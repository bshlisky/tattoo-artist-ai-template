# 🎨 Artist Setup Guide

**Complete step-by-step guide for tattoo artists to customize and deploy this template**

---

## 📋 Prerequisites

Before you start, make sure you have:

- [ ] A computer (Mac, Windows, or Linux)
- [ ] Basic text editing skills
- [ ] An Instagram account for your tattoo work
- [ ] Credit card for API services (OpenAI & Replicate)
- [ ] Optional: A domain name for your website

**Estimated Setup Time**: 2-3 hours  
**Monthly Cost**: $10-50 depending on usage

---

## 🚀 Part 1: Getting Started (30 minutes)

### Step 1: Install Required Software

#### Install Node.js
1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS version (recommended)
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Install Git (if not already installed)
1. Go to [git-scm.com](https://git-scm.com)
2. Download and install
3. Verify:
   ```bash
   git --version
   ```

#### Install a Code Editor
- **Recommended**: [VS Code](https://code.visualstudio.com)
- Alternative: Any text editor works

### Step 2: Get the Template

1. **Download or clone** this repository
2. **Open Terminal/Command Prompt**
3. **Navigate to the folder**:
   ```bash
   cd path/to/tattoo-artist-ai-template
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
   *(This will take 2-5 minutes)*

---

## 🔑 Part 2: API Setup (45 minutes)

### Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create new secret key**
5. **Copy and save** the key (you won't see it again!)
6. Add $5-10 credit to your account

**Cost**: ~$0.01-0.05 per conversation

### Get Replicate API Token

1. Go to [replicate.com](https://replicate.com)
2. Sign up or log in
3. Go to **Account Settings** → **API Tokens**
4. Copy your token
5. Add payment method

**Cost**: ~$0.05-0.15 per image generated

### Set Up Environment Variables

1. **Copy the template file**:
   ```bash
   cp .env.local.template .env.local
   ```

2. **Edit `.env.local`** with your keys:
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
   NEXT_PUBLIC_THEME=taetu
   ```

3. **Save the file**

---

## 🎨 Part 3: Customize Your Brand (1 hour)

### Create Your Theme

1. **Create a new theme file**: `app/themes/yourname.ts`

```typescript
export const yourTheme = {
  name: 'Your Studio Name',
  description: 'Professional tattoo artistry with AI-powered design consultation',
  
  colors: {
    primary: '#1a1a1a',      // Main background color
    secondary: '#2a2a2a',    // Secondary background
    accent: '#your-color',   // Your brand color (buttons, highlights)
    background: '#0a0a0a',   // Page background
    text: '#ffffff',         // Text color
  },
  
  effects: {
    glow: 'rgba(your-r, your-g, your-b, 0.3)',  // Glow effect color
    shadow: 'rgba(0, 0, 0, 0.5)',               // Shadow color
  },
  
  branding: {
    tagline: 'Your Studio - Your Tagline',
    instagram: '@your_instagram_handle',
    instagramUrl: 'https://www.instagram.com/your_instagram_handle/',
  },
};
```

**Tips for choosing colors**:
- Use your existing brand colors
- Keep backgrounds dark for better contrast
- Test on mobile devices
- Use a color picker from your logo

2. **Register your theme** in `app/themes/index.ts`:

```typescript
import { yourTheme } from './yourname';

export function getTheme() {
  const themeName = process.env.NEXT_PUBLIC_THEME || 'yourname';
  
  switch (themeName.toLowerCase()) {
    case 'yourname':
      return yourTheme;
    case 'taetu':
      return taetuTheme;
    case 'dreadmoor':
      return dreadmoorTheme;
    default:
      return yourTheme;
  }
}
```

3. **Set your theme** in `.env.local`:
```bash
NEXT_PUBLIC_THEME=yourname
```

### Add Your Logo

1. **Prepare your logo**:
   - Square or circular format works best
   - Recommended size: 500x500px minimum
   - Format: JPG, PNG, or SVG
   - Name it: `your_logo.jpg` (or .png)

2. **Add to project**:
   - Copy logo to `public/` folder

3. **Update ChatWindow.tsx**:

Find this section (around line 430):
```typescript
{theme.name === 'Tae\'Tu' ? (
  <img 
    src="/tae_tu_round.jpg" 
    alt="Tae'Tu Logo" 
    className="w-full h-full object-contain rounded-full"
  />
) : (
```

Change to:
```typescript
{theme.name === 'Your Studio Name' ? (
  <img 
    src="/your_logo.jpg" 
    alt="Your Studio Logo" 
    className="w-full h-full object-contain rounded-full"
  />
) : (
```

### Customize Suggested Prompts

Edit `app/page.tsx` (around line 40):

```typescript
const suggestedPrompts = [
  {
    title: "Your Specialty #1",
    prompt: "Create a [your style] tattoo design featuring [your specialty]...",
  },
  {
    title: "Your Specialty #2",
    prompt: "Design a [your style] with [your elements]...",
  },
  {
    title: "Your Specialty #3",
    prompt: "Generate a [your specialty] tattoo incorporating [your style]...",
  },
];
```

**Examples**:
- "Traditional Japanese dragon with cherry blossoms"
- "Blackwork geometric mandala with sacred geometry"
- "Watercolor style phoenix rising from flames"
- "Realistic portrait with floral elements"

### Update Site Metadata

Edit `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Your Studio Name - AI Tattoo Consultation",
  description: "Professional AI-powered tattoo design consultation and generation",
};
```

---

## 🧪 Part 4: Test Locally (15 minutes)

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test Checklist

- [ ] Logo appears correctly
- [ ] Colors match your brand
- [ ] Instagram link works
- [ ] Suggested prompts are relevant
- [ ] Generate a test tattoo design
- [ ] Try modifying a design
- [ ] Test on mobile (use your phone)
- [ ] Check all text is correct

### Common Issues

**Logo doesn't show**:
- Check filename matches exactly
- Make sure file is in `public/` folder
- Try clearing browser cache (Cmd+Shift+R or Ctrl+Shift+R)

**Colors look wrong**:
- Check hex codes in theme file
- Rebuild: Stop server (Ctrl+C) and run `npm run dev` again

**API errors**:
- Verify API keys in `.env.local`
- Check you have credit on OpenAI and Replicate accounts

---

## 🌐 Part 5: Deploy Your Site (30 minutes)

### Option A: Vercel (Easiest - Recommended for Beginners)

1. **Create GitHub account** (if you don't have one)
   - Go to [github.com](https://github.com)
   - Sign up

2. **Create a new repository**
   - Click "New repository"
   - Name it: `your-studio-tattoo-ai`
   - Make it Public or Private
   - Don't initialize with README

3. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - My tattoo AI site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/your-studio-tattoo-ai.git
   git push -u origin main
   ```

4. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Import Project"
   - Select your repository
   - Add environment variables:
     - `OPENAI_API_KEY`
     - `REPLICATE_API_TOKEN`
     - `NEXT_PUBLIC_THEME`
   - Click "Deploy"

5. **Done!** Your site is live at `your-project.vercel.app`

### Option B: Custom Domain

1. **Buy a domain** (GoDaddy, Namecheap, etc.)
2. **In Vercel**:
   - Go to your project
   - Settings → Domains
   - Add your domain
   - Follow DNS instructions

---

## 📱 Part 6: Instagram Integration

### Set Up Instagram Embed

Your Instagram feed will automatically show based on your theme settings.

**To update**:
1. Edit your theme file
2. Change `instagramUrl` to your profile
3. Redeploy

**Note**: Instagram embeds show your public posts. Make sure your account is public or the embed won't work.

---

## 💰 Cost Breakdown

### One-Time Costs
- Domain name: $10-15/year (optional)
- Logo design: $0-500 (if you need one made)

### Monthly Costs
- **Vercel Hosting**: FREE (hobby plan)
- **OpenAI API**: $5-20/month (depends on usage)
- **Replicate API**: $5-30/month (depends on usage)

**Average**: $10-50/month for moderate usage (50-200 designs)

### Cost Saving Tips
- Start with small API credits
- Monitor usage in dashboards
- Set spending limits in API accounts
- Consider charging clients for consultations

---

## 🎯 Part 7: Going Live

### Pre-Launch Checklist

- [ ] Test all features thoroughly
- [ ] Check mobile responsiveness
- [ ] Verify Instagram link works
- [ ] Test image generation (create 5-10 designs)
- [ ] Proofread all text
- [ ] Add API spending limits
- [ ] Share with friends for feedback

### Launch!

1. **Announce on social media**
2. **Add link to Instagram bio**
3. **Share with existing clients**
4. **Consider running a promotion**

### Post-Launch

- Monitor API costs daily for first week
- Collect user feedback
- Make adjustments as needed
- Keep Instagram updated

---

## 🆘 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### API key errors
- Double-check keys in `.env.local`
- Make sure no extra spaces
- Verify you have credit on accounts

### Build fails
```bash
npm run build
```
Check error messages and fix issues before deploying

### Site is slow
- Check API rate limits
- Consider upgrading Vercel plan
- Optimize images in `public/` folder

---

## 📚 Additional Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **OpenAI Help**: [help.openai.com](https://help.openai.com)
- **Replicate Docs**: [replicate.com/docs](https://replicate.com/docs)

---

## 🎉 You're Done!

Congratulations! You now have your own AI-powered tattoo consultation platform.

**Next Steps**:
- Experiment with different prompts
- Share with clients
- Gather feedback
- Customize further as needed

**Need Help?**
- Check existing documentation
- Open an issue on GitHub
- Join the community discussions

---

**Built with ❤️ for tattoo artists**

*Powered by Tae'Tu AI Technology*
