<!-- Banner -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:0d9488,100:0f172a&height=250&section=header&text=WareFlow%20ERP&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Professional%20Warehouse%20%26%20Inventory%20Management&descAlignY=55&descSize=18" alt="WareFlow Banner" />
</p>

<!-- Typing Animation -->
<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=24&duration=3000&pause=800&color=2DD4BF&center=true&vCenter=true&width=650&lines=Next.js+14+%7C+TypeScript+%7C+PostgreSQL;Multi-Warehouse+ERP+System;Thermal+Printer+Support;AI+Demand+Forecasting;Telegram+Bot+Integration" alt="Typing Animation" />
</p>

<!-- Badges -->
<p align="center">
  <a href="https://github.com/nazarovdev1/WareFlow/stargazers"><img src="https://img.shields.io/github/stars/nazarovdev1/WareFlow?style=for-the-badge&logo=github&color=fbbf24" alt="Stars" /></a>
  <a href="https://github.com/nazarovdev1/WareFlow/network/members"><img src="https://img.shields.io/github/forks/nazarovdev1/WareFlow?style=for-the-badge&logo=github&color=38bdf8" alt="Forks" /></a>
  <a href="https://github.com/nazarovdev1/WareFlow/issues"><img src="https://img.shields.io/github/issues/nazarovdev1/WareFlow?style=for-the-badge&logo=github&color=f87171" alt="Issues" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/nazarovdev1/WareFlow?style=for-the-badge&logo=opensourceinitiative&color=a3e635" alt="License" /></a>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript_5.3-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma_7.7-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
  <a href="https://redux-toolkit.js.org/"><img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white" alt="Redux" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL_16-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
</p>

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🎯 Overview

**WareFlow** — bu distribyutor kompaniyalar uchun mo'ljallangan **to'liq funksional ombor boshqaruv ERP tizimi**. Mahsulot kataloglari, ko'p omborli zaxira boshqaruvi, omborlararo transferlar, inventarizatsiya auditi, narxlar boshqaruvi va mijoz/ta'minotchi moliyaviy hisoblarini bitta platformada yuritish imkonini beradi.

<div align="center">

| | |
|---|---|
| 🌐 **Tillar** | O'zbek / Русский / English (multi-language i18n) |
| 💱 **Valyuta** | USD + UZS (ikki valyutali balans) |
| 🏢 **Omborlar** | Cheksiz miqdorda ombor qo'llab-quvvatlanadi |
| 🔐 **Auth** | NextAuth v4 + JWT + Role-based access (ADMIN / MANAGER / STAFF) |
| 📊 **Modellar** | 35+ ta Prisma modeli, 10+ enum, 8 ta domain |
| 🖨️ **Printer** | A4 / A5 / Termal 80mm / Termal 58mm |

</div>

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## ✨ Features

<details open>
<summary><strong>📦 Mahsulotlar boshqaruvi</strong></summary>

