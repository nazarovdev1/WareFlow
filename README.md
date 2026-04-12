<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=2DD4BF&center=true&vCenter=true&width=600&lines=WareFlow+%E2%80%94+Warehouse+ERP" alt="Typing SVG" />
</p>

<p align="center">
  <strong>🏭 Online Warehouse & Inventory ERP System</strong><br/>
  <em>Distribution bizneslari uchun to'liq ombor boshqaruv tizimi</em>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14.1-black?logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-7.7-2D3748?logo=prisma&logoColor=white" alt="Prisma" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
  <a href="https://redux-toolkit.js.org/"><img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux&logoColor=white" alt="Redux" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <br/>
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="#-tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="#-architecture"><strong>Architecture</strong></a> ·
  <a href="#-api-reference"><strong>API</strong></a> ·
  <a href="#-roadmap"><strong>Roadmap</strong></a>
</p>

---

## 🎯 Overview

**WareFlow** — bu distribyutor kompaniyalar uchun mo'ljallangan **to'liq funksional ombor boshqaruv ERP tizimi**. Mahsulot kataloglari, ko'p omborli zaxira boshqaruvi, omborlararo transferlar, inventarizatsiya auditi, narxlar boshqaruvi va mijoz/ta'minotchi moliyaviy hisoblarini bitta platformada yuritish imkonini beradi.

| | |
|---|---|
| 🌐 **Til** | O'zbek / Русский / English (multi-language) |
| 💱 **Valyuta** | USD + UZS (ikki valyutali balans) |
| 🏢 **Omborlar** | Cheksiz miqdorda ombor qo'llab-quvvatlanadi |
| 🔐 **Auth** | NextAuth v4 + JWT + Role-based access (ADMIN / MANAGER / STAFF) |
| 📊 **Modellar** | 18 ta Prisma modeli, 5 ta domain |

---

## ✨ Features

<details open>
<summary><strong>📦 Mahsulotlar boshqaruvi</strong></summary>

- ✅ To'liq mahsulot katalogi (kategoriya + kollektsiya + o'lchov birligi)
- ✅ SKU & shtrix-kod generatsiya (EAN13, Code128, UPC)
- ✅ Ko'p darajali narxlar (chakana ← ulgurji ← minimal)
- ✅ Mahsulot rasmlari qo'llab-quvvatlanadi
- ✅ Har bir ombor bo'yicha zaxira darajasi
</details>

<details>
<summary><strong>🏢 Ko'p ombor tizimi</strong></summary>

- ✅ Cheksiz miqdordagi omborlar (manzil tracking bilan)
- ✅ Har bir ombor uchun alohida zaxira yozuvlari (miqdor + tannarx)
- ✅ Zaxira band qilish (reservation) tizimi
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
- ✅ Qarzдор mijozlar ro'yxati
</details>

<details>
<summary><strong>🏭 Ta'minotchilar boshqaruvi</strong></summary>

- ✅ Ta'minotchi profillari (aloqa shaxsi, telefon, kategoriya)
- ✅ Ikki valyutali qarz/kredit hisobi (USD + UZS)
- ✅ Tranzaksiyalar tarixi
- ✅ Kreditdor ta'minotchilar ro'yxati
</details>

<details>
<summary><strong>📊 Dashboard & Analytics</strong></summary>

