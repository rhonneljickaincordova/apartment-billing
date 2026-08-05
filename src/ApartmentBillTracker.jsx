import { useState, useEffect, useMemo } from 'react';
import { Users, DollarSign, Settings, ArrowLeft, LogOut } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import { ConfirmDialog } from './components/ui';
import { useRooms, useBills, useAirconCleaning, useSettings, useConfirmDialog, useTenants, useExpenses } from './hooks';
import { isBillDueSoon } from './utils/dateHelpers';
import { exportBillsToCSV, exportAllDataToJSON } from './utils/exportHelpers';

// Component imports
import { RoomForm, RoomsList } from './components/rooms';
import { BillForm, BillsTable, BillFilters, BillPrintModal, PaymentPopup, PaymentHistoryModal, PaymentReceiptModal } from './components/bills';
import { SummaryCards, RecentActivity, MonthlyComparison, MonthlyExpenseChart, MonthlyBillsChart, ExpenseByCategoryChart, BillsByRoomChart, FinancialSummary, FinancialBreakdown, DashboardFilters, getAvailableYears, filterByPeriod, NotificationBell, BusinessReportModal } from './components/dashboard';
import { SettingsForm } from './components/settings';
import MediaLibrarySection from './components/settings/MediaLibrarySection';
import { TenantForm, TenantsList, TenantDetailsModal, MoveOutModal, TransferRoomModal } from './components/tenants';
import { ExpenseForm, ExpensesTable, ExpenseFilters } from './components/expenses';
import { Pagination } from './components/ui';
import { InfoModal, InfoButton, DashboardInfoContent } from './components/common';

