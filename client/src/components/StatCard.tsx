import React from 'react';
import { IconType } from 'react-icons';

interface StatCardProps {
  icon: IconType;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-500 bg-opacity-20 p-3 rounded-xl">
          <Icon className="text-indigo-400 text-3xl" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
