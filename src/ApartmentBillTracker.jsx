import { useState, useEffect, useMemo } from 'react';
import { useToast } from './context/ToastContext';
import { ConfirmDialog } from './components/ui';
import { useRooms, useBills, useAirconCleaning, useSettings, useConfirmDialog, useTenants, useExpenses } from './hooks';
import { isBillDueSoon } from './utils/dateHelpers';
import { exportBillsToCSV, exportAllDataToJSON } from './utils/exportHelpers';

// Component imports
import { RoomForm, RoomsList } from './components/rooms';
import { BillForm, BillsTable, BillFilters, BillPrintModal, PaymentPopup } from './components/bills';
import { CleaningForm, CleaningCard, CleaningHistoryModal } from './components/aircon';
import { SummaryCards, RevenueCards, AlertsList, MonthlyExpenseChart, MonthlyBillsChart, ExpenseByCategoryChart, BillsByRoomChart } from './components/dashboard';
import { SettingsForm } from './components/settings';
import { TenantForm, TenantsList, TenantDetailsModal } from './components/tenants';
import { ExpenseForm, ExpensesTable } from './components/expenses';
import { Pagination } from './components/ui';

const ApartmentBillTracker = () => {
  const toast = useToast();
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Custom hooks for data management
  const { settings, updateSetting, saveSettings: saveSettingsAction } = useSettings();

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
    getSchedulesNeedingAttention,
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
    deleteExpense: deleteExpenseAction,
    resetForm: resetExpenseForm,
    updateFormField: updateExpenseField,
  } = useExpenses();

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [printBillData, setPrintBillData] = useState(null);
  const [paymentBillData, setPaymentBillData] = useState(null);

  const confirmDialog = useConfirmDialog();

  // Filter and paginate bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
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
  }, [bills, billFilters, getRoomById]);

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

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setBillFilters((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleSubmitPayment = async (billId, amount) => {
    const result = await recordPayment(billId, amount);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
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
    } else {
      toast.warning(result.message);
    }
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
    confirmDialog.showConfirm(
      'Move Out Tenant',
      `Are you sure you want to mark "${tenant.fullName}" as moved out? This will set their status to inactive and record today's date as the move-out date.`,
      async () => {
        const result = await moveOutTenant(tenant);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      },
      'danger'
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
    } else {
      toast.warning(result.message);
    }
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Apartment Bill Tracker
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 md:gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
          {['dashboard', 'bills', 'rooms', 'tenants', 'aircon', 'expenses', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <SummaryCards
              totalRooms={rooms.length}
              occupiedRooms={getOccupiedRooms().length}
              pendingBills={getUnpaidBills().length}
              overdueBills={getOverdueBills().length}
              airconDue={getSchedulesNeedingAttention().length}
            />
            <RevenueCards
              collected={getTotalCollected()}
              pending={getTotalPending()}
              total={getTotalBilled()}
            />
            <AlertsList
              overdueBills={getOverdueBills()}
              overdueCleanings={getOverdueSchedules()}
              getRoomById={getRoomById}
            />

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyBillsChart bills={bills} getBillTotal={getBillTotal} />
              <MonthlyExpenseChart expenses={expenses} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BillsByRoomChart bills={bills} rooms={rooms} getBillTotal={getBillTotal} />
              <ExpenseByCategoryChart expenses={expenses} />
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
              onPrint={handleOpenPrintModal}
              onEdit={editBill}
              onDelete={handleDeleteBill}
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
            <RoomsList rooms={rooms} onEdit={editRoom} onDelete={handleDeleteRoom} onToggleStatus={handleToggleRoomStatus} />
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            <TenantForm
              form={tenantForm}
              errors={tenantErrors}
              isEditing={isEditingTenant}
              rooms={rooms}
              settings={settings}
              onSave={handleSaveTenant}
              onCancel={resetTenantForm}
              onUpdateField={updateTenantField}
              onAddImage={addValidIdImage}
              onRemoveImage={removeValidIdImage}
            />
            <TenantsList
              tenants={tenants}
              rooms={rooms}
              settings={settings}
              onEdit={editTenant}
              onDelete={handleDeleteTenant}
              onViewDetails={handleViewTenantDetails}
              onToggleStatus={handleToggleTenantStatus}
              onMoveOut={handleMoveOutTenant}
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
          </div>
        )}

        {/* Aircon Tab */}
        {activeTab === 'aircon' && (
          <div className="space-y-6">
            <CleaningForm
              form={cleaningForm}
              errors={cleaningErrors}
              isEditing={isEditingCleaning}
              rooms={rooms}
              onSave={handleSaveCleaningSchedule}
              onCancel={resetCleaningForm}
              onUpdateField={updateCleaningField}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cleaningSchedules.map((schedule) => (
                <CleaningCard
                  key={schedule.id}
                  schedule={schedule}
                  roomName={getRoomById(schedule.roomId)?.name || 'Unknown Room'}
                  isOverdue={isScheduleOverdue(schedule)}
                  isDueSoon={isScheduleDueSoon(schedule)}
                  onViewHistory={() => openHistory(schedule)}
                  onEdit={() => editSchedule(schedule)}
                  onDelete={() => handleDeleteCleaningSchedule(schedule.id)}
                  onMarkCleaned={() => handleMarkAirconCleaned(schedule.roomId)}
                />
              ))}
              {cleaningSchedules.length === 0 && (
                <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
                  No cleaning schedules added yet. Add your first schedule above.
                </div>
              )}
            </div>
            <CleaningHistoryModal
              isOpen={!!selectedHistory}
              onClose={closeHistory}
              roomName={getRoomById(selectedHistory?.roomId)?.name || 'Unknown'}
              history={selectedHistory?.history}
            />
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <ExpenseForm
              form={expenseForm}
              errors={expenseErrors}
              isEditing={isEditingExpense}
              onSave={handleSaveExpense}
              onCancel={resetExpenseForm}
              onUpdateField={updateExpenseField}
            />
            <ExpensesTable
              expenses={expenses}
              onEdit={editExpense}
              onDelete={handleDeleteExpense}
            />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsForm
            settings={settings}
            onUpdateSetting={updateSetting}
            onSave={handleSaveSettings}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
          />
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
    </div>
  );
};

export default ApartmentBillTracker;
