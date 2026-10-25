from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import StreamingResponse
import sqlite3
import os
import re
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from PIL import Image, ImageChops, ImageDraw, ImageFont
import tempfile
from io import BytesIO
import pathlib
import secrets
import time
import unicodedata
from urllib.parse import quote

# PIN de la rifa: se define con la variable de entorno RIFA_PIN
RIFA_PIN = os.getenv("RIFA_PIN", "")
ESTADOS_GANADOR = {"pendiente", "entregado", "anulado"}
DATA_DIR = pathlib.Path('data')
DB_NAME = str(DATA_DIR / 'carrera_medico.db')
BASE_IMG_PATH = 'app/XXX.png'

# Validación simple y permisiva de correo electrónico
EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

# Fuentes propias (empaquetadas en el repo, no dependen del SO del servidor)
FONT_BOLD_PATH = 'app/fonts/Poppins-Bold.ttf'
FONT_REGULAR_PATH = 'app/fonts/Poppins-Regular.ttf'

# Coordenadas sobre la plantilla horizontal XXX.png (2000 x 1414)
NOMBRE_POS = (1016, 579)  # centro (x, y) de la franja gris oscura (x 251-1782, y 486-671)
NOMBRE_MAX_WIDTH = 1450
NUMERO_POS = (1000, 919)  # centro (x, y) del panel claro debajo de la franja (x 142-1858, y 673-1165)
NUMERO_MAX_WIDTH = 1500
NUMERO_MAX_HEIGHT = 400

