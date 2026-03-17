import React from 'react';
import BipartiteGraph, { ScientistNode, EngineerNode, Edge } from '../components/BipartiteGraph';

const scientists: ScientistNode[] = [
  { id: 's1', name: 'Alan Turing' },
  { id: 's2', name: 'John von Neumann' },
  { id: 's3', name: 'Niels Bohr' },
  { id: 's4', name: 'Warren McCulloch' },
  { id: 's5', name: 'Ashish Vaswani' },
];

const engineers: EngineerNode[] = [
  { id: 'e1', name: 'Quantum Computing Team' },
  { id: 'e2', name: 'IBM Engineers' },
  { id: 'e3', name: 'Deep Learning Engineers' },
  { id: 'e4', name: 'Google AI Research' },
  { id: 'e5', name: 'OpenAI Engineering' },
];

const edges: Edge[] = [
  { scientistId: 's1', engineerId: 'e2', lag: '42 yr lag' },
  { scientistId: 's2', engineerId: 'e1', lag: '68 yr lag' },
  { scientistId: 's3', engineerId: 'e1', lag: '73 yr lag' },
  { scientistId: 's4', engineerId: 'e3', lag: '43 yr lag' },
  { scientistId: 's5', engineerId: 'e4', lag: '3 yr lag' },
];

const GraphPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-indigo-400 text-4xl font-bold mb-4">Bipartite Graph Visualization</h1>
          <p className="text-gray-300 text-lg">
            Mapping the relationships between theoretical scientists and engineering implementation teams,
            showing knowledge transfer patterns and temporal lag.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-8">
          <BipartiteGraph scientists={scientists} engineers={engineers} edges={edges} />
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-indigo-400 text-lg font-bold mb-2">Total Scientists</h3>
            <p className="text-white text-3xl font-bold">{scientists.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-indigo-400 text-lg font-bold mb-2">Total Engineers</h3>
            <p className="text-white text-3xl font-bold">{engineers.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
            <h3 className="text-indigo-400 text-lg font-bold mb-2">Active Transfers</h3>
            <p className="text-white text-3xl font-bold">{edges.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphPage;
