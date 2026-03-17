import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

const etvxPhases = [
  {
    name: 'Entry',
    description: 'Define problem scope, gather theoretical knowledge, identify research gaps'
  },
  {
    name: 'Tasks',
    description: 'Conduct experiments, develop prototypes, test hypotheses, collaborate with engineers'
  },
  {
    name: 'Validation',
    description: 'Peer review, empirical testing, performance benchmarking, quality assurance'
  },
  {
    name: 'Exit',
    description: 'Production deployment, knowledge documentation, market release, impact assessment'
  },
];

const EtvxPhase: React.FC = () => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-8">
      <h3 className="text-indigo-400 text-xl font-bold mb-6">ETVX Framework</h3>
      <div className="flex items-center justify-between gap-4">
        {etvxPhases.map((phase, index) => (
          <React.Fragment key={index}>
            <div className="flex-1 bg-gray-800 border border-gray-600 rounded-xl p-4">
              <h4 className="text-white font-bold text-lg mb-2">{phase.name}</h4>
              <p className="text-gray-400 text-sm">{phase.description}</p>
            </div>
            {index < etvxPhases.length - 1 && (
              <FaArrowRight className="text-indigo-400 text-2xl flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default EtvxPhase;
