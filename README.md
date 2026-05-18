# Rental & Personal Finance Suite

A multi-app React workspace combining an **Apartment Bill Tracker** (rooms, tenants, utility billing, aircon maintenance, expenses, reports) and a **Personal Finance Tracker** (transactions, budgets, goals, recurring payments) behind a single authenticated login. Built with React 19, Firebase (Auth + Firestore + Storage), and Tailwind CSS.

**Live URL**: `https://apartment-billing-five.vercel.app`

## App Shell

- **Login Screen** — Firebase Authentication gates the entire app
- **App Selection Screen** — choose between Apartment, Personal Finance, or Investments (coming soon)
- **Per-app navigation** — each app has its own tab layout and dashboard

## Apartment Bill Tracker

### Dashboard
- **Summary Cards** — total rooms, active tenants, pending bills, collected revenue
- **Revenue Cards** — monthly and yearly revenue tracking
- **Financial Summary / Breakdown** — income vs. expense view
- **Monthly Comparison** — period-over-period comparison
- **Recent Activity** feed and **Notification Bell**
- **Charts** (Recharts): Monthly Bills, Bills by Room, Monthly Expense, Expense by Category
- **Reports**: Business Report, Monthly Collection Report, Monthly Expense Report
- **Alerts** for overdue bills and upcoming aircon maintenance
- **Dashboard Filters** for time-range scoping

### Room Management
- Create, edit, delete rooms; set monthly rent and persons per room
- Toggle active/inactive status
- **Media Library / Room Media** — upload and manage room photos (Firebase Storage)
- **Share Preview** — generate a shareable preview for listing a room

### Tenant Management
- Full CRUD with: full name, phone, valid ID images, emergency contact, room assignment, move-in date, lease start/end, rent-due day
- **Per-tenant custom utility rates** that override global settings for that tenant's bills
- **Security deposit** and **early-termination penalty** fields
- **Digital signature** capture (canvas) for the lease
- **Lease Agreement Modal** — auto-generated printable contract with landlord + tenant signatures
- **Move-Out Modal** — guided move-out flow

### Billing System
Monthly bills per room with full line-item breakdown:

- **Line items**: Rent, Electricity (per kWh from meter readings), Water (per person flat), Wi-Fi (flat, optional), Aircon Cleaning (optional per bill), Mineral Water (per-unit, optional)
- **Effective rates** — automatically uses tenant's custom rates when set, otherwise global settings; each bill stores a `ratesUsed` snapshot for historical accuracy
- **Auto-fill on room selection** — `lastMonthReading` is pulled from the most recent bill for that room; `dueDate` is computed from the tenant's `rentDueDay`
- **Security deposit application** (move-out flow) — apply 50% or 100% of the tenant's deposit toward the final bill; rent is automatically excluded (advance rent covers last month), with auto-refund or remaining-cash display
- **Early termination penalty** — optional penalty line added to the bill when a tenant leaves early
- **Partial payments** with full **payment history**: multiple payment methods per entry, proof-of-payment images, notes
- **Retroactive payments** — add missing historical payment records
- **Refunds** — recorded as negative entries in the payment history
- **4-state status**: Paid / Partial / Pending / Overdue (auto-derived, with remaining balance display)
- **Filters**: search by room, status, room, date range
- **Sortable** table columns
- **Pagination** for bill history
- **Print bill** — opens a styled HTML invoice with paid/unpaid badge
- **Payment Receipt Modal** — view a printable receipt for any payment
- **Payment History Modal** — review all payments and refunds for a bill
- **CSV export**

### Expenses
- Full CRUD with form, filters, and tabular view
- Feeds the dashboard's expense charts and reports

### Aircon Cleaning Scheduler
- Schedule per-room aircon maintenance with custom interval (months)
- Last-cleaned tracking and automatic overdue detection
- Cleaning history log

### Settings
- Configure utility rates (water, electricity, Wi-Fi, aircon cleaning, mineral water)
- **Media Gallery / Media Library** — central media management
- Dark mode toggle
- Export all data to JSON

## Personal Finance Tracker

A separate app inside the same shell, with its own dashboard and Firestore collections (`personal_*`).

