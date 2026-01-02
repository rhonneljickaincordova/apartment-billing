import { Edit2, Trash2, Eye, UserCheck, UserX, Phone, Users } from 'lucide-react';

/**
 * Tenants List Component
 * Displays all tenants in a responsive table/card layout
 */
function TenantsList({ tenants, rooms, onEdit, onDelete, onViewDetails, onToggleStatus }) {
  const getRoomName = (roomId) => {
    if (!roomId) return 'Not assigned';
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (tenants.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
        No tenants found. Add your first tenant above.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <h2 className="text-lg font-semibold p-4 border-b dark:border-gray-700 flex items-center gap-2 text-gray-900 dark:text-white">
        <Users className="w-5 h-5" />
        Tenants List ({tenants.length})
      </h2>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Room
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Move-in Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {tenant.fullName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Emergency: {tenant.emergencyContactName} ({tenant.relationship})
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {tenant.phoneNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {getRoomName(tenant.roomId)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(tenant.moveInDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      tenant.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tenant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(tenant)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(tenant)}
                      className={`p-1 ${
                        tenant.isActive
                          ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300'
                          : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                      }`}
                      title={tenant.isActive ? 'Mark Inactive' : 'Mark Active'}
                    >
                      {tenant.isActive ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(tenant)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tenant.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{tenant.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {tenant.phoneNumber}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  tenant.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {tenant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Room:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{getRoomName(tenant.roomId)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Move-in:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{formatDate(tenant.moveInDate)}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Emergency: {tenant.emergencyContactName} ({tenant.relationship}) - {tenant.emergencyContactNumber}
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t dark:border-gray-700">
              <button
                onClick={() => onViewDetails(tenant)}
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 flex items-center gap-1 text-sm"
              >
                <Eye className="w-4 h-4" />
                Details
              </button>
              <button
                onClick={() => onToggleStatus(tenant)}
                className={`flex items-center gap-1 text-sm ${
                  tenant.isActive
                    ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400'
                    : 'text-green-600 hover:text-green-800 dark:text-green-400'
                }`}
              >
                {tenant.isActive ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Activate
                  </>
                )}
              </button>
              <button
                onClick={() => onEdit(tenant)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(tenant.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TenantsList;
