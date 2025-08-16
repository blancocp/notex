#!/bin/bash

# Script de deployment para NotEx
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deployment de NotEx..."
echo "===================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_error "PM2 no está instalado. Instálalo con: npm install -g pm2"
    exit 1
fi

# Crear backup de la versión actual
log_info "Creando backup de la versión actual..."
BACKUP_DIR="/var/www/notex-backup-$(date +%Y%m%d-%H%M%S)"
if [ -d "/var/www/notex" ]; then
    sudo cp -r /var/www/notex "$BACKUP_DIR"
    log_success "Backup creado en: $BACKUP_DIR"
fi

# Parar la aplicación si está corriendo
log_info "Parando aplicación actual..."
pm2 stop notex 2>/dev/null || log_warning "La aplicación no estaba corriendo"

# Actualizar código desde Git
log_info "Actualizando código desde Git..."
git fetch origin
git reset --hard origin/main
log_success "Código actualizado"

# Verificar que existe el archivo de variables de entorno
if [ ! -f ".env.production" ]; then
    log_warning "No se encontró .env.production. Copiando desde .env.local..."
    if [ -f ".env.local" ]; then
        cp .env.local .env.production
        log_info "Recuerda actualizar las variables de entorno para producción"
    else
        log_error "No se encontró archivo de variables de entorno"
        exit 1
    fi
fi

# Instalar dependencias
log_info "Instalando dependencias..."
npm ci --only=production
log_success "Dependencias instaladas"

# Construir aplicación
log_info "Construyendo aplicación..."
NODE_ENV=production npm run build
log_success "Aplicación construida"

# Iniciar aplicación con PM2
log_info "Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js
pm2 save
log_success "Aplicación iniciada"

# Verificar estado
log_info "Verificando estado de la aplicación..."
sleep 5

if pm2 list | grep -q "notex.*online"; then
    log_success "¡Deployment completado exitosamente!"
    echo ""
    echo "📊 Estado actual:"
    pm2 status notex
    echo ""
    echo "🌐 La aplicación debería estar disponible en:"
    echo "   https://tu-subdominio.pangolin.com"
    echo ""
    echo "📝 Para ver logs en tiempo real:"
    echo "   pm2 logs notex"
else
    log_error "La aplicación no se inició correctamente"
    echo "📝 Revisa los logs con: pm2 logs notex"
    exit 1
fi

log_success "¡Deployment finalizado! 🎉"