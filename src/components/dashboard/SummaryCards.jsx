import { useState } from 'react';
import { Home, FileText, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Summary Cards Component
 * Displays key metrics in modern card format with icons and hover tooltips
 */
function SummaryCards({
  totalRooms,
  occupiedRoomsList = [],
  pendingBillsList = [],
  overdueBillsList = [],
  paidRoomsList = [],
  totalBilledRooms
}) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const occupiedRooms = occupiedRoomsList.length;
  const pendingBills = pendingBillsList.length;
  const overdueBills = overdueBillsList.length;
  const roomsPaid = paidRoomsList.length;
  const allPaid = roomsPaid === totalBilledRooms && totalBilledRooms > 0;

  const cards = [
    {
      id: 'occupied',
      title: 'Occupied Rooms',
      value: occupiedRooms,
      subtitle: `of ${totalRooms} total`,
      icon: Home,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-400/30',
      tooltipItems: occupiedRoomsList.map(r => r.name),
      tooltipTitle: 'Occupied Rooms',
    },
    {
      id: 'pending',
      title: 'Pending Bills',
      value: pendingBills,
      subtitle: 'Awaiting payment',
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconBg: 'bg-amber-400/30',
      tooltipItems: pendingBillsList.map(b => b.roomName),
      tooltipTitle: 'Rooms with Pending Bills',
    },
    {
      id: 'overdue',
      title: 'Overdue Bills',
      value: overdueBills,
      subtitle: 'Needs attention',
      icon: AlertCircle,
      bgColor: overdueBills > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-green-500 to-emerald-600',
      iconBg: overdueBills > 0 ? 'bg-red-400/30' : 'bg-green-400/30',
      tooltipItems: overdueBillsList.map(b => b.roomName),
      tooltipTitle: 'Rooms with Overdue Bills',
    },
    {
      id: 'paid',
      title: 'Rooms Paid',
      value: roomsPaid,
      subtitle: `of ${totalBilledRooms} billed`,
      icon: CheckCircle,
      bgColor: allPaid ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-teal-500 to-cyan-600',
      iconBg: allPaid ? 'bg-green-400/30' : 'bg-teal-400/30',
      tooltipItems: paidRoomsList.map(r => r.name),
      tooltipTitle: 'Rooms That Paid',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isHovered = hoveredCard === card.id;
        const hasItems = card.tooltipItems.length > 0;

        return (
          <div
            key={card.id}
            className={`${card.bgColor} rounded-xl shadow-lg p-3 md:p-5 text-white transform hover:scale-105 transition-all duration-200 relative cursor-pointer`}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-white/80 text-xs md:text-sm font-medium truncate">{card.title}</p>
                <p className="text-2xl md:text-3xl font-bold mt-0.5 md:mt-1">{card.value}</p>
                <p className="text-white/70 text-[10px] md:text-xs mt-0.5 md:mt-1 truncate">{card.subtitle}</p>
              </div>
              <div className={`${card.iconBg} p-2 md:p-3 rounded-xl flex-shrink-0`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>

            {/* Tooltip */}
            {isHovered && hasItems && (
              <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{card.tooltipTitle}</p>
                <div className="max-h-32 overflow-y-auto">
                  {card.tooltipItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
