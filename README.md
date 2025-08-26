# YaYa Wallet Transaction Dashboard - Frontend

A modern React.js dashboard for monitoring YaYa Wallet transactions with real-time search, pagination, and responsive design.

## 🏗️ Architecture

The frontend is a single-page application (SPA) built with React and TypeScript that provides an intuitive interface for viewing and searching transactions. It communicates with the backend API for all data operations.

### Key Features
- Real-time transaction search with debouncing
- Pagination with URL-based navigation
- Visual indicators for transaction direction
- Mobile-responsive design
- Fast development with Vite
- Type-safe with TypeScript

## 🔧 Tech Stack

- **Framework**: React.js 18+ with TypeScript
- **Build Tool**: Vite (fast build and hot-reload)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: URL query parameters for pagination

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 3001

### Setup Instructions

1. **Clone and navigate to frontend directory:**
```bash
git clone <repository-url>
cd yaya-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
Create a `.env` file in the frontend root directory:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_CURRENT_USER=current_user
```

4. **Start the development server:**
```bash
npm run dev
```

The application will run on `http://localhost:3000` with hot-reload enabled.

## 🎨 Features & Components

### Transaction Dashboard

The main dashboard displays transactions in a clean, organized table format with the following features:

#### Search Functionality
- **Real-time search**: Search results update as you type
- **Debounced input**: Prevents excessive API calls (300ms delay)
- **Multi-field search**: Searches across transaction ID, sender, receiver, and cause
- **Clear search**: Easy reset button to clear search terms

#### Transaction Display
- **Paginated table**: Clean table layout with proper headers
- **Visual indicators**: 
  - Green dot (🟢) for incoming transactions
  - Red dot (🔴) for outgoing transactions
- **Transaction classification**:
  - Incoming: User is receiver OR sender equals receiver (top-ups)
  - Outgoing: User is sender (excluding top-ups)
- **Formatted data**: Proper currency formatting and date display

#### Navigation
- **URL-based pagination**: Page state preserved in URL (?p=2)
- **Previous/Next buttons**: Easy navigation between pages
- **Page indicators**: Current page and total page display
- **Direct navigation**: Enter page number directly in URL

### Responsive Design

#### Desktop View
- Full table layout with all columns visible
- Hover effects on rows and buttons
- Optimal spacing for readability

#### Tablet View
- Adjusted table spacing
- Smaller text sizes where appropriate
- Touch-friendly button sizes

#### Mobile View
- Horizontal scroll for table when needed
- Compact layout with essential information
- Stack-friendly design elements

## 🎯 Component Structure

### Main Components

1. **App.tsx**: Main application component
   - State management for transactions and pagination
   - API integration
   - Search handling
   - Error boundary

2. **TransactionTable**: Transaction display component
   - Table rendering
   - Row formatting
   - Visual indicators

3. **SearchBar**: Search input component
   - Debounced input handling
   - Clear functionality
   - Loading states

4. **Pagination**: Navigation component
   - Page navigation
   - URL parameter handling
   - Page count display

### Key Functions

```typescript
// Transaction classification logic
const isIncomingTransaction = (transaction: Transaction): boolean => {
  return transaction.receiver === currentUser || 
         transaction.sender === transaction.receiver;
};

// Debounced search implementation
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

## 🧪 Testing Guide

### Manual Testing Scenarios

#### 1. Basic Functionality
- [ ] Load the dashboard and verify transactions display
- [ ] Check that all transaction data appears correctly
- [ ] Verify proper formatting of amounts and dates
- [ ] Confirm visual indicators work (green/red dots)

#### 2. Search Functionality
```bash
# Test these search scenarios:
- Search by transaction ID (exact match)
- Search by sender name (partial match)
- Search by receiver name (case insensitive)
- Search by transaction cause/description
- Search with special characters
- Empty search (should show all transactions)
```

#### 3. Pagination Testing
- [ ] Navigate to different pages using next/previous buttons
- [ ] Test direct URL navigation (e.g., ?p=3)
- [ ] Verify page numbers display correctly
- [ ] Test edge cases (page 1, last page)
- [ ] Check URL updates when navigating

#### 4. Responsive Design Testing
```bash
# Test on different screen sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)
- Small mobile (320x568)
```

#### 5. Error Handling
- [ ] Test with backend offline
- [ ] Test with slow network connection
- [ ] Test invalid search queries
- [ ] Test navigation to non-existent pages



## 🎨 Styling & Design

### Tailwind CSS Classes

The application uses Tailwind's utility classes for consistent styling:

```css
/* Common patterns used */
.btn-primary: bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded
.btn-secondary: bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded
.table-row: hover:bg-gray-50 border-b border-gray-200
.search-input: border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500
```

### Design System

- **Primary Color**: Blue (#3B82F6)
- **Success Color**: Green (#10B981) for incoming transactions
- **Error Color**: Red (#EF4444) for outgoing transactions
- **Gray Scale**: Various shades for backgrounds and borders
- **Font**: Inter (system font stack)

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Update environment variables for production:**
```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_CURRENT_USER=production_user_id
```

3. **Deploy to static hosting:**
The `dist` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting



## 📁 Project Structure

```
yaya-frontend/
├── src/
│   ├── components/           # Reusable components
│   │   ├── TransactionTable.tsx
│   │   ├── SearchBar.tsx
│   │   └── Pagination.tsx
│   ├── types/               # TypeScript type definitions
│   │   └── transaction.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useDebounce.ts
│   ├── utils/               # Utility functions
│   │   └── api.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles and Tailwind imports
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── .env                     # Environment variables (not in git)
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | Yes | - |
| `VITE_CURRENT_USER` | Current user identifier | Yes | - |

### Vite Configuration

Key configuration in `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Tailwind Configuration

Customizations in `tailwind.config.js`:
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        success: '#10B981',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
};
```

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify backend is running on correct port
   - Check `VITE_API_BASE_URL` in `.env` file
   - Ensure CORS is configured on backend

2. **Build Errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are compatible

3. **Styling Issues**:
   - Ensure Tailwind CSS is properly imported in `index.css`
   - Check for conflicting CSS rules
   - Verify Tailwind config includes all necessary content paths

4. **Performance Issues**:
   - Check network tab for slow API calls
   - Verify search debouncing is working (300ms delay)
   - Monitor memory usage for large transaction lists

### Debug Mode

Enable React DevTools and check browser console for detailed error messages. Set up error boundaries for better error handling:

```typescript
// Add to App.tsx for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.log('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## 📞 Support

For frontend-specific issues:
1. Check the browser console for JavaScript errors
2. Verify all environment variables are set correctly
3. Test API connectivity by checking Network tab in DevTools
4. Ensure backend is running and accessible
5. Check responsive design on different screen sizes