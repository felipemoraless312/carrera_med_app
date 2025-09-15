from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sqlite3
import os
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from PIL import Image, ImageDraw, ImageFont
import tempfile

import pathlib
# Configuración
MAX_REGISTROS = 2000
DATA_DIR = pathlib.Path('data')
DB_NAME = str(DATA_DIR / 'carrera_medico.db')
BASE_IMG_PATH = str(DATA_DIR / 'carrera_medico_template.png')

app = FastAPI(title="Carrera del Médico API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica el dominio de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NUMEROS_GENERADOS_DIR = DATA_DIR / 'numeros_generados'
NUMEROS_GENERADOS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(NUMEROS_GENERADOS_DIR)), name="static")
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")

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
    """Genera la imagen con el número del participante"""
    try:
        # Crear imagen base si no existe
        if os.path.exists(BASE_IMG_PATH):
            img = Image.open(BASE_IMG_PATH)
        try:
            # Crear imagen base si no existe
            if os.path.exists(BASE_IMG_PATH):
                img = Image.open(BASE_IMG_PATH)
            else:
                # Crear imagen básica
                img = Image.new('RGB', (800, 600), color='white')
                draw = ImageDraw.Draw(img)
                # Dibujar borde
                draw.rectangle([(10, 10), (790, 590)], outline='black', width=5)
                # Título
                try:
                    font_titulo = ImageFont.truetype('arial.ttf', 48)
                except Exception:
                    font_titulo = ImageFont.load_default()
                draw.text((400, 50), "CARRERA DÍA DEL MÉDICO", font=font_titulo, fill='black', anchor='mt')
            # Preparar el dibujo
            draw = ImageDraw.Draw(img)
            # Configurar fuentes
            try:
                font_numero = ImageFont.truetype('arial.ttf', 120)
                font_nombre = ImageFont.truetype('arial.ttf', 36)
            except Exception:
                font_numero = ImageFont.load_default()
                font_nombre = ImageFont.load_default()
            # Formatear número con ceros a la izquierda
            numero_formateado = f"{participante_id:04d}"
            # Posición centrada para el número
            img_width, img_height = img.size
            # Dibujar número del participante (más grande)
            draw.text((img_width//2, img_height//2 - 60), numero_formateado, font=font_numero, fill='black', anchor='mm')
            # Dibujar nombre (debajo del número)
            draw.text((img_width//2, img_height//2 + 40), nombre, font=font_nombre, fill='blue', anchor='mm')
            # Guardar imagen
            filename = f"participante_{numero_formateado}_{nombre.replace(' ', '_')}.png"
            filepath = NUMEROS_GENERADOS_DIR / filename
            img.save(str(filepath))
            return str(filepath)
        except Exception as e:
            print(f"Error al generar imagen: {e}")
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

@app.post("/api/registro", response_model=ParticipanteResponse)
async def registrar_participante(participante: ParticipanteCreate):
    # Validaciones básicas
    if not all([participante.nombre.strip(), participante.sexo, 
                participante.telefono.strip(), participante.sector_profesional]):
        raise HTTPException(status_code=400, detail="Todos los campos son obligatorios")
    
    if participante.sexo not in ["Masculino", "Femenino"]:
        raise HTTPException(status_code=400, detail="Sexo debe ser 'Masculino' o 'Femenino'")
    
    if len(participante.telefono.strip()) < 10:
        raise HTTPException(status_code=400, detail="El número de teléfono debe tener al menos 10 dígitos")
    
    # Verificar límite de registros
    puede_registrar, total_actual = verificar_limite_registros()
    if not puede_registrar:
        raise HTTPException(status_code=400, detail=f"Se ha alcanzado el límite máximo de {MAX_REGISTROS} registros")
    
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
        
        # Obtener el próximo ID disponible
        cursor.execute("SELECT MAX(id) FROM participantes")
        max_id = cursor.fetchone()[0]
        next_id = 1 if max_id is None else max_id + 1
        
        if next_id > MAX_REGISTROS:
            raise HTTPException(status_code=400, 
                              detail=f"Se ha alcanzado el límite máximo de {MAX_REGISTROS} registros")
        
        # Crear número formateado
        numero_asignado = f"{next_id:04d}"
        
        # Insertar el nuevo participante
        cursor.execute("""INSERT INTO participantes 
                         (id, nombre, sexo, telefono, sector_profesional, numero_asignado)
                         VALUES (?, ?, ?, ?, ?, ?)""", 
                      (next_id, participante.nombre.strip(), participante.sexo, 
                       participante.telefono.strip(), participante.sector_profesional, numero_asignado))
        
        con.commit()
        
        # Generar imagen con el número
        imagen_path = generar_numero_participante(next_id, participante.nombre.strip())
        
        imagen_url = None
        if imagen_path and os.path.exists(imagen_path):
            imagen_url = f"/api/imagen/{numero_asignado}"
        
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
async def descargar_imagen(numero_participante: str):
    """Descarga la imagen del número de participante"""
    
    # Buscar el archivo en el directorio
    archivos = os.listdir(str(NUMEROS_GENERADOS_DIR))
    archivo_encontrado = None
    for archivo in archivos:
        if archivo.startswith(f"participante_{numero_participante}_"):
            archivo_encontrado = archivo
            break
    if not archivo_encontrado:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    filepath = NUMEROS_GENERADOS_DIR / archivo_encontrado
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Archivo de imagen no encontrado")
    return FileResponse(
        str(filepath),
        media_type='image/png',
        filename=archivo_encontrado,
        headers={"Content-Disposition": f"attachment; filename={archivo_encontrado}"}
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
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)