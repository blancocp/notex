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