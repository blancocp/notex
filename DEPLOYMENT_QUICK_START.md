# 🚀 Guía Rápida de Deployment - NotEx

## Resumen Ejecutivo

Esta guía te ayudará a desplegar NotEx en tu OrangePi con DietPi (192.168.0.14) usando nginx como reverse proxy.

## ⚡ Pasos Rápidos

### 1. Preparación del Servidor (15 min)
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias básicas
sudo apt install -y curl git nginx

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2
pm2 startup
```

### 2. Configuración del Proyecto (10 min)
```bash
# Crear usuario y directorio
sudo adduser --system --group --home /var/www/notex notex
sudo mkdir -p /var/www/notex
sudo chown notex:notex /var/www/notex

# Clonar proyecto
sudo su - notex
cd /var/www/notex
git clone [URL_DE_TU_REPO] .

# Configurar variables de entorno
cp .env.production.example .env.production
# Editar .env.production con tu dominio real

# Instalar y construir
npm ci --only=production
npm run build
```

### 3. Configuración de PM2 (5 min)
```bash
# Crear logs directory
sudo mkdir -p /var/log/notex
sudo chown notex:notex /var/log/notex

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
```

### 4. Configuración de nginx (10 min)
```bash
# Copiar configuración
sudo cp nginx.conf /etc/nginx/sites-available/notex

# Editar y reemplazar 'tu-subdominio.pangolin.com' con tu dominio real
sudo nano /etc/nginx/sites-available/notex

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/notex /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configurar SSL (10 min)
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado (reemplaza con tu dominio)
sudo certbot --nginx -d tu-subdominio.pangolin.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Configurar Supabase (5 min)
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/bwcbtafocttjdwvhuryb)
2. Authentication > URL Configuration
3. Actualizar:
   - **Site URL**: `https://tu-subdominio.pangolin.com`
   - **Redirect URLs**: Agregar `https://tu-subdominio.pangolin.com/**`

## 🔧 Comandos Útiles

### Deployment
```bash
# Deployment automático
./deploy.sh

# Monitoreo del sistema
./monitor.sh
```

### Gestión de PM2
```bash
pm2 status          # Ver estado
pm2 logs notex      # Ver logs
pm2 restart notex   # Reiniciar
pm2 stop notex      # Parar
```

### Gestión de nginx
```bash
sudo nginx -t                    # Verificar configuración
sudo systemctl reload nginx     # Recargar configuración
sudo systemctl restart nginx    # Reiniciar nginx
```

## 🛠️ Troubleshooting Rápido

### Aplicación no inicia
```bash
pm2 logs notex                  # Ver logs de la aplicación
cat .env.production             # Verificar variables de entorno
```

### Error 502 Bad Gateway
```bash
pm2 status                      # Verificar que la app esté corriendo
sudo netstat -tlnp | grep :3000 # Verificar puerto 3000
sudo systemctl status nginx     # Verificar nginx
```

### Problemas de SSL
```bash
sudo certbot certificates       # Ver certificados
sudo nginx -t                   # Verificar configuración nginx
```

## 📋 Checklist Final

- [ ] Servidor actualizado y dependencias instaladas
- [ ] Proyecto clonado y construido
- [ ] PM2 configurado y aplicación corriendo
- [ ] nginx configurado como reverse proxy
- [ ] SSL configurado con Let's Encrypt
- [ ] Supabase configurado para producción
- [ ] Dominio apuntando al servidor (192.168.0.14)
- [ ] Firewall configurado (puertos 80, 443, 22)

## 🎯 URLs Importantes

- **Aplicación**: https://tu-subdominio.pangolin.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/bwcbtafocttjdwvhuryb
- **Servidor**: 192.168.0.14

---

**Tiempo total estimado**: ~55 minutos

**¿Necesitas ayuda?** Consulta el archivo `DEPLOYMENT.md` para instrucciones detalladas.