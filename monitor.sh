#!/bin/bash

# Script de monitoreo para NotEx
# Uso: ./monitor.sh

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para headers
print_header() {
    echo -e "\n${CYAN}$1${NC}"
    echo -e "${CYAN}$(printf '=%.0s' {1..50})${NC}"
}

# Función para verificar servicios
check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "${GREEN}✅ $1 está corriendo${NC}"
    else
        echo -e "${RED}❌ $1 no está corriendo${NC}"
    fi
}

# Función para verificar conectividad
check_url() {
    if curl -s --head --request GET "$1" | grep "200 OK" > /dev/null; then
        echo -e "${GREEN}✅ $1 responde correctamente${NC}"
    else
        echo -e "${RED}❌ $1 no responde o tiene errores${NC}"
    fi
}

echo -e "${PURPLE}📊 Monitor de Sistema NotEx${NC}"
echo -e "${PURPLE}Fecha: $(date)${NC}"

# Estado de PM2
print_header "🔧 Estado de PM2"
if command -v pm2 &> /dev/null; then
    pm2 status notex 2>/dev/null || echo -e "${YELLOW}⚠️  La aplicación NotEx no está registrada en PM2${NC}"
else
    echo -e "${RED}❌ PM2 no está instalado${NC}"
fi

# Estado de servicios del sistema
print_header "🛠️  Estado de Servicios del Sistema"
check_service nginx
check_service ssh

# Uso de recursos
print_header "💾 Uso de Recursos"
echo -e "${BLUE}Memoria:${NC}"
free -h

echo -e "\n${BLUE}Disco (directorio de la aplicación):${NC}"
df -h /var/www/notex 2>/dev/null || df -h .

echo -e "\n${BLUE}CPU y Load Average:${NC}"
uptime

# Procesos de Node.js
print_header "⚡ Procesos de Node.js"
ps aux | grep node | grep -v grep || echo -e "${YELLOW}⚠️  No se encontraron procesos de Node.js${NC}"

# Puertos en uso
print_header "🔌 Puertos en Uso"
echo -e "${BLUE}Puerto 3000 (Next.js):${NC}"
netstat -tlnp 2>/dev/null | grep :3000 || echo -e "${YELLOW}⚠️  Puerto 3000 no está en uso${NC}"

echo -e "\n${BLUE}Puerto 80 (HTTP):${NC}"
netstat -tlnp 2>/dev/null | grep :80 || echo -e "${YELLOW}⚠️  Puerto 80 no está en uso${NC}"

echo -e "\n${BLUE}Puerto 443 (HTTPS):${NC}"
netstat -tlnp 2>/dev/null | grep :443 || echo -e "${YELLOW}⚠️  Puerto 443 no está en uso${NC}"

# Logs recientes de PM2
print_header "📝 Logs Recientes de PM2 (últimas 10 líneas)"
if command -v pm2 &> /dev/null; then
    pm2 logs notex --lines 10 2>/dev/null || echo -e "${YELLOW}⚠️  No se pudieron obtener los logs de PM2${NC}"
else
    echo -e "${RED}❌ PM2 no está disponible${NC}"
fi

# Logs de nginx
print_header "🌐 Logs de nginx (últimas 5 líneas)"
if [ -f "/var/log/nginx/notex_error.log" ]; then
    echo -e "${BLUE}Errores:${NC}"
    sudo tail -5 /var/log/nginx/notex_error.log 2>/dev/null || echo -e "${YELLOW}⚠️  No se pudieron leer los logs de error de nginx${NC}"
else
    echo -e "${YELLOW}⚠️  Archivo de log de errores de nginx no encontrado${NC}"
fi

if [ -f "/var/log/nginx/notex_access.log" ]; then
    echo -e "\n${BLUE}Accesos recientes:${NC}"
    sudo tail -5 /var/log/nginx/notex_access.log 2>/dev/null || echo -e "${YELLOW}⚠️  No se pudieron leer los logs de acceso de nginx${NC}"
else
    echo -e "${YELLOW}⚠️  Archivo de log de accesos de nginx no encontrado${NC}"
fi

# Verificación de conectividad
print_header "🔗 Verificación de Conectividad"
echo -e "${BLUE}Verificando localhost:3000...${NC}"
check_url "http://localhost:3000"

echo -e "\n${BLUE}Verificando sitio en producción...${NC}"
echo -e "${YELLOW}⚠️  Recuerda reemplazar 'tu-subdominio.pangolin.com' con tu dominio real${NC}"
# check_url "https://tu-subdominio.pangolin.com"

# Certificados SSL
print_header "🔒 Estado de Certificados SSL"
if command -v certbot &> /dev/null; then
    sudo certbot certificates 2>/dev/null || echo -e "${YELLOW}⚠️  No se pudieron verificar los certificados SSL${NC}"
else
    echo -e "${YELLOW}⚠️  Certbot no está instalado${NC}"
fi

# Espacio en disco
print_header "💿 Espacio en Disco"
df -h | grep -E '(Filesystem|/dev/)' | head -6

# Información del sistema
print_header "ℹ️  Información del Sistema"
echo -e "${BLUE}Sistema Operativo:${NC} $(lsb_release -d 2>/dev/null | cut -f2 || uname -a)"
echo -e "${BLUE}Kernel:${NC} $(uname -r)"
echo -e "${BLUE}Arquitectura:${NC} $(uname -m)"
echo -e "${BLUE}Uptime:${NC} $(uptime -p 2>/dev/null || uptime)"

# Resumen final
print_header "📋 Resumen"
echo -e "${BLUE}Para más información detallada:${NC}"
echo -e "  • Logs de PM2: ${CYAN}pm2 logs notex${NC}"
echo -e "  • Estado de PM2: ${CYAN}pm2 status${NC}"
echo -e "  • Logs de nginx: ${CYAN}sudo tail -f /var/log/nginx/notex_error.log${NC}"
echo -e "  • Reiniciar aplicación: ${CYAN}pm2 restart notex${NC}"
echo -e "  • Verificar nginx: ${CYAN}sudo nginx -t${NC}"

echo -e "\n${GREEN}✅ Monitoreo completado${NC}"