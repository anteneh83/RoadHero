# 🚗 RoadHero — Provider Partner Portal

RoadHero is a premium on-demand roadside assistance and service management platform tailored for garage owners, towing services, and technicians in Ethiopia (Addis Ababa). This repository contains the Next.js and TypeScript-based **Provider Partner Portal**, which enables local garage owners to register their business, manage field technicians, track customer rescue requests, log offline walk-ins, manage spare parts inventory, handle subscriptions, and monitor their revenue analytics in real time.

---

## 🌟 Key Product Features

### 1. 📊 Interactive Dashboard & Analytics
- **Live Business Metrics:** Real-time counters for active jobs, pending actions, today's jobs, today's revenue (ETB), average response times, and customer ratings.
- **Dynamic Analysis Charts:** Toggleable visual reports (line, bar, and pie charts) to analyze weekly revenue trends, overall garage performance, individual technician efficiency, and service category breakdown.
- **Real-time Activity Feed:** Immediate event logging for dispatch status, technician logins, and job completions.

### 2. ⚡ Real-Time Request Queue & Dispatch
- **Job Intake Queue:** Real-time list of customer requests (both Emergency and Scheduled) with customer location, distance, and vehicle details.
- **Intelligent Dispatching:** Select and assign on-duty technicians (Heros) to incoming jobs and provide estimated time of arrival (ETA).

### 3. 📍 Live Job Tracker & Map Integration
- **Interactive Leaflet Map:** Displays the real-time position of the technician, the client, and the target garage.
- **Step-by-Step Status Updates:** Seamless transition through the rescue workflow: `EN_ROUTE` ➔ `ARRIVED` ➔ `DIAGNOSING` ➔ `IN_PROGRESS` ➔ `COMPLETED`.
- **In-App Live Chat:** Direct communication channel between dispatchers/providers and customers during active missions.

### 4. 💼 Service Catalog Configuration
- **Custom Service Listings:** Set base prices, toggle visibility on the customer map, and define garage specialties.
- **Categorization:** Classify offerings (e.g., Towing, Mechanical, Battery Jumpstart, Tire Change).

### 5. 🛠️ Staff & Fleet Management
- **Technician Profiles:** Add new technicians, assign vehicles/license plates, and specify specialized skills.
- **Availability Toggle:** Track which technicians are online, on duty, or offline.
- **Unique PIN Authentication:** Generate secure, unique login PINs for technician mobile client logins.

### 6. 📦 Spare Parts Inventory Management
- **Stock Tracking:** Register spare parts with prices, quantities, and low-stock warning thresholds.
- **Automated Deduction:** Deduct inventory quantities directly when finalizing customer repair bills.

### 7. 📖 Revenue Journal (App & Walk-In Income)
- **Unified Log:** Automated entries for completed app-based rescues, plus manual logging of walk-in garage clients.
- **Transaction History:** Filterable transactions by date range and source with CSV data export.

### 8. 🛡️ Verification & Subscription System
- **Multi-Step Onboarding:** Step-by-step business details configuration, GPS landmark selection, and document upload (Business License, TIN Certificate, National ID).
- **Premium Subscriptions:** Monitor subscription status, initiate Telebirr/Chapa checkout URLs, and upload payment receipts.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React framework for server-side rendering and routing |
| **Language** | TypeScript | Strong typing and compiler-level safety |
| **Styling** | Tailwind CSS v4 & PostCSS | High-fidelity, responsive UI layouts |
| **Icons** | Lucide React | Clean, scalable vector iconography |
| **Mapping** | Leaflet & React-Leaflet | Open-source interactive maps and geocoding |
| **State & Logic** | React Hooks & Context | Localization and theme management |
| **API Client** | Axios | Configured HTTP client with request/response interceptors |
| **Animations** | Framer Motion | Fluid transitions and premium micro-interactions |

---

## 📁 Codebase Architecture

