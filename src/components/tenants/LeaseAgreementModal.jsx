import { useRef, useState } from 'react';
import { X, Share2 } from 'lucide-react';
import landlordSignature from '../../assets/signiture.png';

const LANDLORD_INFO = {
  name: 'Rhonnel Cordova',
  phone: '09276161535',
  property: 'Blk 13 Lot 30 Matutum St., Sto. Nino Bulusan, Central Park, Bangkal, Brgy Talomo Poblacion, Davao City',
};

/**
 * Format date to readable string
 */
const formatDate = (dateString) => {
  if (!dateString) return '____________________';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Lease Agreement Modal Component
 * Displays a lease agreement preview in a modal with share functionality
 */
function LeaseAgreementModal({ isOpen, onClose, tenant, room, settings }) {
  const contentRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !tenant) return null;

  const monthlyRent = room?.rent || 0;
  const waterRate = settings?.waterRate || 100;
  const electricityRate = settings?.electricityRate || 15;
  const wifiRate = settings?.wifiRate || 500;

  // Generate contract as image using canvas
  const generateContractImage = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = contentRef.current;

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 800,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });
  };

  // Handle native share
  const handleShare = async () => {
    setIsSharing(true);

    try {
      const imageBlob = await generateContractImage();
      const tenantName = tenant?.fullName || 'Tenant';
      const fileName = `LeaseAgreement-${tenantName.replace(/\s+/g, '_')}.png`;
      const file = new File([imageBlob], fileName, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Lease Agreement - ${tenantName}`,
          text: `Lease Agreement for ${tenantName} - ${room?.name || 'Room'}`,
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback: share without file (text only)
        await navigator.share({
          title: `Lease Agreement - ${tenantName}`,
          text: `Lease Agreement for ${tenantName}\nRoom: ${room?.name || 'N/A'}\nMonthly Rent: ${formatCurrency(monthlyRent)}`,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Image downloaded! You can now share it manually.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        alert('Failed to share. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lease-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="lease-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Lease Agreement Preview
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Share2 className={`w-4 h-4 ${isSharing ? 'animate-pulse' : ''}`} />
              {isSharing ? 'Preparing...' : 'Send'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Content */}
        <div className="p-4 overflow-y-auto flex-1">
          <div ref={contentRef} className="bg-white p-8 rounded-lg" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            {/* Header */}
            <div className="text-center mb-8 pb-4 border-b-4 border-double border-gray-800">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900 mb-2">Lease Agreement</h1>
              <p className="text-sm text-gray-500 italic">Residential Property Rental Contract</p>
            </div>

            {/* Parties Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
              <p className="italic mb-4 text-gray-700">This Lease Agreement ("Agreement") is entered into by and between:</p>

              <div className="mb-3">
                <span className="font-bold text-blue-600 uppercase text-sm mr-4">Lessor:</span>
                <span className="font-bold text-black">{LANDLORD_INFO.name || '____________________'}</span>
                <span className="text-sm text-gray-600 ml-2">Contact: {LANDLORD_INFO.phone || '____________________'}</span>
              </div>

              <div>
                <span className="font-bold text-blue-600 uppercase text-sm mr-4">Lessee:</span>
                <span className="font-bold text-black">{tenant?.fullName || '____________________'}</span>
                <span className="text-sm text-gray-600 ml-2">Contact: {tenant?.phoneNumber || '____________________'}</span>
                <div className="text-sm text-gray-600 ml-16">
                  Emergency: {tenant?.emergencyContactName || '____________________'} ({tenant?.relationship || '____________________'}) - {tenant?.emergencyContactNumber || '____________________'}
                </div>
              </div>
            </div>

            {/* Property Address */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-bold text-blue-800 uppercase text-sm mb-1">Property Address</p>
              <p className="text-gray-800">
                {room?.name && <strong>Room {room.name}</strong>} - {LANDLORD_INFO.property}
              </p>
            </div>

            {/* Terms Introduction */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg text-justify">
              <p className="text-gray-700">
                The parties hereby agree to the following terms and conditions governing the rental of the above-mentioned property:
              </p>
            </div>

            {/* Terms List */}
            <div className="space-y-4">
              {/* Term 1 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">Term of Lease</p>
                    <p className="text-gray-700">
                      The term of this lease shall begin on <span className="bg-yellow-100 px-1 font-bold">{formatDate(tenant?.moveInDate)}</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Term 2 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">Monthly Rent</p>
                    <p className="text-gray-700">
                      The Lessee agrees to pay the Lessor the monthly rent of <span className="text-green-700 font-bold">{formatCurrency(monthlyRent)}</span>,
                      payable on or before the <strong>{tenant?.rentDueDay || '5th'}</strong> of each month.
                    </p>
                  </div>
                </div>
              </div>

              {/* Term 3 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">Advance Payment & Security Deposit</p>
                    <p className="text-gray-700 mb-2">Upon signing this Agreement, the Lessee shall pay:</p>
                    <ul className="ml-4 space-y-1 text-gray-700">
                      <li>• One (1) month's rent as advance payment: <span className="text-green-700 font-bold">{formatCurrency(monthlyRent)}</span></li>
                      <li>• One (1) month's rent as security deposit: <span className="text-green-700 font-bold">{formatCurrency(monthlyRent)}</span></li>
                      <li className="pt-2 border-t border-dashed border-gray-300 font-bold">
                        • Total amount due upon move-in: <span className="text-green-700">{formatCurrency(monthlyRent * 2)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Term 4 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">Security Deposit Refund</p>
                    <p className="text-gray-700 text-justify">
                      The security deposit shall be refundable upon the Lessee's departure from the property,
                      provided that no damage to the premises beyond normal wear and tear has occurred and all
                      outstanding rent and utility payments have been settled. The refund shall be processed
                      within <strong>one (1) day</strong> of the Lessee's departure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Term 5 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">Early Termination</p>
                    <p className="text-gray-700 text-justify">
                      If the Lessee terminates this lease before the completion of <strong>six (6) months</strong> from the start date,
                      the <span className="bg-yellow-100 px-1 font-bold">entire security deposit</span> shall be forfeited.
                    </p>
                  </div>
                </div>
              </div>

              {/* Term 6 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">Utilities</p>
                    <p className="text-gray-700 mb-2">The Lessee shall be responsible for payment of all utilities consumed, at the following rates:</p>
                    <ul className="ml-4 space-y-1 text-gray-700">
                      <li>• Water: <span className="text-green-700 font-bold">{formatCurrency(waterRate)}</span> per person per month</li>
                      <li>• Electricity: <span className="text-green-700 font-bold">{formatCurrency(electricityRate)}</span> per kilowatt-hour (kWh)</li>
                      <li>• Wi-Fi: <span className="text-green-700 font-bold">{formatCurrency(wifiRate)}</span> per month (flat rate)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Term 7 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">Maintenance & Repairs</p>
                    <p className="text-gray-700 text-justify">
                      The Lessee agrees to maintain the premises in good condition. Minor repairs shall be the
                      responsibility of the Lessee. Major repairs requiring structural changes or significant
                      cost shall be reported to the Lessor for appropriate action.
                    </p>
                  </div>
                </div>
              </div>

              {/* Term 8 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">Termination Notice</p>
                    <p className="text-gray-700 text-justify">
                      Either party may terminate this Agreement with at least <strong>one (1) day</strong> prior written notice to the other party.
                    </p>
                  </div>
                </div>
              </div>

              {/* Term 9 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">9</span>
                  <div>
                    <p className="font-bold text-blue-800 uppercase text-sm mb-2">House Rules</p>
                    <p className="text-gray-700 text-justify">
                      The Lessee agrees to abide by all house rules and regulations set by the Lessor,
                      including but not limited to: maintaining peace and quiet, proper disposal of garbage,
                      and respecting other tenants' privacy and property.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Witness Section */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-justify">
              <p className="text-gray-700">
                <strong>IN WITNESS WHEREOF</strong>, the parties have hereunto set their hands this{' '}
                <span className="font-bold">{formatDate(new Date().toISOString())}</span>.
              </p>
            </div>

            {/* Signature Section */}
            <div className="mt-10 grid grid-cols-2 gap-8">
              {/* Lessor Signature */}
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="h-20 flex items-end justify-center mb-2">
                  <img src={landlordSignature} alt="Landlord Signature" className="max-w-[180px] max-h-[70px]" />
                </div>
                <div className="border-t-2 border-gray-800 pt-2">
                  <p className="font-bold text-lg text-black">{LANDLORD_INFO.name}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Lessor</p>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Date: <span className="border-b border-gray-400 px-4">{formatDate(new Date().toISOString())}</span>
                </p>
              </div>

              {/* Lessee Signature */}
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="h-20 flex items-end justify-center mb-2">
                  {tenant?.contractSignature && (
                    <img src={tenant.contractSignature} alt="Tenant Signature" className="max-w-[180px] max-h-[70px]" />
                  )}
                </div>
                <div className="border-t-2 border-gray-800 pt-2">
                  <p className="font-bold text-lg text-black">{tenant?.fullName || '____________________'}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Lessee</p>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Date: <span className="border-b border-gray-400 px-4">{tenant?.contractSignedDate ? formatDate(tenant.contractSignedDate) : '_______________'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaseAgreementModal;
