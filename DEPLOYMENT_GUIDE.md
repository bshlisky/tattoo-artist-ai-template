# Deployment Guide - Theme System Update

## What's New

The app now supports **two themes** that can be switched via environment variable:

1. **Dreadmoor** - Dark gothic theme (original)
2. **Tae'Tu** - Clean professional theme (new)

## Quick Deployment Steps

### On Your Ubuntu Server

```bash
# 1. Navigate to your app directory
cd /tattoo-gen-app

# 2. Pull the latest changes
git pull origin main

# 3. Choose your theme by editing .env.local
nano .env.local

# Add this line (choose dreadmoor or taetu):
NEXT_PUBLIC_THEME=dreadmoor
# or
NEXT_PUBLIC_THEME=taetu

# 4. Rebuild the app
npm run build

# 5. Restart with PM2
pm2 restart tattoo-app

# 6. Check status
pm2 status
pm2 logs tattoo-app
```

## Theme Options

### Dreadmoor (Current/Default)
```bash
NEXT_PUBLIC_THEME=dreadmoor
```
- Dark, gothic aesthetic
- Black and gray colors
- Ink drip effects
- "We are Dreadmoor" branding

### Tae'Tu (New)
```bash
NEXT_PUBLIC_THEME=taetu
```
- Clean, professional aesthetic
- Blue and white colors (water-inspired)
- "Your Skin's Best Ally" branding
- Medical-grade feel

## Running Both Themes Simultaneously

If you want to run both themes on different ports/servers:

### Option 1: Different Ports on Same Server

```bash
# Dreadmoor on port 3000
cd /tattoo-gen-app
echo "NEXT_PUBLIC_THEME=dreadmoor" >> .env.local
npm run build
pm2 start npm --name "dreadmoor" -- start

# Tae'Tu on port 3001
cd /taetu-app
git clone https://github.com/bshlisky/taetu-ai-tattoo-gen.git .
echo "NEXT_PUBLIC_THEME=taetu" >> .env.local
echo "PORT=3001" >> .env.local
npm install
npm run build
pm2 start npm --name "taetu" -- start
```

### Option 2: Different Servers

Deploy to two separate Ubuntu servers with different themes.

## Verifying the Theme

After deployment, check:

1. **Browser**: Open http://192.168.1.8:3000
   - Dreadmoor: Dark background, "DREADMOOR" header
   - Tae'Tu: Light background, "TAE'TU" header

2. **Logs**: Check for errors
   ```bash
   pm2 logs tattoo-app --lines 50
   ```

3. **Environment**: Verify theme is set
   ```bash
   cat .env.local | grep THEME
   ```

## Troubleshooting

### Theme Not Changing

```bash
# 1. Verify environment variable
cat .env.local | grep THEME

# 2. Rebuild (required for theme changes)
npm run build

# 3. Restart
pm2 restart tattoo-app

# 4. Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
```

### Build Errors

```bash
# Check Node version (needs 24+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### PM2 Issues

```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs tattoo-app --lines 100

# Restart from scratch
pm2 delete tattoo-app
pm2 start npm --name "tattoo-app" -- start
pm2 save
```

## Rollback

If you need to rollback to the previous version:

```bash
cd /tattoo-gen-app
git log --oneline  # Find the commit before theme system
git checkout <commit-hash>
npm run build
pm2 restart tattoo-app
```

Or just remove the theme variable:

```bash
# Edit .env.local and remove or comment out:
# NEXT_PUBLIC_THEME=dreadmoor
nano .env.local

# Rebuild
npm run build
pm2 restart tattoo-app
```

## Support

- **Theme Documentation**: See `THEME_SYSTEM.md`
- **General Setup**: See `README.md`
- **Performance Info**: See `PERFORMANCE_OPTIMIZATIONS.md`
