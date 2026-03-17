import React from 'react';
import { Link } from 'react-router-dom';
import { FaProjectDiagram } from 'react-icons/fa';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <FaProjectDiagram className="text-indigo-400 text-2xl" />
            <span className="text-white font-bold text-lg">Knowledge Transfer Graph</span>
          </Link>
          <div className="flex gap-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/graph" className="text-gray-300 hover:text-white transition-colors">
              Graph
            </Link>
            <Link to="/lag-analysis" className="text-gray-300 hover:text-white transition-colors">
              Lag Analysis
            </Link>
            <Link to="/bottlenecks" className="text-gray-300 hover:text-white transition-colors">
              Bottlenecks
            </Link>
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
