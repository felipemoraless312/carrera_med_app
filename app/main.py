from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import StreamingResponse
import sqlite3
import os
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from PIL import Image, ImageDraw, ImageFont
import tempfile
from io import BytesIO
import pathlib

# Configuración
MAX_REGISTROS = 2000
DATA_DIR = pathlib.Path('data')
DB_NAME = str(DATA_DIR / 'carrera_medico.db')
BASE_IMG_PATH = 'app/carrera_medico_template.png'

# Sectores profesionales (igual que en Gradio)
SECTORES_SALUD = [
    "Medicina General",
    "Enfermería", 
    "Odontología",
    "Fisioterapia",
    "Psicología",
    "Nutrición",
    "Farmacia",
    "Medicina Especializada",
    "Técnico en Salud",
    "Administración en Salud",
    "Otro sector de salud",
    "Área diferente a la salud"
]

app = FastAPI(title="Carrera del Médico API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://carrera-med-app.fly.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos del frontend
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")

# Modelos Pydantic
class ParticipanteCreate(BaseModel):
    nombre: str
    sexo: str
    telefono: str
    sector_profesional: str

class ParticipanteResponse(BaseModel):
    id: int
    numero_asignado: str
    message: str
    imagen_url: Optional[str] = None

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
            telefono TEXT NOT NULL,
            sector_profesional TEXT NOT NULL,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            numero_asignado TEXT NOT NULL
        )""")
        con.commit()
        print("Base de datos creada correctamente")
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
    """Genera la imagen con el número del participante - CORREGIDA"""
    try:
        # Si existe imagen base personalizada, usarla; si no, crear una imagen simple
        if os.path.exists(BASE_IMG_PATH):
            img = Image.open(BASE_IMG_PATH)
        else:
            # Crear imagen básica si no existe la plantilla (igual que en Gradio)
            img = Image.new('RGB', (800, 600), color='white')
            draw = ImageDraw.Draw(img)
            
            # Dibujar borde
            draw.rectangle([(10, 10), (790, 590)], outline='black', width=5)
            
            # Título
            try:
                font_titulo = ImageFont.truetype('arial.ttf', 48)
            except:
                font_titulo = ImageFont.load_default()
            
            draw.text((400, 50), "CARRERA DÍA DEL MÉDICO", font=font_titulo, 
                     fill='black', anchor='mt')
        
        # Preparar el dibujo
        draw = ImageDraw.Draw(img)
        
        # Configurar fuentes
        try:
            font_numero = ImageFont.truetype('arial.ttf', 120)
            font_nombre = ImageFont.truetype('arial.ttf', 36)
        except:
            font_numero = ImageFont.load_default()
            font_nombre = ImageFont.load_default()
        
        # Formatear número con ceros a la izquierda
        numero_formateado = f"{participante_id:04d}"
        
        # Posición centrada para el número
        img_width, img_height = img.size
        
        # Dibujar número del participante (más grande)
        draw.text((img_width//2, img_height//2 - 60), numero_formateado, 
                 font=font_numero, fill='black', anchor='mm')
        
        # Dibujar nombre (debajo del número) - CORREGIDO: color blanco como en Gradio
        draw.text((img_width//2, img_height//2 + 40), nombre, 
                 font=font_nombre, fill='white', anchor='mm')
        
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

@app.get("/api/status")
async def get_status():
    puede_registrar, total_actual = verificar_limite_registros()
    return {
        "total_registros": total_actual,
        "limite_maximo": MAX_REGISTROS,
        "puede_registrar": puede_registrar
    }

@app.get("/api/sectores")
async def get_sectores():
    """Endpoint para obtener los sectores profesionales disponibles"""
    return {"sectores": SECTORES_SALUD}

@app.post("/api/registro", response_model=ParticipanteResponse)
async def registrar_participante(participante: ParticipanteCreate):
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
                         (id, nombre, sexo, telefono, sector_profesional, numero_asignado)
                         VALUES (?, ?, ?, ?, ?, ?)""", 
                      (next_id, participante.nombre.strip(), participante.sexo, 
                       participante.telefono.strip(), participante.sector_profesional, numero_asignado))
        
        con.commit()
        
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
    except Exception as e:
        con.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el registro: {str(e)}")
    finally:
        con.close()

@app.get("/api/imagen/{numero_participante}")
async def descargar_imagen(numero_participante: str, request: Request):
    """Descarga la imagen del número de participante - CORREGIDA"""
    
    # Obtener el nombre desde la query params
    nombre = request.query_params.get('nombre', None)
    
    if not nombre:
        raise HTTPException(status_code=400, detail="Nombre requerido para generar la imagen")
    
    try:
        # Validar que el número sea válido
        participant_id = int(numero_participante)
        if participant_id <= 0 or participant_id > MAX_REGISTROS:
            raise HTTPException(status_code=400, detail="Número de participante inválido")
    except ValueError:
        raise HTTPException(status_code=400, detail="Número de participante debe ser numérico")
    
    # Verificar que el participante existe en la BD
    con = conectar_bd()
    cursor = con.cursor()
    
    try:
        cursor.execute("SELECT nombre FROM participantes WHERE numero_asignado = ?", (numero_participante,))
        participante = cursor.fetchone()
        
        if not participante:
            raise HTTPException(status_code=404, detail="Participante no encontrado")
        
        # Usar el nombre real de la BD, no el del query param
        nombre_real = participante[0]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al verificar participante")
    finally:
        con.close()
    
    # Generar imagen en memoria con el nombre real
    img_bytes = generar_numero_participante(participant_id, nombre_real)
    
    if not img_bytes:
        raise HTTPException(status_code=500, detail="No se pudo generar la imagen")
    
    filename = f"participante_{numero_participante}_{nombre_real.replace(' ', '_')}.png"
    
    # Debug logging
    print(f"Generando imagen para: {numero_participante} - {nombre_real}")
    print(f"Tamaño del archivo: {img_bytes.tell() if hasattr(img_bytes, 'tell') else 'unknown'} bytes")
    
    return StreamingResponse(
        img_bytes, 
        media_type='image/png', 
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "image/png"
        }
    )

@app.get("/api/participantes")
async def listar_participantes(limit: int = 100, offset: int = 0):
    """Lista los participantes registrados (para administración)"""
    con = conectar_bd()
    cursor = con.cursor()
    
    try:
        cursor.execute("""SELECT id, nombre, sexo, telefono, sector_profesional, 
                         fecha_registro, numero_asignado 
                         FROM participantes 
                         ORDER BY fecha_registro DESC 
                         LIMIT ? OFFSET ?""", (limit, offset))
        
        participantes = cursor.fetchall()
        
        cursor.execute("SELECT COUNT(*) FROM participantes")
        total = cursor.fetchone()[0]
        
        return {
            "participantes": [
                {
                    "id": p[0],
                    "nombre": p[1],
                    "sexo": p[2],
                    "telefono": p[3],
                    "sector_profesional": p[4],
                    "fecha_registro": p[5],
                    "numero_asignado": p[6]
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

if __name__ == "__main__":
    import sys
    import traceback
    print("Entrando a main.py (__main__)")
    print(f"Argumentos: {sys.argv}")
    try:
        if "--init-db" in sys.argv:
            print("Ejecutando crear_tablas()...")
            crear_tablas()
            print("crear_tablas() ejecutado correctamente.")
        else:
            print("Ejecutando uvicorn...")
            import uvicorn
            uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        print(f"Error global en main.py: {e}")
        traceback.print_exc()