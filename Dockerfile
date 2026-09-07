








# 1. Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend .
RUN npm run build

# 2. Build backend
FROM python:3.11-slim AS backend
WORKDIR /app
# Instalar dependencias del sistema para PIL
RUN apt-get update && apt-get install -y \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libopenjp2-7-dev \
    libtiff5-dev \
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar backend y build del frontend
COPY app ./app
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Crear directorios necesarios
RUN mkdir -p data/numeros_generados

# Exponer puerto
EXPOSE 8000

# Comando para ejecutar
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]