- **Transactions** — list + form with searchable selects
- **Categories** — custom income/expense categories
- **Budgets** — per-category budget tracking
- **Goals** — savings goals
- **Payment Methods** — list of accounts/cards
- **Recurring** — scheduled recurring transactions
- **Reports** and a dedicated **Personal Dashboard**

## Tech Stack

- **Frontend**: React 19 + Vite 7
- **Styling**: Tailwind CSS 3
- **Icons**: lucide-react
- **Charts**: Recharts
- **PDF / Image export**: jsPDF + html2canvas
- **Backend**: Firebase Authentication, Firestore, Storage
- **State**: React hooks (no external state library)

## Project Structure

```
src/
├── App.jsx                       # Auth gate + app selection switch
├── main.jsx                      # React DOM render
├── ApartmentBillTracker.jsx      # Apartment app shell + tabs
├── PersonalFinanceTracker.jsx    # Personal finance app shell + tabs
├── index.css                     # Global styles + Tailwind
│
├── assets/                       # Static assets (landlord signature, etc.)
│
├── components/
│   ├── app-selection/            # AppCard, AppSelectionScreen
│   ├── auth/                     # LoginScreen
│   ├── aircon/                   # Cleaning card, form, history modal
│   ├── bills/                    # BillForm, BillsTable, BillFilters,
│   │                             #   BillPrintModal, PaymentPopup,
│   │                             #   PaymentHistoryModal, PaymentReceiptModal
│   ├── common/                   # InfoModal
│   ├── dashboard/                # SummaryCards, RevenueCards, AlertsList,
│   │                             #   NotificationBell, RecentActivity,
│   │                             #   FinancialSummary/Breakdown,
│   │                             #   MonthlyComparison, DashboardFilters,
│   │                             #   MonthlyBillsChart, BillsByRoomChart,
│   │                             #   MonthlyExpenseChart, ExpenseByCategoryChart,
│   │                             #   BusinessReportModal,
│   │                             #   MonthlyCollectionReport, MonthlyExpenseReport
│   ├── expenses/                 # ExpenseForm, ExpensesTable, ExpenseFilters
│   ├── personal/                 # Personal finance components
│   ├── rooms/                    # RoomForm, RoomsList,
│   │                             #   MediaLibraryModal, RoomMediaModal,
│   │                             #   SharePreviewModal, GeneralSharePreviewModal
│   ├── settings/                 # SettingsForm, MediaGallery, MediaLibrarySection
│   ├── tenants/                  # TenantForm, TenantsList, TenantDetailsModal,
│   │                             #   SignaturePad, LeaseAgreement,
│   │                             #   LeaseAgreementModal, MoveOutModal
│   └── ui/                       # Modal, ConfirmDialog, Toast,
│                                 #   Pagination, SearchableSelect
│
├── config/
│   └── firebase.js               # Firebase initialization
│
├── context/
│   ├── AuthContext.jsx           # Auth state + selected-app routing
│   └── ToastContext.jsx          # Toast notifications
│
├── hooks/
│   ├── useFirestore.js           # Generic real-time collection hook
│   ├── useRooms.js
│   ├── useTenants.js
│   ├── useBills.js               # Bills + payments + deposits + penalties
│   ├── useExpenses.js
│   ├── useAirconCleaning.js
│   ├── useSettings.js
│   ├── useConfirmDialog.js
│   ├── useLocalStorage.js
│   └── personal/                 # usePersonalTransactions, usePersonalBudgets,
│                                 #   usePersonalCategories, usePersonalGoals,
│                                 #   usePersonalPaymentMethods,
│                                 #   usePersonalRecurring, usePersonalDashboard
│
├── services/
│   ├── firestore.js              # Apartment Firestore services + COLLECTIONS
│   ├── authService.js            # Firebase Auth wrapper
│   ├── storageService.js         # Firebase Storage wrapper
│   ├── localStorageService.js
│   └── personal/                 # personal_* Firestore services
│
└── utils/
    ├── dateHelpers.js
    ├── exportHelpers.js          # CSV / JSON export
    ├── validation.js
    └── rateHelpers.js            # getEffectiveRates (tenant overrides)
```

## Architecture

### High-level data flow

