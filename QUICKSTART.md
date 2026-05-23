# ⚡ Quick Start Guide

**Get your AI tattoo consultation site running in 15 minutes**

---

## 1️⃣ Install (5 minutes)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tattoo-artist-ai-template.git
cd tattoo-artist-ai-template

# Install dependencies
npm install
```

---

## 2️⃣ Configure (5 minutes)

### Get API Keys

1. **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Replicate**: [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

### Set Up Environment

```bash
# Copy template
cp .env.local.template .env.local

# Edit .env.local and add your keys:
# OPENAI_API_KEY=sk-proj-xxxxx
# REPLICATE_API_TOKEN=r8_xxxxx
# NEXT_PUBLIC_THEME=taetu
```

---

## 3️⃣ Run (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**That's it!** 🎉

---

## 🎨 Next Steps

### Customize Your Brand

1. **Create your theme**: `app/themes/yourname.ts`
2. **Add your logo**: `public/your_logo.jpg`
3. **Update prompts**: `app/page.tsx`

See **ARTIST_SETUP_GUIDE.md** for detailed instructions.

---

## 🚀 Deploy

### Vercel (Recommended)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Deploy at vercel.com
# Import your GitHub repo
# Add environment variables
# Click Deploy
```

**Done!** Your site is live.

---

## 📚 Full Documentation

- **ARTIST_SETUP_GUIDE.md** - Complete customization guide
- **THEME_SYSTEM.md** - Theme documentation
- **DEPLOYMENT_GUIDE.md** - Deployment instructions
- **README.md** - Full project overview

---

## 🆘 Need Help?

**Common Issues**:

- **API errors**: Check your keys in `.env.local`
- **Module errors**: Run `npm install` again
- **Build fails**: Run `npm run build` to see errors

**Still stuck?** Open an issue on GitHub.

---

**Happy tattooing!** 🎨✨
