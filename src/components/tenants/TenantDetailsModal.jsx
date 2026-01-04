import { useState } from 'react';
import { X, User, Phone, Home, Calendar, Users, Heart, FileText, Image, Share2, LogOut } from 'lucide-react';
import SignaturePad from './SignaturePad';
import LeaseAgreementModal from './LeaseAgreementModal';

/**
 * Tenant Details Modal Component
 * Shows full tenant information with signature pad
 */
function TenantDetailsModal({ tenant, rooms, settings, isOpen, onClose, onSaveSignature, onClearSignature }) {
  const [showLeaseModal, setShowLeaseModal] = useState(false);

  if (!isOpen || !tenant) return null;

  const getRoom = (roomId) => {
    if (!roomId) return null;
    return rooms.find((r) => r.id === roomId) || null;
  };

  const getRoomName = (roomId) => {
    const room = getRoom(roomId);
    return room ? room.name : 'Not assigned';
  };

  const handleOpenLeaseModal = () => {
    setShowLeaseModal(true);
  };

  const handleCloseLeaseModal = () => {
    setShowLeaseModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Tenant Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{tenant.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{tenant.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Room</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getRoomName(tenant.roomId)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Move-in Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(tenant.moveInDate)}</p>
                </div>
              </div>
              {tenant.moveOutDate && (
                <div className="flex items-start gap-3">
                  <LogOut className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Move-out Date</p>
                    <p className="font-medium text-red-600 dark:text-red-400">{formatDate(tenant.moveOutDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lease Information */}
          <div>
            <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Lease Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lease Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(tenant.leaseStartDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lease End Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(tenant.leaseEndDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contact Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{tenant.emergencyContactName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contact Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{tenant.emergencyContactNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Relationship</p>
                  <p className="font-medium text-gray-900 dark:text-white">{tenant.relationship}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Valid ID Images */}
          <div>
            <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Valid ID Pictures
            </h3>
            {tenant.validIdImages && tenant.validIdImages.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {tenant.validIdImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Valid ID ${index + 1}`}
                      className="w-40 h-28 object-cover rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(image, '_blank')}
                    />
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                      ID {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No ID images uploaded</p>
            )}
          </div>

          {/* Contract Signature */}
          <div>
            <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contract Signature
            </h3>
            {tenant.contractSignature ? (
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <img
                    src={tenant.contractSignature}
                    alt="Contract Signature"
                    className="max-w-full h-auto max-h-40 mx-auto"
                  />
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                  Contract signed
                </p>
                <div className="text-center">
                  <button
                    onClick={onClearSignature}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    Clear signature and re-sign
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  The tenant has not signed the contract yet. Please have them sign below:
                </p>
                <SignaturePad
                  onSave={onSaveSignature}
                  onClear={onClearSignature}
                  existingSignature={null}
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                tenant.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : tenant.moveOutDate
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {tenant.isActive ? 'Active Tenant' : tenant.moveOutDate ? 'Moved Out' : 'Inactive Tenant'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={handleOpenLeaseModal}
            className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Send Contract
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lease Agreement Modal */}
      <LeaseAgreementModal
        isOpen={showLeaseModal}
        onClose={handleCloseLeaseModal}
        tenant={tenant}
        room={getRoom(tenant.roomId)}
        settings={settings}
      />
    </div>
  );
}

export default TenantDetailsModal;
