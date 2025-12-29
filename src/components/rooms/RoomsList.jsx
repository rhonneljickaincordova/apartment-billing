import { Edit2, Trash2, CheckCircle, UserCheck, UserX } from 'lucide-react';

/**
 * Rooms List Component
 * Displays rooms in a table format
 */
function RoomsList({ rooms, onEdit, onDelete, onToggleStatus }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Room
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Persons
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Rent
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Status
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 md:px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {room.name}
                </td>
                <td className="px-4 md:px-6 py-4 text-gray-700 dark:text-gray-300">{room.persons}</td>
                <td className="px-4 md:px-6 py-4 text-gray-700 dark:text-gray-300">
                  ₱{(room.rent || 0).toLocaleString()}
                </td>
                <td className="px-4 md:px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      room.status === 'occupied'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {room.status === 'occupied' && <CheckCircle className="w-3 h-3" />}
                    {room.status}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleStatus(room)}
                      className={`p-1 rounded ${
                        room.status === 'occupied'
                          ? 'text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      aria-label={`Mark ${room.name} as ${room.status === 'occupied' ? 'vacant' : 'occupied'}`}
                      title={room.status === 'occupied' ? 'Mark as Vacant' : 'Mark as Occupied'}
                    >
                      {room.status === 'occupied' ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(room)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      aria-label={`Edit ${room.name}`}
                      title="Edit Room"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(room.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label={`Delete ${room.name}`}
                      title="Delete Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No rooms added yet. Add your first room above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoomsList;
