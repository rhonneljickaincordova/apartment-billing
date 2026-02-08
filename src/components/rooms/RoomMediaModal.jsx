import { useState, useEffect } from 'react';
import { X, Trash2, Download, Image, Video, Play, ZoomIn, Loader2, AlertCircle, FolderOpen, Package } from 'lucide-react';
import { getMediaUrl } from '../../services/localStorageService';
import MediaLibraryModal from './MediaLibraryModal';
import { STATIC_ROOM_MEDIA } from '../../assets/rooms';

/**
 * Room Media Modal Component
 * Allows selecting and managing images/videos for a specific room from the media library
 */
function RoomMediaModal({ isOpen, onClose, room, onUpdateMedia, mediaLibrary }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState('');
  const [mediaUrls, setMediaUrls] = useState({});
  const [showLibrary, setShowLibrary] = useState(false);

  const media = room?.media || [];

  // Ensure mediaLibrary is always an array
  const libraryItems = Array.isArray(mediaLibrary) ? mediaLibrary : [];

  // Load media URLs from IndexedDB when media changes (static media already has URLs)
  useEffect(() => {
    if (!isOpen || !room) return;

    const loadUrls = async () => {
      const urls = {};
      for (const item of media) {
        // Static media already has URL
        if (item.isStatic && item.url) {
          urls[item.id] = item.url;
          continue;
        }
        // Load uploaded media from IndexedDB
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
    };

    loadUrls();

    // Cleanup blob URLs when modal closes (not static URLs)
    return () => {
      Object.values(mediaUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [isOpen, room, media]);

  if (!isOpen || !room) return null;

  // Get display URL for a media item
  const getDisplayUrl = (item) => {
    if (mediaUrls[item.id]) {
      return mediaUrls[item.id];
    }
    return item.data || item.url || null;
  };

  const handleRemove = async (mediaItem) => {
    if (!confirm('Remove this media from this room?')) return;

    setIsProcessing(true);
    setProcessingMessage('Removing...');
    try {
      // Revoke blob URL if exists
      if (mediaUrls[mediaItem.id]?.startsWith('blob:')) {
        URL.revokeObjectURL(mediaUrls[mediaItem.id]);
      }

      // Update state
      setMediaUrls((prev) => {
        const updated = { ...prev };
        delete updated[mediaItem.id];
        return updated;
      });

      // Update Firestore (remove from this room only)
      const updatedMedia = media.filter((m) => m.id !== mediaItem.id);
      await onUpdateMedia(room.id, updatedMedia);
    } catch (err) {
      console.error('Failed to remove media:', err);
      setError('Failed to remove media. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleDownload = async (item) => {
    const url = getDisplayUrl(item);
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle adding media from library
  const handleAddFromLibrary = async (selectedItems) => {
    setIsProcessing(true);
    setProcessingMessage('Adding from library...');

    try {
      // Load URLs for newly added items
      for (const item of selectedItems) {
        // Static media already has URL
        if (item.isStatic && item.url) {
          setMediaUrls((prev) => ({ ...prev, [item.id]: item.url }));
        } else {
          const url = await getMediaUrl(item);
          if (url) {
            setMediaUrls((prev) => ({ ...prev, [item.id]: url }));
          }
        }
      }

      const updatedMedia = [...media, ...selectedItems];
      const result = await onUpdateMedia(room.id, updatedMedia);

      if (result && !result.success) {
        throw new Error(result.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Failed to add from library:', err);
      setError('Failed to add media from library. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // Always has library media because of static bundled media
  const hasLibraryMedia = STATIC_ROOM_MEDIA.length > 0 || libraryItems.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {room.name} - Media
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select images and videos from the library
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] relative">
          {/* Loading Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {processingMessage || 'Processing...'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="text-xs text-red-600 dark:text-red-400 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Add from Library Button */}
          <div className="mb-4">
            <button
              onClick={() => setShowLibrary(true)}
              disabled={isProcessing}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isProcessing
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Add from Library
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-3">
              {STATIC_ROOM_MEDIA.length} bundled + {libraryItems.length} uploaded available
            </span>
          </div>

          {/* Media Grid */}
          {media.length > 0 ? (
            <>
              <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                {media.length} file{media.length !== 1 ? 's' : ''} ({media.filter(m => m.type === 'image').length} images, {media.filter(m => m.type === 'video').length} videos)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {media.map((item) => {
                  const displayUrl = getDisplayUrl(item);
                  return (
                    <div
                      key={item.id}
                      className="relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
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
                            <video
                              src={displayUrl}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="w-10 h-10 text-white" />
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                      )}

                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedMedia(item)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
                          title="View"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(item)}
                          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-full text-white"
                          title="Remove from room"
                          disabled={isProcessing}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

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
                        </div>
                      )}

                      {/* File size (only for uploaded media) */}
                      {item.size && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/50 rounded text-white text-xs">
                          {formatFileSize(item.size)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No media for this room</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Click "Add from Library" to select images/videos
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(selectedMedia);
            }}
            className="absolute top-4 left-4 p-2 text-white hover:bg-white/20 rounded-full flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm">Download</span>
          </button>

          <div className="max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'image' ? (
              <img
                src={getDisplayUrl(selectedMedia)}
                alt={selectedMedia.name}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <video
                src={getDisplayUrl(selectedMedia)}
                controls
                autoPlay
                className="max-w-full max-h-[80vh]"
              />
            )}
            <p className="text-white text-center mt-2 text-sm">{selectedMedia.name}</p>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        mediaLibrary={libraryItems}
        onSelectMedia={handleAddFromLibrary}
      />
    </div>
  );
}

export default RoomMediaModal;
