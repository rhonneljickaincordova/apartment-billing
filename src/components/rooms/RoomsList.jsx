import { useState, useMemo } from 'react';
import { Edit2, Trash2, CheckCircle, UserCheck, UserX, Check, Megaphone, Image, Eye, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import RoomMediaModal from './RoomMediaModal';
import SharePreviewModal from './SharePreviewModal';
import GeneralSharePreviewModal from './GeneralSharePreviewModal';

/**
 * Sortable Header Component
 */
function SortableHeader({ field, label, sortField, sortDirection, onSort, className = '' }) {
  const isActive = sortField === field;

  const getSortIcon = () => {
    if (!isActive) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${className}`}>
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
      >
        {label}
        {getSortIcon()}
      </button>
    </th>
  );
}

const DEFAULT_SHARE_TEMPLATE = `🏠 ROOM FOR RENT

📍 {roomName}
💰 Monthly Rent: ₱{rent}
👥 Good for {persons} person(s)

✨ Amenities:
• WiFi included
• Water included
• Electricity (metered)

📞 Contact us for viewing!

#RoomForRent #Apartment #ForRent`;

const DEFAULT_GENERAL_TEMPLATE = `PERMISSION TO POST ADMIN
Studio Type Apartment for Rent 🏡

{vacantRoomsList}

- 1 month advance
- 1 month deposit
- with own sink, cr and ac
- with own electric meter
- Good for 1 to 2 person per unit
- Water {waterRate}/person
- Electricity {electricityRate} pesos/kilowatt
- Internet/Wifi {wifiRate}/room
- PLDT and Globe
- Good for work from home set-up
- No Children Allowed
- No Pets Allowed
- Preferred long term renters/borders.

Location:
{location}

Contact Number:
{contactNumber}

PM for more details ☺️`;

/**
 * Generate share message for a vacant room using template
 */
function generateShareMessage(room, template, settings = {}) {
  const messageTemplate = template || DEFAULT_SHARE_TEMPLATE;

  return messageTemplate
    .replace(/{roomName}/g, room.name || 'Room')
    .replace(/{rent}/g, (room.rent || 0).toLocaleString())
    .replace(/{persons}/g, room.persons || 1)
    .replace(/{waterRate}/g, settings.waterRate || 100)
    .replace(/{electricityRate}/g, settings.electricityRate || 15)
    .replace(/{wifiRate}/g, settings.wifiRate || 500)
    .replace(/{location}/g, settings.location || 'Contact for location')
    .replace(/{contactNumber}/g, settings.contactNumber || 'Contact for details');
}

/**
 * Generate general share message for all vacant rooms
 */
function generateGeneralShareMessage(vacantRooms, settings) {
  const template = settings.generalShareTemplate || DEFAULT_GENERAL_TEMPLATE;

  // Group rooms by rent price and count them
  const rentGroups = {};
  vacantRooms.forEach((room) => {
    const rent = room.rent || 0;
    if (!rentGroups[rent]) {
      rentGroups[rent] = 0;
    }
    rentGroups[rent]++;
  });

  // Generate the vacant rooms list (sorted by rent descending)
  const vacantRoomsList = Object.entries(rentGroups)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([rent, count]) => `${Number(rent).toLocaleString()} / Month - ${count} Unit${count > 1 ? 's' : ''} Available`)
    .join('\n');

  return template
    .replace(/{vacantRoomsList}/g, vacantRoomsList || 'No vacant rooms available')
    .replace(/{waterRate}/g, settings.waterRate || 100)
    .replace(/{electricityRate}/g, settings.electricityRate || 15)
    .replace(/{wifiRate}/g, settings.wifiRate || 500)
    .replace(/{location}/g, settings.location || 'Contact for location')
    .replace(/{contactNumber}/g, settings.contactNumber || 'Contact for details');
}

/**
 * Share to Facebook using share dialog
 */
async function shareToFacebook(room, template, settings = {}) {
  const message = generateShareMessage(room, template, settings);

  // Try Web Share API first (works on mobile, includes FB option)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Room for Rent - ${room.name}`,
        text: message,
      });
      return { success: true, method: 'webshare' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      // Fall through to clipboard method
    }
  }

  // Fallback: Copy to clipboard and open Facebook
  try {
    await navigator.clipboard.writeText(message);
    // Open Facebook - user can paste in their group
    window.open('https://www.facebook.com/', '_blank');
    return { success: true, method: 'clipboard' };
  } catch (err) {
    console.error('Failed to copy:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Rooms List Component
 * Displays rooms in a table format
 */
function RoomsList({ rooms, onEdit, onDelete, onToggleStatus, shareTemplate, settings, onUpdateMedia, mediaLibrary = [] }) {
  const [copiedRoomId, setCopiedRoomId] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [isGeneralCopied, setIsGeneralCopied] = useState(false);
  const [selectedRoomIdForMedia, setSelectedRoomIdForMedia] = useState(null);
  const [sharePreviewRoomId, setSharePreviewRoomId] = useState(null);
  const [showGeneralSharePreview, setShowGeneralSharePreview] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Get the current room data from the rooms array (ensures fresh data after updates)
  const selectedRoomForMedia = selectedRoomIdForMedia ? rooms.find(r => r.id === selectedRoomIdForMedia) : null;
  const sharePreviewRoom = sharePreviewRoomId ? rooms.find(r => r.id === sharePreviewRoomId) : null;

  const vacantRooms = rooms.filter((room) => room.status === 'vacant');

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorted rooms
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Handle numeric fields
      if (sortField === 'rent' || sortField === 'persons') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      // String comparison for text fields
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rooms, sortField, sortDirection]);

  const handleShare = async (room) => {
    const result = await shareToFacebook(room, shareTemplate, settings);

    if (result.success && result.method === 'clipboard') {
      setCopiedRoomId(room.id);
      setShareMessage('Copied! Paste in your Facebook group');
      setTimeout(() => {
        setCopiedRoomId(null);
        setShareMessage('');
      }, 3000);
    } else if (result.success && result.method === 'webshare') {
      setShareMessage('Shared successfully!');
      setTimeout(() => setShareMessage(''), 2000);
    }
  };

  // Get the general share message
  const generalShareMessage = generateGeneralShareMessage(vacantRooms, settings || {});

  // Show preview for share all vacant
  const handleShowGeneralSharePreview = () => {
    if (vacantRooms.length === 0) {
      setShareMessage('No vacant rooms to share');
      setTimeout(() => setShareMessage(''), 2000);
      return;
    }
    setShowGeneralSharePreview(true);
  };

  const handleShareAllVacant = async () => {
    const message = generalShareMessage;

    // Try Web Share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rooms for Rent',
          text: message,
        });
        setShareMessage('Shared successfully!');
        setTimeout(() => setShareMessage(''), 2000);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        // Fall through to clipboard method
      }
    }

    // Fallback: Copy to clipboard and open Facebook
    try {
      await navigator.clipboard.writeText(message);
      window.open('https://www.facebook.com/', '_blank');
      setIsGeneralCopied(true);
      setShareMessage('Copied! Paste in your Facebook group');
      setTimeout(() => {
        setIsGeneralCopied(false);
        setShareMessage('');
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      {/* Toast notification for share status */}
      {shareMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          {shareMessage}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Header with Share All button */}
        {vacantRooms.length > 0 && (
          <div className="px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {vacantRooms.length} vacant room{vacantRooms.length !== 1 ? 's' : ''} available
            </span>
            <button
              onClick={handleShowGeneralSharePreview}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isGeneralCopied
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isGeneralCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  Share All Vacant
                </>
              )}
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <SortableHeader
                field="name"
                label="Room"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                field="persons"
                label="Persons"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                field="rent"
                label="Rent"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                field="status"
                label="Status"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedRooms.map((room) => (
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
                  <div className="flex gap-2 items-center">
                    {/* Media button */}
                    <button
                      onClick={() => setSelectedRoomIdForMedia(room.id)}
                      className="p-1 rounded text-purple-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 relative"
                      aria-label={`Manage media for ${room.name}`}
                      title="Manage Photos/Videos"
                    >
                      <Image className="w-4 h-4" />
                      {room.media && room.media.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-500 text-white text-[10px] rounded-full flex items-center justify-center">
                          {room.media.length}
                        </span>
                      )}
                    </button>
                    {/* Share preview button */}
                    <button
                      onClick={() => setSharePreviewRoomId(room.id)}
                      className={`p-1 rounded transition-colors ${
                        copiedRoomId === room.id
                          ? 'text-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                      aria-label={`Share ${room.name} to Facebook`}
                      title={copiedRoomId === room.id ? 'Copied to clipboard!' : 'Preview & Share'}
                    >
                      {copiedRoomId === room.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
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

      {/* Room Media Modal */}
      <RoomMediaModal
        isOpen={!!selectedRoomForMedia}
        onClose={() => setSelectedRoomIdForMedia(null)}
        room={selectedRoomForMedia}
        onUpdateMedia={onUpdateMedia}
        mediaLibrary={mediaLibrary}
      />

      {/* Share Preview Modal */}
      <SharePreviewModal
        isOpen={!!sharePreviewRoom}
        onClose={() => setSharePreviewRoomId(null)}
        room={sharePreviewRoom}
        message={sharePreviewRoom ? generateShareMessage(sharePreviewRoom, shareTemplate, settings) : ''}
        onShare={() => handleShare(sharePreviewRoom)}
      />

      {/* General Share Preview Modal */}
      <GeneralSharePreviewModal
        isOpen={showGeneralSharePreview}
        onClose={() => setShowGeneralSharePreview(false)}
        message={generalShareMessage}
        vacantCount={vacantRooms.length}
        onShare={handleShareAllVacant}
      />
    </>
  );
}

export default RoomsList;
