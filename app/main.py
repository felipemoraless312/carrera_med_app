from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import StreamingResponse
import sqlite3
import os
import re
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from PIL import Image, ImageDraw, ImageFont
import qrcode
import tempfile
from io import BytesIO
import pathlib
import secrets

# Configuración
MAX_REGISTROS = 2000

# PIN de la rifa: se define con la variable de entorno RIFA_PIN
RIFA_PIN = os.getenv("RIFA_PIN", "")
ESTADOS_GANADOR = {"pendiente", "entregado", "anulado"}
DATA_DIR = pathlib.Path('data')
DB_NAME = str(DATA_DIR / 'carrera_medico.db')
BASE_IMG_PATH = 'app/plantilla_nueva.png'

# Validación simple y permisiva de correo electrónico
EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

# Fuentes propias (empaquetadas en el repo, no dependen del SO del servidor)
FONT_BOLD_PATH = 'app/fonts/Poppins-Bold.ttf'
FONT_REGULAR_PATH = 'app/fonts/Poppins-Regular.ttf'

QR_BOX = (181, 600, 898, 1317)  # left, top, right, bottom
NUMERO_POS = (540, 1435)  # centro (x, y)
NOMBRE_POS = (540, 1555)  # centro (x, y)

SECTORES_SALUD = [
          "Medico",
          "Medico especialista",
          "Estudiante de medicina",
          "Medico interno",
          "Medico en servicio social",
          "Medico residente",
          "Paramedico",
          "Tecnico en enfermería",
          "Lic. en enfermería",
          "Enfermera especialista",
          "Otro sector de salud",
          "Público en general"
]

app = FastAPI(title="Carrera del Médico API", version="1.0.0")

# Inicializar la BD automáticamente al arrancar
@app.on_event("startup")
async def startup_event():
    print("🚀 Iniciando aplicación...")
    crear_tablas()
    print("✅ Base de datos inicializada")

    # Verificar estado actual
    puede_registrar, total = verificar_limite_registros()
    print(f"📊 Registros actuales: {total}/{MAX_REGISTROS}")
    print(f"🟢 Puede registrar: {'Sí' if puede_registrar else 'No'}")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporalmente permitir todos los orígenes para debug
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MOVER ESTO AL FINAL - después de definir todos los endpoints API

# Modelos Pydantic
class ParticipanteCreate(BaseModel):
    nombre: str
    sexo: str
    telefono: str
    sector_profesional: str
    # Valores por defecto vacíos para responder con un 400 claro (no un 422) si faltan
    ciudad: str = ""
    telefono_emergencia: str = ""
    correo: str = ""
    condiciones_salud: str = ""

class ParticipanteResponse(BaseModel):
    id: int
    numero_asignado: str
    message: str
    imagen_url: Optional[str] = None

class AsistenciaUpdate(BaseModel):
    asistio: bool

class AsistenciaBulkUpdate(BaseModel):
    ids: List[int]
    asistio: bool

# Funciones de base de datos
def conectar_bd():
    return sqlite3.connect(DB_NAME)