```text
RoadHero/
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── auth/               # Login, registration, OTP validation, and support
│   │   ├── provider/           # Main portal workspace
│   │   │   ├── dashboard/      # Business metrics & analysis charts
│   │   │   ├── queue/          # Active and pending job requests
│   │   │   ├── tracker/        # Interactive rescue map & job control panel
│   │   │   ├── technicians/    # Staff, vehicle assignment, and credentials
│   │   │   ├── services/       # Service catalog configuration
│   │   │   ├── inventory/      # Warehouse spare parts & stock levels
│   │   │   ├── revenue/        # Revenue ledger & CSV exporter
│   │   │   ├── subscription/   # Chapa/Telebirr checkout & payment uploads
│   │   │   ├── reviews/        # Customer reputation and replies
│   │   │   ├── settings/       # Profile configuration & image gallery
│   │   │   └── help/           # FAQs & support documentation
│   │   ├── globals.css         # Tailwind directives and style definitions
│   │   └── layout.tsx          # Root HTML layout with providers
│   ├── components/             # Reusable UI Components
│   │   ├── InteractiveMap.tsx  # Leaflet-based live-tracking map
│   │   ├── ProviderSidebar.tsx # Sidebar with Theme & Language switchers
│   │   ├── DashboardHeader.tsx # Universal portal header
│   │   └── Toast.tsx           # Global action notifications
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useLanguage.tsx     # Internationalization (English & Amharic translations)
│   │   └── useTheme.tsx        # Dark/Light theme coordinator
│   ├── lib/                    # Configuration libraries
│   │   ├── axios.ts            # Base API instance & auth interceptors
│   │   └── cloudinary.ts       # Image hosting setups
│   └── services/               # Modular API request handlers
│       └── api.service.ts      # Auth, onboarding, jobs, technicians, inventory, etc.
├── public/                     # Static media, icons, and map markers
├── tests/                      # Automated endpoint workflow scripts
│   └── api-workflow.js         # Integration flow test suite
├── package.json                # Project dependencies and script commands
├── tsconfig.json               # TypeScript compiler rules
└── tailwind.config.ts          # Tailwind theme configurations
```

---

## ⚙️ Setup & Configuration

### Prerequisites
- **Node.js** v18 or higher is recommended.
- A package manager such as **npm**, **yarn**, or **pnpm**.

### Environment Variables (`.env.local`)
Create a `.env.local` file in the root directory and populate it with the appropriate values:

```env
# Next.js Public Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1/

# Leaflet / Map Settings (if custom tiles are needed)
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Optional Third-Party Services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

---

## 🚀 Running the Project

```bash
# 1. Clone the repository
git clone https://github.com/anteneh83/RoadHero.git
cd RoadHero

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Lint and check for compilation errors
npm run lint

# 5. Build for production
npm run build
npm run start
```
The portal will be running locally at **`http://localhost:3000`**.

---

## 🧪 Integration Workflow Testing

To test integration with the backend API locally, you can run the automated API workflow script. This script verifies authentication, onboarding data retrieval, service catalogs, technicians, inventory, availability schedules, and revenue analytics.

```bash
# Run the automated test script (set BASE_URL to your backend server)
BASE_URL=http://localhost:8000 node tests/api-workflow.js
```

---

## 🌍 Localization (English & Amharic)

RoadHero supports full internationalization out of the box. Translation mappings are managed inside `src/hooks/useLanguage.tsx`. Any new interface strings should be added to both `en` and `am` keys to maintain bilingual completeness.

---

## 🤝 Contributing

1. **Fork** the repository and create a feature branch (`git checkout -b feature/amazing-feature`).
2. Make clean, atomic commits conforming to semantic guidelines.
3. Verify your changes do not violate TypeScript constraints or ESLint rules (`npm run lint`).
4. Push to your branch and submit a **Pull Request**.

---

## 📄 License
This project is proprietary. Add a `LICENSE` file in the root if you wish to apply an open-source or commercial license.
