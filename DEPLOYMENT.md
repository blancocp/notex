# Guía de Deployment - NotEx en Producción

## Información del Servidor
- **Servidor**: OrangePi con DietPi
- **IP**: 192.168.0.14
- **Web Server**: nginx
- **Subdominio**: [tu-subdominio].pangolin.com

## Requisitos del Sistema

### Dependencias Base
- Node.js 18+ (LTS)
- npm o yarn
- Git
- nginx
- PM2 (Process Manager)
- Certbot (para SSL)

## Paso 1: Preparación del Servidor DietPi

### 1.1 Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar Node.js (usando NodeSource)
```bash
# Instalar curl si no está disponible
sudo apt install -y curl

# Agregar repositorio de NodeSource para Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 1.3 Instalar PM2 globalmente
```bash
sudo npm install -g pm2

# Configurar PM2 para iniciar con el sistema
pm2 startup
# Ejecutar el comando que PM2 te proporcione (sudo env PATH=...)
```

### 1.4 Instalar nginx
```bash
sudo apt install -y nginx

# Habilitar nginx para iniciar con el sistema
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.5 Instalar Git
```bash
sudo apt install -y git
```

## Paso 2: Configuración del Proyecto

### 2.1 Crear usuario para la aplicación
```bash
# Crear usuario dedicado para la app
sudo adduser --system --group --home /var/www/notex notex

# Cambiar al directorio de la aplicación
sudo mkdir -p /var/www/notex
sudo chown notex:notex /var/www/notex
```

### 2.2 Clonar el repositorio
```bash
# Cambiar al usuario notex
sudo su - notex

# Clonar el repositorio (reemplaza con tu URL de GitHub)
cd /var/www/notex
git clone https://github.com/tu-usuario/notex.git .

# O si usas SSH
# git clone git@github.com:tu-usuario/notex.git .
```

### 2.3 Configurar variables de entorno
```bash
# Crear archivo de variables de entorno para producción
cp .env.local .env.production

# Editar variables de entorno
nano .env.production
```

**Contenido de .env.production:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bwcbtafocttjdwvhuryb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Y2J0YWZvY3R0amR3dmh1cnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MDk3OTksImV4cCI6MjA2OTI4NTc5OX0.aC7gxMXQTO1-lSUvUR_s2cjxm8mc7zGY8zVY7znYYJk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Y2J0YWZvY3R0amR3dmh1cnliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcwOTc5OSwiZXhwIjoyMDY5Mjg1Nzk5fQ.8LzlsOibUWf42suV4G5ihmjusStcLdKPQ7JfF5mRmbg

# Production Configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://tu-subdominio.pangolin.com
```

### 2.4 Instalar dependencias y construir
```bash
# Instalar dependencias
npm ci --only=production

# Construir la aplicación
npm run build
```

## Paso 3: Configuración de PM2

### 3.1 Crear archivo de configuración PM2
```bash
# Crear archivo ecosystem.config.js
nano ecosystem.config.js
```

**Contenido de ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'notex',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/notex',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/notex/err.log',
    out_file: '/var/log/notex/out.log',
    log_file: '/var/log/notex/combined.log',
    time: true
  }]
};
```

### 3.2 Crear directorio de logs
```bash
# Salir del usuario notex
exit

# Crear directorio de logs
sudo mkdir -p /var/log/notex
sudo chown notex:notex /var/log/notex
```

### 3.3 Iniciar la aplicación con PM2
```bash
# Cambiar al usuario notex
sudo su - notex
cd /var/www/notex

# Iniciar la aplicación
pm2 start ecosystem.config.js

# Guardar configuración de PM2
pm2 save

# Verificar que esté corriendo
pm2 status
pm2 logs notex
```

## Paso 4: Configuración de nginx

### 4.1 Crear configuración del sitio
```bash
# Salir del usuario notex
exit

# Crear archivo de configuración de nginx
sudo nano /etc/nginx/sites-available/notex
```

**Contenido de /etc/nginx/sites-available/notex:**
```nginx
server {
    listen 80;
    server_name tu-subdominio.pangolin.com;

    # Redireccionar HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-subdominio.pangolin.com;

    # Certificados SSL (se configurarán con Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tu-subdominio.pangolin.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-subdominio.pangolin.com/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Configuración de proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Configuración para archivos estáticos
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Logs
    access_log /var/log/nginx/notex_access.log;
    error_log /var/log/nginx/notex_error.log;
}
```

### 4.2 Habilitar el sitio
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/notex /etc/nginx/sites-enabled/

