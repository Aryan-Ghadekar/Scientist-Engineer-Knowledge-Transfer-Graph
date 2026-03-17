import React from 'react';

const sipocData = [
  { phase: 'Suppliers', description: 'Research institutions, universities, theoretical scientists' },
  { phase: 'Inputs', description: 'Published papers, theoretical frameworks, mathematical models' },
  { phase: 'Process', description: 'Knowledge transfer, collaboration, prototyping, validation' },
  { phase: 'Outputs', description: 'Working implementations, products, patents, engineering solutions' },
  { phase: 'Customers', description: 'Industry, end-users, technology adopters, market consumers' },
];

const SipocTable: React.FC = () => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Phase</th>
            <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {sipocData.map((item, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="px-6 py-4 text-white font-medium">{item.phase}</td>
              <td className="px-6 py-4 text-gray-300">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SipocTable;
