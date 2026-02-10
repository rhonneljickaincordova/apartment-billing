import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/auth';
import { AppSelectionScreen } from './components/app-selection';
import ApartmentBillTracker from './ApartmentBillTracker';
import PersonalFinanceTracker from './PersonalFinanceTracker';

function App() {
  const { isAuthenticated, loading, selectedApp, goBackToAppSelection } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Authenticated but no app selected - show app selection
  if (!selectedApp) {
    return <AppSelectionScreen />;
  }

  // Render selected app
  switch (selectedApp) {
    case 'apartment':
      return <ApartmentBillTracker />;
    case 'personal':
      return <PersonalFinanceTracker />;
    case 'investments':
      return <ComingSoonScreen appName="Investments" onBack={goBackToAppSelection} />;
    default:
      return <AppSelectionScreen />;
  }
}

// Coming Soon placeholder component
function ComingSoonScreen({ appName, onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{appName}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This feature is coming soon. Stay tuned!
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Apps
        </button>
      </div>
    </div>
  );
}

export default App;
