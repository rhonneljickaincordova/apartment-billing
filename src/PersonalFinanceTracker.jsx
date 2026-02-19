import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { PersonalTracker } from './components/personal';

/**
 * Personal Finance Tracker - Main App Wrapper
 * Provides the app shell with navigation for the Personal finance module
 */
function PersonalFinanceTracker() {
  const { user, logout, goBackToAppSelection } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Back to App Selection */}
            <button
              onClick={goBackToAppSelection}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to Apps"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white truncate">
              Personal Finance
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* User avatar */}
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
              />
            )}
            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Personal Tracker Content */}
        <PersonalTracker />
      </div>
    </div>
  );
}

export default PersonalFinanceTracker;
