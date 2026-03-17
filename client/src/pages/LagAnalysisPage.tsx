import React from 'react';
import { FaClock, FaTable } from 'react-icons/fa';
import LagTable, { LagData } from '../components/LagTable';
import StatCard from '../components/StatCard';

const lagData: LagData[] = [
  {
    discovery: 'Quantum Mechanics',
    discoveryYear: 1925,
    implementation: 'Quantum Computing',
    implementationYear: 1998,
    lag: 73,
  },
  {
    discovery: 'Neural Networks',
    discoveryYear: 1943,
    implementation: 'Deep Learning Systems',
    implementationYear: 1986,
    lag: 43,
  },
  {
    discovery: 'Transformer Architecture',
    discoveryYear: 2017,
    implementation: 'GPT Models',
    implementationYear: 2020,
    lag: 3,
  },
  {
    discovery: 'Turing Machine',
    discoveryYear: 1936,
    implementation: 'Modern Computers',
    implementationYear: 1978,
    lag: 42,
  },
  {
    discovery: 'Information Theory',
    discoveryYear: 1948,
    implementation: 'Digital Communications',
    implementationYear: 1960,
    lag: 12,
  },
  {
    discovery: 'Cellular Automata',
    discoveryYear: 1948,
    implementation: 'Artificial Life Simulations',
    implementationYear: 1970,
    lag: 22,
  },
  {
    discovery: 'Bayesian Inference',
    discoveryYear: 1763,
    implementation: 'Modern Machine Learning',
    implementationYear: 1990,
    lag: 227,
  },
  {
    discovery: 'Graph Theory',
    discoveryYear: 1736,
    implementation: 'Social Network Analysis',
    implementationYear: 2004,
    lag: 268,
  },
];

const LagAnalysisPage: React.FC = () => {
  const avgLag = Math.round(lagData.reduce((sum, item) => sum + item.lag, 0) / lagData.length);
  const maxLag = Math.max(...lagData.map((item) => item.lag));
  const minLag = Math.min(...lagData.map((item) => item.lag));

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-indigo-400 text-4xl font-bold mb-4">
            Theory → Implementation Lag Analysis
          </h1>
          <p className="text-gray-300 text-lg">
            Analyzing the temporal gap between theoretical discoveries and practical engineering
            implementations across various domains.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FaClock} label="Average Lag" value={`${avgLag} yrs`} />
          <StatCard icon={FaClock} label="Maximum Lag" value={`${maxLag} yrs`} />
          <StatCard icon={FaClock} label="Minimum Lag" value={`${minLag} yrs`} />
          <StatCard icon={FaTable} label="Total Pairs" value={lagData.length} />
        </div>

        <LagTable data={lagData} />

        <div className="mt-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
          <h3 className="text-indigo-400 text-xl font-bold mb-4">Key Insights</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Modern AI research shows dramatically reduced lag times (3 years for Transformers)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Classical theories like Quantum Mechanics took 73 years to reach practical implementation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Mathematical foundations can take centuries to find practical applications</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LagAnalysisPage;
