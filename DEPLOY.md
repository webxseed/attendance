# Laravel Forge Deployment Fix

The "Vite manifest not found" error occurs because the `npm run build` command is missing or failing in your deployment script.

## 1. Update Deployment Script

Go to your site in Laravel Forge -> **App** -> **Deployment Script** and ensure it looks like this:

```bash
cd /home/forge/social.qadralabs.com
git pull origin $FORGE_SITE_BRANCH

$FORGE_COMPOSER install --no-interaction --prefer-dist --optimize-autoloader

# 👇 THESE LINES ARE CRITICAL FOR VITE 👇
npm install
npm run build
# 👆 --------------------------------- 👆

$FORGE_PHP artisan migrate --force
```

## 2. Quick Fix (SSH)

If you want to fix it immediately without redeploying, you can SSH into your server and run:

```bash
cd /home/forge/social.qadralabs.com
npm install
npm run build
```
