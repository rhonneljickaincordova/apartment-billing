function AppCard({ app, onSelect }) {
  const { name, description, icon: Icon, color, available } = app;

  const colorClasses = {
    blue: {
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    purple: {
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onSelect}
      disabled={!available}
      className={`
        relative w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left
        ${
          available
            ? `bg-white dark:bg-gray-800 ${colors.border} hover:shadow-lg hover:scale-[1.02] cursor-pointer`
            : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-75'
        }
      `}
    >
      {/* Coming Soon Badge */}
      {!available && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
          Coming Soon
        </div>
      )}

      {/* Icon */}
      <div
        className={`
        w-16 h-16 rounded-xl flex items-center justify-center mb-4
        ${available ? colors.bgLight : 'bg-gray-200 dark:bg-gray-700'}
      `}
      >
        <Icon className={`w-8 h-8 ${available ? colors.text : 'text-gray-400 dark:text-gray-500'}`} />
      </div>

      {/* Content */}
      <h3
        className={`text-xl font-semibold mb-2 ${available ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
      >
        {name}
      </h3>
      <p
        className={`text-sm ${available ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}
      >
        {description}
      </p>

      {/* Action indicator */}
      {available && (
        <div className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${colors.text}`}>
          <span>Open</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

export default AppCard;
