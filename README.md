# 🎨 AI Tattoo Artist Template

**A customizable AI-powered tattoo consultation platform for tattoo artists**

This is a complete, ready-to-deploy template that allows tattoo artists to offer AI-powered design consultations on their own websites. Built with Next.js 15, React 19, and powered by advanced AI models.

---

## ✨ Features

- **🎨 AI Tattoo Design Generation**: Create custom designs from text descriptions
- **✏️ Design Modification**: Alter and refine existing designs
- **� Cover-Up Design**: Generate cover-up designs for existing tattoos
- **💡 Tattoo Interpretation**: Analyze meanings and symbolism
- **🎭 Multi-Theme System**: Switch between different brand themes
- **📱 Responsive Design**: Beautiful UI optimized for all devices
- **📌 Design Gallery**: Pin and save favorite designs
- **📸 Instagram Integration**: Showcase your latest work
- **🎨 Fully Customizable**: Easy branding and styling

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/tattoo-artist-ai-template.git
cd tattoo-artist-ai-template
npm install
```

### 2. Set Up Environment Variables

Copy the template and add your API keys:

```bash
cp .env.local.template .env.local
```

Edit `.env.local` with your credentials:

```bash
# Required: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Required: Replicate API Token
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Optional: Supabase (for artist recommendations)
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

# Theme Selection (dreadmoor or taetu)
NEXT_PUBLIC_THEME=taetu
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site!

---

## 🎨 Customization Guide

### Step 1: Create Your Theme

1. **Create a new theme file** in `app/themes/yourname.ts`:

```typescript
export const yourTheme = {
  name: 'YourBrand',
  description: 'Your tagline here',
  colors: {
    primary: '#your-color',
    secondary: '#your-color',
    accent: '#your-color',
    background: '#your-color',
    text: '#your-color',
  },
  effects: {
    glow: 'your-glow-color',
    shadow: 'your-shadow-color',
  },
  branding: {
    tagline: 'Your Brand - Your Tagline',
    instagram: '@your_instagram',
    instagramUrl: 'https://www.instagram.com/your_instagram/',
  },
};
```

2. **Add your theme** to `app/themes/index.ts`:

```typescript
import { yourTheme } from './yourname';

export function getTheme() {
  const themeName = process.env.NEXT_PUBLIC_THEME || 'yourname';
  
  switch (themeName.toLowerCase()) {
    case 'yourname':
      return yourTheme;
    // ... other themes
    default:
      return yourTheme;
  }
}
```

3. **Set your theme** in `.env.local`:

```bash
NEXT_PUBLIC_THEME=yourname
```

### Step 2: Add Your Logo

1. **Add your logo** to the `public/` folder (e.g., `public/your_logo.jpg`)

2. **Update the logo reference** in `app/components/ChatWindow.tsx`:

```typescript
{theme.name === 'YourBrand' ? (
  <img 
    src="/your_logo.jpg" 
    alt="Your Brand Logo" 
    className="w-full h-full object-contain rounded-full"
  />
) : (
  // ... fallback
)}
```

### Step 3: Customize Suggested Prompts

Edit `app/page.tsx` to add your own prompt suggestions:

```typescript
const suggestedPrompts = [
  {
    title: "Your Style 1",
    prompt: "Create a [your specialty] tattoo design...",
  },
  {
    title: "Your Style 2",
    prompt: "Design a [your specialty] with...",
  },
  // Add more prompts
];
```

### Step 4: Update Branding

1. **Site Title & Description**: Edit `app/layout.tsx`
2. **Favicon**: Replace `public/favicon.ico`
3. **Instagram Link**: Update in your theme file

---

## 📚 Detailed Documentation

### Theme System

The template includes a powerful theme system. See `THEME_SYSTEM.md` for:
- Available themes
- How to switch themes
- Customization options
- Testing and deployment

### Deployment

See `DEPLOYMENT_GUIDE.md` for:
- Ubuntu server deployment with PM2
- Running multiple themes simultaneously
- Environment configuration
- Troubleshooting

---

## 🛠 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: LangChain, LangGraph, OpenAI GPT-4
- **Image Generation**: Replicate (Flux models)
- **Database**: Supabase (optional)
- **UI**: Radix UI, Lucide Icons

---

## 📋 API Requirements

### Required APIs

1. **OpenAI API** ([Get Key](https://platform.openai.com/api-keys))
   - Used for: Chat, tattoo interpretation
   - Cost: Pay-as-you-go

2. **Replicate API** ([Get Token](https://replicate.com/account/api-tokens))
   - Used for: Image generation
   - Cost: Pay-as-you-go

### Optional APIs

3. **Supabase** ([Get Started](https://supabase.com))
   - Used for: Artist recommendations database
   - Cost: Free tier available

---

## 🎯 Features Breakdown

### 1. Tattoo Design Generation
- Text-to-image using Flux 1.1 Pro Ultra
- Optimized for tattoo-style artwork
- High-quality, detailed outputs

### 2. Design Modification
- Alter existing designs
- Change styles, add elements
- Refine and iterate

### 3. Cover-Up Design
- Upload existing tattoo photos
- Generate cover-up designs
- Incorporate existing line work

### 4. Tattoo Interpretation
- Analyze tattoo meanings
- Cultural significance
- Symbolism explanation

### 5. Instagram Integration
- Live Instagram feed embed
- Showcase your latest work
- Direct link to your profile

---

## 📁 Project Structure

```
tattoo-artist-ai-template/
├── app/
│   ├── api/chat/route.ts          # Main AI chat endpoint
│   ├── components/
│   │   ├── ChatWindow.tsx         # Chat interface
│   │   ├── ChatMessageBubble.tsx  # Message display
│   │   └── ui/                    # Reusable components
│   ├── themes/                    # Theme definitions
│   │   ├── index.ts               # Theme loader
│   │   ├── dreadmoor.ts          # Example theme 1
│   │   └── taetu.ts              # Example theme 2
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main page
│   └── globals.css                # Global styles
├── public/                        # Static assets
├── .env.local.template            # Environment template
├── THEME_SYSTEM.md               # Theme documentation
├── DEPLOYMENT_GUIDE.md           # Deployment instructions
└── package.json
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for beginners)
```bash
npm run build
# Deploy to Vercel via their dashboard
```

### Option 2: Ubuntu Server with PM2
See `DEPLOYMENT_GUIDE.md` for complete instructions.

### Option 3: Docker
```bash
docker build -t tattoo-ai .
docker run -p 3000:3000 tattoo-ai
```

---

## 💡 Tips for Artists

1. **Customize Prompts**: Add prompts that showcase YOUR specialty styles
2. **Brand Colors**: Match your existing brand colors in the theme
3. **Instagram**: Keep your feed updated for the live widget
4. **Logo**: Use a high-quality, circular logo for best results
5. **Test Locally**: Always test changes locally before deploying

---

## 🆘 Support & Resources

- **Documentation**: See `THEME_SYSTEM.md` and `DEPLOYMENT_GUIDE.md`
- **Issues**: Open an issue on GitHub
- **Updates**: Watch the repository for updates

---

## 📄 License

This template is provided for use by tattoo artists to create their own branded AI consultation platforms.

---

## 🙏 Credits

Built with ❤️ using:
- Next.js & React
- OpenAI & Replicate AI
- LangChain & LangGraph
- Tailwind CSS

**Powered by Tae'Tu AI Technology**

---

## 🎨 Example Themes Included

1. **Dreadmoor**: Dark, gothic, artistic theme
2. **Tae'Tu**: Clean, professional, water-inspired theme

Use these as references to create your own unique brand! 