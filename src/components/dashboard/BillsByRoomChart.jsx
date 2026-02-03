import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * Bills By Room Chart Component
 * Shows total billed amount per room
 */
function BillsByRoomChart({ bills, rooms, getBillTotal }) {
  const chartData = useMemo(() => {
    // Group bills by room
    const roomTotals = {};
    bills.forEach((bill) => {
      const roomId = bill.roomId;
      if (!roomTotals[roomId]) {
        roomTotals[roomId] = { collected: 0, pending: 0 };
      }
      const total = getBillTotal(bill, bill.rentExcluded || false);
      if (bill.paid) {
        roomTotals[roomId].collected += total;
      } else {
        roomTotals[roomId].pending += total;
      }
    });

    // Convert to array with room names
    return Object.entries(roomTotals)
      .map(([roomId, totals]) => {
        const room = rooms.find((r) => r.id === roomId);
        return {
          name: room?.name || 'Unknown',
          collected: totals.collected,
          pending: totals.pending,
          total: totals.collected + totals.pending,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 rooms
  }, [bills, rooms, getBillTotal]);

  if (bills.length === 0 || chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Revenue by Room
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No bills recorded yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Revenue by Room
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 60, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              type="number"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => `₱${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              formatter={(value, name) => [
                `₱${value.toFixed(2)}`,
                name === 'collected' ? 'Collected' : 'Pending',
              ]}
            />
            <Legend
              wrapperStyle={{ color: '#9CA3AF' }}
              formatter={(value) => (value === 'collected' ? 'Collected' : 'Pending')}
            />
            <Bar dataKey="collected" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pending" stackId="a" fill="#F59E0B" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BillsByRoomChart;
