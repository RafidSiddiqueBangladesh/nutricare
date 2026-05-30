import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Hospital, Search, Map as MapIcon, Phone, Globe, Navigation, Heart, MapPin, AlertCircle, Pill, Ambulance, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HOSPITALS_64, MEDICINE_SHOPS_64, AMBULANCES_64 } from '@/src/data/facilitiesData';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// District list for all 64 districts of Bangladesh
const ALL_DISTRICTS = [
  'Dhaka', 'Narayanganj', 'Gazipur', 'Tangail', 'Manikganj', 'Munshiganj', 'Kishoreganj', 'Shariatpur', 'Rajbari',
  'Chattogram', 'Comilla', 'Noakhali', 'Cox\'s Bazar', 'Khagrachari', 'Rangamati', 'Feni', 'Chandpur', 'Bandarban',
  'Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Magura', 'Narail', 'Chuadanga', 'Pirojpur', 'Jhenaidah',
  'Rajshahi', 'Pabna', 'Bogra', 'Naogaon', 'Natore', 'Nawabganj', 'Chapainawabganj',
  'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Barguna',
  'Sylhet', 'Moulvibazar', 'Sunamganj', 'Habiganj',
  'Rangpur', 'Dinajpur', 'Thakurgaon', 'Nilphamari', 'Lalmonirhat', 'Gaibandha', 'Kurigram', 'Panchagarh',
  'Mymensingh', 'Jashore'
];