# Remover sitio por defecto si existe
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t
```

## Paso 5: Configurar SSL con Let's Encrypt

### 5.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Configuración temporal sin SSL
```bash
# Crear configuración temporal sin SSL
sudo nano /etc/nginx/sites-available/notex-temp
```

**Contenido temporal:**
```nginx
server {
    listen 80;
    server_name tu-subdominio.pangolin.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Usar configuración temporal
sudo rm /etc/nginx/sites-enabled/notex
sudo ln -s /etc/nginx/sites-available/notex-temp /etc/nginx/sites-enabled/notex-temp

# Recargar nginx
sudo systemctl reload nginx
```

### 5.3 Obtener certificado SSL
```bash
# Obtener certificado
sudo certbot --nginx -d tu-subdominio.pangolin.com

# Configurar renovación automática
sudo crontab -e
# Agregar esta línea:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5.4 Aplicar configuración final
```bash
# Remover configuración temporal
sudo rm /etc/nginx/sites-enabled/notex-temp

# Aplicar configuración final con SSL
sudo ln -s /etc/nginx/sites-available/notex /etc/nginx/sites-enabled/

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

## Paso 6: Configuración de Supabase para Producción

### 6.1 Actualizar URLs en Supabase Dashboard

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/bwcbtafocttjdwvhuryb)
2. Navega a **Authentication** > **URL Configuration**
3. Actualiza:
   - **Site URL**: `https://tu-subdominio.pangolin.com`
   - **Redirect URLs**: Agregar:
     ```
     https://tu-subdominio.pangolin.com/**
     https://tu-subdominio.pangolin.com/auth/confirm
     https://tu-subdominio.pangolin.com/dashboard
     ```

## Paso 7: Scripts de Deployment

### 7.1 Crear script de deployment
```bash
sudo nano /var/www/notex/deploy.sh
```

**Contenido de deploy.sh:**
```bash
#!/bin/bash

# Script de deployment para NotEx
set -e

echo "🚀 Iniciando deployment..."

# Cambiar al directorio del proyecto
cd /var/www/notex

# Hacer backup de la versión actual
echo "📦 Creando backup..."
pm2 stop notex || true
cp -r /var/www/notex /var/www/notex-backup-$(date +%Y%m%d-%H%M%S)

# Actualizar código
echo "📥 Actualizando código..."
git fetch origin
git reset --hard origin/main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production

# Construir aplicación
echo "🔨 Construyendo aplicación..."
npm run build

# Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
pm2 start notex
pm2 save

echo "✅ Deployment completado!"
echo "📊 Estado de la aplicación:"
pm2 status notex
```

```bash
# Hacer ejecutable
sudo chmod +x /var/www/notex/deploy.sh
sudo chown notex:notex /var/www/notex/deploy.sh
```

### 7.2 Script de monitoreo
```bash
sudo nano /var/www/notex/monitor.sh
```

**Contenido de monitor.sh:**
```bash
#!/bin/bash

# Script de monitoreo para NotEx
echo "📊 Estado del sistema NotEx"
echo "========================="

echo "\n🔧 Estado de PM2:"
pm2 status notex

echo "\n📝 Últimos logs (últimas 20 líneas):"
pm2 logs notex --lines 20

echo "\n🌐 Estado de nginx:"
sudo systemctl status nginx --no-pager -l

echo "\n💾 Uso de memoria:"
free -h

echo "\n💿 Uso de disco:"
df -h /var/www/notex

echo "\n🔗 Verificación de conectividad:"
curl -I https://tu-subdominio.pangolin.com || echo "❌ Sitio no accesible"
```

```bash
# Hacer ejecutable
sudo chmod +x /var/www/notex/monitor.sh
sudo chown notex:notex /var/www/notex/monitor.sh
```

## Comandos Útiles para Mantenimiento

### Gestión de PM2
```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs notex

# Reiniciar aplicación
pm2 restart notex

# Parar aplicación
pm2 stop notex

# Eliminar aplicación de PM2
pm2 delete notex
```

### Gestión de nginx
```bash
# Verificar configuración
sudo nginx -t

# Recargar configuración
sudo systemctl reload nginx

# Reiniciar nginx
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/notex_access.log
sudo tail -f /var/log/nginx/notex_error.log
```

### Gestión de SSL
```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados manualmente
sudo certbot renew

# Probar renovación
sudo certbot renew --dry-run
```

## Troubleshooting

### Problemas Comunes

1. **Aplicación no inicia**
   ```bash
   # Verificar logs
   pm2 logs notex
   
   # Verificar variables de entorno
   cat .env.production
   ```

2. **Error 502 Bad Gateway**
   ```bash
   # Verificar que la aplicación esté corriendo
   pm2 status
   
   # Verificar que el puerto 3000 esté en uso
   sudo netstat -tlnp | grep :3000
   ```

3. **Problemas de SSL**
   ```bash
   # Verificar certificados
   sudo certbot certificates
   
   # Verificar configuración de nginx
   sudo nginx -t
   ```

## Seguridad Adicional

### Firewall
```bash
# Instalar ufw si no está disponible
sudo apt install -y ufw

# Configurar firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Actualizaciones Automáticas
```bash
# Instalar unattended-upgrades
sudo apt install -y unattended-upgrades

# Configurar actualizaciones automáticas
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

**¡Tu aplicación NotEx estará lista para producción!** 🎉

Recuerda reemplazar `tu-subdominio.pangolin.com` con tu subdominio real en todos los archivos de configuración.