- ✅ Asosiy KPI kartochkalar (transferlar, omborlar, mijoz qarzi, ta'minotchi qarzi)
- ✅ Ikki valyutali moliyaviy xulosa
- ✅ Mahsulot va ombor statistikasi
</details>

<details>
<summary><strong>🔐 Autentifikatsiya</strong></summary>

- ✅ NextAuth v4 + Credentials Provider
- ✅ JWT session boshqaruvi
- ✅ Rolga asoslangan kirish (ADMIN / MANAGER / STAFF)
- ✅ Middleware orqali himoyalangan route'lar
- ✅ Chiroyli login sahifa (responsive dizayn)
</details>

---

## 🛠 Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  Next.js 14 (App Router)  •  React 18  •  TS 5     │
│  Tailwind CSS 3           •  Lucide Icons           │
│  Redux Toolkit            •  React Redux            │
├─────────────────────────────────────────────────────┤
│                   AUTH LAYER                        │
│  NextAuth v4  •  JWT  •  bcryptjs  •  Middleware   │
├─────────────────────────────────────────────────────┤
│                 DATABASE LAYER                      │
│  Prisma 7.7  •  @prisma/adapter-pg  •  PostgreSQL   │
│  Connection Pooling  •  Global Client Singleton     │
└─────────────────────────────────────────────────────┘
```

| Layer | Texnologiya | Versiya |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | `14.1` |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.3` |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom utilities | `3.4` |
| **State** | [Redux Toolkit](https://redux-toolkit.js.org/) + React Redux | `2.2` |
| **Auth** | [NextAuth](https://next-auth.js.org/) v4 + bcryptjs | `4.24` |
| **Validation** | [Zod](https://zod.dev/) | `4.3` |
| **ORM** | [Prisma](https://www.prisma.io/) + `@prisma/adapter-pg` | `7.7` |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | `16+` |
| **Icons** | [Lucide React](https://lucide.dev/) | `0.358` |
| **Runtime** | Node.js | `18+` |

---

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
> 🔑 **Default Admin:** `admin@ibox.uz` / `admin`

---

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
│   │   │   ├── page.tsx
│   │   │   └── add/page.tsx
│   │   ├── warehouse/                #    → Ombor boshqaruvi
│   │   │   ├── page.tsx              #       → Transferlar
│   │   │   ├── stock/page.tsx        #       → Zaxira
│   │   │   ├── inventory/page.tsx    #       → Inventarizatsiya
│   │   │   └── add/page.tsx          #       → Ombor qo'shish
│   │   ├── customers/                #    → Mijozlar
│   │   │   ├── page.tsx              #       → Ro'yxat
│   │   │   ├── add/page.tsx          #       → Qo'shish
│   │   │   ├── groups/page.tsx       #       → Guruhlar
│   │   │   ├── groups/[id]/page.tsx  #       → Guruh tafsilotlari
│   │   │   └── debtors/page.tsx      #       → Qarzдорlar
│   │   └── suppliers/                #    → Ta'minotchilar
│   │       ├── page.tsx
│   │       ├── add/page.tsx
│   │       └── creditors/page.tsx    #       → Kreditdorlar
│   │
│   ├── api/                          # 🔌 REST API Routes
│   │   ├── auth/[...nextauth]/       #    → NextAuth handler
│   │   ├── products/                 #    → Mahsulotlar CRUD
│   │   ├── warehouses/               #    → Omborlar CRUD
│   │   ├── transfers/                #    → Transferlar
│   │   ├── stock/                    #    → Zaxira yozuvlari
│   │   ├── price-lists/              #    → Narxlar ro'yxati
│   │   ├── inventory-audit/          #    → Inventarizatsiya
│   │   ├── customers/                #    → Mijozlar
│   │   ├── customer-groups/          #    → Mijoz guruhlari
│   │   ├── suppliers/                #    → Ta'minotchilar
│   │   ├── dashboard/stats/          #    → Dashboard statistika
│   │   └── setup-admin/              #    → Admin yaratish endpoint
│   │
│   ├── login/                        # 🔐 Login sahifa
│   │   └── page.tsx
│   ├── layout.tsx                    # Root layout
│   └── providers.tsx                 # Redux + Auth providers
│
├── components/                       # 🧩 UI Components
│   ├── providers/
│   │   └── AuthProvider.tsx          #    → NextAuth session provider
│   └── ...                           #    → Reusable components
│
├── lib/                              # 📚 Utilities
│   ├── db.ts                         #    → Prisma client (pooled singleton)
│   ├── auth.ts                       #    → NextAuth config
│   ├── features/                     #    → Redux Toolkit slices
│   └── ...
│
├── prisma/
│   ├── schema.prisma                 # 🗄  Database schema (18 models)
│   └── seed.ts                       # 🌱  Admin user seeder
│
├── middleware.ts                     # 🛡  Auth middleware (route protection)
├── .env                              # 🔑  Environment variables
├── next.config.js                    # ⚙️  Next.js config
├── tailwind.config.ts                # 🎨  Tailwind config
├── tsconfig.json                     # 📘  TypeScript config
└── package.json                      # 📦  Dependencies
```

### 🗄 Database Schema

```
┌──────────────────────────────────────────────────────────────┐
│                     DATABASE DOMAINS                         │
├──────────────┬───────────────────────────────────────────────┤
│  📦 Products │  Category, Folder, Unit, Product              │
│  🏢 Warehouse│  Warehouse, StockEntry                        │
│  🚚 Transfer │  Transfer, TransferItem                       │
│  📋 Audit    │  InventoryAudit, InventoryAuditItem           │
│  💰 Pricing  │  PriceList, PriceListItem                     │
│  👥 Customers│  CustomerGroup, Customer, CustomerTransaction  │
│  🏭 Suppliers│  Supplier, SupplierTransaction                │
│  🔐 Auth     │  User (ADMIN / MANAGER / STAFF)               │
└──────────────┴───────────────────────────────────────────────┘
```

**Jami:** 18 model • 5 enum • 30+ relation • Cascade delete support

---

## 🔌 API Reference

### 🔐 Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/signin` | `{ email, password }` | Login |
| `POST` | `/api/auth/signout` | — | Logout |
| `GET` | `/api/auth/session` | — | Get current session |

### 📦 Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Ro'yxat (qidiruv, filter, paginatsiya) |
| `POST` | `/api/products` | Yangi mahsulot yaratish |
| `DELETE` | `/api/products/[id]` | Mahsulotni o'chirish |

### 🏢 Warehouses

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/warehouses` | Omborlar ro'yxati |
| `POST` | `/api/warehouses` | Yangi ombor yaratish |

### 🚚 Transfers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transfers` | Transferlar ro'yxati (filter bilan) |
| `POST` | `/api/transfers` | Yangi transfer yaratish |
| `GET` | `/api/transfers/[id]` | Transfer tafsilotlari |
| `PATCH` | `/api/transfers/[id]` | Transfer yangilash |
| `DELETE` | `/api/transfers/[id]` | Transfer o'chirish |

### 📋 Inventory Audits

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/inventory-audit` | Auditlar ro'yxati |
| `POST` | `/api/inventory-audit` | Yangi audit yaratish |
| `DELETE` | `/api/inventory-audit/[id]` | Audit o'chirish |

### 💰 Price Lists

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/price-lists` | Narxlar ro'yxati |
| `POST` | `/api/price-lists` | Yangi narxlar ro'yxati |
| `DELETE` | `/api/price-lists/[id]` | O'chirish |

### 👥 Customers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | Mijozlar ro'yxati (statistika bilan) |
| `POST` | `/api/customers` | Yangi mijoz yaratish |
| `DELETE` | `/api/customers/[id]` | Mijoz o'chirish |

### 🏭 Suppliers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suppliers` | Ta'minotchilar ro'yxati |
| `POST` | `/api/suppliers` | Yangi ta'minotchi yaratish |
| `DELETE` | `/api/suppliers/[id]` | Ta'minotchi o'chirish |

### 📊 Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregatsiyalangan statistika |

---

## 🔧 Configuration

### Environment Variables

| Variable | Tavsif | Majburiy | Misol |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL ulanish string | ✅ | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | JWT sign uchun secret kalit | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App base URL | ✅ (prod) | `http://localhost:3000` |

### Available Scripts

| Buyruq | Tavsif |
|---|---|
| `npm run dev` | Development server (`http://localhost:3000`) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint tekshiruvi |
| `npx prisma generate` | Prisma client generatsiya |
| `npx prisma db push` | Schema'ni database'ga push qilish |
| `npx prisma studio` | Prisma Studio GUI (database browser) |
| `npx tsx prisma/seed.ts` | Demo data seed |

---

## 🗺 Roadmap

### ✅ Amalga oshirilgan
- [x] Mahsulotlar boshqaruvi (CRUD + shtrix-kod)
- [x] Ko'p ombor tizimi
- [x] Omborlararo transferlar
- [x] Inventarizatsiya auditi
- [x] Narxlar ro'yxati
- [x] Mijozlar boshqaruvi (ikki valyuta)
- [x] Ta'minotchilar boshqaruvi
- [x] Dashboard statistika
- [x] Autentifikatsiya (NextAuth + JWT + RBAC)
- [x] Login sahifa + Middleware protection

### 🚧 Rejalashtirilgan
- [ ] Sotuvlar moduli (SOTUVLAR) — order, invoice, receipt
- [ ] Xaridlar moduli (XARIDLAR) — purchase orders
- [ ] Moliyaviy hisobotlar & analitika
- [ ] Shtrix-kod skanner integratsiya
- [ ] Excel/PDF eksport
- [ ] Real-time zaxira ogohlantirishlar
- [ ] Ko'p til qo'llab-quvvatlash (UZ / RU / EN)
- [ ] Mobil responsive yaxshilash
- [ ] Docker containerizatsiya
- [ ] CI/CD pipeline

---

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

---

## 📄 License

MIT License — erkin foydalanish, o'zgartirish va tarqatish mumkin.

---

## 👨‍💻 Author

<div align="center">

| | |
|---|---|
| **nazarovdev1** | [GitHub Profile](https://github.com/nazarovdev1) |
| | [WareFlow Repository](https://github.com/nazarovdev1/WareFlow) |

</div>

---

<p align="center">
  <em>🏭 WareFlow — Ombor boshqaruvi samarali, tez va ishonchli.</em><br/>
  <sub>Made with ❤️ and ☕ in Uzbekistan</sub>
</p>
