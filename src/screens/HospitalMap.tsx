import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Hospital, Search, Map as MapIcon, Phone, Globe, Navigation, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const MOCK_HOSPITALS = [
  { id: 10, name: 'Panchagarh District Hospital 10', district: 'Panchagarh', division: 'Rangpur Division', totalDoctors: 91, phone: '+8801715810' },
  { id: 9, name: 'Panchagarh District Hospital 9', district: 'Panchagarh', division: 'Rangpur Division', totalDoctors: 85, phone: '+8801715809' },
  { id: 8, name: 'Panchagarh District Hospital 8', district: 'Panchagarh', division: 'Rangpur Division', totalDoctors: 70, phone: '+8801715808' },
];

export default function HospitalMap() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
           <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <Hospital size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Nearest Hospital Map</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card flex flex-col gap-4 border-rose-400/20">
        <div className="flex gap-4">
          <div className="bg-rose-400/20 p-2 rounded-lg text-rose-400 self-start">
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Free map with 640 mock points. Search and focus in map.</h3>
            <p className="text-[10px] text-white/40 mt-1">Showing nearest 12 of 640 matched points from 64 district locations.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or address" 
            className="glass-input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="aspect-square bg-[#002b2b] rounded-3xl relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
         {/* Mock Map View */}
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_0px,#000_1px)] bg-[length:24px_24px]" />
         <div className="absolute inset-0 flex items-center justify-center">
           <motion.div 
             animate={{ scale: [1, 1.2, 1] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/40"
           >
             <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/20">
               <Heart size={16} fill="white" className="text-white" />
             </div>
           </motion.div>
         </div>
      </section>

      <div className="flex flex-col gap-3 pb-8">
        {MOCK_HOSPITALS.map((h) => (
          <motion.div 
            key={h.id}
            onClick={() => setSelected(h)}
            className="glass-card !p-4 flex items-center justify-between hover:bg-white/10 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 ring-1 ring-rose-500/20">
                <Heart size={20} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight max-w-[150px]">{h.name}</h4>
                <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">{h.id}</p>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5">Unit {h.id}, Panchagarh Sadar, {h.division}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <MapIcon size={18} className="text-white/40 hover:text-teal-400 transition-colors" />
              <Phone size={18} className="text-white/40 hover:text-teal-400 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Hospital Modal Overlay */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-[120] glass-card !rounded-t-3xl !rounded-b-none p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/20"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white">
                  <Heart size={24} fill="currentColor" />
                </div>
                <h3 className="text-xl font-black">{selected.name}</h3>
              </div>
              
              <div className="space-y-3 mb-8">
                <DetailRow label="Phone" value={selected.phone} />
                <DetailRow label="District" value={selected.district} />
                <DetailRow label="Division" value={selected.division} />
                <DetailRow label="Service Type" value="Hospital" />
                <DetailRow label="Website" value={`https://${selected.name.toLowerCase().replace(/ /g, '-')}.mock-health.com`} isLink />
                <DetailRow label="Total Doctors" value={selected.totalDoctors} />
                <DetailRow label="Location" value="24.30000, 88.60900" />
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton icon={Phone} label="Call" color="bg-teal-400" />
                <ActionButton icon={Globe} label="Website" color="bg-teal-400" />
                <ActionButton icon={Navigation} label="Open Map" color="bg-teal-400" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, isLink }: { label: string, value: any, isLink?: boolean }) {
  return (
    <div className="text-sm">
      <span className="font-bold text-white/40">{label}: </span>
      <span className={cn("text-white/80", isLink ? "text-teal-400 underline" : "")}>{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <button className={cn("flex-1 min-w-[100px] py-2 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 text-teal-950", color)}>
      <Icon size={14} />
      {label}
    </button>
  );
}