- ✅ To'liq mahsulot katalogi (kategoriya + kollektsiya + o'lchov birligi)
- ✅ SKU & shtrix-kod generatsiya (EAN13, Code128, UPC)
- ✅ Ko'p darajali narxlar (chakana ← ulgurji ← minimal)
- ✅ Mahsulot rasmlari qo'llab-quvvatlanadi
- ✅ Har bir ombor bo'yicha zaxira darajasi
- ✅ Mahsulot variantlari (rang, o'lcham) va partiyalar (FIFO/FEFO)
</details>

<details>
<summary><strong>🏢 Ko'p ombor tizimi</strong></summary>

- ✅ Cheksiz miqdordagi omborlar (manzil tracking bilan)
- ✅ Har bir ombor uchun alohida zaxira yozuvlari (miqdor + tannarx)
- ✅ Zaxira band qilish (reservation) tizimi
- ✅ Ombor orali threshold ogohlantirishlar
</details>

<details>
<summary><strong>🚚 Omborlararo transferlar</strong></summary>

- ✅ Omborlar orasida transfer yaratish va kuzatish
- ✅ Status lifecycle: `PENDING` → `IN_TRANSIT` → `COMPLETED` / `CANCELLED`
- ✅ Hujjat raqami generatsiya (auto-increment)
- ✅ Mas'ul shaxs tayinlash
</details>

<details>
<summary><strong>📋 Inventarizatsiya auditi</strong></summary>

- ✅ Zaxira auditini yaratish va boshqarish
- ✅ Tizim miqdori vs faktik miqdor taqqoslash
- ✅ Avtomatik farq hisoblash
- ✅ Audit status: `IN_PROGRESS` → `COMPLETED`
</details>

<details>
<summary><strong>💰 Narxlar ro'yxati</strong></summary>

- ✅ Sotuv (SALE) va Xarid (PURCHASE) narxlar ro'yxati
- ✅ Bir nechta aktiv narxlar ro'yxatini qo'llab-quvvatlaydi
- ✅ Har bir mahsulot uchun individual narx belgilash
</details>

<details>
<summary><strong>👥 Mijozlar boshqaruvi</strong></summary>

- ✅ Individual va korporativ mijoz profillari
- ✅ **Ikki valyutali balans** (USD + UZS)
- ✅ Mijozlar guruhlari (standart chegirma bilan)
- ✅ Hudud bo'yicha segmentatsiya
- ✅ Aktiv / Nofaol status tracking
- ✅ Qarzdor mijozlar ro'yxati
- ✅ Sodiqlik dasturi (Bronze → Silver → Gold → Platinum)
</details>

<details>
<summary><strong>🏭 Ta'minotchilar boshqaruvi</strong></summary>

- ✅ Ta'minotchi profillari (aloqa shaxsi, telefon, kategoriya)
- ✅ Ikki valyutali qarz/kredit hisobi (USD + UZS)
- ✅ Tranzaksiyalar tarixi
- ✅ Kreditdor ta'minotchilar ro'yxati
</details>

<details>
<summary><strong>🖨️ Chop etish & Shablonlar</strong></summary>

- ✅ 5 ta hujjat turi: Hisob-faktura, Chek, Yo'l xati, Dalolatnoma, Maxsus
- ✅ 4 ta qog'oz o'lchami: A4, A5, Termal 80mm, Termal 58mm
- ✅ Vizual shablon muharriri (HTML + Live Preview)
- ✅ Thermal printer uchun monospace optimallashtirilgan CSS
- ✅ `@media print` bilan to'g'ri chop etish
</details>

<details>
<summary><strong>📊 Dashboard & Analytics</strong></summary>

- ✅ Asosiy KPI kartochkalar (transferlar, omborlar, mijoz qarzi, ta'minotchi qarzi)
- ✅ Ikki valyutali moliyaviy xulosa
- ✅ Mahsulot va ombor statistikasi
- ✅ AI talab bashorati (Demand Forecast)
</details>

<details>
<summary><strong>🤖 Integratsiyalar</strong></summary>

- ✅ Telegram bot (buyurtma, zaxira ogohlantirish, kunlik hisobot)
- ✅ 1C Buxgalteriya sinxronizatsiyasi
- ✅ Webhook & API kalitlari
- ✅ Barcode skaner (ZXing)
</details>

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🛠 Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  Next.js 14 (App Router)  •  React 18  •  TypeScript 5.3      │
│  Tailwind CSS 3.4         •  Lucide Icons  •  Recharts         │
│  Redux Toolkit            •  React Redux  •  React-to-Print    │
├─────────────────────────────────────────────────────────────────┤
│                         AUTH LAYER                              │
│  NextAuth v4  •  JWT  •  bcryptjs  •  Middleware Protection    │
├─────────────────────────────────────────────────────────────────┤
│                       DATABASE LAYER                            │
│  Prisma 7.7  •  @prisma/adapter-pg  •  PostgreSQL 16           │
│  Connection Pooling  •  Global Client Singleton                 │
├─────────────────────────────────────────────────────────────────┤
│                      INTEGRATIONS                               │
│  Leaflet (Maps)  •  ZXing (Barcode)  •  XLSX (Export)          │
│  Telegram Bot API  •  Recharts (Charts)                        │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Texnologiya | Versiya |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | `14.2` |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.3` |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom utilities | `3.4` |
| **State** | [Redux Toolkit](https://redux-toolkit.js.org/) + React Redux | `2.2` |
| **Auth** | [NextAuth](https://next-auth.js.org/) v4 + bcryptjs | `4.24` |
| **Validation** | [Zod](https://zod.dev/) | `4.3` |
| **ORM** | [Prisma](https://www.prisma.io/) + `@prisma/adapter-pg` | `7.7` |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | `16+` |
| **Icons** | [Lucide React](https://lucide.dev/) | `0.358` |
| **Runtime** | Node.js | `18+` |

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🚀 Quick Start

### 📋 Prerequisites

| Dastur | Versiya | O'rnatish |
|---|---|---|
| [Node.js](https://nodejs.org/) | `18+` | `nvm install 22` |
| [PostgreSQL](https://www.postgresql.org/) | `14+` | Local yoki hosted (Neon, Supabase, Railway) |
| [npm](https://www.npmjs.com/) | `9+` | Node.js bilan birga keladi |

### ⚡ 5 qadamda ishga tushirish

```bash
# 1️⃣  Repository'ni klonlash
git clone https://github.com/nazarovdev1/WareFlow.git
cd WareFlow

# 2️⃣  Dependency'larni o'rnatish
npm install

# 3️⃣  .env fayl yaratish
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/wareflow_db?schema=public"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
EOF

# 4️⃣  Database'ni sozlash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts          # ⚡ Admin user yaratadi

# 5️⃣  Dev server'ni ishga tushirish
npm run dev
```

> 🌐 **Brauzerda oching:** [http://localhost:3000](http://localhost:3000)
>
> 🔑 **Default Admin:** `admin@wareflow.uz` / `admin`

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🏗 Architecture

### 📁 Project Structure

```
WareFlow/
├── app/                              # Next.js App Router
│   ├── (dashboard)/                  # 🎯 Protected dashboard routes
│   │   ├── layout.tsx                #    → Dashboard layout (sidebar)
│   │   ├── page.tsx                  #    → Main dashboard
│   │   ├── inventory/                #    → Mahsulotlar ro'yxati
│   │   ├── barcode/                  #    → Shtrix-kod chop etish
│   │   ├── prices/                   #    → Narxlar ro'yxati
│   │   ├── warehouse/                #    → Ombor boshqaruvi
│   │   ├── customers/                #    → Mijozlar
│   │   ├── suppliers/                #    → Ta'minotchilar
│   │   ├── sales/                    #    → Savdolar
│   │   ├── purchases/                #    → Xaridlar
│   │   ├── deliveries/               #    → Yetkazib berish
│   │   ├── cashbox/                  #    → Kassa
│   │   ├── contracts/                #    → Shartnomalar
│   │   ├── print-templates/          #    → Chop etish shablonlari
│   │   ├── loyalty/                  #    → Sodiqlik dasturi
│   │   ├── ai-forecast/              #    → AI bashorat
│   │   ├── telegram/                 #    → Telegram bot
│   │   ├── 1c-sync/                  #    → 1C integratsiya
│   │   └── settings/                 #    → Sozlamalar
│   │
│   ├── api/                          # 🔌 REST API Routes (~40 ta endpoint)
│   ├── login/                        # 🔐 Login sahifa
│   ├── mobile/                       # 📱 Mobil versiya
│   └── layout.tsx                    # Root layout
│
├── components/                       # 🧩 UI Components
├── lib/                              # 📚 Utilities, Redux, i18n, auth
├── prisma/                           # 🗄 Database schema (35+ models)
├── public/                           # 🌍 Static assets, PWA
└── types/                            # 📘 TypeScript declarations
```

### 🗄 Database Schema

```
┌──────────────────────────────────────────────────────────────┐
│                     DATABASE DOMAINS                         │
├──────────────┬───────────────────────────────────────────────┤
│  📦 Products │  Category, Folder, Unit, Product, Variant     │
│  🏢 Warehouse│  Warehouse, StockEntry, StockThreshold        │
│  🚚 Transfer │  Transfer, TransferItem                       │
│  📋 Audit    │  InventoryAudit, InventoryAuditItem           │
│  💰 Pricing  │  PriceList, PriceListItem                     │
│  👥 Customers│  CustomerGroup, Customer, Transaction, Loyalty│
│  🏭 Suppliers│  Supplier, SupplierTransaction                │
│  🛒 Sales    │  Order, OrderItem, Commission                 │
│  📥 Purchase │  Purchase, PurchaseItem, ProductBatch         │
│  💵 Cashbox  │  Cashbox, CashTransaction, Expense            │
│  🚚 Delivery │  Delivery, DeliveryRoute, RouteStop           │
│  🤖 AI       │  DemandForecast                               │
│  📢 Notif.   │  AdminNotification, UserNotification          │
│  📊 Logs     │  ActivityLog                                  │
│  🔗 API      │  ApiKey, Webhook                              │
│  🤖 Telegram │  TelegramBotConfig, TelegramChat              │
│  💱 Finance  │  ExchangeRate, Subscription, Contract         │
│  🔐 Auth     │  User, UserSettings, UserRequest              │
│  📑 Print    │  PrintTemplate                                │
│  🔗 1C       │  OneCConfig, OneCSyncLog                      │
└──────────────┴───────────────────────────────────────────────┘
```

**Jami:** 35+ model • 10+ enum • 50+ relation • Cascade delete support

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 📸 Screenshots

<p align="center">
  <img src="mobiledesign/Screenshot%20From%202026-04-19%2017-52-22.png" width="30%" alt="Dashboard" />
  <img src="mobiledesign/Screenshot%20From%202026-04-19%2017-52-41.png" width="30%" alt="Inventory" />
  <img src="mobiledesign/Screenshot%20From%202026-04-19%2017-52-50.png" width="30%" alt="Sales" />
</p>

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🗺 Roadmap

### ✅ Amalga oshirilgan
- [x] Mahsulotlar boshqaruvi (CRUD + shtrix-kod)
- [x] Ko'p ombor tizimi
- [x] Omborlararo transferlar
- [x] Inventarizatsiya auditi
- [x] Narxlar ro'yxati
- [x] Mijozlar boshqaruvi (ikki valyuta + sodiqlik)
- [x] Ta'minotchilar boshqaruvi
- [x] Savdo & Xaridlar modullari
- [x] Kassa boshqaruvi
- [x] Yetkazib berish marshrutlash (Leaflet)
- [x] Dashboard statistika
- [x] Chop etish shablonlari (A4/A5/80mm/58mm)
- [x] Autentifikatsiya (NextAuth + JWT + RBAC)
- [x] Mobil responsive versiya
- [x] Telegram bot integratsiyasi
- [x] 1C integratsiya
- [x] AI talab bashorati

### 🚧 Rejalashtirilgan
- [ ] Real-time zaxira ogohlantirishlar (WebSocket)
- [ ] Ko'p tilli qo'llab-quvvatlash (UZ / RU / EN)
- [ ] Advanced hisobotlar builder
- [ ] Docker containerizatsiya
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Mobile App (React Native / Expo)
- [ ] Voice search & commands

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🤝 Contributing

Contributions xush keladi! Iltimos, Pull Request yuboring:

```bash
# 1. Fork qiling
# 2. Feature branch yarating
git checkout -b feature/yangi-funksiya

# 3. Commit qiling
git commit -m "feat: yangi funksiya qo'shildi"

# 4. Push qiling
git push origin feature/yangi-funksiya

# 5. Pull Request oching
```

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 📄 License

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-success.svg?style=for-the-badge&logo=opensourceinitiative" alt="MIT License" />
  </a>
</p>

MIT License — erkin foydalanish, o'zgartirish va tarqatish mumkin.

<!-- Animated Line -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 👨‍💻 Author

<p align="center">
  <a href="https://github.com/nazarovdev1">
    <img src="https://img.shields.io/badge/GitHub-nazarovdev1-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
</p>

<p align="center">
  <em>🏭 WareFlow — Ombor boshqaruvi samarali, tez va ishonchli.</em><br/>
  <sub>Made with ❤️ and ☕ in Uzbekistan</sub>
</p>

<!-- Footer Wave -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d9488,50:0f172a,100:0d9488&height=120&section=footer" alt="Footer Wave" />
</p>