SECTORES_SALUD = [
          "Médico",
          "Médico especialista",
          "Estudiante de medicina",
          "Médico interno",
          "Médico en servicio social",
          "Médico residente",
          "Paramédico",
          "Técnico en enfermería",
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
    print(f"📊 Registros actuales: {total} (sin límite)")
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
    # Aceptación de la carta responsiva y versión del texto que se mostró al participante
    acepta_carta_responsiva: bool = False
    carta_responsiva_version: str = ""

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

class RecuperarFolioRequest(BaseModel):
    tipo: str = ""
    valor: str = ""

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
            correo TEXT,
            acepta_carta_responsiva INTEGER NOT NULL DEFAULT 0,
            fecha_aceptacion_carta TIMESTAMP,
            version_carta_responsiva TEXT
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
        if 'acepta_carta_responsiva' not in columnas:
            cursor.execute("ALTER TABLE participantes ADD COLUMN acepta_carta_responsiva INTEGER NOT NULL DEFAULT 0")
            print("🔧 Migración: columna 'acepta_carta_responsiva' agregada")
        for columna_nueva, tipo in (('fecha_aceptacion_carta', 'TIMESTAMP'), ('version_carta_responsiva', 'TEXT')):
            if columna_nueva not in columnas:
                cursor.execute(f"ALTER TABLE participantes ADD COLUMN {columna_nueva} {tipo}")
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
    """Devuelve (puede_registrar, total). Los registros son ilimitados."""
    con = conectar_bd()
    cursor = con.cursor()

    try:
        cursor.execute("SELECT COUNT(*) FROM participantes")
        total = cursor.fetchone()[0]
        return True, total
    except Exception as e:
        return False, 0
    finally:
        con.close()

def fuente_ajustada(draw, texto: str, font_path: str, tamano_max: int, ancho_max: int):
    """Devuelve la fuente más grande (hasta tamano_max) con la que el texto cabe en ancho_max"""
    try:
        tamano = tamano_max
        font = ImageFont.truetype(font_path, tamano)
        while tamano > 20 and draw.textlength(texto, font=font) > ancho_max:
            tamano -= 4
            font = ImageFont.truetype(font_path, tamano)
        return font
    except Exception:
        return ImageFont.load_default()


SECTORES_CONTORNO = {"Médico", "Médico especialista", "Estudiante de medicina"}


def es_medico(sector_profesional: Optional[str]) -> bool:
    """Sectores cuyo número se dibuja solo con contorno"""
    return (sector_profesional or "").strip() in SECTORES_CONTORNO


def generar_numero_participante(participante_id: int, nombre: str, contorno: bool = False):
    """Genera la imagen con el número y nombre del participante.
    Si contorno=True (médicos), el número se dibuja solo con el contorno, sin relleno."""
    try:
        # Si existe imagen base personalizada, usarla; si no, crear una imagen básica
        if os.path.exists(BASE_IMG_PATH):
            img = Image.open(BASE_IMG_PATH).convert('RGB')
        else:
            img = Image.new('RGB', (1080, 1920), color='#1a3fd4')
            draw = ImageDraw.Draw(img)
            draw.rectangle([(10, 10), (1070, 1910)], outline='black', width=5)

        draw = ImageDraw.Draw(img)

        numero_formateado = f"{participante_id:04d}"

        # --- Número y nombre en las coordenadas de la plantilla ---
        # Número en azul marino para que se lea también impreso en blanco y negro
        font_numero = fuente_ajustada(draw, numero_formateado, FONT_BOLD_PATH, 600, NUMERO_MAX_WIDTH)
        while font_numero.size > 20:
            top, bottom = draw.textbbox((0, 0), numero_formateado, font=font_numero, anchor='mm')[1::2]
            if bottom - top <= NUMERO_MAX_HEIGHT:
                break
            font_numero = ImageFont.truetype(FONT_BOLD_PATH, font_numero.size - 10)
        font_nombre = fuente_ajustada(draw, nombre.upper(), FONT_BOLD_PATH, 90, NOMBRE_MAX_WIDTH)
        if contorno:
            # Contorno: se dibuja el número con trazo azul marino y luego se "vacía" el interior
            # recortando el relleno del trazo sobre la plantilla original.
            # El trazo crece hacia afuera, así que se reduce la fuente y se separan los dígitos
            # para que el número siga cabiendo en el panel y los bordes no se encimen.
            def medidas(font):
                grosor = max(8, font.size // 18)
                espacio = grosor * 2
                anchos = [draw.textlength(c, font=font) for c in numero_formateado]
                ancho = sum(anchos) + espacio * (len(anchos) - 1) + grosor * 2
                top, bottom = draw.textbbox((0, 0), numero_formateado, font=font, anchor='mm', stroke_width=grosor)[1::2]
                return grosor, espacio, anchos, ancho, bottom - top

            grosor, espacio, anchos, ancho, alto = medidas(font_numero)
            while font_numero.size > 20 and (ancho > NUMERO_MAX_WIDTH or alto > NUMERO_MAX_HEIGHT):
                font_numero = ImageFont.truetype(FONT_BOLD_PATH, font_numero.size - 10)
                grosor, espacio, anchos, ancho, alto = medidas(font_numero)

            mascara_trazo = Image.new('L', img.size, 0)
            mascara_relleno = Image.new('L', img.size, 0)
            dibujo_trazo = ImageDraw.Draw(mascara_trazo)
            dibujo_relleno = ImageDraw.Draw(mascara_relleno)
            x = NUMERO_POS[0] - (ancho - grosor * 2) / 2
            for caracter, ancho_caracter in zip(numero_formateado, anchos):
                pos = (x, NUMERO_POS[1])
                dibujo_trazo.text(pos, caracter, font=font_numero, fill=255, anchor='lm',
                                  stroke_width=grosor, stroke_fill=255)
                dibujo_relleno.text(pos, caracter, font=font_numero, fill=255, anchor='lm')
                x += ancho_caracter + espacio
            solo_borde = ImageChops.subtract(mascara_trazo, mascara_relleno)
            img.paste('#0b1f4d', mask=solo_borde)
        else:
            draw.text(NUMERO_POS, numero_formateado, font=font_numero, fill='#0b1f4d', anchor='mm')
        draw.text(NOMBRE_POS, nombre.upper(), font=font_nombre, fill='white', anchor='mm')

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
        "limite_maximo": None,
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

@app.get("/api/estadisticas")
async def estadisticas():
    """Totales agregados de toda la BD para el panel de asistencia (sin datos personales)"""
    conn = conectar_bd()
    try:
        filas = conn.execute(
            """SELECT TRIM(sector_profesional), sexo, COUNT(*), SUM(asistio)
               FROM participantes GROUP BY 1, 2"""
        ).fetchall()
    finally:
        conn.close()

    total = asistieron = 0
    por_sexo = {s: {"total": 0, "asistieron": 0} for s in ("Femenino", "Masculino")}
    sectores = {}
    for sector, sexo, cantidad, llegaron in filas:
        llegaron = llegaron or 0
        total += cantidad
        asistieron += llegaron
        fila = sectores.setdefault(sector or "Sin especificar", {
            "sector": sector or "Sin especificar", "total": 0, "Femenino": 0, "Masculino": 0, "asistieron": 0
        })
        fila["total"] += cantidad
        fila["asistieron"] += llegaron
        if sexo in por_sexo:
            fila[sexo] += cantidad
            por_sexo[sexo]["total"] += cantidad
            por_sexo[sexo]["asistieron"] += llegaron

    return {
        "total": total,
        "asistieron": asistieron,
        "por_sexo": por_sexo,
        "por_sector": sorted(sectores.values(), key=lambda s: (-s["total"], s["sector"])),
        "actualizado": datetime.now().isoformat(),
    }

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

    if not participante.acepta_carta_responsiva:
        raise HTTPException(status_code=400, detail="Debe aceptar la carta responsiva para registrarse.")
    version_carta = participante.carta_responsiva_version.strip()[:50] or None

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

        # Crear número formateado
        numero_asignado = f"{next_id:04d}"

        # Insertar el nuevo participante
        cursor.execute("""INSERT INTO participantes
                         (id, nombre, sexo, telefono, sector_profesional, numero_asignado,
                          ciudad, telefono_emergencia, condiciones_salud, correo,
                          acepta_carta_responsiva, fecha_aceptacion_carta, version_carta_responsiva)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?)""",
                      (next_id, participante.nombre.strip(), participante.sexo,
                       participante.telefono.strip(), participante.sector_profesional, numero_asignado,
                       participante.ciudad.strip(), telefono_emergencia, condiciones_salud, correo,
                       version_carta))

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
        if participant_id <= 0:
            raise HTTPException(status_code=400, detail="Número de participante inválido")
    except ValueError:
        raise HTTPException(status_code=400, detail="Número de participante debe ser numérico")

    con = conectar_bd()
    cursor = con.cursor()

    try:
        cursor.execute("SELECT nombre, sector_profesional FROM participantes WHERE numero_asignado = ?", (numero_participante,))
        participante = cursor.fetchone()

        if not participante:
            raise HTTPException(status_code=404, detail="Participante no encontrado")

        nombre_real, sector_profesional = participante

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al verificar participante")
    finally:
        con.close()

    img_bytes = generar_numero_participante(participant_id, nombre_real, es_medico(sector_profesional))

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

# Límite de intentos para recuperar folio (por IP), para evitar que descarguen la base completa
RECUPERAR_MAX_INTENTOS = 20
RECUPERAR_VENTANA_SEG = 15 * 60
RECUPERAR_MAX_RESULTADOS = 20
intentos_recuperar = {}

def solo_digitos(texto: str) -> str:
    return re.sub(r"\D", "", texto or "")

def normalizar_texto(texto: str) -> str:
    """Minúsculas, sin acentos y sin espacios repetidos, para comparar nombres y correos"""
    sin_acentos = unicodedata.normalize("NFD", texto or "")
    sin_acentos = "".join(c for c in sin_acentos if unicodedata.category(c) != "Mn")
    return " ".join(sin_acentos.lower().split())

@app.post("/api/recuperar-folio")
async def recuperar_folio(data: RecuperarFolioRequest, request: Request):
    """Permite volver a descargar el número buscando por teléfono, correo o nombre.
    Solo devuelve datos no sensibles, porque cualquiera puede hacer la búsqueda."""
    ip = request.headers.get("x-real-ip") or (request.client.host if request.client else "desconocida")
    ahora = time.time()
    recientes = [t for t in intentos_recuperar.get(ip, []) if ahora - t < RECUPERAR_VENTANA_SEG]
    if len(recientes) >= RECUPERAR_MAX_INTENTOS:
        raise HTTPException(status_code=429, detail="Demasiados intentos. Espere 15 minutos e intente de nuevo.")
    recientes.append(ahora)
    intentos_recuperar[ip] = recientes

    tipo = data.tipo
    valor = data.valor.strip()

    if tipo == "telefono":
        telefono = solo_digitos(valor)
        if len(telefono) < 10:
            raise HTTPException(status_code=400, detail="Ingrese el teléfono con el que se registró (10 dígitos).")
        # Se comparan solo dígitos: algunos teléfonos se guardaron con espacios o guiones
        coincide = lambda p: solo_digitos(p[3]) == telefono
    elif tipo == "correo":
        correo = normalizar_texto(valor)
        if not EMAIL_REGEX.match(correo):
            raise HTTPException(status_code=400, detail="Ingrese un correo electrónico válido.")
        coincide = lambda p: normalizar_texto(p[4]) == correo
    elif tipo == "nombre":
        palabras = normalizar_texto(valor).split()
        if len(palabras) < 2 or len("".join(palabras)) < 5:
            raise HTTPException(status_code=400, detail="Escriba al menos su nombre y un apellido.")
        coincide = lambda p: all(palabra in normalizar_texto(p[1]).split() for palabra in palabras)
    else:
        raise HTTPException(status_code=400, detail="Tipo de búsqueda inválido.")

    con = conectar_bd()
    cursor = con.cursor()
    try:
        cursor.execute("""SELECT numero_asignado, nombre, ciudad, telefono, correo
                          FROM participantes ORDER BY id""")
        encontrados = [p for p in cursor.fetchall() if coincide(p)]
    finally:
        con.close()

    if not encontrados:
        raise HTTPException(status_code=404, detail="No encontramos ningún registro con esos datos. Verifique que estén escritos igual que cuando se registró.")
    if len(encontrados) > RECUPERAR_MAX_RESULTADOS:
        raise HTTPException(status_code=400, detail="Hay demasiados registros con ese nombre. Escriba su nombre completo o busque por teléfono o correo.")

    print(f"🔁 Folio recuperado por {tipo}: {', '.join(p[0] for p in encontrados)}")

    return {
        "resultados": [
            {
                "numero_asignado": numero,
                "nombre": nombre,
                "ciudad": ciudad,
                "telefono_oculto": f"******{solo_digitos(telefono)[-4:]}",
                "imagen_url": f"/api/imagen/{numero}?nombre={quote(nombre)}"
            }
            for numero, nombre, ciudad, telefono, _ in encontrados
        ]
    }

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
                ciudad, telefono_emergencia, condiciones_salud, correo,
                acepta_carta_responsiva, fecha_aceptacion_carta, version_carta_responsiva
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
                    "correo": p[12],
                    "acepta_carta_responsiva": bool(p[13]),
                    "fecha_aceptacion_carta": p[14],
                    "version_carta_responsiva": p[15]
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
                ciudad, telefono_emergencia, condiciones_salud, correo,
                acepta_carta_responsiva, fecha_aceptacion_carta, version_carta_responsiva
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
            "correo": resultado[12],
            "acepta_carta_responsiva": bool(resultado[13]),
            "fecha_aceptacion_carta": resultado[14],
            "version_carta_responsiva": resultado[15]
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
    cantidad: int = Field(1, ge=1, le=20)  # ganadores por giro


class GanadorUpdate(BaseModel):
    estado: Optional[str] = None
    premio: Optional[str] = None


class ReiniciarRequest(BaseModel):
    confirmacion: str


def verificar_pin(x_rifa_pin: Optional[str] = Header(None)):
    if not RIFA_PIN or not x_rifa_pin or not secrets.compare_digest(x_rifa_pin, RIFA_PIN):
        raise HTTPException(status_code=401, detail="PIN inválido")


# Registros de prueba que no deben entrar a la rifa (nombres tipo "test", "prueba 14", "hola", correos de ejemplo)
_PRUEBA_NOMBRE = re.compile(r"\b(test(s|ing)?\d*|pruebas?\d*|demo\d*|ejemplos?\d*|ho+la\d*|hola ?mundo|asdf\w*|qwert\w*|fake|dummy)\b")
_PRUEBA_CORREO = re.compile(r"(^|[^a-z])(test|prueba|ejemplo|example|fake|dummy)s?\d*([^a-z]|$)|^ho+la\d*@")

# Participantes reales que el filtro marcaba como prueba (revisados por el comité)
_NO_SON_PRUEBA = {"0955", "1829", "1850", "1999"}


def _sin_acentos(texto: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", texto.lower()) if unicodedata.category(c) != "Mn")


def es_registro_prueba(nombre: Optional[str], correo: Optional[str], numero: Optional[str] = None) -> int:
    if numero and numero.strip() in _NO_SON_PRUEBA:
        return 0
    if nombre and _PRUEBA_NOMBRE.search(_sin_acentos(nombre)):
        return 1
    if correo and _PRUEBA_CORREO.search(correo.strip().lower()):
        return 1
    return 0


def conectar_bd_rifa():
    con = conectar_bd()
    con.create_function("es_prueba", 3, es_registro_prueba, deterministic=True)
    return con


def _filtro_elegibles(solo_asistentes: bool) -> str:
    base = ("FROM participantes WHERE id NOT IN (SELECT participante_id FROM ganadores)"
            " AND NOT es_prueba(nombre, correo, numero_asignado)")
    return base + (" AND asistio = 1" if solo_asistentes else "")


@app.get("/api/rifa/elegibles", dependencies=[Depends(verificar_pin)])
async def rifa_elegibles(solo_asistentes: bool = True, muestra: int = 24):
    """Total de elegibles + nombres en orden aleatorio para dibujar la ruleta (todos, para que nadie quede fuera)"""
    con = conectar_bd_rifa()
    try:
        cur = con.cursor()
        base = _filtro_elegibles(solo_asistentes)
        cur.execute(f"SELECT COUNT(*) {base}")
        total = cur.fetchone()[0]
        cur.execute(f"SELECT nombre {base} ORDER BY RANDOM() LIMIT ?", (max(1, min(muestra, 5000)),))
        muestra_nombres = [{"nombre": r[0]} for r in cur.fetchall()]
        cur.execute("SELECT COUNT(*) FROM participantes WHERE es_prueba(nombre, correo, numero_asignado)")
        excluidos = cur.fetchone()[0]
        return {"total": total, "muestra": muestra_nombres, "excluidos_prueba": excluidos}
    finally:
        con.close()


@app.get("/api/rifa/excluidos", dependencies=[Depends(verificar_pin)])
async def rifa_excluidos():
    """Registros que la rifa ignora por parecer de prueba (para que el comité lo pueda revisar)"""
    con = conectar_bd_rifa()
    try:
        cur = con.cursor()
        cur.execute("""SELECT nombre, numero_asignado FROM participantes
                       WHERE es_prueba(nombre, correo, numero_asignado) ORDER BY id""")
        return {"excluidos": [{"nombre": r[0], "numero_asignado": r[1]} for r in cur.fetchall()]}
    finally:
        con.close()


@app.post("/api/rifa/reiniciar", dependencies=[Depends(verificar_pin)])
async def rifa_reiniciar(data: ReiniciarRequest):
    """Borra todos los ganadores: todos vuelven a participar. No toca la asistencia."""
    if data.confirmacion.strip().upper() != "REINICIAR":
        raise HTTPException(status_code=400, detail="Escribe REINICIAR para confirmar")
    con = conectar_bd()
    try:
        cur = con.cursor()
        cur.execute("DELETE FROM ganadores")
        borrados = cur.rowcount
        con.commit()
        return {"borrados": borrados, "message": "Rifa reiniciada"}
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=f"Error al reiniciar la rifa: {str(e)}")
    finally:
        con.close()


@app.post("/api/rifa/girar", dependencies=[Depends(verificar_pin)])
async def rifa_girar(data: GirarRequest):
    """Elige y guarda los ganadores del giro (el sorteo real ocurre aquí, no en el navegador)"""
    con = conectar_bd_rifa()
    try:
        con.execute("BEGIN IMMEDIATE")  # bloquea escrituras concurrentes durante el sorteo
        cur = con.cursor()
        cur.execute(f"SELECT id, nombre, numero_asignado {_filtro_elegibles(data.solo_asistentes)}")
        elegibles = cur.fetchall()
        if not elegibles:
            raise HTTPException(status_code=400, detail="No quedan participantes elegibles")

        elegidos = secrets.SystemRandom().sample(elegibles, min(data.cantidad, len(elegibles)))
        cur.execute("SELECT COALESCE(MAX(numero_ganador), 0) + 1 FROM ganadores")
        siguiente = cur.fetchone()[0]
        premio = data.premio.strip() if data.premio and data.premio.strip() else None

        ganadores = []
        for i, (pid, nombre, numero) in enumerate(elegidos):
            cur.execute(
                "INSERT INTO ganadores (numero_ganador, participante_id, premio) VALUES (?, ?, ?)",
                (siguiente + i, pid, premio),
            )
            ganadores.append({
                "id": cur.lastrowid,
                "numero_ganador": siguiente + i,
                "participante_id": pid,
                "nombre": nombre,
                "numero_asignado": numero,
                "premio": premio,
            })
        con.commit()
        # El primero también va en la raíz para que los clientes de un solo ganador sigan funcionando
        return {**ganadores[0], "ganadores": ganadores}
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