import React from 'react';
import { FaUser, FaWrench, FaArrowRight } from 'react-icons/fa';

export interface ScientistNode {
  id: string;
  name: string;
}

export interface EngineerNode {
  id: string;
  name: string;
}

export interface Edge {
  scientistId: string;
  engineerId: string;
  lag: string;
}

interface BipartiteGraphProps {
  scientists: ScientistNode[];
  engineers: EngineerNode[];
  edges: Edge[];
}

const BipartiteGraph: React.FC<BipartiteGraphProps> = ({ scientists, engineers, edges }) => {
  return (
    <div className="grid grid-cols-3 gap-8 items-center">
      <div className="space-y-4">
        <h3 className="text-indigo-400 text-xl font-bold text-center mb-6">Scientists</h3>
        {scientists.map((scientist) => (
          <div
            key={scientist.id}
            className="bg-blue-900 border border-blue-500 rounded-2xl shadow-lg p-4 flex items-center gap-3"
          >
            <FaUser className="text-blue-400 text-2xl" />
            <span className="text-white font-medium">{scientist.name}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-indigo-400 text-xl font-bold text-center mb-2">Knowledge Transfer</h3>
        {edges.map((edge, index) => (
          <div key={index} className="flex items-center justify-center gap-2">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 flex items-center gap-2">
              <FaArrowRight className="text-indigo-400" />
              <span className="text-white text-sm font-semibold">{edge.lag}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"></div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-indigo-400 text-xl font-bold text-center mb-6">Engineers</h3>
        {engineers.map((engineer) => (
          <div
            key={engineer.id}
            className="bg-green-900 border border-green-500 rounded-2xl shadow-lg p-4 flex items-center gap-3"
          >
            <FaWrench className="text-green-400 text-2xl" />
            <span className="text-white font-medium">{engineer.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BipartiteGraph;
