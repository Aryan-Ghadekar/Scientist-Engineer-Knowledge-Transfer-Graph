import React from 'react';
import { FaChartBar, FaTachometerAlt, FaBell, FaFlask, FaCogs, FaArrowRight, FaClock } from 'react-icons/fa';
import StatCard from '../components/StatCard';
import SipocTable from '../components/SipocTable';

const recentActivity = [
  {
    event: 'Transformer model implementation completed',
    timestamp: '2 hours ago',
    type: 'success',
  },
  {
    event: 'Quantum error correction bottleneck detected',
    timestamp: '5 hours ago',
    type: 'warning',
  },
  {
    event: 'New scientist node added: Geoffrey Hinton',
    timestamp: '1 day ago',
    type: 'info',
  },
  {
    event: 'Knowledge transfer edge created: Neural Networks → Deep Learning',
    timestamp: '2 days ago',
    type: 'success',
  },
  {
    event: 'Critical lag threshold exceeded for AI Alignment',
    timestamp: '3 days ago',
    type: 'critical',
  },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-indigo-400 text-4xl font-bold mb-4">
            Research-to-Product Pipeline Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time monitoring of knowledge transfer metrics and pipeline health.
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={FaFlask} label="Total Scientists" value={45} />
          <StatCard icon={FaCogs} label="Total Engineers" value={78} />
          <StatCard icon={FaChartBar} label="Active Transfers" value={23} />
          <StatCard icon={FaClock} label="Avg Knowledge Lag" value="42 yrs" />
          <StatCard icon={FaBell} label="Bottlenecks" value={6} />
          <StatCard icon={FaTachometerAlt} label="Resolved" value={12} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-indigo-400 text-xl font-bold mb-6">Pipeline Flow</h3>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="bg-blue-900 border border-blue-500 rounded-xl p-4 mb-2">
                  <FaFlask className="text-blue-400 text-3xl mx-auto mb-2" />
                  <p className="text-white font-semibold">Theory</p>
                </div>
              </div>
              <FaArrowRight className="text-indigo-400 text-2xl mx-2" />
              <div className="flex-1 text-center">
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 mb-2">
                  <p className="text-white font-semibold">Discovery</p>
                </div>
              </div>
              <FaArrowRight className="text-indigo-400 text-2xl mx-2" />
              <div className="flex-1 text-center">
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 mb-2">
                  <p className="text-white font-semibold">Transfer</p>
                </div>
              </div>
              <FaArrowRight className="text-indigo-400 text-2xl mx-2" />
              <div className="flex-1 text-center">
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 mb-2">
                  <p className="text-white font-semibold">Prototype</p>
                </div>
              </div>
              <FaArrowRight className="text-indigo-400 text-2xl mx-2" />
              <div className="flex-1 text-center">
                <div className="bg-green-900 border border-green-500 rounded-xl p-4 mb-2">
                  <FaCogs className="text-green-400 text-3xl mx-auto mb-2" />
                  <p className="text-white font-semibold">Product</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-indigo-400 text-xl font-bold mb-4 flex items-center gap-2">
              <FaBell />
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-3 flex items-start gap-3"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'success'
                        ? 'bg-green-400'
                        : activity.type === 'warning'
                        ? 'bg-yellow-400'
                        : activity.type === 'critical'
                        ? 'bg-red-400'
                        : 'bg-blue-400'
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.event}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-indigo-400 text-2xl font-bold mb-4">SIPOC Process Overview</h3>
          <SipocTable />
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
          <h3 className="text-indigo-400 text-xl font-bold mb-4">System Health Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Knowledge Transfer Efficiency</span>
                <span className="text-green-400">87%</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '87%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Pipeline Velocity</span>
                <span className="text-yellow-400">64%</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '64%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Bottleneck Resolution Rate</span>
                <span className="text-indigo-400">72%</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
