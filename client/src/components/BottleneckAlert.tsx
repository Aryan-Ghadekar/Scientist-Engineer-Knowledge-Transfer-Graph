import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface BottleneckAlertProps {
  severity: 'red' | 'yellow' | 'green';
  title: string;
  lag: string;
  recommendation: string;
}

const BottleneckAlert: React.FC<BottleneckAlertProps> = ({ severity, title, lag, recommendation }) => {
  const severityConfig = {
    red: {
      bg: 'bg-red-900',
      border: 'border-red-500',
      icon: FaExclamationTriangle,
      iconColor: 'text-red-400',
      label: 'Critical',
    },
    yellow: {
      bg: 'bg-yellow-900',
      border: 'border-yellow-500',
      icon: FaExclamationCircle,
      iconColor: 'text-yellow-400',
      label: 'Warning',
    },
    green: {
      bg: 'bg-green-900',
      border: 'border-green-500',
      icon: FaCheckCircle,
      iconColor: 'text-green-400',
      label: 'Resolved',
    },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-2xl shadow-lg p-6`}>
      <div className="flex items-start gap-4">
        <Icon className={`${config.iconColor} text-3xl flex-shrink-0 mt-1`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${config.iconColor} text-sm font-semibold`}>{config.label}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300 text-sm">{lag}</span>
          </div>
          <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
          <p className="text-gray-300 text-sm">{recommendation}</p>
        </div>
      </div>
    </div>
  );
};

export default BottleneckAlert;