export default function HospitalMap() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.8103, 90.4441]);
  const [mapZoom, setMapZoom] = useState(11);
  const [activeTab, setActiveTab] = useState<'hospital' | 'medicine' | 'ambulance'>('hospital');
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);

  // Get current data based on active tab
  const getData = () => {
    switch(activeTab) {
      case 'medicine':
        return MEDICINE_SHOPS_64;
      case 'ambulance':
        return AMBULANCES_64;
      default:
        return HOSPITALS_64;
    }
  };

  const allData = getData();

  // Filter based on search and user location
  const filteredData = allData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !userLocation || item.district === userLocation;
    return matchesSearch && matchesLocation;
  });

  // Request user location
  const requestLocation = () => {
    setRequestingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For now, default to Dhaka area
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(13);
          setRequestingLocation(false);
        },
        () => {
          // If denied, show district selector
          setShowDistrictSelector(true);
          setRequestingLocation(false);
        }
      );
    }
  };

  const getTabIcon = () => {
    switch(activeTab) {
      case 'medicine':
        return <Pill size={16} />;
      case 'ambulance':
        return <Ambulance size={16} />;
      default:
        return <Hospital size={16} />;
    }
  };

  const getTabLabel = () => {
    switch(activeTab) {
      case 'medicine':
        return 'Medicine & Pharmacies';
      case 'ambulance':
        return 'Ambulance Services';
      default:
        return 'Hospital Locations';
    }
  };

  const createMarkerIcon = (type: string, isSelected: boolean = false) => {
    let emoji = '🏥';
    let color = '#f43f5e';
    if (type === 'medicine') {
      emoji = '💊';
      color = '#06b6d4';
    } else if (type === 'ambulance') {
      emoji = '🚑';
      color = '#f59e0b';
    }
    if (isSelected) color = '#ef4444';

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-size: 20px;
        ">
          ${emoji}
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  };

  const handleItemClick = (item: any) => {
    setSelected(item);
    setMapCenter([item.lat, item.lng]);
    setMapZoom(14);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <MapPin size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Find Nearest Facility</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3">
        {(['hospital', 'medicine', 'ambulance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelected(null);
              setSearchTerm('');
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all",
              activeTab === tab
                ? "bg-teal-500 text-teal-950"
                : "glass-card hover:bg-white/20"
            )}
          >
            {tab === 'hospital' && <Hospital size={16} />}
            {tab === 'medicine' && <Pill size={16} />}
            {tab === 'ambulance' && <Ambulance size={16} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search & Location */}
      <section className="glass-card flex flex-col gap-4 border-rose-400/20">
        <div className="flex gap-4">
          <div className="bg-rose-400/20 p-2 rounded-lg text-rose-400 self-start">
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Find {getTabLabel().split('&')[0].trim().toLowerCase()}</h3>
            <p className="text-[10px] text-white/40 mt-1">Search by name or district, or get your current location</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or district" 
              className="glass-input w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={requestLocation}
            disabled={requestingLocation}
            className="glass-card px-4 py-3 hover:bg-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <MapPin size={18} />
            <span className="text-xs font-bold">{requestingLocation ? 'Locating...' : 'My Location'}</span>
          </button>
        </div>
        {userLocation && (
          <div className="text-xs text-teal-400 flex items-center gap-2">
            <AlertCircle size={14} />
            Showing facilities in: <strong>{userLocation}</strong>
            <button
              onClick={() => setUserLocation(null)}
              className="text-white/50 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* District Selector Modal */}
        <AnimatePresence>
          {showDistrictSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setShowDistrictSelector(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card !p-6 max-w-md w-[90%] max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Select Your District</h3>
                  <button
                    onClick={() => setShowDistrictSelector(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-white/60 mb-4">Choose from all 64 districts of Bangladesh</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_DISTRICTS.map(district => (
                    <motion.button
                      key={district}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setUserLocation(district);
                        setShowDistrictSelector(false);
                        setSelected(null);
                      }}
                      className="py-2 px-3 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-sm font-bold transition-all text-center"
                    >
                      {district}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Map */}
      <section className="aspect-square bg-[#002b2b] rounded-3xl relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {filteredData.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createMarkerIcon(activeTab, selected?.id === item.id)}
              eventHandlers={{
                click: () => handleItemClick(item),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-600">{item.district}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {/* List */}
      <div className="flex flex-col gap-3 pb-8">
        <div className="text-sm font-bold text-white/60">
          Showing {filteredData.length} {activeTab} {filteredData.length !== 1 ? 's' : ''}
        </div>
        {filteredData.slice(0, 10).map((item) => (
          <motion.div 
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={cn("glass-card !p-4 flex items-center justify-between cursor-pointer transition-all", selected?.id === item.id ? "bg-rose-500/20 border-rose-500/40" : "hover:bg-white/10")}
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl ring-1",
                activeTab === 'hospital' ? "bg-rose-500/20 text-rose-500 ring-rose-500/20" :
                activeTab === 'medicine' ? "bg-cyan-500/20 text-cyan-400 ring-cyan-500/20" :
                "bg-amber-500/20 text-amber-400 ring-amber-500/20"
              )}>
                {activeTab === 'hospital' && '🏥'}
                {activeTab === 'medicine' && '💊'}
                {activeTab === 'ambulance' && '🚑'}
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight max-w-[200px]">{item.name}</h4>
                <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">{item.district}</p>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5">
                  {activeTab === 'hospital' && `👨‍⚕️ ${item.totalDoctors} Doctors`}
                  {activeTab === 'medicine' && `💊 ${(item as any).medicines?.slice(0,2).join(', ') || 'Medicines'}`}
                  {activeTab === 'ambulance' && `🚑 ${(item as any).availability || '24/7'}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Phone size={18} className="text-white/40 hover:text-teal-400 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Details Modal - 50% Screen Width */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="facility-modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="facility-modal-content glass-card shadow-2xl border border-white/20"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all z-50"
              >
                <X size={24} />
              </button>

              <div className="flex items-start gap-6 mb-8">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ring-2",
                  activeTab === 'hospital' ? "bg-rose-500/20 ring-rose-500/40" :
                  activeTab === 'medicine' ? "bg-cyan-500/20 ring-cyan-500/40" :
                  "bg-amber-500/20 ring-amber-500/40"
                )}>
                  {activeTab === 'hospital' && '🏥'}
                  {activeTab === 'medicine' && '💊'}
                  {activeTab === 'ambulance' && '🚑'}
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">{selected.name}</h2>
                  <p className="text-white/60 text-sm">{selected.district}, {selected.division}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-white/10">
                {activeTab === 'hospital' && (
                  <>
                    <DetailRow label="Phone" value={selected.phone} />
                    <DetailRow label="Doctors" value={selected.totalDoctors} />
                    <DetailRow label="Website" value={selected.website} isLink />
                    <DetailRow label="Coordinates" value={`${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`} />
                  </>
                )}
                {activeTab === 'medicine' && (
                  <>
                    <DetailRow label="Owner" value={selected.owner} />
                    <DetailRow label="Phone" value={selected.phone} />
                    <DetailRow label="Hours" value={selected.hours} />
                    <DetailRow label="Available Medicines" value={selected.medicines?.join(', ') || 'Various'} />
                  </>
                )}
                {activeTab === 'ambulance' && (
                  <>
                    <DetailRow label="Operator" value={selected.operator} />
                    <DetailRow label="Phone" value={selected.phone} />
                    <DetailRow label="Availability" value={selected.availability} />
                    <DetailRow label="Equipment" value={selected.equipment} />
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <a href={`tel:${selected.phone}`} className="flex-1 min-w-[100px] py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 bg-teal-400 text-teal-950 hover:opacity-90 transition-opacity">
                  <Phone size={16} />
                  Call
                </a>
                {activeTab === 'hospital' && (
                  <a href={`https://${selected.website}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[100px] py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 bg-teal-400/50 text-white hover:bg-teal-400/70 transition-all">
                    <Globe size={16} />
                    Website
                  </a>
                )}
                <button className="flex-1 min-w-[100px] py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 bg-teal-400/30 text-white hover:bg-teal-400/50 transition-all">
                  <Navigation size={16} />
                  View Map
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, isLink }: { label: string, value: any, isLink?: boolean }) {
  if (isLink) {
    return (
      <div>
        <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{label}</p>
        <a href={`https://${value}`} target="_blank" rel="noopener noreferrer" className="text-teal-400 text-sm hover:underline break-all">
          {value}
        </a>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{label}</p>
      <p className="text-white/80 text-sm">{value}</p>
    </div>
  );
}
