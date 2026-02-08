import { useState, useEffect } from 'react';
import { X, Image, Video, Play, Check, Loader2, Package } from 'lucide-react';
import { getMediaUrl } from '../../services/localStorageService';
import { STATIC_ROOM_MEDIA } from '../../assets/rooms';

/**
 * Media Library Modal Component
 * Shows static bundled media + global media library from settings for reuse across rooms
 */
function MediaLibraryModal({ isOpen, onClose, mediaLibrary = [], onSelectMedia }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [mediaUrls, setMediaUrls] = useState({});
  const [loading, setLoading] = useState(true);

  // Combine static media with uploaded media library
  const allMedia = [...STATIC_ROOM_MEDIA, ...mediaLibrary];

  // Load media URLs (static media already has URLs, only need to load uploaded ones)
  useEffect(() => {
    if (!isOpen) return;

    const loadUrls = async () => {
      setLoading(true);
      const urls = {};

      // Static media already has URLs
      for (const item of STATIC_ROOM_MEDIA) {
        urls[item.id] = item.url;
      }

      // Load uploaded media from IndexedDB
      for (const item of mediaLibrary) {
        try {
          const url = await getMediaUrl(item);
          if (url) {
            urls[item.id] = url;
          }
        } catch (e) {
          console.warn('Failed to load media:', item.id, e);
        }
      }
      setMediaUrls(urls);
      setLoading(false);
    };

    loadUrls();

    return () => {
      // Only revoke blob URLs (not static asset URLs)
      Object.values(mediaUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [isOpen, mediaLibrary.length]);

  if (!isOpen) return null;

  const getDisplayUrl = (item) => {
    return mediaUrls[item.id] || item.data || item.url || null;
  };

  const toggleSelect = (item) => {
    setSelectedItems((prev) => {
      const isSelected = prev.find((m) => m.id === item.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleAddSelected = () => {
    if (selectedItems.length > 0) {
      // Create new media items - handle static vs uploaded differently
      const newMediaItems = selectedItems.map((item) => {
        if (item.isStatic) {
          // Static media - store the static ID for lookup (URLs change with each build)
          return {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            type: item.type,
            mimeType: item.mimeType,
            staticId: item.id, // Store original static ID for runtime lookup
            isStatic: true,
            uploadedAt: new Date().toISOString(),
            fromLibrary: true,
          };
        } else {
          // Uploaded media - use localId reference to IndexedDB
          return {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            type: item.type,
            mimeType: item.mimeType,
            size: item.size,
            localId: item.localId,
            uploadedAt: new Date().toISOString(),
            fromLibrary: true,
          };
        }
      });
      onSelectMedia(newMediaItems);
      setSelectedItems([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Media Library
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select media from library to add to this room
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : allMedia.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {STATIC_ROOM_MEDIA.length} bundled + {mediaLibrary.length} uploaded = {allMedia.length} file{allMedia.length !== 1 ? 's' : ''} available
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allMedia.map((item) => {
                  const displayUrl = getDisplayUrl(item);
                  const isSelected = selectedItems.find((m) => m.id === item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelect(item)}
                      className={`relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {displayUrl ? (
                        item.type === 'image' ? (
                          <img
                            src={displayUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video src={displayUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                      )}

                      {/* Selection indicator - bottom right, above filename */}
                      {isSelected && (
                        <div className="absolute bottom-8 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Type indicator */}
                      <div className="absolute top-1 left-1 p-1 bg-black/50 rounded text-white">
                        {item.type === 'image' ? (
                          <Image className="w-3 h-3" />
                        ) : (
                          <Video className="w-3 h-3" />
                        )}
                      </div>

                      {/* Bundled indicator */}
                      {item.isStatic && (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-green-500 rounded text-white text-[10px] flex items-center gap-0.5">
                          <Package className="w-2.5 h-2.5" />
                          Bundled
                        </div>
                      )}

                      {/* File name */}
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-white text-xs truncate">
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No media in library yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Go to Settings → Media Library to upload media
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedItems.length > 0 && `${selectedItems.length} selected`}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedItems.length === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedItems.length > 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaLibraryModal;
