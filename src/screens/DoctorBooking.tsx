import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Calendar, Phone, Video, Send, FileText } from 'lucide-react';
import { motion } from 'motion/react';

const DOCTORS = [
  { id: 1, name: 'Dr. Sarah Ahmed', specialty: 'Cardiology', hospital: 'City Care Hospital', schedule: '10:00 AM - 1:00 PM', fee: '900 BDT', phone: '+8801711000001' },
  { id: 2, name: 'Dr. Hasan Karim', specialty: 'Orthopedics', hospital: 'Green Life Medical', schedule: '4:00 PM - 8:00 PM', fee: '800 BDT', phone: '+8801711000002' },
];

export default function DoctorBooking() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
           <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <User size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Book Doctors</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      <section className="glass-card">
        <h3 className="text-lg font-bold mb-2">Doctor Booking Access</h3>
        <p className="text-sm text-white/60">
          Role from profile: Patient. Doctor report inbox is hidden for your account.
        </p>
      </section>

      <section className="glass-card">
        <h3 className="text-lg font-bold mb-2">Patient View</h3>
        <p className="text-sm text-white/60">
          You can book doctors, send your report, and start doctor calls here.
        </p>
      </section>

      <div className="flex flex-col gap-4 pb-12">
        {DOCTORS.map((doc) => (
          <motion.div key={doc.id} className="glass-card !p-5">
            <div className="flex gap-4 mb-4">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white/60">
                <User size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black">{doc.name}</h4>
                <p className="text-sm text-teal-400 font-bold">{doc.specialty}</p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-white/60 mb-6">
              <p>Hospital: {doc.hospital}</p>
              <p>Schedule: {doc.schedule}</p>
              <p>Fee: {doc.fee}</p>
              <p>Phone: {doc.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ActionButton icon={Calendar} label="Book Doctor" onClick={() => {}} />
              <ActionButton icon={Send} label="Send Report" onClick={() => {}} />
              <ActionButton icon={Video} label="Video Call" onClick={() => navigate(`/video-call/${doc.id}`)} />
              <ActionButton icon={Phone} label="Call Doctor" onClick={() => window.location.href = `tel:${doc.phone}`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="py-2.5 bg-teal-400/20 hover:bg-teal-400/30 text-teal-400 border border-teal-400/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
      <Icon size={14} />
      {label}
    </button>
  );
}
