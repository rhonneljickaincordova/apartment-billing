import { useAuth } from '../../context/AuthContext';
import { Building2, User, TrendingUp, LogOut } from 'lucide-react';
import AppCard from './AppCard';

function AppSelectionScreen() {
  const { user, logout, selectApp } = useAuth();

  const apps = [
    {
      id: 'apartment',
      name: 'Apartment',
      description: 'Manage apartment billing and tenants',
      icon: Building2,
      color: 'blue',
      available: true,
    },
    {
      id: 'personal',
      name: 'Personal',
      description: 'Track personal finances',
      icon: User,
      color: 'green',
      available: false,
    },
    {
      id: 'investments',
      name: 'Investments',
      description: 'Monitor your investment portfolio',
      icon: TrendingUp,
      color: 'purple',
      available: false,
    },
  ];

  const handleAppSelect = (appId) => {
    const app = apps.find((a) => a.id === appId);
    if (app?.available) {
      selectApp(appId);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome, {user?.displayName?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select an app to continue</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* App Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} onSelect={() => handleAppSelect(app.id)} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Property Manager Suite v1.0</p>
        </div>
      </div>
    </div>
  );
}

export default AppSelectionScreen;
