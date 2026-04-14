# 🚀 Netlify Deploy Qo'llanma

## Tezkor Deploy (3 qadam)

### 1️⃣ Dependencies o'rnatish
```bash
cd /home/fedora/VolumeD/IBOX
npm install
```

### 2️⃣ Git'ga push qilish
```bash
git add .
git commit -m "feat: Netlify deployment ready"
git push origin main
```

### 3️⃣ Netlify'da sayt yaratish

#### **Variant A: Dashboard orqali (Tavsiya)**
1. [app.netlify.com](https://app.netlify.com) ga kiring
2. **"Add new site"** → **"Import an existing project"**
3. Git provider'ni tanlang (GitHub/GitLab/Bitbucket)
4. **IBOX** repository'ni tanlang
5. Build settings avtomatik to'ldiriladi (`netlify.toml` dan)
6. **"Deploy site"** tugmasini bosing

#### **Variant B: CLI orqali**
```bash
# Netlify CLI o'rnatish
npm install -g netlify-cli

# Login
netlify login

# Sayt yaratish va deploy
netlify init
# yoki
netlify deploy --build --prod
```

---

## ⚠️ Muhim: Environment Variables

Deploy bo'lgandan keyin **Netlify Dashboard** → **Site Settings** → **Environment variables** ga quyidagilarni qo'shing:

| Variable | Qiymat (`.env` dan) |
|----------|---------------------|
| `DATABASE_URL` | `postgresql://idelhome:0n8DtF3wXFKEhZlMZezCwXQOioGkC4sQ@dpg-d7bnj30gjchc73dp5sh0-a.oregon-postgres.render.com/idealhome?sslmode=require` |
| `NEXTAUTH_SECRET` | `NgugSjkpfcdqduoePNxlGesT320J5dy1XzynEmTwTkU=` |
| `NEXTAUTH_URL` | `https://SIZNING-SAYTINGIZ.netlify.app` |

**Muhim:** `NEXTAUTH_URL` ni deploy URL bilan almashtiring!

---

## ✅ Tekshirish

Deploy tugagandan keyin:

1. **Site URL** ni oching
2. **Login sahifasi** ochilishi kerak
3. **Admin credentials:**
   - Email: `admin@ibox.uz`
   - Password: `admin`

---

## 🔧 Muammolar va Yechimlar

### Build xato bersa:
```bash
# Local'da build test
npm run build

# Netlify loglarni ko'rish
netlify logs --build
```

### Database ulanmasa:
- Environment variables to'g'riligini tekshiring
- `DATABASE_URL` formati: `postgresql://user:password@host:port/database?sslmode=require`

### Next-auth ishlamasa:
- `NEXTAUTH_URL` to'g'ri ekanligini tekshiring
- `NEXTAUTH_SECRET` mavjudligini tekshiring

---

## 📁 Tayyor Fayllar

✅ `netlify.toml` - Netlify konfiguratsiyasi
✅ `next.config.js` - `output: 'standalone'` (Netlify uchun)
✅ `.gitignore` - `.env` himoyalangan
✅ `package.json` - barcha dependencies

---

**Tayyor!** Git'ga push qiling va Netlify avtomatik deploy qiladi! 🎉
