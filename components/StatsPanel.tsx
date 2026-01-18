
import React from 'react';
import { Target, Search, Users, MapPin } from 'lucide-react';

interface StatsPanelProps {
  totalPartners: number;
  identifiedOpportunities: number;
  coveredZones: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ totalPartners, identifiedOpportunities, coveredZones }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Partners</p>
            <p className="text-2xl font-black text-slate-900">{totalPartners}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identified Opportunities</p>
            <p className="text-2xl font-black text-slate-900">{identifiedOpportunities}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimized Zones</p>
            <p className="text-2xl font-black text-slate-900">{coveredZones}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
