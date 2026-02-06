import { useState, useRef, useEffect } from 'react';
import { Image, Video, Upload, Trash2, Download, X, Play, ZoomIn, Loader2, AlertCircle } from 'lucide-react';
import { uploadSettingsMedia, deleteSettingsMedia, getMediaUrl } from '../../services/localStorageService';

/**
 * Media Library Section Component
 * Global media library in Settings - media can be reused across all rooms
 */
function MediaLibrarySection({ mediaLibrary = [], onUpdateMediaLibrary }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [mediaUrls, setMediaUrls] = useState({});
  const fileInputRef = useRef(null);

  // Load media URLs from IndexedDB when media changes
  useEffect(() => {
    const loadUrls = async () => {
      const urls = {};
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
    };

    loadUrls();

    // Cleanup blob URLs on unmount
    return () => {
      Object.values(mediaUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mediaLibrary]);

  // Get display URL for a media item
  const getDisplayUrl = (item) => {
    if (mediaUrls[item.id]) {
      return mediaUrls[item.id];
    }
    return item.data || item.url || null;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError('');
    setUploadProgress(`Uploading 0/${files.length} files...`);

    const newMedia = [];
    const skippedFiles = [];

    // Max 100MB per file
    const maxSize = 100 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);

      if (file.size > maxSize) {
        skippedFiles.push(`${file.name} (too large - max 100MB)`);
        continue;
      }

      try {
        const mediaItem = await uploadSettingsMedia(file);
        newMedia.push(mediaItem);

        // Cache URL immediately
        const url = await getMediaUrl(mediaItem);
        if (url) {
          setMediaUrls((prev) => ({ ...prev, [mediaItem.id]: url }));
        }
      } catch (err) {
        console.error('Failed to upload file:', err);
        skippedFiles.push(`${file.name} (upload failed)`);
      }
    }

    if (newMedia.length > 0) {
      const updatedMedia = [...mediaLibrary, ...newMedia];
      await onUpdateMediaLibrary(updatedMedia);
    }

    if (skippedFiles.length > 0) {
      setUploadError(`Skipped: ${skippedFiles.join(', ')}`);
    }

    setIsUploading(false);
    setUploadProgress('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (mediaItem) => {
    if (!confirm('Delete this media from the library? Rooms using this media will no longer display it.')) return;

    setIsDeleting(true);
    try {
      await deleteSettingsMedia(mediaItem);

      if (mediaUrls[mediaItem.id]?.startsWith('blob:')) {
        URL.revokeObjectURL(mediaUrls[mediaItem.id]);
      }

      setMediaUrls((prev) => {
        const updated = { ...prev };
        delete updated[mediaItem.id];
        return updated;
      });

      const updatedMedia = mediaLibrary.filter((m) => m.id !== mediaItem.id);
      await onUpdateMediaLibrary(updatedMedia);
    } catch (err) {
      console.error('Failed to delete media:', err);
      setUploadError('Failed to delete media. Please try again.');
    } finally {
      setIsDeleting(false);
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
    mediaLibrary.forEach((item, index) => {
      setTimeout(() => handleDownload(item), index * 500);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Media Library
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Upload images and videos here to reuse across all rooms. Files are stored locally in your browser.
      </p>

      <div className="relative">
        {/* Loading Overlay */}
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 z-10 flex flex-col items-center justify-center rounded-lg">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {isDeleting ? 'Deleting...' : 'Uploading...'}
            </p>
            {uploadProgress && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{uploadProgress}</p>
            )}
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 dark:text-red-400">{uploadError}</p>
              <button
                onClick={() => setUploadError('')}
                className="text-xs text-red-600 dark:text-red-400 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="media-library-upload"
            disabled={isUploading || isDeleting}
          />
          <label
            htmlFor="media-library-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
              isUploading || isDeleting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload Images/Videos'}
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-3">
            Max: 100MB per file (stored locally)
          </span>
        </div>

        {/* Media Grid */}
        {mediaLibrary.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {mediaLibrary.length} file{mediaLibrary.length !== 1 ? 's' : ''} ({mediaLibrary.filter(m => m.type === 'image').length} images, {mediaLibrary.filter(m => m.type === 'video').length} videos)
              </span>
              <button
                onClick={handleDownloadAll}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {mediaLibrary.map((item) => {
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
                        onClick={() => handleDelete(item)}
                        className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-full text-white"
                        title="Delete"
                        disabled={isDeleting}
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

                    {/* File size */}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/50 rounded text-white text-xs">
                      {formatFileSize(item.size)}
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
              Upload images and videos to share across all rooms
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
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
    </div>
  );
}

export default MediaLibrarySection;