const ApartmentBillTracker = () => {
  const toast = useToast();
  const { user, logout, goBackToAppSelection } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Bill filters state
  const [billFilters, setBillFilters] = useState({
    search: '',
    status: 'unpaid',
    roomId: '',
    dateFrom: '',
    dateTo: '',
  });

  // Bill sorting state
  const [billSortField, setBillSortField] = useState('dueDate');
  const [billSortDirection, setBillSortDirection] = useState('desc');

  // Expense filters state
  const [expenseFilters, setExpenseFilters] = useState({
    expenseType: 'all',
    category: 'all',
  });

  // Expense sorting state
  const [expenseSortField, setExpenseSortField] = useState('date');
  const [expenseSortDirection, setExpenseSortDirection] = useState('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dashboard filters state
  const [dashboardTimePeriod, setDashboardTimePeriod] = useState('month');
  const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear());
  const [dashboardCustomRange, setDashboardCustomRange] = useState({ startDate: '', endDate: '' });

  // Custom hooks for data management
  const { settings, updateSetting, saveSettings: saveSettingsAction, updateMediaLibrary } = useSettings();

  const {
    rooms,
    roomForm,
    isEditing: isEditingRoom,
    errors: roomErrors,
    saveRoom: saveRoomAction,
    editRoom,
    deleteRoom: deleteRoomAction,
    resetForm: resetRoomForm,
    updateFormField: updateRoomField,
    toggleRoomStatus,
    getRoomById,
    getOccupiedRooms,
    updateRoomMedia,
  } = useRooms();

  const {
    tenants,
    tenantForm,
    isEditing: isEditingTenant,
    errors: tenantErrors,
    saveTenant: saveTenantAction,
    editTenant,
    deleteTenant: deleteTenantAction,
    resetForm: resetTenantForm,
    updateFormField: updateTenantField,
    toggleTenantStatus,
    moveOutTenant,
    revertMoveOut,
    transferTenantRoom,
    addValidIdImage,
    removeValidIdImage,
    setContractSignature,
    clearContractSignature,
  } = useTenants();

  const {
    bills,
    billForm,
    isEditing: isEditingBill,
    errors: billErrors,
    saveBill: saveBillAction,
    editBill,
    deleteBill: deleteBillAction,
    deleteBillsByRoomId,
    recordPayment,
    resetForm: resetBillForm,
    updateFormField: updateBillField,
    getOverdueBills,
    getUnpaidBills,
    isBillOverdue,
    getTotalCollected,
    getTotalPending,
    getTotalBilled,
    getBillTotal,
    getBillStatus,
    getRemainingBalance,
    updatePaymentHistory,
    addMissingPaymentRecord,
    recordRefund,
  } = useBills(rooms, settings, tenants);

  const {
    cleaningSchedules,
    cleaningForm,
    isEditing: isEditingCleaning,
    errors: cleaningErrors,
    selectedHistory,
    saveSchedule: saveScheduleAction,
    editSchedule,
    deleteSchedule: deleteScheduleAction,
    deleteSchedulesByRoomId,
    markAsCleaned,
    resetForm: resetCleaningForm,
    updateFormField: updateCleaningField,
    openHistory,
    closeHistory,
    getOverdueSchedules,
    isScheduleOverdue,
    isScheduleDueSoon,
  } = useAirconCleaning(rooms);

  const {
    expenses,
    expenseForm,
    isEditing: isEditingExpense,
    errors: expenseErrors,
    saveExpense: saveExpenseAction,
    editExpense,
    duplicateExpense,
    deleteExpense: deleteExpenseAction,
    resetForm: resetExpenseForm,
    updateFormField: updateExpenseField,
  } = useExpenses();

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [moveOutTenantData, setMoveOutTenantData] = useState(null);
  const [transferTenantData, setTransferTenantData] = useState(null);
  const [printBillData, setPrintBillData] = useState(null);
  const [paymentBillData, setPaymentBillData] = useState(null);
  const [paymentHistoryData, setPaymentHistoryData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [pendingBillRoomId, setPendingBillRoomId] = useState(null);
  const [isTenantFormExpanded, setIsTenantFormExpanded] = useState(false);
  const [isExpenseFormExpanded, setIsExpenseFormExpanded] = useState(false);
  const [isSettingsFormExpanded, setIsSettingsFormExpanded] = useState(false);
  const [showDashboardInfo, setShowDashboardInfo] = useState(false);

  const confirmDialog = useConfirmDialog();

  // Dashboard available years
  const dashboardAvailableYears = useMemo(() => {
    return getAvailableYears(bills, expenses);
  }, [bills, expenses]);

  // Dashboard filtered bills
  const dashboardFilteredBills = useMemo(() => {
    return bills.filter((bill) => filterByPeriod(bill.dueDate, dashboardTimePeriod, dashboardYear, dashboardCustomRange));
  }, [bills, dashboardTimePeriod, dashboardYear, dashboardCustomRange]);

  // Dashboard filtered expenses
  const dashboardFilteredExpenses = useMemo(() => {
    return expenses.filter((expense) => filterByPeriod(expense.date, dashboardTimePeriod, dashboardYear, dashboardCustomRange));
  }, [expenses, dashboardTimePeriod, dashboardYear, dashboardCustomRange]);

  // Filter and paginate bills
  const filteredBills = useMemo(() => {
    const filtered = bills.filter((bill) => {
      const room = getRoomById(bill.roomId);

      // Search filter
      if (billFilters.search) {
        const searchLower = billFilters.search.toLowerCase();
        if (!room?.name?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter - use getBillStatus for accurate filtering
      if (billFilters.status !== 'all') {
        const status = getBillStatus(bill);
        // 'unpaid' shows all non-paid bills (pending, partial, overdue)
        if (billFilters.status === 'unpaid') {
          if (status === 'paid') return false;
        } else if (billFilters.status !== status) {
          return false;
        }
      }

      // Room filter
      if (billFilters.roomId && bill.roomId !== billFilters.roomId) {
        return false;
      }

      // Date range filter
      if (billFilters.dateFrom && bill.dueDate < billFilters.dateFrom) {
        return false;
      }
      if (billFilters.dateTo && bill.dueDate > billFilters.dateTo) {
        return false;
      }

      return true;
    });

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (billSortField) {
        case 'status':
          aValue = getBillStatus(a);
          bValue = getBillStatus(b);
          break;
        case 'room':
          aValue = getRoomById(a.roomId)?.name || '';
          bValue = getRoomById(b.roomId)?.name || '';
          break;
        case 'dueDate':
          aValue = a.dueDate;
          bValue = b.dueDate;
          break;
        case 'total':
          aValue = getBillTotal(a);
          bValue = getBillTotal(b);
          break;
        case 'rentBill':
          aValue = a.rentBill || 0;
          bValue = b.rentBill || 0;
          break;
        case 'electricityBill':
          aValue = a.electricityBill || 0;
          bValue = b.electricityBill || 0;
          break;
        case 'waterBill':
          aValue = a.waterBill || 0;
          bValue = b.waterBill || 0;
          break;
        case 'wifiBill':
          aValue = a.wifiBill || 0;
          bValue = b.wifiBill || 0;
          break;
        case 'airconCleaningBill':
          aValue = a.airconCleaningBill || 0;
          bValue = b.airconCleaningBill || 0;
          break;
        case 'paidDate':
          aValue = a.paidDate || '';
          bValue = b.paidDate || '';
          break;
        default:
          aValue = a.dueDate;
          bValue = b.dueDate;
      }

      if (aValue < bValue) return billSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return billSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bills, billFilters, getRoomById, getBillStatus, getBillTotal, billSortField, billSortDirection]);

  // Paginated bills
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBills.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBills, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [billFilters]);

  // Simulate initial data load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle pending bill creation from tenant list
  useEffect(() => {
    if (pendingBillRoomId && activeTab === 'bills' && !isEditingBill) {
      updateBillField('roomId', pendingBillRoomId);
      setPendingBillRoomId(null);
    }
  }, [pendingBillRoomId, activeTab, isEditingBill, updateBillField]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setBillFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Expense filter handler
  const handleExpenseFilterChange = (key, value) => {
    setExpenseFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Expense sort handler
  const handleExpenseSort = (field) => {
    if (expenseSortField === field) {
      setExpenseSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setExpenseSortField(field);
      setExpenseSortDirection('asc');
    }
  };

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    const filtered = expenses.filter((expense) => {
      // Type filter
      if (expenseFilters.expenseType !== 'all') {
        const expType = expense.expenseType || 'apartment';
        if (expType !== expenseFilters.expenseType) {
          return false;
        }
      }

      // Category filter
      if (expenseFilters.category !== 'all') {
        if (expense.category !== expenseFilters.category) {
          return false;
        }
      }

      return true;
    });

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      let aVal = a[expenseSortField];
      let bVal = b[expenseSortField];

      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Handle numeric fields
      if (expenseSortField === 'amount') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      // Handle date field
      if (expenseSortField === 'date') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      // String comparison for text fields
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return expenseSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return expenseSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [expenses, expenseFilters, expenseSortField, expenseSortDirection]);

  const handleClearFilters = () => {
    setBillFilters({
      search: '',
      status: 'unpaid',
      roomId: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  // Room handlers with toast notifications
  const handleSaveRoom = async () => {
    const result = await saveRoomAction();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.warning(result.message);
    }
  };

  const handleToggleRoomStatus = async (room) => {
    const result = await toggleRoomStatus(room);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteRoom = (id) => {
    const room = getRoomById(id);
    confirmDialog.showConfirm(
      'Delete Room',
      `Are you sure you want to delete "${room?.name}"? All associated bills and cleaning schedules will also be deleted.`,
      async () => {
        await deleteBillsByRoomId(id);
        await deleteSchedulesByRoomId(id);
        const result = await deleteRoomAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      },
      'danger'
    );
  };

  const handleUpdateRoomMedia = async (roomId, media) => {
    const result = await updateRoomMedia(roomId, media);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const handleUpdateMediaLibrary = async (mediaLibrary) => {
    const result = await updateMediaLibrary(mediaLibrary);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    return result;
  };

  // Bill handlers with toast notifications
  const handleSaveBill = async () => {
    const result = await saveBillAction();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.warning(result.message);
    }
  };

  const handleDeleteBill = (id) => {
    const bill = bills.find((b) => b.id === id);
    const room = getRoomById(bill?.roomId);
    confirmDialog.showConfirm(
      'Delete Bill',
      `Are you sure you want to delete the bill for "${room?.name || 'Unknown'}"?`,
      async () => {
        const result = await deleteBillAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      },
      'danger'
    );
  };

  // Bill print modal handlers
  const handleOpenPrintModal = (bill) => {
    setPrintBillData(bill);
  };

  const handleClosePrintModal = () => {
    setPrintBillData(null);
  };

  // Payment popup handlers
  const handleOpenPaymentPopup = (bill) => {
    setPaymentBillData(bill);
  };

  const handleClosePaymentPopup = () => {
    setPaymentBillData(null);
  };

  const handleSubmitPayment = async (billId, amount, paymentDetails) => {
    // Get bill data before payment to check remaining balance
    const billBeforePayment = bills.find(b => b.id === billId);
    const totalBill = billBeforePayment ? getBillTotal(billBeforePayment) : 0;
    const paidBefore = billBeforePayment?.amountPaid || 0;
    const remainingBefore = totalBill - paidBefore;

    const result = await recordPayment(billId, amount, paymentDetails);
    if (result.success) {
      toast.success(result.message);

      // Check if bill is now fully paid (payment covers remaining balance)
      if (amount >= remainingBefore) {
        // Wait a moment for state to update, then show receipt
        setTimeout(() => {
          const updatedBill = bills.find(b => b.id === billId);
          if (updatedBill) {
            setReceiptData({
              bill: updatedBill,
              totalAmount: totalBill,
            });
          }
        }, 500);
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleCloseReceipt = () => {
    setReceiptData(null);
  };

  const handlePrintReceiptFromHistory = (bill) => {
    // Close payment history and open receipt modal
    setPaymentHistoryData(null);
    setReceiptData({
      bill: bill,
      totalAmount: getBillTotal(bill),
    });
  };

  // Payment history modal handlers
  const handleOpenPaymentHistory = (bill) => {
    setPaymentHistoryData(bill);
  };

  const handleClosePaymentHistory = () => {
    setPaymentHistoryData(null);
  };

  const handleUpdatePaymentHistory = async (billId, paymentIndex, updatedPayment) => {
    const result = await updatePaymentHistory(billId, paymentIndex, updatedPayment);
    if (result.success) {
      toast.success(result.message);
      // Refresh the payment history data
      const updatedBill = bills.find(b => b.id === billId);
      if (updatedBill) {
        setPaymentHistoryData({ ...updatedBill });
      }
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const handleAddMissingRecord = async (billId, paymentData) => {
    const result = await addMissingPaymentRecord(billId, paymentData);
    if (result.success) {
      toast.success(result.message);
      // Refresh the payment history data
      const updatedBill = bills.find(b => b.id === billId);
      if (updatedBill) {
        setPaymentHistoryData({ ...updatedBill });
      }
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const handleRecordRefund = async (billId, refundData) => {
    const result = await recordRefund(billId, refundData);
    if (result.success) {
      toast.success(result.message);
      // Refresh the payment history data
      const updatedBill = bills.find(b => b.id === billId);
      if (updatedBill) {
        setPaymentHistoryData({ ...updatedBill });
      }
    } else {
      toast.error(result.message);
    }
    return result;
  };

  // Bill sorting handler
  const handleBillSort = (field) => {
    if (billSortField === field) {
      // Toggle direction if same field
      setBillSortDirection(billSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setBillSortField(field);
      setBillSortDirection('desc');
    }
  };

  // Aircon cleaning handlers with toast notifications
  const handleSaveCleaningSchedule = async () => {
    const result = await saveScheduleAction();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.warning(result.message);
    }
  };

  const handleDeleteCleaningSchedule = (id) => {
    const schedule = cleaningSchedules.find((c) => c.id === id);
    const room = getRoomById(schedule?.roomId);
    confirmDialog.showConfirm(
      'Delete Schedule',
      `Are you sure you want to delete the cleaning schedule for "${room?.name || 'Unknown'}"? All history will be lost.`,
      async () => {
        const result = await deleteScheduleAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      },
      'danger'
    );
  };

  const handleMarkAirconCleaned = (roomId) => {
    const room = getRoomById(roomId);
    confirmDialog.showConfirm(
      'Mark as Cleaned',
      `Mark aircon for "${room?.name || 'Unknown'}" as cleaned today?`,
      async () => {
        const result = await markAsCleaned(roomId);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }
    );
  };

  // Settings handlers
  const handleSaveSettings = async () => {
    const result = await saveSettingsAction();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.warning(result.message);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const success = exportBillsToCSV(bills, rooms);
    if (success) {
      toast.success('Bills exported to CSV successfully!');
    } else {
      toast.error('Failed to export bills. No data available.');
    }
  };

  const handleExportJSON = () => {
    const allData = {
      rooms,
      bills,
      cleaningSchedules,
      settings,
      tenants,
    };
    const success = exportAllDataToJSON(allData);
    if (success) {
      toast.success('All data exported to JSON successfully!');
    } else {
      toast.error('Failed to export data.');
    }
  };

  // Tenant handlers with toast notifications
  const handleSaveTenant = async () => {
    const result = await saveTenantAction();
    if (result.success) {
      toast.success(result.message);
      setIsTenantFormExpanded(false);
    } else {
      toast.warning(result.message);
    }
  };

  const handleEditTenant = (tenant) => {
    editTenant(tenant);
    setIsTenantFormExpanded(true);
  };

  const handleDeleteTenant = (id) => {
    const tenant = tenants.find((t) => t.id === id);
    confirmDialog.showConfirm(
      'Delete Tenant',
      `Are you sure you want to delete "${tenant?.fullName}"? This action cannot be undone.`,
      async () => {
        const result = await deleteTenantAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      },
      'danger'
    );
  };

  const handleToggleTenantStatus = async (tenant) => {
    const result = await toggleTenantStatus(tenant);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleMoveOutTenant = (tenant) => {
    setMoveOutTenantData(tenant);
  };

  const handleConfirmMoveOut = async (tenant, moveOutDetails) => {
    const result = await moveOutTenant(tenant, moveOutDetails);
    if (result.success) {
      // Also update the room status to vacant if tenant had a room assigned
      if (tenant.roomId) {
        const room = getRoomById(tenant.roomId);
        if (room && room.status === 'occupied') {
          await toggleRoomStatus(room);
        }
      }
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setMoveOutTenantData(null);
  };

  const handleCloseMoveOutModal = () => {
    setMoveOutTenantData(null);
  };

  const handleRevertMoveOut = (tenant) => {
    confirmDialog.showConfirm(
      'Revert Move-Out',
      `Restore "${tenant.fullName}" to active status and clear the move-out record? The refund (if any) will NOT be reversed — handle that separately if it was recorded in error.`,
      async () => {
        const result = await revertMoveOut(tenant);
        if (result.success) {
          if (tenant.roomId) {
            const room = getRoomById(tenant.roomId);
            if (room && room.status !== 'occupied') {
              await toggleRoomStatus(room);
            }
          }
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      },
      'warning'
    );
  };

  const handleTransferRoom = (tenant) => {
    setTransferTenantData(tenant);
  };

  const handleConfirmTransfer = async (tenant, details) => {
    const result = await transferTenantRoom(tenant, details);
    if (result.success) {
      const oldRoom = tenant.roomId ? getRoomById(tenant.roomId) : null;
      if (oldRoom && oldRoom.status === 'occupied') {
        await toggleRoomStatus(oldRoom);
      }
      const newRoom = details.newRoomId ? getRoomById(details.newRoomId) : null;
      if (newRoom && newRoom.status !== 'occupied') {
        await toggleRoomStatus(newRoom);
      }
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setTransferTenantData(null);
  };

  const handleCloseTransferModal = () => {
    setTransferTenantData(null);
  };

  const handleSyncRoomOccupancy = () => {
    const activeRoomIds = new Set(
      tenants.filter((t) => t.isActive && t.roomId).map((t) => t.roomId)
    );
    const changes = rooms
      .map((room) => {
        const shouldBeOccupied = activeRoomIds.has(room.id);
        const currentlyOccupied = room.status === 'occupied';
        if (shouldBeOccupied === currentlyOccupied) return null;
        return {
          room,
          from: room.status || 'vacant',
          to: shouldBeOccupied ? 'occupied' : 'vacant',
        };
      })
      .filter(Boolean);

    if (changes.length === 0) {
      toast.success('Room occupancy is already in sync.');
      return;
    }

    const preview = changes
      .slice(0, 5)
      .map((c) => `${c.room.name} (${c.from} → ${c.to})`)
      .join(', ');
    const suffix = changes.length > 5 ? `, and ${changes.length - 5} more` : '';

    confirmDialog.showConfirm(
      'Sync Room Occupancy',
      `${changes.length} room${changes.length === 1 ? '' : 's'} will be updated: ${preview}${suffix}. Proceed?`,
      async () => {
        let ok = 0;
        let fail = 0;
        for (const c of changes) {
          const result = await toggleRoomStatus(c.room);
          if (result.success) ok++;
          else fail++;
        }
        if (fail === 0) {
          toast.success(`Synced ${ok} room${ok === 1 ? '' : 's'}.`);
        } else {
          toast.error(`Synced ${ok}, failed ${fail}.`);
        }
      },
      'warning'
    );
  };

  const handleViewTenantDetails = (tenant) => {
    setSelectedTenant(tenant);
  };

  const handleCloseTenantDetails = () => {
    setSelectedTenant(null);
  };

  const handleSaveTenantSignature = async (signatureData) => {
    if (selectedTenant) {
      try {
        const { tenantsService } = await import('./services/firestore');
        const contractSignedDate = new Date().toISOString().split('T')[0];
        await tenantsService.update(selectedTenant.id, {
          contractSignature: signatureData,
          contractSignedDate
        });
        setSelectedTenant({ ...selectedTenant, contractSignature: signatureData, contractSignedDate });
        toast.success('Signature saved successfully!');
      } catch (error) {
        console.error('Error saving signature:', error);
        toast.error('Failed to save signature.');
      }
    }
  };

  const handleClearTenantSignature = async () => {
    if (selectedTenant) {
      try {
        const { tenantsService } = await import('./services/firestore');
        await tenantsService.update(selectedTenant.id, {
          contractSignature: null,
          contractSignedDate: null
        });
        setSelectedTenant({ ...selectedTenant, contractSignature: null, contractSignedDate: null });
        toast.success('Signature cleared!');
      } catch (error) {
        console.error('Error clearing signature:', error);
        toast.error('Failed to clear signature.');
      }
    }
  };

  // Expense handlers with toast notifications
  const handleSaveExpense = async () => {
    const result = await saveExpenseAction();
    if (result.success) {
      toast.success(result.message);
      setIsExpenseFormExpanded(false);
    } else {
      toast.warning(result.message);
    }
  };

  const handleEditExpense = (expense) => {
    editExpense(expense);
    setIsExpenseFormExpanded(true);
  };

  const handleDuplicateExpense = (expense) => {
    duplicateExpense(expense);
    setIsExpenseFormExpanded(true);
    toast.info('Expense duplicated. Adjust the date and save.');
  };

  const handleDeleteExpense = (id) => {
    const expense = expenses.find((e) => e.id === id);
    confirmDialog.showConfirm(
      'Delete Expense',
      `Are you sure you want to delete "${expense?.description}"?`,
      async () => {
        const result = await deleteExpenseAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      },
      'danger'
    );
  };

  // Helper to check if bill is due soon
  const checkBillDueSoon = (bill) => {
    return !bill.paid && isBillDueSoon(bill.dueDate);
  };

  // Handle create bill from tenant list
  const handleCreateBillForTenant = (tenant) => {
    setPendingBillRoomId(tenant.roomId);
    setActiveTab('bills');
    toast.info(`Creating bill for ${tenant.fullName}...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Title and Notifications */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Back to App Selection */}
            <button
              onClick={goBackToAppSelection}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to Apps"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white truncate">
              Apartment Bill Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* User avatar */}
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
              />
            )}
            <NotificationBell
              overdueBills={getOverdueBills()}
              overdueCleanings={getOverdueSchedules()}
              getRoomById={getRoomById}
            />
            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mb-4 md:mb-6">
          {/* Left fade indicator */}
          <div className="absolute left-0 top-0 bottom-1 w-6 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10 md:hidden" />
          {/* Right fade indicator */}
          <div className="absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10 md:hidden" />

          <div className="flex gap-1 md:gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
            {['dashboard', 'bills', 'tenants', 'expenses', 'reports', 'rooms', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 md:px-6 py-2.5 md:py-3 font-medium transition-colors whitespace-nowrap text-sm md:text-base snap-start ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                aria-selected={activeTab === tab}
                role="tab"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Header with Filters */}
            <div className="flex items-start gap-2 sm:gap-4">
              <DashboardFilters
                timePeriod={dashboardTimePeriod}
                selectedYear={dashboardYear}
                availableYears={dashboardAvailableYears}
                customRange={dashboardCustomRange}
                onTimePeriodChange={setDashboardTimePeriod}
                onYearChange={setDashboardYear}
                onCustomRangeChange={setDashboardCustomRange}
              />
              <div className="flex-shrink-0 mt-3 md:mt-4">
                <InfoButton onClick={() => setShowDashboardInfo(true)} />
              </div>
            </div>

            {/* Dashboard Info Modal */}
            <InfoModal
              isOpen={showDashboardInfo}
              onClose={() => setShowDashboardInfo(false)}
              title="Dashboard Overview"
            >
              <DashboardInfoContent />
            </InfoModal>

            {/* Quick Stats */}
            <SummaryCards
              totalRooms={rooms.length}
              occupiedRoomsList={getOccupiedRooms()}
              pendingBillsList={dashboardFilteredBills
                .filter((b) => !b.paid && new Date(b.dueDate) >= new Date())
                .map((b) => ({ ...b, roomName: getRoomById(b.roomId)?.name || 'Unknown' }))}
              overdueBillsList={dashboardFilteredBills
                .filter((b) => !b.paid && new Date(b.dueDate) < new Date())
                .map((b) => ({ ...b, roomName: getRoomById(b.roomId)?.name || 'Unknown' }))}
              paidRoomsList={[...new Set(dashboardFilteredBills.filter((b) => b.paid).map((b) => b.roomId))]
                .map((roomId) => {
                  const roomBills = dashboardFilteredBills.filter((b) => b.paid && b.roomId === roomId);
                  // Calculate actual cash collected (excluding deposits) and refunds
                  const totalCollected = roomBills.reduce((sum, b) => {
                    const amountPaid = b.amountPaid || 0;
                    if (b.depositApplied && b.depositAmount > 0) {
                      const billTotal = getBillTotal(b, b.rentExcluded || false);
                      const depositUsed = b.depositAmount;
                      // Cash portion = total paid minus deposit
                      const cashPortion = Math.max(0, amountPaid - depositUsed);
                      // Refund = when deposit exceeds bill total (negative amount)
                      const refund = depositUsed > billTotal ? depositUsed - billTotal : 0;
                      return sum + cashPortion - refund;
                    }
                    return sum + amountPaid;
                  }, 0);
                  return { id: roomId, name: getRoomById(roomId)?.name || 'Unknown', totalCollected };
                })}
              totalBilledRooms={new Set(dashboardFilteredBills.map((b) => b.roomId)).size}
            />

            {/* Financial Summary & Monthly Comparison Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <FinancialSummary
                bills={dashboardFilteredBills}
                expenses={dashboardFilteredExpenses}
                getBillTotal={getBillTotal}
              />
              <MonthlyComparison
                bills={bills}
                expenses={expenses}
                getBillTotal={getBillTotal}
              />
            </div>

            {/* Recent Activity & Financial Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <RecentActivity
                bills={dashboardFilteredBills}
                expenses={dashboardFilteredExpenses}
                getRoomById={getRoomById}
                getBillTotal={getBillTotal}
              />
              <FinancialBreakdown
                bills={dashboardFilteredBills}
                expenses={dashboardFilteredExpenses}
                getBillTotal={getBillTotal}
                getRoomById={getRoomById}
              />
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <MonthlyBillsChart bills={dashboardFilteredBills} getBillTotal={getBillTotal} />
              <MonthlyExpenseChart expenses={dashboardFilteredExpenses} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <BillsByRoomChart bills={dashboardFilteredBills} rooms={rooms} getBillTotal={getBillTotal} />
              <ExpenseByCategoryChart expenses={dashboardFilteredExpenses} />
            </div>
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <BillForm
              form={billForm}
              errors={billErrors}
              isEditing={isEditingBill}
              rooms={getOccupiedRooms()}
              tenants={tenants}
              onSave={handleSaveBill}
              onCancel={resetBillForm}
              onUpdateField={updateBillField}
            />
            <BillFilters
              filters={billFilters}
              rooms={rooms}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
            <BillsTable
              bills={paginatedBills}
              getRoomById={getRoomById}
              getBillTotal={getBillTotal}
              getBillStatus={getBillStatus}
              getRemainingBalance={getRemainingBalance}
              isBillOverdue={isBillOverdue}
              isBillDueSoon={checkBillDueSoon}
              onRecordPayment={handleOpenPaymentPopup}
              onViewPaymentHistory={handleOpenPaymentHistory}
              onPrint={handleOpenPrintModal}
              onEdit={editBill}
              onDelete={handleDeleteBill}
              sortField={billSortField}
              sortDirection={billSortDirection}
              onSort={handleBillSort}
            />
            {filteredBills.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredBills.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <RoomForm
              form={roomForm}
              errors={roomErrors}
              isEditing={isEditingRoom}
              onSave={handleSaveRoom}
              onCancel={resetRoomForm}
              onUpdateField={updateRoomField}
            />
            <RoomsList rooms={rooms} onEdit={editRoom} onDelete={handleDeleteRoom} onToggleStatus={handleToggleRoomStatus} shareTemplate={settings.shareTemplate} settings={settings} onUpdateMedia={handleUpdateRoomMedia} mediaLibrary={[...(settings.media || []), ...(settings.mediaLibrary || [])]} />
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            {/* Collapsible Tenant Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <button
                onClick={() => setIsTenantFormExpanded(!isTenantFormExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditingTenant ? 'Edit Tenant' : 'Add New Tenant'}
                  </h3>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                    isTenantFormExpanded ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isTenantFormExpanded && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <TenantForm
                    form={tenantForm}
                    errors={tenantErrors}
                    isEditing={isEditingTenant}
                    rooms={rooms}
                    settings={settings}
                    onSave={handleSaveTenant}
                    onCancel={() => {
                      resetTenantForm();
                      setIsTenantFormExpanded(false);
                    }}
                    onUpdateField={updateTenantField}
                    onAddImage={addValidIdImage}
                    onRemoveImage={removeValidIdImage}
                  />
                </div>
              )}
            </div>
            <TenantsList
              tenants={tenants}
              rooms={rooms}
              settings={settings}
              onEdit={handleEditTenant}
              onDelete={handleDeleteTenant}
              onViewDetails={handleViewTenantDetails}
              onToggleStatus={handleToggleTenantStatus}
              onMoveOut={handleMoveOutTenant}
              onRevertMoveOut={handleRevertMoveOut}
              onTransferRoom={handleTransferRoom}
              onCreateBill={handleCreateBillForTenant}
            />
            <TenantDetailsModal
              tenant={selectedTenant}
              rooms={rooms}
              settings={settings}
              isOpen={!!selectedTenant}
              onClose={handleCloseTenantDetails}
              onSaveSignature={handleSaveTenantSignature}
              onClearSignature={handleClearTenantSignature}
            />
            <MoveOutModal
              key={moveOutTenantData?.id || 'moveout-modal'}
              isOpen={!!moveOutTenantData}
              onClose={handleCloseMoveOutModal}
              tenant={moveOutTenantData}
              room={moveOutTenantData ? rooms.find(r => r.id === moveOutTenantData.roomId) : null}
              bills={bills}
              tenants={tenants}
              settings={settings}
              onConfirmMoveOut={handleConfirmMoveOut}
            />
            <TransferRoomModal
              key={transferTenantData?.id || 'transfer-modal'}
              isOpen={!!transferTenantData}
              onClose={handleCloseTransferModal}
              tenant={transferTenantData}
              rooms={rooms}
              tenants={tenants}
              settings={settings}
              onConfirmTransfer={handleConfirmTransfer}
            />
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Collapsible Expense Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <button
                onClick={() => setIsExpenseFormExpanded(!isExpenseFormExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditingExpense ? 'Edit Expense' : 'Add New Expense'}
                  </h3>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                    isExpenseFormExpanded ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpenseFormExpanded && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <ExpenseForm
                    form={expenseForm}
                    errors={expenseErrors}
                    isEditing={isEditingExpense}
                    onSave={handleSaveExpense}
                    onCancel={() => {
                      resetExpenseForm();
                      setIsExpenseFormExpanded(false);
                    }}
                    onUpdateField={updateExpenseField}
                  />
                </div>
              )}
            </div>
            <ExpenseFilters
              filters={expenseFilters}
              onFilterChange={handleExpenseFilterChange}
            />
            <ExpensesTable
              expenses={filteredExpenses}
              onEdit={handleEditExpense}
              onDuplicate={handleDuplicateExpense}
              onDelete={handleDeleteExpense}
              sortField={expenseSortField}
              sortDirection={expenseSortDirection}
              onSort={handleExpenseSort}
            />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <BusinessReportModal
            isOpen={true}
            onClose={() => setActiveTab('dashboard')}
            rooms={rooms}
            tenants={tenants}
            bills={bills}
            expenses={expenses}
            getBillTotal={getBillTotal}
            settings={settings}
            isInline={true}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">
                Data Maintenance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Reconcile any drift between tenants and their assigned rooms. Runs a safe diff first and asks for confirmation before writing.
              </p>
              <button
                onClick={handleSyncRoomOccupancy}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                Sync Room Occupancy
              </button>
            </div>
            <SettingsForm
              settings={settings}
              onUpdateSetting={updateSetting}
              onSave={handleSaveSettings}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              cleaningSchedules={cleaningSchedules}
              cleaningForm={cleaningForm}
              cleaningErrors={cleaningErrors}
              isEditingCleaning={isEditingCleaning}
              rooms={rooms}
              getRoomById={getRoomById}
              selectedHistory={selectedHistory}
              onSaveSchedule={handleSaveCleaningSchedule}
              onEditSchedule={editSchedule}
              onDeleteSchedule={handleDeleteCleaningSchedule}
              onCancelCleaning={resetCleaningForm}
              onUpdateCleaningField={updateCleaningField}
              onOpenHistory={openHistory}
              onCloseHistory={closeHistory}
              onMarkCleaned={handleMarkAirconCleaned}
              isScheduleOverdue={isScheduleOverdue}
              isScheduleDueSoon={isScheduleDueSoon}
            />
            <MediaLibrarySection
              mediaLibrary={settings.mediaLibrary || []}
              onUpdateMediaLibrary={handleUpdateMediaLibrary}
            />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.variant === 'danger' ? 'Delete' : 'Confirm'}
      />

      {/* Bill Print Modal */}
      <BillPrintModal
        isOpen={!!printBillData}
        onClose={handleClosePrintModal}
        bill={printBillData}
        room={printBillData ? getRoomById(printBillData.roomId) : null}
        getBillTotal={getBillTotal}
      />

      {/* Payment Popup */}
      <PaymentPopup
        isOpen={!!paymentBillData}
        onClose={handleClosePaymentPopup}
        bill={paymentBillData}
        roomName={paymentBillData ? getRoomById(paymentBillData.roomId)?.name : ''}
        total={paymentBillData ? getBillTotal(paymentBillData) : 0}
        amountPaid={paymentBillData?.amountPaid || 0}
        remainingBalance={paymentBillData ? getRemainingBalance(paymentBillData) : 0}
        onSubmitPayment={handleSubmitPayment}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={!!paymentHistoryData}
        onClose={handleClosePaymentHistory}
        bill={paymentHistoryData}
        roomName={paymentHistoryData ? getRoomById(paymentHistoryData.roomId)?.name : ''}
        total={paymentHistoryData ? getBillTotal(paymentHistoryData) : 0}
        amountPaid={paymentHistoryData?.amountPaid || 0}
        onUpdatePayment={handleUpdatePaymentHistory}
        onAddMissingRecord={handleAddMissingRecord}
        onRecordRefund={handleRecordRefund}
        onPrintReceipt={handlePrintReceiptFromHistory}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!receiptData}
        onClose={handleCloseReceipt}
        bill={receiptData?.bill}
        room={receiptData?.bill ? getRoomById(receiptData.bill.roomId) : null}
        tenant={receiptData?.bill ? tenants.find(t => t.roomId === receiptData.bill.roomId && t.status === 'active') : null}
        totalAmount={receiptData?.totalAmount || 0}
      />

    </div>
  );
};

export default ApartmentBillTracker;
