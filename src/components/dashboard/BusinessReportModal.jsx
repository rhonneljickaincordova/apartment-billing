import { useState, useRef } from 'react';
import { X, Download, FileText, TrendingUp, TrendingDown, Home, Users, DollarSign, Calendar, Building, Wallet, Target, AlertTriangle, Clock, Building2 } from 'lucide-react';

/**
 * Format currency in PHP
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Format date to readable string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get current month/year string
 */
const getCurrentPeriod = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Business Report Modal Component
 * Generates comprehensive business report with PDF download
 */
function BusinessReportModal({
  isOpen,
  onClose,
  rooms,
  tenants,
  bills,
  expenses,
  getBillTotal,
  settings,
}) {
  const reportRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Calculate metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const vacantRooms = totalRooms - occupiedRooms;
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

  const activeTenants = tenants.filter((t) => t.isActive).length;
  const inactiveTenants = tenants.length - activeTenants;

  // Financial calculations
  const totalRevenue = bills.reduce((sum, bill) => sum + (getBillTotal(bill, bill.rentExcluded || false) || 0), 0);
  const collectedRevenue = bills.reduce((sum, bill) => {
    if (bill.paid) return sum + (getBillTotal(bill, bill.rentExcluded || false) || 0);
    return sum + (bill.amountPaid || 0);
  }, 0);

  // Separate expenses by type
  const apartmentExpenses = expenses.filter((exp) => (exp.expenseType || 'apartment') === 'apartment');
  const personalExpenses = expenses.filter((exp) => exp.expenseType === 'personal');
  const totalApartmentExpenses = apartmentExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalPersonalExpenses = personalExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Net profit uses only apartment expenses (business expenses)
  const netProfit = collectedRevenue - totalApartmentExpenses;
  const profitMargin = collectedRevenue > 0 ? ((netProfit / collectedRevenue) * 100).toFixed(1) : 0;

  // Bill status breakdown
  const paidBills = bills.filter((b) => b.paid).length;
  const unpaidBills = bills.filter((b) => !b.paid).length;
  const overdueBills = bills.filter((b) => !b.paid && new Date(b.dueDate) < new Date()).length;
  const partialBills = bills.filter((b) => !b.paid && (b.amountPaid || 0) > 0).length;

  // Monthly rent potential
  const monthlyRentPotential = rooms.reduce((sum, room) => sum + (room.rent || 0), 0);

  // Top revenue rooms
  const roomRevenue = {};
  bills.forEach((bill) => {
    if (!roomRevenue[bill.roomId]) {
      roomRevenue[bill.roomId] = 0;
    }
    roomRevenue[bill.roomId] += getBillTotal(bill, bill.rentExcluded || false) || 0;
  });

  const topRooms = Object.entries(roomRevenue)
    .map(([roomId, revenue]) => ({
      room: rooms.find((r) => r.id === roomId),
      revenue,
    }))
    .filter((item) => item.room)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Expense by category with type breakdown
  const expenseByCategory = {};
  expenses.forEach((exp) => {
    const category = exp.category || 'Other';
    const expType = exp.expenseType || 'apartment';
    const amount = exp.amount || 0;

    if (!expenseByCategory[category]) {
      expenseByCategory[category] = { total: 0, apartment: 0, personal: 0 };
    }
    expenseByCategory[category].total += amount;
    expenseByCategory[category][expType] += amount;
  });

  const topExpenseCategories = Object.entries(expenseByCategory)
    .map(([category, data]) => ({
      category,
      amount: data.total,
      apartment: data.apartment,
      personal: data.personal,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // === NEW BUSINESS METRICS ===

  // 1. Cash Flow Summary - Collected revenue minus expenses
  const cashFlow = collectedRevenue - totalApartmentExpenses;

  // 2. Monthly Target vs Actual
  // Target = sum of rent from all occupied rooms
  const monthlyTarget = rooms
    .filter((r) => r.status === 'occupied')
    .reduce((sum, room) => sum + (room.rent || 0), 0);
  const targetVariance = collectedRevenue - monthlyTarget;
  const targetAchievement = monthlyTarget > 0 ? ((collectedRevenue / monthlyTarget) * 100).toFixed(1) : 0;

  // 3. Overdue Analysis
  const today = new Date();
  const overdueBillsData = bills.filter((b) => !b.paid && new Date(b.dueDate) < today);
  const overdueAmount = overdueBillsData.reduce((sum, bill) => {
    const total = getBillTotal(bill, bill.rentExcluded || false) || 0;
    const paid = bill.amountPaid || 0;
    return sum + (total - paid);
  }, 0);
  const upcomingBillsData = bills.filter((b) => !b.paid && new Date(b.dueDate) >= today);
  const upcomingAmount = upcomingBillsData.reduce((sum, bill) => {
    const total = getBillTotal(bill, bill.rentExcluded || false) || 0;
    const paid = bill.amountPaid || 0;
    return sum + (total - paid);
  }, 0);

  // 4. Occupancy Impact - Revenue lost due to vacant rooms
  const potentialMonthlyRevenue = rooms.reduce((sum, room) => sum + (room.rent || 0), 0);
  const lostRevenueFromVacancy = potentialMonthlyRevenue - monthlyTarget;
  const vacancyImpactRate = potentialMonthlyRevenue > 0
    ? ((lostRevenueFromVacancy / potentialMonthlyRevenue) * 100).toFixed(1)
    : 0;

  // 5. Payment Timeliness - On-time vs late payments
  const paidBillsData = bills.filter((b) => b.paid);
  const onTimePaidBills = paidBillsData.filter((b) => {
    if (!b.paidDate || !b.dueDate) return true; // Assume on-time if no data
    return new Date(b.paidDate) <= new Date(b.dueDate);
  });
  const latePaidBills = paidBillsData.filter((b) => {
    if (!b.paidDate || !b.dueDate) return false;
    return new Date(b.paidDate) > new Date(b.dueDate);
  });
  const onTimeRate = paidBillsData.length > 0
    ? ((onTimePaidBills.length / paidBillsData.length) * 100).toFixed(1)
    : 0;

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800,
      });

      // Create download link
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `Business-Report-${dateStr}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Print as PDF
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the report.');
      return;
    }

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Business Report - ${getCurrentPeriod()}</title>
        <style>
          @page { size: A4; margin: 0.5in; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a1a1a;
            background: #fff;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2563eb;
          }
          .header h1 {
            font-size: 24pt;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .header .subtitle {
            font-size: 12pt;
            color: #666;
          }
          .header .date {
            font-size: 10pt;
            color: #888;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .grid-2 {
            grid-template-columns: repeat(2, 1fr);
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
          }
          .card-title {
            font-size: 10pt;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .card-value {
            font-size: 18pt;
            font-weight: bold;
            color: #1e293b;
          }
          .card-value.green { color: #16a34a; }
          .card-value.red { color: #dc2626; }
          .card-value.blue { color: #2563eb; }
          .card-subtitle {
            font-size: 9pt;
            color: #94a3b8;
            margin-top: 3px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .table th, .table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .table th {
            background: #f1f5f9;
            font-size: 10pt;
            text-transform: uppercase;
            color: #64748b;
          }
          .table td {
            font-size: 11pt;
          }
          .summary-box {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
          }
          .summary-box h2 {
            font-size: 14pt;
            margin-bottom: 15px;
            opacity: 0.9;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-value {
            font-size: 20pt;
            font-weight: bold;
          }
          .summary-label {
            font-size: 9pt;
            opacity: 0.8;
            text-transform: uppercase;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 9pt;
            color: #94a3b8;
          }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Business Report</h1>
          <div class="subtitle">Apartment Billing Overview</div>
          <div class="date">Generated on ${formatDate(new Date().toISOString())}</div>
        </div>

        <div class="summary-box">
          <h2>Financial Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(totalRevenue)}</div>
              <div class="summary-label">Total Billed</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(collectedRevenue)}</div>
              <div class="summary-label">Collected</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(totalExpenses)}</div>
              <div class="summary-label">Expenses</div>
              <div style="font-size: 8pt; opacity: 0.7; margin-top: 4px;">Apt: ${formatCurrency(totalApartmentExpenses)} | Pers: ${formatCurrency(totalPersonalExpenses)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(netProfit)}</div>
              <div class="summary-label">Net Profit (Apt. Only)</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Property Overview</div>
          <div class="grid">
            <div class="card">
              <div class="card-title">Total Rooms</div>
              <div class="card-value blue">${totalRooms}</div>
            </div>
            <div class="card">
              <div class="card-title">Occupied</div>
              <div class="card-value green">${occupiedRooms}</div>
              <div class="card-subtitle">${occupancyRate}% occupancy rate</div>
            </div>
            <div class="card">
              <div class="card-title">Vacant</div>
              <div class="card-value ${vacantRooms > 0 ? 'red' : ''}">${vacantRooms}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Tenant Overview</div>
          <div class="grid">
            <div class="card">
              <div class="card-title">Total Tenants</div>
              <div class="card-value blue">${tenants.length}</div>
            </div>
            <div class="card">
              <div class="card-title">Active</div>
              <div class="card-value green">${activeTenants}</div>
            </div>
            <div class="card">
              <div class="card-title">Inactive</div>
              <div class="card-value">${inactiveTenants}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bills Overview</div>
          <div class="grid">
            <div class="card">
              <div class="card-title">Total Bills</div>
              <div class="card-value blue">${bills.length}</div>
            </div>
            <div class="card">
              <div class="card-title">Paid</div>
              <div class="card-value green">${paidBills}</div>
            </div>
            <div class="card">
              <div class="card-title">Unpaid</div>
              <div class="card-value red">${unpaidBills}</div>
              <div class="card-subtitle">${overdueBills} overdue, ${partialBills} partial</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Cash Flow Summary</div>
          <div class="grid">
            <div class="card">
              <div class="card-title">Revenue Collected</div>
              <div class="card-value green">${formatCurrency(collectedRevenue)}</div>
            </div>
            <div class="card">
              <div class="card-title">Apartment Expenses</div>
              <div class="card-value red">${formatCurrency(totalApartmentExpenses)}</div>
            </div>
            <div class="card">
              <div class="card-title">Net Cash Flow</div>
              <div class="card-value ${cashFlow >= 0 ? 'green' : 'red'}">${formatCurrency(cashFlow)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Monthly Target vs Actual</div>
          <div class="grid">
            <div class="card">
              <div class="card-title">Target (Occupied Rooms)</div>
              <div class="card-value blue">${formatCurrency(monthlyTarget)}</div>
            </div>
            <div class="card">
              <div class="card-title">Actual Collected</div>
              <div class="card-value green">${formatCurrency(collectedRevenue)}</div>
            </div>
            <div class="card">
              <div class="card-title">Achievement</div>
              <div class="card-value ${parseFloat(targetAchievement) >= 100 ? 'green' : 'red'}">${targetAchievement}%</div>
              <div class="card-subtitle">${targetVariance >= 0 ? '+' : ''}${formatCurrency(targetVariance)} variance</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Overdue Analysis</div>
          <div class="grid grid-2">
            <div class="card">
              <div class="card-title">Overdue Bills</div>
              <div class="card-value red">${overdueBillsData.length}</div>
              <div class="card-subtitle">Amount: ${formatCurrency(overdueAmount)}</div>
            </div>
            <div class="card">
              <div class="card-title">Upcoming Bills</div>
              <div class="card-value blue">${upcomingBillsData.length}</div>
              <div class="card-subtitle">Amount: ${formatCurrency(upcomingAmount)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Occupancy Impact</div>
          <div class="grid">
            <div class="card">
              <div class="card-title">Potential Revenue</div>
              <div class="card-value blue">${formatCurrency(potentialMonthlyRevenue)}</div>
              <div class="card-subtitle">All ${totalRooms} rooms</div>
            </div>
            <div class="card">
              <div class="card-title">Current Revenue</div>
              <div class="card-value green">${formatCurrency(monthlyTarget)}</div>
              <div class="card-subtitle">${occupiedRooms} occupied rooms</div>
            </div>
            <div class="card">
              <div class="card-title">Lost to Vacancy</div>
              <div class="card-value ${lostRevenueFromVacancy > 0 ? 'red' : 'green'}">${formatCurrency(lostRevenueFromVacancy)}</div>
              <div class="card-subtitle">${vacancyImpactRate}% impact from ${vacantRooms} vacant</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Timeliness</div>
          <div class="grid">
            <div class="card">
              <div class="card-title">On-Time Payments</div>
              <div class="card-value green">${onTimePaidBills.length}</div>
            </div>
            <div class="card">
              <div class="card-title">Late Payments</div>
              <div class="card-value red">${latePaidBills.length}</div>
            </div>
            <div class="card">
              <div class="card-title">On-Time Rate</div>
              <div class="card-value ${parseFloat(onTimeRate) >= 80 ? 'green' : 'red'}">${onTimeRate}%</div>
              <div class="card-subtitle">of ${paidBillsData.length} paid bills</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Profitability</div>
          <div class="grid grid-2">
            <div class="card">
              <div class="card-title">Net Profit (Apartment Expenses Only)</div>
              <div class="card-value ${netProfit >= 0 ? 'green' : 'red'}">${formatCurrency(netProfit)}</div>
            </div>
            <div class="card">
              <div class="card-title">Profit Margin</div>
              <div class="card-value ${parseFloat(profitMargin) >= 0 ? 'green' : 'red'}">${profitMargin}%</div>
            </div>
          </div>
          <div style="margin-top: 15px; display: flex; gap: 20px; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></span>
              <span style="font-size: 11pt;">Apartment Expenses: ${formatCurrency(totalApartmentExpenses)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b;"></span>
              <span style="font-size: 11pt;">Personal Expenses: ${formatCurrency(totalPersonalExpenses)}</span>
            </div>
          </div>
        </div>

        ${topRooms.length > 0 ? `
        <div class="section">
          <div class="section-title">Top Revenue Rooms</div>
          <table class="table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${topRooms.map((item) => `
                <tr>
                  <td>${item.room?.name || 'Unknown'}</td>
                  <td>${formatCurrency(item.revenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${topExpenseCategories.length > 0 ? `
        <div class="section">
          <div class="section-title">Expenses by Category</div>
          <table class="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Apartment</th>
                <th>Personal</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${topExpenseCategories.map((item) => `
                <tr>
                  <td>${item.category}</td>
                  <td style="color: #10b981;">${item.apartment > 0 ? formatCurrency(item.apartment) : '-'}</td>
                  <td style="color: #f59e0b;">${item.personal > 0 ? formatCurrency(item.personal) : '-'}</td>
                  <td style="font-weight: bold; color: #dc2626;">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p>This report was automatically generated by Apartment Bill Tracker</p>
          <p>Report Date: ${formatDate(new Date().toISOString())}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Business Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Download Image'}
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Print PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6" ref={reportRef}>
          {/* Report Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Report</h1>
            <p className="text-gray-500 dark:text-gray-400">Generated on {formatDate(new Date().toISOString())}</p>
          </div>

          {/* Financial Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white mb-6">
            <h3 className="text-lg font-semibold mb-4 opacity-90">Financial Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm opacity-80">Total Billed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(collectedRevenue)}</p>
                <p className="text-sm opacity-80">Collected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                <p className="text-sm opacity-80">Expenses</p>
                <p className="text-xs opacity-60 mt-1">
                  Apt: {formatCurrency(totalApartmentExpenses)} | Pers: {formatCurrency(totalPersonalExpenses)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(netProfit)}</p>
                <p className="text-sm opacity-80">Net Profit</p>
              </div>
            </div>
          </div>

          {/* Property & Tenant Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Property Overview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Property Overview
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalRooms}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Rooms</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{occupiedRooms}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Occupied</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${vacantRooms > 0 ? 'text-red-600' : 'text-gray-600'}`}>{vacantRooms}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vacant</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{occupancyRate}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy Rate</p>
              </div>
            </div>

            {/* Tenant Overview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Tenant Overview
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{tenants.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{activeTenants}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{inactiveTenants}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bills & Collection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Bills Status */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Bills Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total Bills</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{bills.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Paid</span>
                  <span className="font-semibold text-green-600">{paidBills}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Unpaid</span>
                  <span className="font-semibold text-red-600">{unpaidBills}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Overdue</span>
                  <span className="font-semibold text-orange-600">{overdueBills}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Partial Payment</span>
                  <span className="font-semibold text-yellow-600">{partialBills}</span>
                </div>
              </div>
            </div>

            {/* Cash Flow Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Cash Flow Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Revenue Collected</span>
                  <span className="font-semibold text-green-600">{formatCurrency(collectedRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Apartment Expenses</span>
                  <span className="font-semibold text-red-600">- {formatCurrency(totalApartmentExpenses)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">Net Cash Flow</span>
                    <span className={`text-xl font-bold ${cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(cashFlow)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Target vs Actual & Overdue Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Monthly Target vs Actual */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Monthly Target vs Actual
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Target (Occupied Rooms)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(monthlyTarget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Actual Collected</span>
                  <span className="font-semibold text-green-600">{formatCurrency(collectedRevenue)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">Achievement</span>
                    <span className={`font-bold ${parseFloat(targetAchievement) >= 100 ? 'text-green-600' : 'text-amber-600'}`}>
                      {targetAchievement}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${parseFloat(targetAchievement) >= 100 ? 'bg-green-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(targetAchievement, 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm">
                    <span className={`${targetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {targetVariance >= 0 ? '+' : ''}{formatCurrency(targetVariance)} variance
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue Analysis */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Overdue Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Overdue Bills</span>
                  <span className="font-semibold text-red-600">{overdueBillsData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Overdue Amount</span>
                  <span className="font-bold text-red-600">{formatCurrency(overdueAmount)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Upcoming Bills</span>
                    <span className="font-semibold text-blue-600">{upcomingBillsData.length}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600 dark:text-gray-300">Upcoming Amount</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(upcomingAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Occupancy Impact & Payment Timeliness */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Occupancy Impact */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Occupancy Impact
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Potential Revenue (All Rooms)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(potentialMonthlyRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Current Revenue (Occupied)</span>
                  <span className="font-semibold text-green-600">{formatCurrency(monthlyTarget)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">Lost to Vacancy</span>
                    <span className={`font-bold ${lostRevenueFromVacancy > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(lostRevenueFromVacancy)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {vacancyImpactRate}% revenue impact from {vacantRooms} vacant room{vacantRooms !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Timeliness */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Payment Timeliness
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total Paid Bills</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{paidBillsData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">On-Time Payments</span>
                  <span className="font-semibold text-green-600">{onTimePaidBills.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Late Payments</span>
                  <span className="font-semibold text-red-600">{latePaidBills.length}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">On-Time Rate</span>
                    <span className={`font-bold ${parseFloat(onTimeRate) >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                      {onTimeRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${parseFloat(onTimeRate) >= 80 ? 'bg-green-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(onTimeRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profitability */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              {netProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              Profitability
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(collectedRevenue)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalApartmentExpenses)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apt. Expenses</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${parseFloat(profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitMargin}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</p>
              </div>
            </div>
            {/* Expense Type Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-gray-600 dark:text-gray-300">Apartment: {formatCurrency(totalApartmentExpenses)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-gray-600 dark:text-gray-300">Personal: {formatCurrency(totalPersonalExpenses)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Rooms & Expense Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Revenue Rooms */}
            {topRooms.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Top Revenue Rooms
                </h3>
                <div className="space-y-2">
                  {topRooms.map((item, index) => (
                    <div key={item.room?.id || index} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">{item.room?.name || 'Unknown'}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Expense Categories */}
            {topExpenseCategories.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Expenses by Category
                </h3>
                <div className="space-y-3">
                  {topExpenseCategories.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700 dark:text-gray-200 font-medium">{item.category}</span>
                        <span className="font-semibold text-red-600">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        {item.apartment > 0 && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Apt: {formatCurrency(item.apartment)}
                          </span>
                        )}
                        {item.personal > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Pers: {formatCurrency(item.personal)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessReportModal;
