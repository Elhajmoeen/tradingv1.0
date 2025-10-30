import * as React from 'react';
import { useSelector } from 'react-redux';
import { selectTotalDeposits } from '@/state/entitiesSlice';

export default function DashboardPage() {
  const totalDeposits = useSelector(selectTotalDeposits);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here is an overview of your CRM.</p>
      </div>
      
      <div className="grid gap-4 mb-6">
        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <p className="text-gray-600">Total Deposits: ${typeof totalDeposits === 'number' ? totalDeposits.toLocaleString() : '0'}</p>
        </div>
      </div>
    </div>
  );
}
