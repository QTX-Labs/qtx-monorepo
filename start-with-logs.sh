#!/bin/sh

# Function to log with timestamp and app name
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "========================================="
log "Starting QTX Multi-App Container"
log "========================================="
log "Environment: $NODE_ENV"
log "Dashboard URL: $NEXT_PUBLIC_DASHBOARD_URL"
log "Marketing URL: $NEXT_PUBLIC_MARKETING_URL"
log "Public API URL: $NEXT_PUBLIC_PUBLIC_API_URL"
log "========================================="

# Check if required environment variables are set
if [ -z "$AUTH_SECRET" ]; then
    log "WARNING: AUTH_SECRET is not set. Registration will not work!"
fi

if [ -z "$DATABASE_URL" ]; then
    log "WARNING: DATABASE_URL is not set. Database operations will fail!"
fi

if [ -z "$EMAIL_FROM" ]; then
    log "WARNING: EMAIL_FROM is not set. Email sending will fail!"
fi

if [ -z "$EMAIL_RESEND_API_KEY" ] && [ -z "$EMAIL_NODEMAILER_URL" ]; then
    log "WARNING: No email provider configured (EMAIL_RESEND_API_KEY or EMAIL_NODEMAILER_URL)"
fi

log "Starting supervisor..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf