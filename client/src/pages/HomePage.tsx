import React from 'react';
import { Link } from 'react-router-dom';
import { FaFlask, FaCogs, FaProjectDiagram, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import SipocTable from '../components/SipocTable';
import EtvxPhase from '../components/EtvxPhase';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-indigo-400 text-5xl font-bold mb-4">
            Scientist–Engineer Knowledge Transfer Graph
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Advanced Data Structure Visualization for Bipartite Graphs, Knowledge Lag Analysis,
            and Innovation Bottleneck Detection
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/graph"
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 hover:border-indigo-400 transition-colors group"
          >
            <FaProjectDiagram className="text-indigo-400 text-4xl mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white text-xl font-bold mb-2">Bipartite Graph</h3>
            <p className="text-gray-400">
              Visualize knowledge transfer relationships between scientists and engineers
            </p>
          </Link>

          <Link
            to="/lag-analysis"
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 hover:border-indigo-400 transition-colors group"
          >
            <FaChartLine className="text-indigo-400 text-4xl mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white text-xl font-bold mb-2">Lag Analysis</h3>
            <p className="text-gray-400">
              Analyze the time delay between theoretical discovery and practical implementation
            </p>
          </Link>

          <Link
            to="/bottlenecks"
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 hover:border-indigo-400 transition-colors group"
          >
            <FaExclamationTriangle className="text-indigo-400 text-4xl mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white text-xl font-bold mb-2">Bottleneck Detection</h3>
            <p className="text-gray-400">
              Identify innovation bottlenecks and predict knowledge transfer delays
            </p>
          </Link>
        </div>

        <div className="mb-12">
          <h2 className="text-indigo-400 text-3xl font-bold mb-6">SIPOC Framework</h2>
          <p className="text-gray-300 mb-6">
            The SIPOC model provides a systematic view of the knowledge transfer process from
            theoretical research to practical engineering implementation.
          </p>
          <SipocTable />
        </div>

        <div className="mb-12">
          <EtvxPhase />
        </div>

        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            <FaCogs />
            View Full Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
