# 🏭 WareFlow — Warehouse Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.7-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green)

> **Online Warehouse & Inventory ERP System for Distribution Businesses**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [API Reference](#-api-reference) • [Screenshots](#-screenshots)

</div>

---

## 📖 About

**WareFlow** is a full-featured **Warehouse Management ERP system** designed for distribution businesses that manage products across multiple warehouse locations. The system handles product catalogs, multi-warehouse stock tracking, inter-warehouse transfers, inventory audits, price management, and customer/supplier financial tracking with dual-currency support (USD & UZS).

Originally built for a wallpaper distribution company operating across Uzbekistan (Denov, Termez, Tashkent, Samarkand, Fergana), the system is flexible enough to handle any product distribution business.

---

## ✨ Features

### 📦 Product Management
- Full product catalog with categories and collections
- SKU & barcode generation (EAN13, Code128, UPC)
- Multi-tier pricing (retail, wholesale, minimum)
- Product image support
- Stock levels per warehouse

### 🏢 Multi-Warehouse Support
- Unlimited warehouse locations with address tracking
- Per-warehouse stock entries with quantity & cost price
- Stock reservation system

### 🚚 Inter-Warehouse Transfers
- Create and track transfers between warehouses
- Transfer status lifecycle: `PENDING → IN_TRANSIT → COMPLETED / CANCELLED`
- Document number generation
- Responsible person assignment

### 📋 Inventory Audits
- Stock audit creation and tracking
- System quantity vs actual quantity comparison
- Auto-calculated discrepancies
- Audit status: `IN_PROGRESS → COMPLETED`

### 💰 Price Lists
- Sale & Purchase price lists
- Multiple active price lists support
- Per-item price management

### 👥 Customer Management
- Individual & corporate customer profiles
- **Dual-currency balances** (USD + UZS)
- Customer groups with default discounts
- Regional segmentation
- Active/Inactive status tracking

### 🏭 Supplier Management
- Supplier profiles with contact information
- Dual-currency debt tracking (USD + UZS)
- Transaction history
- Category-based organization

### 📊 Dashboard
- Key KPI cards: transfers, warehouses, customer debt, supplier debt
- Financial summary with dual-currency display
- Product & warehouse statistics

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + custom utilities |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) + React Redux |
| **Database** | PostgreSQL |
| **ORM** | [Prisma 7.7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Runtime** | Node.js |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database (local or hosted)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nazarovdev1/WareFlow.git
   cd WareFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/warehouse_db?schema=public"
   ```

4. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database (optional — demo data)**
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
WareFlow/
├── app/                      # Next.js App Router
│   ├── api/                  # REST API route handlers
│   │   ├── products/         # Product CRUD
│   │   ├── warehouses/       # Warehouse CRUD
│   │   ├── transfers/        # Transfer management
│   │   ├── stock/            # Stock entries
│   │   ├── price-lists/      # Price list management
│   │   ├── inventory-audit/  # Stock audit
│   │   ├── customers/        # Customer CRUD + transactions
│   │   ├── customer-groups/  # Customer group management
│   │   ├── suppliers/        # Supplier CRUD + transactions
│   │   └── dashboard/stats/  # Dashboard statistics
│   ├── (pages)/              # Page components
│   │   ├── page.tsx          # Dashboard
│   │   ├── inventory/        # Product list & add form
│   │   ├── barcode/          # Barcode printing
│   │   ├── prices/           # Price list pages
│   │   ├── warehouse/        # Transfer, stock, audit pages
│   │   ├── customers/        # Customer management pages
│   │   └── suppliers/        # Supplier management pages
│   └── layout.tsx            # Root layout with sidebar
├── components/               # Reusable UI components
├── lib/                      # Utilities & Redux
│   ├── features/             # Redux Toolkit slices
│   └── db.ts                 # Prisma client (connection pooled)
├── prisma/
│   ├── schema.prisma         # Database schema (17 models)
│   └── seed.ts               # Demo data seeder
├── .env                      # Environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🔌 API Reference

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List products (search, filter, paginate) |
| `POST` | `/api/products` | Create product with optional initial stock |
| `DELETE` | `/api/products/[id]` | Delete a product |

### Warehouses
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/warehouses` | List warehouses |
| `POST` | `/api/warehouses` | Create warehouse |

### Transfers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transfers` | List transfers with filtering |
| `POST` | `/api/transfers` | Create new transfer |
| `GET` | `/api/transfers/[id]` | Get transfer details |
| `PATCH` | `/api/transfers/[id]` | Update transfer |
| `DELETE` | `/api/transfers/[id]` | Delete transfer |

### Stock
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stock` | List stock entries |
| `POST` | `/api/stock` | Create stock entry |

### Inventory Audits
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/inventory-audit` | List audits |
| `POST` | `/api/inventory-audit` | Create audit |
| `DELETE` | `/api/inventory-audit/[id]` | Delete audit |

### Price Lists
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/price-lists` | List price lists |
| `POST` | `/api/price-lists` | Create price list |
| `DELETE` | `/api/price-lists/[id]` | Delete price list |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | List customers with stats |
| `POST` | `/api/customers` | Create customer |
| `DELETE` | `/api/customers/[id]` | Delete customer |

### Customer Groups
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customer-groups` | List groups |
| `POST` | `/api/customer-groups` | Create group |

### Customer Transactions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customer-transactions` | List transactions |
| `POST` | `/api/customer-transactions` | Create transaction |

### Suppliers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suppliers` | List suppliers |
| `POST` | `/api/suppliers` | Create supplier |
| `DELETE` | `/api/suppliers/[id]` | Delete supplier |

### Supplier Transactions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/supplier-transactions` | List transactions |
| `POST` | `/api/supplier-transactions` | Create transaction |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregated statistics |

---

## 📸 Screenshots

### Dashboard
Main dashboard with key performance indicators and financial summary.

### Product Inventory
Product catalog with search, filtering, stock levels, and status indicators.

### Warehouse Transfers
Inter-warehouse transfer management with status tracking.

### Customer Management
Customer profiles with dual-currency balance tracking and regional breakdown.

---

## 🗄 Database Schema

The system uses **17 Prisma models** organized into 5 domains:

| Domain | Models |
|---|---|
| **Products** | `Category`, `Folder`, `Unit`, `Product` |
| **Warehouse** | `Warehouse`, `StockEntry` |
| **Transfers** | `Transfer`, `TransferItem` |
| **Inventory Audit** | `InventoryAudit`, `InventoryAuditItem` |
| **Pricing** | `PriceList`, `PriceListItem` |
| **Customers** | `CustomerGroup`, `Customer`, `CustomerTransaction` |
| **Suppliers** | `Supplier`, `SupplierTransaction` |

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema to database |
| `npx tsx prisma/seed.ts` | Seed demo data |

---

## 🚧 Roadmap

- [ ] Authentication & Authorization (JWT, RBAC)
- [ ] Sales module (SOTUVLAR)
- [ ] Purchases module (XARIDLAR)
- [ ] Financial reporting & analytics
- [ ] Barcode scanner integration
- [ ] Export to Excel/PDF
- [ ] Real-time stock alerts
- [ ] Multi-language support (EN/UZ/RU)
- [ ] Mobile-responsive improvements

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**nazarovdev1** — [GitHub](https://github.com/nazarovdev1)

---

<div align="center">
  Made with ❤️ for efficient warehouse management
</div>