```
                    ┌────────────────────────────────┐
                    │           App.jsx              │
                    │  ┌──────────────────────────┐  │
                    │  │   AuthContext Provider   │  │
                    │  │  ┌────────────────────┐  │  │
                    │  │  │ ToastContext       │  │  │
                    │  │  │ ┌────────────────┐ │  │  │
                    │  │  │ │ App switch:    │ │  │  │
                    │  │  │ │  Apartment /   │ │  │  │
                    │  │  │ │  Personal /    │ │  │  │
                    │  │  │ │  (Investments) │ │  │  │
                    │  │  │ └────────────────┘ │  │  │
                    │  │  └────────────────────┘  │  │
                    │  └──────────────────────────┘  │
                    └────────────────────────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │  Domain hooks (useBills,      │
                  │  useTenants, useRooms,        │
                  │  useExpenses, usePersonal*…)  │
                  └───────────────────────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │   useFirestoreCollection      │
                  │   (real-time subscription)    │
                  └───────────────────────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │   Firestore service classes   │
                  │   (firestore.js, personal/*)  │
                  └───────────────────────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │   Firebase Firestore / Auth / │
                  │           Storage              │
                  └───────────────────────────────┘
```

### Custom hooks pattern

Each domain has its own hook that:
1. Subscribes to a Firestore collection via `useFirestoreCollection` for real-time sync
2. Manages local form state and validation errors
3. Exposes CRUD operations and derived helpers (`getBillTotal`, `getBillStatus`, `getRemainingBalance`, totals, etc.)
4. Returns `{ data, form, isEditing, errors, ...actions, ...helpers }`

```javascript
// useBills exposes:
const {
  bills, billForm, isEditing, errors,
  saveBill, editBill, deleteBill, togglePaid,
  recordPayment, updatePaymentHistory,
  addMissingPaymentRecord, recordRefund,
  resetForm, updateFormField, printBill,
  getBillTotal, getBillStatus, getRemainingBalance,
  getOverdueBills, getPartialBills, getBillsDueSoon,
  getTotalCollected, getTotalPending, getTotalBilled,
} = useBills(rooms, settings, tenants);
```

### Bill calculation

`getEffectiveRates(roomId, tenants, settings)` resolves the rates used for a bill — preferring a tenant's `customRates` over global settings field-by-field. The resolved rates are snapshotted onto the bill as `ratesUsed`, so historical bills are not retroactively re-priced when global rates change.

`getBillTotal(bill, excludeRent)` sums rent + utilities + penalty, with `excludeRent` used on move-out bills where the advance rent already covered the final month.

## Firestore Collections

**Apartment app:**
- `rooms` — room info and rent
- `tenants` — tenant details, custom rates, deposit, penalty
- `bills` — monthly bills, payment history, deposit/penalty application
- `airconCleaning` — maintenance schedules
- `expenses` — landlord-side expenses
- `settings` — app configuration (single document)

**Personal Finance app:**
- `personal_transactions`
- `personal_categories`
- `personal_budgets`
- `personal_goals`
- `personal_payment_methods`
- `personal_recurring`

Plus Firebase Authentication for login and Firebase Storage for room media, ID images, and payment proof uploads.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project with **Firestore**, **Authentication**, and **Storage** enabled

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd apartment-billing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Firestore Database**, **Authentication** (email/password), and **Storage**
3. Configure Firestore and Storage security rules for your needs
4. Copy the Firebase config into `.env`

## Available Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Deployment

### Vercel (current host)

This project is deployed on [Vercel](https://vercel.com).

**Live URL**: `https://apartment-billing-five.vercel.app`

```bash
npx vercel          # preview deploy
npx vercel --prod   # production deploy
```

Automatic deployments are configured for the connected GitHub repo:
- **Production** on push to `main`
- **Preview** on pull requests

Set the `VITE_FIREBASE_*` variables under **Settings → Environment Variables** in the Vercel dashboard.

### Add to iPhone/iPad Home Screen

1. Open the deployment URL in Safari
2. Tap the **Share** button
3. Tap **Add to Home Screen**

The app opens full-screen without browser chrome.

### Alternative Hosting

- **Firebase Hosting** — natural pairing with Firestore/Auth/Storage
- **Netlify** — works out of the box for Vite builds

## License

Private and proprietary.

## Author

Rhonnel Cordova
