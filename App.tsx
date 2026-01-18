
import React, { useState, useCallback, useMemo } from 'react';
import { INITIAL_MERCHANTS, INITIAL_ZONES } from './constants';
import { Merchant, ServiceableZone, RouteInfo } from './types';
import MapView from './components/MapView';
import StatsPanel from './components/StatsPanel';
import {
  Search, MapPin, Navigation, Info, Zap, ChevronRight,
  BrainCircuit, Store, Globe, Activity, ArrowUpRight,
  ExternalLink, Filter, Download, Route
} from 'lucide-react';
import { scanPakurForPartners, suggestZonesBasedOnDensity, getRouteLogistics, DiscoveredPartner } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'partners' | 'map' | 'details'>('map');

  const [merchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [zones] = useState<ServiceableZone[]>(INITIAL_ZONES);
  const [discoveredPartners, setDiscoveredPartners] = useState<DiscoveredPartner[]>([]);
  const [aiZoneSuggestions, setAiZoneSuggestions] = useState<any[]>([]);

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedDiscovered, setSelectedDiscovered] = useState<DiscoveredPartner | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const performCityScan = async () => {
    setIsScanning(true);
    setRouteInfo(null);
    const results = await scanPakurForPartners("Daily Need Shops, Kirana, Pharmacies, and Wholesale Markets");
    setDiscoveredPartners(results.partners);
    const suggestions = await suggestZonesBasedOnDensity(merchants);
    setAiZoneSuggestions(suggestions);
    setIsScanning(false);
    if (window.innerWidth < 1024) setActiveTab('partners');
  };

  const handleCalculateRoute = async () => {
    const active = selectedMerchant || selectedDiscovered;
    if (!active) return;

    setIsCalculatingRoute(true);
    const info = await getRouteLogistics(active.name, active.address);
    setRouteInfo(info);
    setIsCalculatingRoute(false);
  };

  const handleExportData = () => {
    const active = selectedMerchant || selectedDiscovered;
    if (!active) return;

    const data = {
      timestamp: new Date().toISOString(),
      city: "Pakur",
      partner: active,
      logistics: routeInfo
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PakurFast_Partner_${active.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSelectMerchant = useCallback((merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setSelectedDiscovered(null);
    setSelectedZoneId(merchant.zoneId);
    setRouteInfo(null);
    if (window.innerWidth < 1024) setActiveTab('details');
  }, []);

  const handleSelectDiscovered = (dp: DiscoveredPartner) => {
    setSelectedDiscovered(dp);
    setSelectedMerchant(null);
    setSelectedZoneId(null);
    setRouteInfo(null);
    if (window.innerWidth < 1024) setActiveTab('details');
  };

  const filteredMerchants = merchants.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Navigation */}
      <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 lg:py-5 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center space-x-10">
          <div className="flex items-baseline cursor-default">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tighter uppercase">Pakur</h1>
            <h1 className="text-xl lg:text-2xl font-light text-emerald-600 tracking-tighter uppercase ml-0.5">Fast</h1>
          </div>
          <nav className="hidden lg:flex space-x-8">
            <button className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b-2 border-emerald-500 pb-1">Partner Intel</button>
            <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Zone Planning</button>
          </nav>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-emerald-500" />
            <input
              type="text"
              placeholder="Search directory..."
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 w-40 lg:w-64 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={performCityScan}
            disabled={isScanning}
            className={`px-3 lg:px-6 py-2 lg:py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all shadow-md ${isScanning ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? 'Scanning City...' : 'Find Potential Partners'}</span>
            <span className="sm:hidden">{isScanning ? 'Scanning...' : 'Scan'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Search Bar (only visible on nice small screens if essential, putting strictly in header better for space, skipping extra row) */}

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* Left: Partner Pipeline */}
        <div className={`
          flex-col bg-white border-r border-slate-200 shrink-0 overflow-hidden transition-all absolute inset-0 z-20 lg:static lg:w-[340px] lg:flex
          ${activeTab === 'partners' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="p-4 lg:p-6 flex flex-col h-full">
            {/* Mobile-only Search in Partner View */}
            <div className="lg:hidden mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search directory..."
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Hubs</h2>
              <Filter className="w-3.5 h-3.5 text-slate-300" />
            </div>

            <div className="space-y-2 overflow-y-auto pr-2 mb-8 flex-1 scrollbar-hide">
              {filteredMerchants.map(merchant => (
                <div
                  key={merchant.id}
                  onClick={() => handleSelectMerchant(merchant)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all group ${selectedMerchant?.id === merchant.id
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{merchant.name}</h3>
                    {merchant.isCollaborated && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3 truncate">{merchant.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{merchant.category}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Discovered Results */}
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                <BrainCircuit className="w-3.5 h-3.5 mr-2" />
                Opportunities Found
              </h2>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                {discoveredPartners.length > 0 ? (
                  discoveredPartners.map((dp, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectDiscovered(dp)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${selectedDiscovered?.name === dp.name ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                      <h4 className="text-xs font-bold text-slate-800">{dp.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-slate-400 italic">Discovered via Scan</span>
                        <ExternalLink className="w-3 h-3 text-slate-300" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg">Run "Find Potential Partners" to populate</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Intelligence Map */}
        <div className={`
          flex-col bg-slate-100 p-4 lg:p-8 overflow-y-auto flex-1 absolute inset-0 z-10 lg:static lg:flex
          ${activeTab === 'map' ? 'flex' : 'hidden lg:flex'}
        `}>
          <StatsPanel
            totalPartners={merchants.length}
            identifiedOpportunities={discoveredPartners.length}
            coveredZones={zones.length}
          />

          <div className="flex-1 min-h-[400px] relative bg-white rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 mt-4 lg:mt-0">
            <MapView
              zones={zones}
              merchants={merchants}
              selectedZoneId={selectedZoneId}
              onSelectMerchant={handleSelectMerchant}
            />
          </div>
        </div>

        {/* Right: Partner Intelligence Detail */}
        <div className={`
          bg-slate-900 flex-col shrink-0 overflow-y-auto p-6 lg:p-10 absolute inset-0 z-30 lg:static lg:w-[420px] lg:flex
          ${activeTab === 'details' ? 'flex' : 'hidden lg:flex'}
        `}>
          {/* Mobile Back Button from Details */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setActiveTab('partners')}
              className="flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
              <span className="text-xs font-bold uppercase tracking-wider">Back to List</span>
            </button>
          </div>

          {selectedMerchant || selectedDiscovered ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-20 lg:pb-0">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${selectedMerchant ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    {selectedMerchant ? 'Active Collaboration' : 'Identified Target'}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tighter leading-tight">
                  {selectedMerchant ? selectedMerchant.name : selectedDiscovered?.name}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Store Metadata</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 text-sm text-slate-300">
                      <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">
                        {selectedMerchant ? selectedMerchant.address : selectedDiscovered?.address}, Pakur
                      </p>
                    </div>
                    {(selectedMerchant?.mapUrl || selectedDiscovered?.googleMapsUri) && (
                      <a
                        href={selectedMerchant?.mapUrl || selectedDiscovered?.googleMapsUri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-2 text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Verify Business Location</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Logistics Analysis Feature */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex justify-between">
                    <span>Logistics Intel</span>
                    {isCalculatingRoute && <Activity className="w-3 h-3 animate-spin text-emerald-400" />}
                  </h3>

                  {routeInfo ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Estimated Distance</p>
                          <p className="text-sm font-black text-white">{routeInfo.distanceKm} km</p>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Time to Hub</p>
                          <p className="text-sm font-black text-white">{routeInfo.estimatedTimeMins} mins</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${routeInfo.feasibility === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                          Feasibility: {routeInfo.feasibility}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 italic">"{routeInfo.notes}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No logistics data calculated yet.</p>
                  )}
                </div>

                <div className="pt-6 flex flex-col space-y-3">
                  <button
                    onClick={handleCalculateRoute}
                    disabled={isCalculatingRoute}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    <Route className="w-4 h-4" />
                    <span className="text-[11px] uppercase tracking-widest">
                      {isCalculatingRoute ? 'Calculating...' : 'Run Route Logistics'}
                    </span>
                  </button>
                  <button
                    onClick={handleExportData}
                    className="w-full py-4 bg-white hover:bg-slate-50 text-slate-900 font-black rounded-2xl transition-all flex items-center justify-center space-x-3"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-[11px] uppercase tracking-widest">Export Partner Data</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6">
                <Store className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Select Partner</h3>
              <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed">
                Choose a merchant to perform route feasibility and export tactical planning data.
              </p>
              {/* Mobile Hint */}
              <button onClick={() => setActiveTab('partners')} className="mt-6 text-emerald-500 text-xs font-bold uppercase tracking-widest lg:hidden">
                Browse List
              </button>
            </div>
          )}

          {aiZoneSuggestions.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-800 pb-20 lg:pb-0">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-2" />
                Planning Recommendations
              </h3>
              <div className="space-y-3">
                {aiZoneSuggestions.map((s, i) => (
                  <div key={i} className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-black text-white uppercase">{s.zoneName}</span>
                      <span className="text-[9px] font-bold text-emerald-500">{s.radiusKm}km Hub</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{s.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden bg-white border-t border-slate-200 flex justify-around items-center h-16 shrink-0 z-50 px-2 safe-area-pb">
        <button
          onClick={() => setActiveTab('partners')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'partners' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Partners</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'map' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Map</span>
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${activeTab === 'details' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          {(selectedMerchant || selectedDiscovered) && <span className="absolute top-2 right-8 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
          <Info className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Intel</span>
        </button>
      </nav>

      <footer className="hidden lg:flex bg-slate-900 border-t border-slate-800 px-8 py-3 justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 shrink-0">
        <div className="flex items-center space-x-8">
          <span>&copy; {currentYear} Pakur Logistics Hub</span>
          <span className="flex items-center text-slate-400"><MapPin className="w-3 h-3 mr-2" /> Pakur Node Active</span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-slate-500">Service Area: Pakur Municipality</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
