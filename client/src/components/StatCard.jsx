import React from 'react';

// Small metric tile used across dashboards: "Total Students: 240" etc.
const StatCard = ({ label, value, icon }) => (
  <div className="card flex items-center gap-4">
    {icon && <div className="w-11 h-11 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 text-xl">{icon}</div>}
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

export default StatCard;
