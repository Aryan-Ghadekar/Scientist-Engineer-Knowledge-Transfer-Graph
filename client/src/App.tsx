import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopNavBar from "./components/layout/TopNavBar";
// import SideNavBar from "./components/layout/SideNavBar";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import HomePage from "./pages/HomePage";
import GraphPage from "./pages/GraphPage";
import LagAnalysisPage from "./pages/LagAnalysisPage";
import BottlenecksPage from "./pages/BottlenecksPage";
import DashboardPage from "./pages/DashboardPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-surface text-on-surface font-body overflow-x-hidden selection:bg-primary/30 min-h-screen">
        <TopNavBar />
        <div className="flex flex-1 overflow-hidden">
          {/* <SideNavBar /> */}
          <div className="flex-1 overflow-y-auto w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/graph" element={<GraphPage />} />
              <Route path="/lag-analysis" element={<LagAnalysisPage />} />
              <Route path="/bottlenecks" element={<BottlenecksPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
};

export default App;
