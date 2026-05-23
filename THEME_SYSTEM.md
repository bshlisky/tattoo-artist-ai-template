# Theme System Documentation

## Overview

The app now supports multiple themes that can be switched via environment variable. This allows you to maintain both the Dreadmoor (dark gothic) and Tae'Tu (clean professional) branding in a single codebase.

## Available Themes

### 1. **Dreadmoor** (Default)
- **Style**: Dark, gothic, artistic
- **Colors**: Black, grays, purple accents
- **Effects**: Ink drips, liquid backgrounds, gothic accents
- **Branding**: "We are Dreadmoor" - Dark Art intelligently crafted
- **Best for**: Artistic, edgy tattoo consultations

### 2. **Tae'Tu**
- **Style**: Clean, professional, medical-grade
- **Colors**: Blues, whites, cyan tones (water-inspired)
- **Effects**: Water droplets, clean liquid backgrounds
- **Branding**: "Your Skin's Best Ally" - Gentle, effective protection
- **Best for**: Professional aftercare and tattoo design services

## How to Switch Themes

### Method 1: Environment Variable (Recommended)

Edit your `.env.local` file:

```bash
# For Dreadmoor (dark theme)
NEXT_PUBLIC_THEME=dreadmoor

# For Tae'Tu (clean theme)
NEXT_PUBLIC_THEME=taetu
```

Then restart your server:
```bash
# Development
npm run dev

# Production
npm run build
npm start

# With PM2
pm2 restart tattoo-app
```

### Method 2: Different Deployments

Deploy two separate instances:

**Dreadmoor Server:**
```bash
# .env.local
NEXT_PUBLIC_THEME=dreadmoor
```

**Tae'Tu Server:**
```bash
# .env.local
NEXT_PUBLIC_THEME=taetu
```

## Theme Configuration Files

Themes are defined in `/app/themes/`:

- `dreadmoor.ts` - Dark gothic theme configuration
- `taetu.ts` - Clean professional theme configuration
- `index.ts` - Theme loader and type definitions

## Customizing Themes

### Adding a New Theme

1. Create a new file in `/app/themes/yourtheme.ts`:

```typescript
export const yourTheme = {
  name: "Your Brand",
  tagline: "Your Tagline",
  description: "Your description",
  
  colors: {
    background: "from-color-50 via-white to-color-50",
    headerBg: "bg-white/95",
    footerBg: "bg-color-50/80",
    cardBg: "bg-white/90",
    inputBg: "bg-white/80",
    buttonBg: "bg-color-600 hover:bg-color-700",
    buttonText: "text-white",
    borderColor: "border-color-200/50",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-700",
    textMuted: "text-gray-500",
    accentColor: "text-color-600",
  },
  
  effects: {
    inkDrip: false,
    liquidBackground: true,
    gothicAccents: false,
  },
  
  branding: {
    logo: "🎨",
    aiName: "Your AI Name",
    copyright: "yourdomain.com",
    instagramHandle: "@yourhandle",
    instagramUrl: "https://www.instagram.com/yourhandle/",
  },
  
  products: [
    // Your products here
  ],
  
  productsUrl: "https://yourstore.com",
};
```

2. Add it to `/app/themes/index.ts`:

```typescript
import { yourTheme } from './yourtheme';

export const themes = {
  dreadmoor: dreadmoorTheme,
  taetu: taetuTheme,
  yourtheme: yourTheme, // Add this line
};
```

3. Use it:

```bash
NEXT_PUBLIC_THEME=yourtheme
```

### Modifying Existing Themes

Edit the theme files directly:

- **Dreadmoor**: `/app/themes/dreadmoor.ts`
- **Tae'Tu**: `/app/themes/taetu.ts`

Changes include:
- Colors and styling
- Branding text
- Logo/emoji
- Product listings
- Instagram links
- Effects (ink drips, backgrounds, etc.)

## Testing Themes

### Local Testing

```bash
# Test Dreadmoor
echo "NEXT_PUBLIC_THEME=dreadmoor" > .env.local
npm run dev

# Test Tae'Tu
echo "NEXT_PUBLIC_THEME=taetu" > .env.local
npm run dev
```

### Production Testing

```bash
# Build with specific theme
NEXT_PUBLIC_THEME=taetu npm run build
npm start
```

## Deployment

### Single Server (Theme Switching)

1. Clone repository
2. Set `NEXT_PUBLIC_THEME` in `.env.local`
3. Build and deploy
4. To switch themes, update `.env.local` and rebuild

### Multiple Servers (Both Themes)

**Server 1 (Dreadmoor):**
```bash
git clone https://github.com/bshlisky/taetu-ai-tattoo-gen.git /dreadmoor-app
cd /dreadmoor-app
echo "NEXT_PUBLIC_THEME=dreadmoor" >> .env.local
npm install && npm run build
pm2 start npm --name "dreadmoor" -- start
```

**Server 2 (Tae'Tu):**
```bash
git clone https://github.com/bshlisky/taetu-ai-tattoo-gen.git /taetu-app
cd /taetu-app
echo "NEXT_PUBLIC_THEME=taetu" >> .env.local
npm install && npm run build
pm2 start npm --name "taetu" -- start
```

## Troubleshooting

### Theme Not Changing

1. **Check environment variable:**
   ```bash
   cat .env.local | grep THEME
   ```

2. **Rebuild the app:**
   ```bash
   npm run build
   pm2 restart tattoo-app
   ```

3. **Clear browser cache** and hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Colors Not Showing

- Tailwind CSS requires a rebuild to include new color classes
- Run `npm run build` after theme changes

### TypeScript Errors

- Run `npm install` to ensure all dependencies are installed
- Restart your IDE/editor

## Future Enhancements

Potential improvements:
- Runtime theme switching (without rebuild)
- User-selectable themes
- Theme preview mode
- Custom theme builder UI
- Per-route themes

## Support

For issues or questions about the theme system:
1. Check this documentation
2. Review theme configuration files in `/app/themes/`
3. Test with default themes first
4. Verify environment variables are set correctly
