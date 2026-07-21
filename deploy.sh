#!/bin/bash
set -e

cd /var/www/qr-app/server
npm install
npm run build

cd /var/www/qr-app/client
npm install
npm run build

pm2 restart qrapp-backend qrapp-frontend
