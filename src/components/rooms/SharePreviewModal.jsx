import { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Share2, Image, Video, Play, Loader2 } from 'lucide-react';
import { getMediaUrl } from '../../services/localStorageService';
import { STATIC_ROOM_MEDIA, getStaticMediaUrl } from '../../assets/rooms';

/**
 * Share Preview Modal Component
 * Shows a preview of the share message and room media before sharing
 */
function SharePreviewModal({ isOpen, onClose, room, message, onShare }) {
  const [copied, setCopied] = useState(false);
  const [mediaUrls, setMediaUrls] = useState({});

  const media = room?.media || [];

  // Load media URLs when modal opens
  useEffect(() => {
    if (!isOpen || !room) return;

    const loadUrls = async () => {
      const urls = {};
      for (const item of media) {
        // Static media - look up current URL by staticId (handles redeployments)
        if (item.isStatic) {
          // Try staticId first (new format)
          let staticUrl = item.staticId ? getStaticMediaUrl(item.staticId) : null;

          // Fallback: match by name for old data without staticId
          if (!staticUrl && item.name) {
            const matched = STATIC_ROOM_MEDIA.find((m) => m.name === item.name);
            staticUrl = matched?.url;
          }

          if (staticUrl) {
            urls[item.id] = staticUrl;
          }
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

    return () => {
      // Cleanup blob URLs (not static URLs)
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

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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

  const handleDownloadAll = () => {
    media.forEach((item, index) => {
      setTimeout(() => handleDownload(item), index * 500);
    });
  };

  const handleShareAndClose = () => {
    onShare();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Preview - {room.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review before sharing to Facebook
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
          {/* Message Preview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </span>
              <button
                onClick={handleCopyText}
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
                  copied
                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </>
                )}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
              {message}
            </pre>
          </div>

          {/* Media Preview */}
          {media.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Room Photos/Videos ({media.length} files)
                </span>
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                      )}

                      {/* Download overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
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
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Download the photos/videos and attach them to your Facebook post manually.
              </p>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Image className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No photos uploaded for this room</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Add photos via the media button to include them here
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShareAndClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Copy & Open Facebook
          </button>
        </div>
      </div>
    </div>
  );
}

export default SharePreviewModal;
