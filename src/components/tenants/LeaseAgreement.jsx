import landlordSignature from '../../assets/signiture.png';

/**
 * Lease Agreement Print Component
 * Generates a printable lease agreement with tenant details
 */

const LANDLORD_INFO = {
  name: 'Rhonnel Cordova',
  phone: '09276161535',
  property: 'Blk 13 Lot 30 Matutum St., Sto. Nino Bulusan, Central Park, Bangkal, Brgy Talomo Poblacion, Davao City',
};

const UTILITY_RATES = {
  water: 100, // per person
  electricity: 15, // per kilowatt
  wifi: 500, // per month
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
 * Get ordinal suffix for a day number
 */
const getOrdinalSuffix = (day) => {
  // Default to 5th if no day provided
  if (day === null || day === undefined || day === '') return '5th';

  // Handle if day is already a string with suffix (from old data)
  const dayStr = String(day).trim();

  // If already has suffix, extract and reformat
  const withSuffixMatch = dayStr.match(/^(\d+)(st|nd|rd|th)$/);
  if (withSuffixMatch) {
    const num = parseInt(withSuffixMatch[1]);
    if (num >= 11 && num <= 13) return num + 'th';
    switch (num % 10) {
      case 1: return num + 'st';
      case 2: return num + 'nd';
      case 3: return num + 'rd';
      default: return num + 'th';
    }
  }

  // Normal processing for numeric values
  const num = parseInt(dayStr);
  if (isNaN(num)) return '5th';

  if (num >= 11 && num <= 13) return num + 'th';
  switch (num % 10) {
    case 1: return num + 'st';
    case 2: return num + 'nd';
    case 3: return num + 'rd';
    default: return num + 'th';
  }
};

/**
 * Print the lease agreement
 */
export function printLeaseAgreement(tenant, room, settings) {
  const monthlyRent = room?.rent || 0;
  const waterRate = settings?.waterRate || UTILITY_RATES.water;
  const electricityRate = settings?.electricityRate || UTILITY_RATES.electricity;
  const wifiRate = settings?.wifiRate || UTILITY_RATES.wifi;
  const securityDeposit = tenant?.securityDeposit || monthlyRent;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the lease agreement.');
    return;
  }

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lease Agreement - ${tenant.fullName}</title>
      <style>
        @page {
          size: A4;
          margin: 0.75in 1in;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Georgia', 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.7;
          color: #1a1a1a;
          background: #fff;
        }
        .container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 35px;
          padding-bottom: 20px;
          border-bottom: 3px double #333;
        }
        .header h1 {
          font-size: 24pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 8px;
          color: #000;
        }
        .header .subtitle {
          font-size: 10pt;
          color: #555;
          font-style: italic;
        }

        /* Parties Section */
        .parties-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .parties-intro {
          margin-bottom: 20px;
          font-style: italic;
        }
        .party-box {
          display: flex;
          margin-bottom: 15px;
        }
        .party-box:last-child {
          margin-bottom: 0;
        }
        .party-label {
          font-weight: bold;
          min-width: 120px;
          color: #2563eb;
          text-transform: uppercase;
          font-size: 10pt;
        }
        .party-details {
          flex: 1;
        }
        .party-name {
          font-weight: bold;
          font-size: 12pt;
          margin-bottom: 3px;
        }
        .party-info {
          font-size: 10pt;
          color: #444;
        }

        /* Property Address */
        .property-section {
          background: #e8f4fd;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .property-label {
          font-weight: bold;
          color: #1e40af;
          font-size: 10pt;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .property-address {
          font-size: 11pt;
        }

        /* Terms Introduction */
        .terms-intro {
          text-align: justify;
          margin-bottom: 25px;
          padding: 15px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        /* Terms List */
        .terms-list {
          counter-reset: term-counter;
          list-style: none;
          padding: 0;
        }
        .terms-list > li {
          counter-increment: term-counter;
          margin-bottom: 20px;
          padding: 15px 15px 15px 50px;
          position: relative;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 5px;
          text-align: justify;
        }
        .terms-list > li::before {
          content: counter(term-counter);
          position: absolute;
          left: 15px;
          top: 15px;
          background: #2563eb;
          color: #fff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          text-align: center;
          line-height: 24px;
          font-size: 10pt;
          font-weight: bold;
        }
        .term-title {
          font-weight: bold;
          color: #1e40af;
          text-transform: uppercase;
          font-size: 10pt;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 8px;
        }
        .term-content {
          color: #333;
        }

        /* Nested List */
        .sub-list {
          margin-top: 12px;
          margin-left: 15px;
          padding-left: 0;
        }
        .sub-list li {
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
          list-style: none;
        }
        .sub-list li::before {
          content: "\\2022";
          position: absolute;
          left: 0;
          color: #2563eb;
          font-weight: bold;
        }
        .sub-list .total-line {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #ccc;
          font-weight: bold;
        }

        /* Highlight Amount */
        .amount {
          color: #166534;
          font-weight: bold;
        }
        .highlight {
          background: #fef3c7;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: bold;
        }

        /* Witness Section */
        .witness-section {
          margin-top: 40px;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          text-align: justify;
        }
        .witness-date {
          font-weight: bold;
        }

        /* Signature Section */
        .signature-section {
          margin-top: 50px;
          page-break-inside: avoid;
        }
        .signature-row {
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }
        .signature-block {
          flex: 1;
          text-align: center;
          padding: 20px;
          background: #fafafa;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        .signature-image-container {
          height: 80px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          margin-bottom: 10px;
        }
        .signature-image {
          max-width: 180px;
          max-height: 70px;
        }
        .signature-line {
          border-top: 2px solid #333;
          padding-top: 10px;
          margin-top: 10px;
        }
        .signature-name {
          font-weight: bold;
          font-size: 12pt;
          margin-bottom: 3px;
        }
        .signature-role {
          color: #666;
          font-size: 9pt;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .signature-date {
          margin-top: 15px;
          font-size: 10pt;
          color: #555;
        }
        .signature-date span {
          border-bottom: 1px solid #999;
          padding: 0 30px;
        }

        /* Print Styles */
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .container {
            padding: 0;
          }
          .parties-section,
          .property-section,
          .terms-list > li,
          .witness-section,
          .signature-block {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Lease Agreement</h1>
          <div class="subtitle">Residential Property Rental Contract</div>
        </div>

        <div class="parties-section">
          <div class="parties-intro">
            This Lease Agreement ("Agreement") is entered into by and between:
          </div>

          <div class="party-box">
            <div class="party-label">Lessor:</div>
            <div class="party-details">
              <div class="party-name">${LANDLORD_INFO.name}</div>
              <div class="party-info">Contact: ${LANDLORD_INFO.phone}</div>
            </div>
          </div>

          <div class="party-box">
            <div class="party-label">Lessee:</div>
            <div class="party-details">
              <div class="party-name">${tenant.fullName}</div>
              <div class="party-info">Contact: ${tenant.phoneNumber}</div>
              <div class="party-info">Emergency: ${tenant.emergencyContactName} (${tenant.relationship}) - ${tenant.emergencyContactNumber}</div>
            </div>
          </div>
        </div>

        <div class="property-section">
          <div class="property-label">Property Address</div>
          <div class="property-address">
            ${room?.name ? `<strong>Room ${room.name}</strong> - ` : ''}${LANDLORD_INFO.property}
          </div>
        </div>

        <div class="terms-intro">
          The parties hereby agree to the following terms and conditions governing the rental of the above-mentioned property:
        </div>

        <ol class="terms-list">
          <li>
            <span class="term-title">Term of Lease</span>
            <span class="term-content">
              The term of this lease shall begin on <span class="highlight">${formatDate(new Date().toISOString())}</span>.
            </span>
          </li>

          <li>
            <span class="term-title">Monthly Rent</span>
            <span class="term-content">
              The Lessee agrees to pay the Lessor the monthly rent of <span class="amount">${formatCurrency(monthlyRent)}</span>,
              payable on or before the <strong>${getOrdinalSuffix(tenant.rentDueDay || tenant.rentDueDate || 5)} day of each month</strong>.
            </span>
          </li>

          <li>
            <span class="term-title">Advance Payment & Security Deposit</span>
            <span class="term-content">
              Upon signing this Agreement, the Lessee shall pay:
            </span>
            <ul class="sub-list">
              <li>One (1) month's rent as advance payment: <span class="amount">${formatCurrency(monthlyRent)}</span></li>
              <li>One (1) month's rent as security deposit: <span class="amount">${formatCurrency(monthlyRent)}</span></li>
              <li class="total-line">Total amount due upon move-in: <span class="amount">${formatCurrency(monthlyRent * 2)}</span></li>
            </ul>
          </li>

          <li>
            <span class="term-title">Security Deposit Refund</span>
            <span class="term-content">
              The security deposit shall be refundable upon the Lessee's departure from the property,
              provided that no damage to the premises beyond normal wear and tear has occurred and all
              outstanding rent and utility payments have been settled. The refund shall be processed
              within <strong>one (1) day</strong> of the Lessee's departure.
            </span>
          </li>

          <li>
            <span class="term-title">Early Termination</span>
            <span class="term-content">
              If the Lessee terminates this lease before the completion of <strong>six (6) months</strong>
              from the start date, a penalty of <span class="highlight amount">${formatCurrency(securityDeposit)}</span> shall be forfeited.
            </span>
          </li>

          <li>
            <span class="term-title">Utilities</span>
            <span class="term-content">
              The Lessee shall be responsible for payment of all utilities consumed, at the following rates:
            </span>
            <ul class="sub-list">
              <li>Water: <span class="amount">${formatCurrency(waterRate)}</span> per person per month</li>
              <li>Electricity: <span class="amount">${formatCurrency(electricityRate)}</span> per kilowatt-hour (kWh)</li>
              <li>Wi-Fi: <span class="amount">${formatCurrency(wifiRate)}</span> per month (flat rate)</li>
            </ul>
          </li>

          <li>
            <span class="term-title">Maintenance & Repairs</span>
            <span class="term-content">
              The Lessee agrees to maintain the premises in good condition. Minor repairs shall be the
              responsibility of the Lessee. Major repairs requiring structural changes or significant
              cost shall be reported to the Lessor for appropriate action.
            </span>
          </li>

          <li>
            <span class="term-title">Termination Notice</span>
            <span class="term-content">
              Either party may terminate this Agreement with at least <strong>one (1) day</strong> prior
              written notice to the other party.
            </span>
          </li>

          <li>
            <span class="term-title">House Rules</span>
            <span class="term-content">
              The Lessee agrees to abide by all house rules and regulations set by the Lessor,
              including but not limited to: maintaining peace and quiet, proper disposal of garbage,
              and respecting other tenants' privacy and property.
            </span>
          </li>
        </ol>

        <div class="witness-section">
          <strong>IN WITNESS WHEREOF</strong>, the parties have hereunto set their hands this
          <span class="witness-date">${formatDate(new Date().toISOString())}</span>.
        </div>

        <div class="signature-section">
          <div class="signature-row">
            <div class="signature-block">
              <div class="signature-image-container">
                <img src="${landlordSignature}" alt="Landlord Signature" class="signature-image" />
              </div>
              <div class="signature-line">
                <div class="signature-name">${LANDLORD_INFO.name}</div>
                <div class="signature-role">Lessor</div>
              </div>
              <div class="signature-date">Date: <span>${formatDate(new Date().toISOString())}</span></div>
            </div>

            <div class="signature-block">
              <div class="signature-image-container">
                ${tenant.contractSignature
                  ? `<img src="${tenant.contractSignature}" alt="Tenant Signature" class="signature-image" />`
                  : ''
                }
              </div>
              <div class="signature-line">
                <div class="signature-name">${tenant.fullName}</div>
                <div class="signature-role">Lessee</div>
              </div>
              <div class="signature-date">Date: <span>${tenant.contractSignedDate ? formatDate(tenant.contractSignedDate) : '_______________'}</span></div>
            </div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}

export default { printLeaseAgreement };