def crear_tablas():
    # Asegurar que el directorio 'data' existe
    data_dir = os.path.dirname(DB_NAME)
    if data_dir and not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)

    con = conectar_bd()
    cursor = con.cursor()
    try:
        cursor.execute("""CREATE TABLE IF NOT EXISTS participantes (
            id INTEGER PRIMARY KEY,
            nombre TEXT NOT NULL,
            sexo TEXT NOT NULL,
            telefono TEXT NOT NULL UNIQUE,
            sector_profesional TEXT NOT NULL,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            numero_asignado TEXT NOT NULL,
            asistio INTEGER NOT NULL DEFAULT 0,
            fecha_asistencia TIMESTAMP,
            ciudad TEXT,
            telefono_emergencia TEXT,
            condiciones_salud TEXT,
            correo TEXT
        )""")

        cursor.execute("PRAGMA table_info(participantes)")
        columnas = [c[1] for c in cursor.fetchall()]
        if 'asistio' not in columnas:
            cursor.execute("ALTER TABLE participantes ADD COLUMN asistio INTEGER NOT NULL DEFAULT 0")
            print("🔧 Migración: columna 'asistio' agregada")
        if 'fecha_asistencia' not in columnas:
            cursor.execute("ALTER TABLE participantes ADD COLUMN fecha_asistencia TIMESTAMP")
            print("🔧 Migración: columna 'fecha_asistencia' agregada")
        for columna_nueva in ('ciudad', 'telefono_emergencia', 'condiciones_salud', 'correo'):
            if columna_nueva not in columnas:
                cursor.execute(f"ALTER TABLE participantes ADD COLUMN {columna_nueva} TEXT")
                print(f"🔧 Migración: columna '{columna_nueva}' agregada")

        # Índice único de teléfono para bases ya existentes (ALTER TABLE no permite agregar UNIQUE directo)
        try:
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_telefono_unique ON participantes(telefono)")
        except Exception as idx_err:
            print(f"⚠️ No se pudo crear índice único de teléfono (puede haber duplicados existentes): {idx_err}")

        cursor.execute("""CREATE TABLE IF NOT EXISTS ganadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_ganador INTEGER NOT NULL,
            participante_id INTEGER NOT NULL UNIQUE,
            premio TEXT,
            fecha_sorteo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado TEXT NOT NULL DEFAULT 'pendiente',
            fecha_entrega TIMESTAMP,
            FOREIGN KEY (participante_id) REFERENCES participantes(id)
        )""")

        con.commit()
        print("Base de datos creada/migrada correctamente")
    except Exception as e:
        print(f"Error al crear tablas: {e}")
    finally:
        con.close()

def verificar_limite_registros():
    """Verifica si aún se pueden hacer registros"""
    con = conectar_bd()
    cursor = con.cursor()

    try:
        cursor.execute("SELECT COUNT(*) FROM participantes")
        total = cursor.fetchone()[0]
        return total < MAX_REGISTROS, total
    except Exception as e:
        return False, 0
    finally:
        con.close()

def generar_numero_participante(participante_id: int, nombre: str):
    """Genera la imagen con el número, nombre y QR del participante"""
    try:
        # Si existe imagen base personalizada, usarla; si no, crear una imagen básica
        if os.path.exists(BASE_IMG_PATH):
            img = Image.open(BASE_IMG_PATH).convert('RGB')
        else:
            img = Image.new('RGB', (1080, 1920), color='#1a3fd4')
            draw = ImageDraw.Draw(img)
            draw.rectangle([(10, 10), (1070, 1910)], outline='black', width=5)

        draw = ImageDraw.Draw(img)

        # --- Generar QR (por ahora solo codifica el número de folio) ---
        numero_formateado = f"{participante_id:04d}"

        qr = qrcode.QRCode(
            version=None,  # ajusta automáticamente el tamaño al contenido
            error_correction=qrcode.constants.ERROR_CORRECT_L,  # baja densidad, escaneo rápido
            box_size=10,
            border=2,
        )
        qr.add_data(numero_formateado)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')

        qr_size_original = QR_BOX[2] - QR_BOX[0]
        qr_size = int(qr_size_original * 0.95)
        qr_img = qr_img.resize((qr_size, qr_size), Image.LANCZOS)

        # Centrar el QR dentro del recuadro original
        offset_x = QR_BOX[0] + (qr_size_original - qr_size) // 2
        offset_y = QR_BOX[1] + (qr_size_original - qr_size) // 2
        img.paste(qr_img, (offset_x, offset_y))

        # --- Fuentes propias (empaquetadas), con fallback seguro ---
        try:
            font_numero = ImageFont.truetype(FONT_BOLD_PATH, 80)
            font_nombre = ImageFont.truetype(FONT_REGULAR_PATH, 40)
        except Exception:
            font_numero = ImageFont.load_default()
            font_nombre = ImageFont.load_default()

        # --- Número y nombre en las coordenadas de la plantilla ---
        draw.text(NUMERO_POS, numero_formateado, font=font_numero, fill='white', anchor='mm')
        draw.text(NOMBRE_POS, nombre, font=font_nombre, fill='white', anchor='mm')

        # Guardar imagen en memoria
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes

    except Exception as e:
        print(f"Error al generar imagen: {e}")
        import traceback
        traceback.print_exc()
        return None

# Endpoints
@app.get("/")
async def root():
    return {"message": "API Carrera del Médico funcionando correctamente"}

