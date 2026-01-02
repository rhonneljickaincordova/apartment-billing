# Apartment Bill Tracker

A comprehensive React application for managing apartment rentals, tenant information, utility billing, and aircon maintenance schedules. Built with React 19, Firebase Firestore, and Tailwind CSS.

## Features

### Dashboard
- **Summary Cards** - Overview of total rooms, active tenants, pending bills, and collected revenue
- **Revenue Cards** - Monthly and yearly revenue tracking
- **Alerts List** - Notifications for overdue bills and upcoming aircon maintenance

### Room Management
- Create, edit, and delete rooms
- Set monthly rent per room
- Toggle room active/inactive status
- Track room occupancy

### Tenant Management
- Full CRUD operations for tenants
- Store tenant information:
  - Full name and phone number
  - Valid ID images (multiple uploads supported)
  - Emergency contact details (name, number, relationship)
  - Room assignment
  - Move-in date
  - Lease dates (start/end)
  - Rent due day preference
- Digital signature capture for contracts
- Toggle tenant active/inactive status

### Billing System
- Generate monthly bills per room
- Track utility consumption:
  - Water (per person rate)
  - Electricity (per kWh rate)
  - Wi-Fi (flat monthly rate)
- Bill filtering by room, status, and date range
- Mark bills as paid/unpaid
- Pagination for bill history
- Export bills to CSV

### Aircon Cleaning Scheduler
- Schedule aircon maintenance per room
- Set cleaning frequency (monthly intervals)
- Track last cleaned date
- Automatic overdue detection
- Cleaning history log

### Printable Lease Agreement
- Auto-generated lease contracts with tenant details
- Professional formatting for printing
- Includes:
  - Lessor and Lessee information
  - Property address
  - Monthly rent and payment terms
  - Advance payment and security deposit details
  - Utility rates
  - House rules and maintenance responsibilities
  - Digital signatures with dates

### Settings
- Configure utility rates (water, electricity, Wi-Fi)
- Dark mode support
- Export all data to JSON

## Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Firebase Firestore
- **State Management**: React Hooks (useState, useCallback, useMemo)

## Project Structure

```
src/
├── assets/
│   └── signiture.png           # Landlord signature image
├── components/
│   ├── aircon/
│   │   ├── CleaningCard.jsx    # Aircon schedule card
│   │   ├── CleaningForm.jsx    # Add/edit cleaning schedule
│   │   ├── CleaningHistoryModal.jsx
│   │   └── index.js
│   ├── bills/
│   │   ├── BillFilters.jsx     # Bill filtering controls
│   │   ├── BillForm.jsx        # Add/edit bills
│   │   ├── BillsTable.jsx      # Bills list with pagination
│   │   └── index.js
│   ├── dashboard/
│   │   ├── AlertsList.jsx      # Overdue/due soon alerts
│   │   ├── RevenueCards.jsx    # Revenue statistics
│   │   ├── SummaryCards.jsx    # Quick stats overview
│   │   └── index.js
│   ├── rooms/
│   │   ├── RoomForm.jsx        # Add/edit rooms
│   │   ├── RoomsList.jsx       # Rooms grid display
│   │   └── index.js
│   ├── settings/
│   │   ├── SettingsForm.jsx    # App settings
│   │   └── index.js
│   ├── tenants/
│   │   ├── LeaseAgreement.jsx  # Printable contract generator
│   │   ├── SignaturePad.jsx    # Digital signature canvas
│   │   ├── TenantDetailsModal.jsx
│   │   ├── TenantForm.jsx      # Add/edit tenants
│   │   ├── TenantsList.jsx     # Tenants grid display
│   │   └── index.js
│   └── ui/
│       ├── ConfirmDialog.jsx   # Confirmation modal
│       ├── Modal.jsx           # Base modal component
│       ├── Pagination.jsx      # Pagination controls
│       ├── Toast.jsx           # Toast notifications
│       └── index.js
├── config/
│   └── firebase.js             # Firebase configuration
├── context/
│   └── ToastContext.jsx        # Toast notification context
├── hooks/
│   ├── useAirconCleaning.js    # Aircon schedule management
│   ├── useBills.js             # Bills CRUD operations
│   ├── useConfirmDialog.js     # Confirmation dialog state
│   ├── useFirestore.js         # Generic Firestore hooks
│   ├── useLocalStorage.js      # Local storage persistence
│   ├── useRooms.js             # Rooms CRUD operations
│   ├── useSettings.js          # App settings management
│   ├── useTenants.js           # Tenants CRUD operations
│   └── index.js                # Barrel exports
├── services/
│   └── firestore.js            # Firestore service layer
├── utils/
│   ├── dateHelpers.js          # Date formatting utilities
│   ├── exportHelpers.js        # CSV/JSON export functions
│   └── validation.js           # Form validation functions
├── ApartmentBillTracker.jsx    # Main application component
├── App.jsx                     # App entry with providers
├── main.jsx                    # React DOM render
└── index.css                   # Global styles + Tailwind
```

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        App.jsx                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              ToastContext Provider                   │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │         ApartmentBillTracker                │    │    │
│  │  │                                             │    │    │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────────┐   │    │    │
│  │  │  │useRooms │ │useBills │ │useTenants   │   │    │    │
│  │  │  └────┬────┘ └────┬────┘ └──────┬──────┘   │    │    │
│  │  │       │           │             │          │    │    │
│  │  │       └───────────┼─────────────┘          │    │    │
│  │  │                   ▼                        │    │    │
│  │  │         useFirestoreCollection             │    │    │
│  │  │                   │                        │    │    │
│  │  │                   ▼                        │    │    │
│  │  │           Firestore Service                │    │    │
│  │  │                   │                        │    │    │
│  │  │                   ▼                        │    │    │
│  │  │         Firebase Firestore DB              │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Custom Hooks Pattern

Each domain has its own custom hook that:
1. Uses `useFirestoreCollection` for real-time data sync
2. Manages local form state
3. Provides CRUD operations with validation
4. Returns state and actions to components

```javascript
// Example: useTenants hook
const {
  tenants,           // Array of tenant data
  tenantForm,        // Current form state
  isEditing,         // Edit mode flag
  errors,            // Validation errors
  saveTenant,        // Create/update tenant
  editTenant,        // Load tenant for editing
  deleteTenant,      // Remove tenant
  resetForm,         // Clear form
  updateFormField,   // Update single field
} = useTenants();
```

### Component Organization

Components are organized by feature domain:
- **Feature components** - Domain-specific UI (TenantForm, BillsTable)
- **UI components** - Reusable primitives (Modal, Toast, Pagination)
- **Barrel exports** - Clean imports via index.js files

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore enabled

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

4. Start the development server:
```bash
npm run dev
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set up Firestore rules for your security needs
4. Copy your Firebase config to the `.env` file

### Firestore Collections

The app uses the following collections:
- `rooms` - Room information and rent
- `tenants` - Tenant details and lease info
- `bills` - Monthly billing records
- `cleaningSchedules` - Aircon maintenance schedules
- `settings` - App configuration (single document)

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder, ready for deployment to any static hosting service.

### Recommended Hosting

- **Firebase Hosting** - Seamless integration with Firestore
- **Vercel** - Great for React/Vite apps
- **Netlify** - Easy deployment with CI/CD

## License

This project is private and proprietary.

## Author

Rhonnel Cordova
