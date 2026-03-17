import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export interface LagData {
  discovery: string;
  discoveryYear: number;
  implementation: string;
  implementationYear: number;
  lag: number;
}

interface LagTableProps {
  data: LagData[];
}

const LagTable: React.FC<LagTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(
    (item) =>
      item.discovery.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.implementation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLagColor = (lag: number) => {
    if (lag < 10) return 'text-green-400 bg-green-900 bg-opacity-30';
    if (lag <= 50) return 'text-yellow-400 bg-yellow-900 bg-opacity-30';
    return 'text-red-400 bg-red-900 bg-opacity-30';
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search discoveries or implementations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Discovery</th>
              <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Year</th>
              <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Implementation</th>
              <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Year</th>
              <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Lag (years)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="border-t border-gray-700 hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{item.discovery}</td>
                <td className="px-6 py-4 text-gray-300">{item.discoveryYear}</td>
                <td className="px-6 py-4 text-white font-medium">{item.implementation}</td>
                <td className="px-6 py-4 text-gray-300">{item.implementationYear}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full font-semibold ${getLagColor(item.lag)}`}>
                    {item.lag} yrs
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LagTable;