@app.get("/api/health")
async def health_check():
    """Endpoint de salud para verificar que la API funciona"""
    puede_registrar, total = verificar_limite_registros()
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "database_connected": True,
        "total_registros": total,
        "puede_registrar": puede_registrar,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    puede_registrar, total_actual = verificar_limite_registros()
    return {
        "total_registros": total_actual,
        "limite_maximo": MAX_REGISTROS,
        "puede_registrar": puede_registrar
    }

@app.get("/api/total_participantes")
async def total_participantes():
    """Endpoint ligero para el contador en tiempo real del frontend"""
    _, total = verificar_limite_registros()
    return {"total": total}

@app.get("/api/sectores")
async def get_sectores():
    """Endpoint para obtener los sectores profesionales disponibles"""
    return {"sectores": SECTORES_SALUD}

@app.post("/api/registro", response_model=ParticipanteResponse)
async def registrar_participante(participante: ParticipanteCreate):
    """Registrar un nuevo participante"""
    print(f"🔵 POST /api/registro recibido: {participante}")  # Debug log

    # Validaciones básicas (iguales a Gradio)
    if not all([participante.nombre.strip(), participante.sexo,
                participante.telefono.strip(), participante.sector_profesional]):
        raise HTTPException(status_code=400, detail="Todos los campos son obligatorios.")

    if participante.sexo not in ["Masculino", "Femenino"]:
        raise HTTPException(status_code=400, detail="Debe seleccionar un sexo válido.")

    if participante.sector_profesional not in SECTORES_SALUD:
        raise HTTPException(status_code=400, detail="Debe seleccionar un sector profesional válido.")

    if len(participante.telefono.strip()) < 10:
        raise HTTPException(status_code=400, detail="El número de teléfono debe tener al menos 10 dígitos.")

    if not participante.ciudad.strip():
        raise HTTPException(status_code=400, detail="La ciudad es obligatoria.")

    telefono_emergencia = participante.telefono_emergencia.strip()
    if len(telefono_emergencia) < 10:
        raise HTTPException(status_code=400, detail="El teléfono de emergencia debe tener al menos 10 dígitos.")

    if telefono_emergencia == participante.telefono.strip():
        raise HTTPException(status_code=400, detail="El teléfono de emergencia debe ser distinto a su propio teléfono.")

    correo = participante.correo.strip()
    if not correo or not EMAIL_REGEX.match(correo):
        raise HTTPException(status_code=400, detail="Debe ingresar un correo electrónico válido.")

    condiciones_salud = participante.condiciones_salud.strip() or "Ninguna"

    # Verificar límite de registros
    puede_registrar, total_actual = verificar_limite_registros()
    if not puede_registrar:
        raise HTTPException(status_code=400, detail=f"Se ha alcanzado el límite máximo de {MAX_REGISTROS} registros.")

    con = conectar_bd()
    cursor = con.cursor()

    try:
        # Verificar si ya existe un participante con el mismo teléfono
        cursor.execute("SELECT nombre FROM participantes WHERE telefono = ?",
                      (participante.telefono.strip(),))
        existing = cursor.fetchone()

        if existing:
            raise HTTPException(status_code=400,
                              detail=f"Ya existe un registro con este número de teléfono: {existing[0]}")

        # Obtener el próximo ID disponible (igual que en Gradio)
        cursor.execute("SELECT MAX(id) FROM participantes")
        max_id = cursor.fetchone()[0]
        next_id = 1 if max_id is None else max_id + 1

        if next_id > MAX_REGISTROS:
            raise HTTPException(status_code=400,
                              detail=f"Se ha alcanzado el límite máximo de {MAX_REGISTROS} registros.")

        # Crear número formateado
        numero_asignado = f"{next_id:04d}"

        # Insertar el nuevo participante
        cursor.execute("""INSERT INTO participantes
                         (id, nombre, sexo, telefono, sector_profesional, numero_asignado,
                          ciudad, telefono_emergencia, condiciones_salud, correo)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                      (next_id, participante.nombre.strip(), participante.sexo,
                       participante.telefono.strip(), participante.sector_profesional, numero_asignado,
                       participante.ciudad.strip(), telefono_emergencia, condiciones_salud, correo))

        con.commit()
        print(f"✅ Participante registrado: {numero_asignado} - {participante.nombre.strip()}")  # Debug log

        # La imagen se genera bajo demanda
        imagen_url = f"/api/imagen/{numero_asignado}?nombre={participante.nombre.strip()}"

        return ParticipanteResponse(
            id=next_id,
            numero_asignado=numero_asignado,
            message=f"¡Registro exitoso! Tu número es: {numero_asignado}",
            imagen_url=imagen_url
        )

    except HTTPException:
        con.rollback()
        raise
    except sqlite3.IntegrityError:
        con.rollback()
        raise HTTPException(status_code=400, detail="Ya existe un registro con este número de teléfono.")
    except Exception as e:
        con.rollback()
        print(f"❌ Error en registro: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Error en el registro: {str(e)}")
    finally:
        con.close()

@app.get("/api/imagen/{numero_participante}")
async def descargar_imagen(numero_participante: str, request: Request):
    """Descarga la imagen del número de participante"""

    nombre = request.query_params.get('nombre', None)

    if not nombre:
        raise HTTPException(status_code=400, detail="Nombre requerido para generar la imagen")

    try:
        participant_id = int(numero_participante)
        if participant_id <= 0 or participant_id > MAX_REGISTROS:
            raise HTTPException(status_code=400, detail="Número de participante inválido")
    except ValueError:
        raise HTTPException(status_code=400, detail="Número de participante debe ser numérico")

    con = conectar_bd()
    cursor = con.cursor()

    try:
        cursor.execute("SELECT nombre FROM participantes WHERE numero_asignado = ?", (numero_participante,))
        participante = cursor.fetchone()

        if not participante:
            raise HTTPException(status_code=404, detail="Participante no encontrado")

        nombre_real = participante[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al verificar participante")
    finally:
        con.close()

    img_bytes = generar_numero_participante(participant_id, nombre_real)

    if not img_bytes:
        raise HTTPException(status_code=500, detail="No se pudo generar la imagen")

    filename = f"participante_{numero_participante}_{nombre_real.replace(' ', '_')}.png"

    print(f"Generando imagen para: {numero_participante} - {nombre_real}")

    return StreamingResponse(
        img_bytes,
        media_type='image/png',
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "image/png"
        }
    )

@app.get("/api/participantes")
async def listar_participantes(limit: int = 100, offset: int = 0, search: Optional[str] = None):
    """Lista los participantes registrados, con búsqueda opcional (para administración)"""
    con = conectar_bd()
    cursor = con.cursor()

    try:
        base_query = "FROM participantes WHERE 1=1"
        params = []

        if search and search.strip():
            base_query += " AND (nombre LIKE ? OR telefono LIKE ? OR numero_asignado LIKE ? OR ciudad LIKE ? OR correo LIKE ?)"
            like_term = f"%{search.strip()}%"
            params.extend([like_term, like_term, like_term, like_term, like_term])

        cursor.execute(f"SELECT COUNT(*) {base_query}", params)
        total = cursor.fetchone()[0]

        cursor.execute(
            f"""SELECT id, nombre, sexo, telefono, sector_profesional,
                fecha_registro, numero_asignado, asistio, fecha_asistencia,
                ciudad, telefono_emergencia, condiciones_salud, correo
                {base_query}
                ORDER BY fecha_registro DESC LIMIT ? OFFSET ?""",
            params + [limit, offset]
        )
        participantes = cursor.fetchall()

        return {
            "participantes": [
                {
                    "id": p[0],
                    "nombre": p[1],
                    "sexo": p[2],
                    "telefono": p[3],
                    "sector_profesional": p[4],
                    "fecha_registro": p[5],
                    "numero_asignado": p[6],
                    "asistio": bool(p[7]),
                    "fecha_asistencia": p[8],
                    "ciudad": p[9],
                    "telefono_emergencia": p[10],
                    "condiciones_salud": p[11],
                    "correo": p[12]
                }
                for p in participantes
            ],
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener participantes: {str(e)}")
    finally:
        con.close()

@app.get("/api/participantes/buscar")
async def buscar_participante(tipo: str, valor: str):
    """Busca un participante por número de folio, teléfono o nombre"""
    columnas_validas = {"numero": "numero_asignado", "telefono": "telefono", "nombre": "nombre"}
    if tipo not in columnas_validas:
        raise HTTPException(status_code=400, detail="Tipo de búsqueda inválido")

    con = conectar_bd()
    cursor = con.cursor()
    try:
        columna = columnas_validas[tipo]
        operador = "=" if tipo != "nombre" else "LIKE"
        valor_busqueda = valor if tipo != "nombre" else f"%{valor}%"

        cursor.execute(
            f"""SELECT id, nombre, sexo, telefono, sector_profesional,
                fecha_registro, numero_asignado, asistio, fecha_asistencia,
                ciudad, telefono_emergencia, condiciones_salud, correo
                FROM participantes WHERE {columna} {operador} ?""",
            (valor_busqueda,)
        )
        resultado = cursor.fetchone()

        if not resultado:
            raise HTTPException(status_code=404, detail="Participante no encontrado")

        return {
            "id": resultado[0],
            "nombre": resultado[1],
            "sexo": resultado[2],
            "telefono": resultado[3],
            "sector_profesional": resultado[4],
            "fecha_registro": resultado[5],
            "numero_asignado": resultado[6],
            "asistio": bool(resultado[7]),
            "fecha_asistencia": resultado[8],
            "ciudad": resultado[9],
            "telefono_emergencia": resultado[10],
            "condiciones_salud": resultado[11],
            "correo": resultado[12]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al buscar participante: {str(e)}")
    finally:
        con.close()

@app.patch("/api/participantes/{participante_id}/asistencia")
async def actualizar_asistencia(participante_id: int, data: AsistenciaUpdate):
    """Marca o desmarca la asistencia de un participante (ej. al escanear su QR)"""
    con = conectar_bd()
    cursor = con.cursor()
    try:
        cursor.execute("SELECT id FROM participantes WHERE id = ?", (participante_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Participante no encontrado")

        fecha = datetime.now().isoformat() if data.asistio else None
        cursor.execute(
            "UPDATE participantes SET asistio = ?, fecha_asistencia = ? WHERE id = ?",
            (1 if data.asistio else 0, fecha, participante_id)
        )
        con.commit()
        return {"id": participante_id, "asistio": data.asistio, "message": "Asistencia actualizada"}
    except HTTPException:
        con.rollback()
        raise
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar asistencia: {str(e)}")
    finally:
        con.close()

@app.patch("/api/participantes/asistencia/bulk")
async def actualizar_asistencia_masiva(data: AsistenciaBulkUpdate):
    """Actualiza la asistencia de varios participantes a la vez"""
    if not data.ids:
        raise HTTPException(status_code=400, detail="Lista de IDs vacía")

    con = conectar_bd()
    cursor = con.cursor()
    try:
        fecha = datetime.now().isoformat() if data.asistio else None
        placeholders = ",".join("?" * len(data.ids))
        cursor.execute(
            f"UPDATE participantes SET asistio = ?, fecha_asistencia = ? WHERE id IN ({placeholders})",
            [1 if data.asistio else 0, fecha] + data.ids
        )
        con.commit()
        return {"actualizados": cursor.rowcount, "asistio": data.asistio}
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=f"Error en actualización masiva: {str(e)}")
    finally:
        con.close()

class GirarRequest(BaseModel):
    solo_asistentes: bool = True
    premio: Optional[str] = None


class GanadorUpdate(BaseModel):
    estado: Optional[str] = None
    premio: Optional[str] = None


def verificar_pin(x_rifa_pin: Optional[str] = Header(None)):
    if not RIFA_PIN or not x_rifa_pin or not secrets.compare_digest(x_rifa_pin, RIFA_PIN):
        raise HTTPException(status_code=401, detail="PIN inválido")


def _filtro_elegibles(solo_asistentes: bool) -> str:
    base = "FROM participantes WHERE id NOT IN (SELECT participante_id FROM ganadores)"
    return base + (" AND asistio = 1" if solo_asistentes else "")


@app.get("/api/rifa/elegibles", dependencies=[Depends(verificar_pin)])
async def rifa_elegibles(solo_asistentes: bool = True, muestra: int = 24):
    """Total de elegibles + muestra aleatoria de nombres para dibujar la ruleta"""
    con = conectar_bd()
    try:
        cur = con.cursor()
        base = _filtro_elegibles(solo_asistentes)
        cur.execute(f"SELECT COUNT(*) {base}")
        total = cur.fetchone()[0]
        cur.execute(f"SELECT nombre {base} ORDER BY RANDOM() LIMIT ?", (max(1, min(muestra, 40)),))
        return {"total": total, "muestra": [{"nombre": r[0]} for r in cur.fetchall()]}
    finally:
        con.close()


@app.post("/api/rifa/girar", dependencies=[Depends(verificar_pin)])
async def rifa_girar(data: GirarRequest):
    """Elige y guarda un ganador (el sorteo real ocurre aquí, no en el navegador)"""
    con = conectar_bd()
    try:
        con.execute("BEGIN IMMEDIATE")  # bloquea escrituras concurrentes durante el sorteo
        cur = con.cursor()
        cur.execute(f"SELECT id, nombre, numero_asignado {_filtro_elegibles(data.solo_asistentes)}")
        elegibles = cur.fetchall()
        if not elegibles:
            raise HTTPException(status_code=400, detail="No quedan participantes elegibles")

        pid, nombre, numero = secrets.choice(elegibles)
        cur.execute("SELECT COALESCE(MAX(numero_ganador), 0) + 1 FROM ganadores")
        numero_ganador = cur.fetchone()[0]
        premio = data.premio.strip() if data.premio and data.premio.strip() else None

        cur.execute(
            "INSERT INTO ganadores (numero_ganador, participante_id, premio) VALUES (?, ?, ?)",
            (numero_ganador, pid, premio),
        )
        ganador_id = cur.lastrowid
        con.commit()
        return {
            "id": ganador_id,
            "numero_ganador": numero_ganador,
            "participante_id": pid,
            "nombre": nombre,
            "numero_asignado": numero,
            "premio": premio,
        }
    except HTTPException:
        con.rollback()
        raise
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el sorteo: {str(e)}")
    finally:
        con.close()


@app.get("/api/rifa/ganadores", dependencies=[Depends(verificar_pin)])
async def rifa_ganadores():
    """Registro completo de ganadores (incluye teléfono para verificar al reclamar)"""
    con = conectar_bd()
    try:
        cur = con.cursor()
        cur.execute("""SELECT g.id, g.numero_ganador, g.participante_id, p.nombre,
                              p.numero_asignado, p.telefono, g.premio, g.estado,
                              g.fecha_sorteo, g.fecha_entrega
                       FROM ganadores g
                       JOIN participantes p ON p.id = g.participante_id
                       ORDER BY g.numero_ganador DESC""")
        cols = [c[0] for c in cur.description]
        return {"ganadores": [dict(zip(cols, r)) for r in cur.fetchall()]}
    finally:
        con.close()


@app.patch("/api/rifa/ganadores/{ganador_id}", dependencies=[Depends(verificar_pin)])
async def rifa_actualizar_ganador(ganador_id: int, data: GanadorUpdate):
    """Marcar entregado / anulado, o cambiar el premio"""
    if data.estado is not None and data.estado not in ESTADOS_GANADOR:
        raise HTTPException(status_code=400, detail="Estado inválido")

    con = conectar_bd()
    try:
        cur = con.cursor()
        cur.execute("SELECT id FROM ganadores WHERE id = ?", (ganador_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Ganador no encontrado")

        if data.estado is not None:
            fecha = datetime.now().isoformat() if data.estado == "entregado" else None
            cur.execute("UPDATE ganadores SET estado = ?, fecha_entrega = ? WHERE id = ?",
                        (data.estado, fecha, ganador_id))
        if data.premio is not None:
            cur.execute("UPDATE ganadores SET premio = ? WHERE id = ?",
                        (data.premio.strip() or None, ganador_id))
        con.commit()
        return {"id": ganador_id, "message": "Ganador actualizado"}
    except HTTPException:
        con.rollback()
        raise
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar ganador: {str(e)}")
    finally:
        con.close()

# IMPORTANTE: Montar archivos estáticos AL FINAL para no interferir con la API
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")

if __name__ == "__main__":
    import sys
    import traceback
    print("Entrando a main.py (__main__)")
    print(f"Argumentos: {sys.argv}")
    try:
        print("Ejecutando uvicorn...")
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)