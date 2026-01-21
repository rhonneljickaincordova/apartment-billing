import { useState } from 'react';
import { Edit2, Trash2, Eye, UserCheck, UserX, Phone, Users, Share2, LogOut } from 'lucide-react';
import LeaseAgreementModal from './LeaseAgreementModal';

/**
 * Tenants List Component
 * Displays all tenants in a responsive table/card layout
 */
function TenantsList({ tenants, rooms, settings, onEdit, onDelete, onViewDetails, onToggleStatus, onMoveOut }) {
  const [leaseModalTenant, setLeaseModalTenant] = useState(null);

  const getRoom = (roomId) => {
    if (!roomId) return null;
    return rooms.find((r) => r.id === roomId) || null;
  };
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

  const calculateDuration = (moveInDate, moveOutDate) => {
    if (!moveInDate) return '-';

    const startDate = new Date(moveInDate);
    const endDate = moveOutDate ? new Date(moveOutDate) : new Date();

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = (diffDays % 365) % 30;

    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0 || parts.length === 0) parts.push(`${days}d`);

    return parts.join(' ');
  };

  const formatDueDay = (rentDueDay) => {
    if (!rentDueDay) return '-';
    const num = parseInt(rentDueDay);
    if (num >= 11 && num <= 13) return num + 'th';
    switch (num % 10) {
      case 1: return num + 'st';
      case 2: return num + 'nd';
      case 3: return num + 'rd';
      default: return num + 'th';
    }
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
                Room
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Due Day
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Move-in Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duration
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
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {getRoomName(tenant.roomId)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {tenant.fullName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Emergency: {tenant.emergencyContactName} ({tenant.relationship})
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {formatDueDay(tenant.rentDueDay)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {tenant.phoneNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(tenant.moveInDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {calculateDuration(tenant.moveInDate, tenant.moveOutDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span
                      className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${
                        tenant.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : tenant.moveOutDate
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tenant.isActive ? 'Active' : tenant.moveOutDate ? 'Moved Out' : 'Inactive'}
                    </span>
                    {tenant.moveOutDate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(tenant.moveOutDate)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setLeaseModalTenant(tenant)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1"
                      title="Send Contract"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
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
                    {tenant.isActive && !tenant.moveOutDate && (
                      <button
                        onClick={() => onMoveOut(tenant)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Move Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
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
              <div className="flex flex-col items-end">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    tenant.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : tenant.moveOutDate
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tenant.isActive ? 'Active' : tenant.moveOutDate ? 'Moved Out' : 'Inactive'}
                </span>
                {tenant.moveOutDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(tenant.moveOutDate)}
                  </span>
                )}
              </div>
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
              <div>
                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{calculateDuration(tenant.moveInDate, tenant.moveOutDate)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Due Day:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{formatDueDay(tenant.rentDueDay)}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Emergency: {tenant.emergencyContactName} ({tenant.relationship}) - {tenant.emergencyContactNumber}
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2 border-t dark:border-gray-700">
              <button
                onClick={() => setLeaseModalTenant(tenant)}
                className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 text-sm"
              >
                <Share2 className="w-4 h-4" />
                Send
              </button>
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
              {tenant.isActive && !tenant.moveOutDate && (
                <button
                  onClick={() => onMoveOut(tenant)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Move Out
                </button>
              )}
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

      {/* Lease Agreement Modal */}
      <LeaseAgreementModal
        isOpen={!!leaseModalTenant}
        onClose={() => setLeaseModalTenant(null)}
        tenant={leaseModalTenant}
        room={leaseModalTenant ? getRoom(leaseModalTenant.roomId) : null}
        settings={settings}
      />
    </div>
  );
}

export default TenantsList;
