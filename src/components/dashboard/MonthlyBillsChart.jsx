import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * Monthly Bills Chart Component
 * Shows collected vs pending bills by month
 */
function MonthlyBillsChart({ bills, getBillTotal }) {
  const chartData = useMemo(() => {
    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      });
    }

    // Aggregate bills by month
    return months.map(({ year, month, label }) => {
      const monthStr = String(month).padStart(2, '0');
      const prefix = `${year}-${monthStr}`;
      const monthBills = bills.filter((b) => b.dueDate?.startsWith(prefix));

      const collected = monthBills
        .filter((b) => b.paid)
        .reduce((sum, b) => sum + getBillTotal(b, b.rentExcluded || false), 0);

      const pending = monthBills
        .filter((b) => !b.paid)
        .reduce((sum, b) => sum + getBillTotal(b, b.rentExcluded || false), 0);

      return {
        name: label,
        collected,
        pending,
      };
    });
  }, [bills, getBillTotal]);

  if (bills.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Monthly Revenue
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
        Monthly Revenue
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => `₱${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
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
            <Area
              type="monotone"
              dataKey="collected"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="pending"
              stackId="1"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MonthlyBillsChart;
