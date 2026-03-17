import React from 'react';
import BottleneckAlert from '../components/BottleneckAlert';

const bottlenecks = [
  {
    severity: 'red' as const,
    title: 'Theoretical AI Alignment Research',
    lag: 'Predicted Lag: 25+ years',
    recommendation: 'Policy acceleration recommended. Increase cross-disciplinary collaboration and funding.',
  },
  {
    severity: 'red' as const,
    title: 'Quantum Error Correction Theory',
    lag: 'Predicted Lag: 15 years',
    recommendation: 'Increase engineering investment. Build prototype quantum systems for empirical testing.',
  },
  {
    severity: 'yellow' as const,
    title: 'Advanced Fusion Reactor Designs',
    lag: 'Predicted Lag: 12 years',
    recommendation: 'Moderate bottleneck. Expand material science research and engineering prototyping.',
  },
  {
    severity: 'yellow' as const,
    title: 'Neuromorphic Computing Architecture',
    lag: 'Predicted Lag: 8 years',
    recommendation: 'Bridge the gap between neuroscience research and hardware engineering teams.',
  },
  {
    severity: 'green' as const,
    title: 'Large Language Models',
    lag: 'Lag: 3 years',
    recommendation: 'Transfer successful. Continue monitoring for optimization opportunities.',
  },
  {
    severity: 'green' as const,
    title: 'CRISPR Gene Editing',
    lag: 'Lag: 5 years',
    recommendation: 'Rapid translation achieved. Scale production and regulatory frameworks.',
  },
];

const BottleneckPage: React.FC = () => {
  const criticalCount = bottlenecks.filter((b) => b.severity === 'red').length;
  const warningCount = bottlenecks.filter((b) => b.severity === 'yellow').length;
  const resolvedCount = bottlenecks.filter((b) => b.severity === 'green').length;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-indigo-400 text-4xl font-bold mb-4">Innovation Bottleneck Detection</h1>
          <p className="text-gray-300 text-lg">
            Identifying critical bottlenecks in knowledge transfer pipelines and providing
            recommendations for acceleration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-900 border border-red-500 rounded-2xl shadow-lg p-6">
            <h3 className="text-red-400 text-lg font-bold mb-2">Critical Bottlenecks</h3>
            <p className="text-white text-4xl font-bold">{criticalCount}</p>
          </div>
          <div className="bg-yellow-900 border border-yellow-500 rounded-2xl shadow-lg p-6">
            <h3 className="text-yellow-400 text-lg font-bold mb-2">Warning Level</h3>
            <p className="text-white text-4xl font-bold">{warningCount}</p>
          </div>
          <div className="bg-green-900 border border-green-500 rounded-2xl shadow-lg p-6">
            <h3 className="text-green-400 text-lg font-bold mb-2">Resolved</h3>
            <p className="text-white text-4xl font-bold">{resolvedCount}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {bottlenecks.map((bottleneck, index) => (
            <BottleneckAlert key={index} {...bottleneck} />
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
          <h3 className="text-indigo-400 text-xl font-bold mb-4">Bottleneck Severity Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Critical (15+ years lag)</span>
                <span className="text-gray-300">{criticalCount}</span>
              </div>
              <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${(criticalCount / bottlenecks.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Warning (8-15 years lag)</span>
                <span className="text-gray-300">{warningCount}</span>
              </div>
              <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${(warningCount / bottlenecks.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">Resolved (&lt;8 years lag)</span>
                <span className="text-gray-300">{resolvedCount}</span>
              </div>
              <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(resolvedCount / bottlenecks.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottleneckPage;
