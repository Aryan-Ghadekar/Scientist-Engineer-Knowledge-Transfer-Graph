import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GraphPage from './pages/GraphPage';
import LagAnalysisPage from './pages/LagAnalysisPage';
import BottleneckPage from './pages/BottleneckPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/lag-analysis" element={<LagAnalysisPage />} />
        <Route path="/bottlenecks" element={<BottleneckPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
