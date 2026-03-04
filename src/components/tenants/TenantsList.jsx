import { useState, useMemo } from 'react';
import { Edit2, Trash2, Eye, UserCheck, UserX, Phone, Users, Share2, LogOut, ArrowUpDown, ArrowUp, ArrowDown, FileText, Search, X, Download } from 'lucide-react';
import LeaseAgreementModal from './LeaseAgreementModal';

/**
 * Tenants List Component
 * Displays all tenants in a responsive table/card layout
 */
function TenantsList({ tenants, rooms, settings, onEdit, onDelete, onViewDetails, onToggleStatus, onMoveOut, onCreateBill }) {
  const [leaseModalTenant, setLeaseModalTenant] = useState(null);
  const [sortBy, setSortBy] = useState('rentDueDay'); // Default sort by due day
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending (lowest to highest)
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'movedOut'
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(null); // Tracks which tenant's PDF is being downloaded

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

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Download contract as PDF
  const handleDownloadPdf = async (tenant) => {
    setDownloadingPdf(tenant.id);

    try {
      const room = getRoom(tenant.roomId);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const landlordSignature = (await import('../../assets/signiture.png')).default;

      // Create a temporary container for rendering
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      document.body.appendChild(container);

      const monthlyRent = room?.rent || 0;
      const waterRate = tenant?.customRates?.waterRate ?? settings?.waterRate ?? 100;
      const electricityRate = tenant?.customRates?.electricityRate ?? settings?.electricityRate ?? 15;
      const wifiRate = tenant?.customRates?.wifiRate ?? settings?.wifiRate ?? 500;
      const securityDeposit = tenant?.securityDeposit || monthlyRent;
      const advancePayment = tenant?.advancePayment || monthlyRent;
      const earlyTerminationPenalty = tenant?.earlyTerminationPenalty || securityDeposit;

      const formatPdfCurrency = (amt) => {
        return new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 2,
        }).format(amt);
      };

      const formatPdfDate = (dateString) => {
        if (!dateString) return '____________________';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const getOrdinalSuffix = (day) => {
        if (day === null || day === undefined || day === '') return '5th';
        const num = parseInt(String(day).trim());
        if (isNaN(num)) return '5th';
        if (num >= 11 && num <= 13) return num + 'th';
        switch (num % 10) {
          case 1: return num + 'st';
          case 2: return num + 'nd';
          case 3: return num + 'rd';
          default: return num + 'th';
        }
      };

      const LANDLORD_INFO = {
        name: 'Rhonnel Cordova',
        phone: '09276161535',
        property: 'Blk 13 Lot 30 Matutum St., Sto. Nino Bulusan, Central Park, Bangkal, Brgy Talomo Poblacion, Davao City',
      };

      container.innerHTML = `
        <div style="background: white; padding: 32px; font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 4px double #1f2937;">
            <h1 style="font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 8px 0;">Lease Agreement</h1>
            <p style="font-size: 14px; color: #6b7280; font-style: italic; margin: 0;">Residential Property Rental Contract</p>
          </div>

          <!-- Parties Section -->
          <div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #2563eb;">
            <p style="font-style: italic; margin-bottom: 16px; color: #374151;">This Lease Agreement ("Agreement") is entered into by and between:</p>

            <div style="margin-bottom: 12px;">
              <span style="font-weight: bold; color: #2563eb; text-transform: uppercase; font-size: 12px; margin-right: 16px;">Lessor:</span>
              <span style="font-weight: bold; color: black;">${LANDLORD_INFO.name}</span>
              <span style="font-size: 12px; color: #4b5563; margin-left: 8px;">Contact: ${LANDLORD_INFO.phone}</span>
            </div>

            <div>
              <span style="font-weight: bold; color: #2563eb; text-transform: uppercase; font-size: 12px; margin-right: 16px;">Lessee:</span>
              <span style="font-weight: bold; color: black;">${tenant?.fullName || '____________________'}</span>
              <span style="font-size: 12px; color: #4b5563; margin-left: 8px;">Contact: ${tenant?.phoneNumber || '____________________'}</span>
              <div style="font-size: 12px; color: #4b5563; margin-left: 64px;">
                Emergency: ${tenant?.emergencyContactName || '____________________'} (${tenant?.relationship || '____________________'}) - ${tenant?.emergencyContactNumber || '____________________'}
              </div>
            </div>
          </div>

          <!-- Property Address -->
          <div style="margin-bottom: 24px; padding: 16px; background: #dbeafe; border-radius: 8px;">
            <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 4px 0;">Property Address</p>
            <p style="color: #1f2937; margin: 0;">
              ${room?.name ? `<strong>Room ${room.name}</strong> - ` : ''}${LANDLORD_INFO.property}
            </p>
          </div>

          <!-- Terms Introduction -->
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: justify;">
            <p style="color: #374151; margin: 0;">
              The parties hereby agree to the following terms and conditions governing the rental of the above-mentioned property:
            </p>
          </div>

          <!-- Terms List -->
          <div>
            <!-- Term 1 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">1</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">Term of Lease</p>
                  <p style="color: #374151; margin: 0;">
                    The term of this lease shall begin on <span style="background: #fef3c7; padding: 2px 4px; font-weight: bold;">${formatPdfDate(tenant?.moveInDate)}</span>.
                  </p>
                </div>
              </div>
            </div>

            <!-- Term 2 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">2</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">Monthly Rent</p>
                  <p style="color: #374151; margin: 0;">
                    The Lessee agrees to pay the Lessor the monthly rent of <span style="color: #15803d; font-weight: bold;">${formatPdfCurrency(monthlyRent)}</span>,
                    payable on or before the <strong>${getOrdinalSuffix(tenant?.rentDueDay || tenant?.rentDueDate || 5)}</strong> day of each month.
                  </p>
                </div>
              </div>
            </div>

            <!-- Term 3 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">3</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">Advance Payment & Security Deposit</p>
                  <p style="color: #374151; margin: 0 0 8px 0;">Upon signing this Agreement, the Lessee shall pay:</p>
                  <ul style="margin: 0 0 0 16px; padding: 0; list-style: disc; color: #374151;">
                    <li style="margin-bottom: 4px;">One (1) month's rent as advance payment: <span style="color: #15803d; font-weight: bold;">${formatPdfCurrency(advancePayment)}</span></li>
                    <li style="margin-bottom: 4px;">One (1) month's rent as security deposit: <span style="color: #15803d; font-weight: bold;">${formatPdfCurrency(securityDeposit)}</span></li>
                    <li style="padding-top: 8px; border-top: 1px dashed #d1d5db; font-weight: bold;">
                      Total amount due upon move-in: <span style="color: #15803d;">${formatPdfCurrency(advancePayment + securityDeposit)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Term 4 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">4</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">Security Deposit Refund</p>
                  <p style="color: #374151; margin: 0; text-align: justify;">
                    The security deposit shall be refundable upon the Lessee's departure from the property,
                    provided that no damage to the premises beyond normal wear and tear has occurred and all
                    outstanding rent and utility payments have been settled. The refund shall be processed
                    within <strong>one (1) day</strong> of the Lessee's departure.
                  </p>
                </div>
              </div>
            </div>

            <!-- Term 5 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">5</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">Early Termination</p>
                  <p style="color: #374151; margin: 0; text-align: justify;">
                    If the Lessee terminates this lease before the completion of <strong>six (6) months</strong> from the start date,
                    a penalty of <span style="background: #fef3c7; padding: 2px 4px; font-weight: bold; color: #b91c1c;">${formatPdfCurrency(earlyTerminationPenalty)}</span> shall be forfeited.
                  </p>
                </div>
              </div>
            </div>

            <!-- Term 6 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">6</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">Utilities</p>
                  <p style="color: #374151; margin: 0 0 8px 0;">The Lessee shall be responsible for payment of all utilities consumed, at the following rates:</p>
                  <ul style="margin: 0 0 0 16px; padding: 0; list-style: disc; color: #374151;">
                    <li style="margin-bottom: 4px;">Water: <span style="color: #15803d; font-weight: bold;">${formatPdfCurrency(waterRate)}</span> per person per month</li>
                    <li style="margin-bottom: 4px;">Electricity: <span style="color: #15803d; font-weight: bold;">${formatPdfCurrency(electricityRate)}</span> per kilowatt-hour (kWh)</li>
                    <li>Wi-Fi: <span style="color: #15803d; font-weight: bold;">${formatPdfCurrency(wifiRate)}</span> per month (flat rate)</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Term 7 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">7</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">Maintenance & Repairs</p>
                  <p style="color: #374151; margin: 0; text-align: justify;">
                    The Lessee agrees to maintain the premises in good condition. Minor repairs shall be the
                    responsibility of the Lessee. Major repairs requiring structural changes or significant
                    cost shall be reported to the Lessor for appropriate action.
                  </p>
                </div>
              </div>
            </div>

            <!-- Term 8 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">8</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">Termination Notice</p>
                  <p style="color: #374151; margin: 0; text-align: justify;">
                    Either party may terminate this Agreement with at least <strong>one (1) day</strong> prior written notice to the other party.
                  </p>
                </div>
              </div>
            </div>

            <!-- Term 9 -->
            <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">9</span>
                <div>
                  <p style="font-weight: bold; color: #1e40af; text-transform: uppercase; font-size: 12px; margin: 0 0 8px 0;">House Rules</p>
                  <p style="color: #374151; margin: 0; text-align: justify;">
                    The Lessee agrees to abide by all house rules and regulations set by the Lessor,
                    including but not limited to: maintaining peace and quiet, proper disposal of garbage,
                    and respecting other tenants' privacy and property.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Witness Section -->
          <div style="margin-top: 32px; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: justify;">
            <p style="color: #374151; margin: 0;">
              <strong>IN WITNESS WHEREOF</strong>, the parties have hereunto set their hands this
              <span style="font-weight: bold;">${formatPdfDate(new Date().toISOString())}</span>.
            </p>
          </div>

          <!-- Signature Section -->
          <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
            <!-- Lessor Signature -->
            <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="height: 80px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px;">
                <img src="${landlordSignature}" alt="Landlord Signature" style="max-width: 180px; max-height: 70px;" crossorigin="anonymous" />
              </div>
              <div style="border-top: 2px solid #1f2937; padding-top: 8px;">
                <p style="font-weight: bold; font-size: 16px; color: black; margin: 0 0 4px 0;">${LANDLORD_INFO.name}</p>
                <p style="color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Lessor</p>
              </div>
              <p style="margin-top: 12px; font-size: 12px; color: #4b5563;">
                Date: <span style="border-bottom: 1px solid #9ca3af; padding: 0 16px;">${formatPdfDate(new Date().toISOString())}</span>
              </p>
            </div>

            <!-- Lessee Signature -->
            <div style="text-align: center; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="height: 80px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px;">
                ${tenant?.contractSignature ? `<img src="${tenant.contractSignature}" alt="Tenant Signature" style="max-width: 180px; max-height: 70px;" crossorigin="anonymous" />` : ''}
              </div>
              <div style="border-top: 2px solid #1f2937; padding-top: 8px;">
                <p style="font-weight: bold; font-size: 16px; color: black; margin: 0 0 4px 0;">${tenant?.fullName || '____________________'}</p>
                <p style="color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Lessee</p>
              </div>
              <p style="margin-top: 12px; font-size: 12px; color: #4b5563;">
                Date: <span style="border-bottom: 1px solid #9ca3af; padding: 0 16px;">${tenant?.contractSignedDate ? formatPdfDate(tenant.contractSignedDate) : '_______________'}</span>
              </p>
            </div>
          </div>
        </div>
      `;

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(container.firstChild, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);

      const aspectRatio = imgWidth / imgHeight;
      let finalWidth = availableWidth;
      let finalHeight = finalWidth / aspectRatio;

      if (finalHeight > availableHeight) {
        finalHeight = availableHeight;
        finalWidth = finalHeight * aspectRatio;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = margin;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

      const fileName = `LeaseAgreement-${tenant.fullName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(null);
    }
  };

  // Filter and sort tenants
  const filteredAndSortedTenants = useMemo(() => {
    // First, filter by status
    let filtered = tenants.filter((tenant) => {
      if (statusFilter === 'active') {
        return tenant.isActive && !tenant.moveOutDate;
      } else if (statusFilter === 'movedOut') {
        return !!tenant.moveOutDate;
      }
      return true; // 'all'
    });

    // Then, filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tenant) => {
        const roomName = getRoomName(tenant.roomId).toLowerCase();
        return (
          tenant.fullName?.toLowerCase().includes(query) ||
          tenant.phoneNumber?.toLowerCase().includes(query) ||
          roomName.includes(query)
        );
      });
    }

    // Finally, sort
    if (sortBy === 'rentDueDay') {
      filtered.sort((a, b) => {
        const dayA = parseInt(a.rentDueDay) || 0;
        const dayB = parseInt(b.rentDueDay) || 0;
        return sortOrder === 'asc' ? dayA - dayB : dayB - dayA;
      });
    }

    return filtered;
  }, [tenants, statusFilter, searchQuery, sortBy, sortOrder]);

  const handleSortByDueDay = () => {
    if (sortBy === 'rentDueDay') {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set to sort by due day with ascending order
      setSortBy('rentDueDay');
      setSortOrder('asc');
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
        Tenants List ({filteredAndSortedTenants.length}{filteredAndSortedTenants.length !== tenants.length ? ` of ${tenants.length}` : ''})
      </h2>

      {/* Filter Bar */}
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600 ${
                statusFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('movedOut')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600 ${
                statusFilter === 'movedOut'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Moved Out
            </button>
          </div>
        </div>
      </div>

      {/* No results message */}
      {filteredAndSortedTenants.length === 0 && tenants.length > 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No tenants match your filters.</p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      {filteredAndSortedTenants.length > 0 && (
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Bill
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={handleSortByDueDay}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-white transition-colors"
                  title="Sort by Due Day"
                >
                  Due Day
                  {sortBy === 'rentDueDay' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                  {sortBy !== 'rentDueDay' && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Room
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
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
                Refund
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedTenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {tenant.isActive && !tenant.moveOutDate && (
                    <button
                      onClick={() => onCreateBill(tenant)}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                      title="Create Bill"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {formatDueDay(tenant.rentDueDay)}
                </td>
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
                      <>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(tenant.moveOutDate)}
                        </span>
                        {tenant.moveOutDetails?.moveOutReasonLabel && (
                          <span className={`text-xs mt-0.5 ${
                            tenant.moveOutDetails.moveOutReason === 'eviction' || tenant.moveOutDetails.moveOutReason === 'contract_violation'
                              ? 'text-red-500 dark:text-red-400'
                              : tenant.moveOutDetails.moveOutReason === 'emergency'
                                ? 'text-amber-500 dark:text-amber-400'
                                : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            ({tenant.moveOutDetails.moveOutReasonLabel})
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  {tenant.moveOutDate && tenant.moveOutDetails?.refundAmount !== undefined ? (
                    <span className={`text-sm font-medium ${tenant.moveOutDetails.refundAmount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formatCurrency(tenant.moveOutDetails.refundAmount)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleDownloadPdf(tenant)}
                      disabled={downloadingPdf === tenant.id}
                      className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 p-1 disabled:opacity-50"
                      title="Download Contract PDF"
                    >
                      <Download className={`w-4 h-4 ${downloadingPdf === tenant.id ? 'animate-pulse' : ''}`} />
                    </button>
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
      )}

      {/* Mobile Card View */}
      {filteredAndSortedTenants.length > 0 && (
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {filteredAndSortedTenants.map((tenant) => (
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
                  <>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(tenant.moveOutDate)}
                    </span>
                    {tenant.moveOutDetails?.moveOutReasonLabel && (
                      <span className={`text-xs ${
                        tenant.moveOutDetails.moveOutReason === 'eviction' || tenant.moveOutDetails.moveOutReason === 'contract_violation'
                          ? 'text-red-500 dark:text-red-400'
                          : tenant.moveOutDetails.moveOutReason === 'emergency'
                            ? 'text-amber-500 dark:text-amber-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        ({tenant.moveOutDetails.moveOutReasonLabel})
                      </span>
                    )}
                  </>
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
              {tenant.moveOutDate && tenant.moveOutDetails?.refundAmount !== undefined && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Refund:</span>
                  <span className={`ml-1 font-medium ${tenant.moveOutDetails.refundAmount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {formatCurrency(tenant.moveOutDetails.refundAmount)}
                  </span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Emergency: {tenant.emergencyContactName} ({tenant.relationship}) - {tenant.emergencyContactNumber}
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2 border-t dark:border-gray-700">
              {tenant.isActive && !tenant.moveOutDate && (
                <button
                  onClick={() => onCreateBill(tenant)}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Bill
                </button>
              )}
              <button
                onClick={() => handleDownloadPdf(tenant)}
                disabled={downloadingPdf === tenant.id}
                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1 text-sm disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${downloadingPdf === tenant.id ? 'animate-pulse' : ''}`} />
                PDF
              </button>
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
      )}

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
