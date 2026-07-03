import React from 'react';
import { UsersIcon, BriefcaseIcon, CurrencyRupeeIcon, ExclamationTriangleIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, trend, trendValue }) => (
  <div className="card group hover:border-gray-700 transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            <span>{Math.abs(trendValue)}% vs last month</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const AdminStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={UsersIcon}
        label="Total Users"
        value={stats.totalUsers?.toLocaleString() || '0'}
        color="bg-blue-500/20 text-blue-400"
        trend={1}
        trendValue={12}
      />
      <StatCard
        icon={BriefcaseIcon}
        label="Active Projects"
        value={stats.activeProjects?.toLocaleString() || '0'}
        color="bg-purple-500/20 text-purple-400"
        trend={1}
        trendValue={8}
      />
      <StatCard
        icon={CurrencyRupeeIcon}
        label="Total Revenue"
        value={formatCurrency(stats.totalRevenue || 0)}
        color="bg-green-500/20 text-green-400"
        trend={1}
        trendValue={24}
      />
      <StatCard
        icon={ExclamationTriangleIcon}
        label="Open Disputes"
        value={stats.openDisputes?.toLocaleString() || '0'}
        color="bg-red-500/20 text-red-400"
        trend={-1}
        trendValue={3}
      />
    </div>
  );
};

export default AdminStats;
