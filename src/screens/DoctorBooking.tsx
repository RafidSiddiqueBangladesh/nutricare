import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Calendar, Phone, Video, Send, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';

const DOCTORS = [
  { id: 1, name: 'Dr. Sarah Ahmed', specialty: 'Cardiology', hospital: 'City Care Hospital', schedule: '10:00 AM - 1:00 PM', fee: '900 BDT', phone: '+8801711000001' },
  { id: 2, name: 'Dr. Hasan Karim', specialty: 'Orthopedics', hospital: 'Green Life Medical', schedule: '4:00 PM - 8:00 PM', fee: '800 BDT', phone: '+8801711000002' },
];

export default function DoctorBooking() {
  const navigate = useNavigate();

  // Local storage inputs
  const [healthResults] = useLocalStorage<any[]>('health-results', []);
  const [bmiLogs] = useLocalStorage<any[]>('health-metrics', []);
  const [exerciseLogs] = useLocalStorage<any[]>('exercise-logs', []);

  // Modal States
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
  const [sendViaSMS, setSendViaSMS] = useState(false);

  // Vitals parsing to detect crucial state (e.g. Heart Rate >100 or <60, High Blood Pressure)
  const isVitalsCrucial = useMemo(() => {
    let hrVal: number | null = null;
    const vitalEntry = healthResults.find(r => r.type === 'vitals');
    const deviceEntry = healthResults.find(r => r.type === 'device');
    
    if (vitalEntry && vitalEntry.data) {
      const v = vitalEntry.data.vitals || vitalEntry.data;
      if (v.heartRate) hrVal = Number(v.heartRate);
      else if (v.heart_rate?.value) hrVal = Number(v.heart_rate.value);
    }
    if (deviceEntry && deviceEntry.data) {
      const dev = deviceEntry.data.device || deviceEntry.data;
      if (dev.heartRate && !hrVal) hrVal = Number(dev.heartRate);
    }

    let bpSystolic: number | null = null;
    let bpDiastolic: number | null = null;
    if (deviceEntry && deviceEntry.data) {
      const dev = deviceEntry.data.device || deviceEntry.data;
      if (dev.bloodPressure) {
        const parts = String(dev.bloodPressure).split('/');
        if (parts.length === 2) {
          bpSystolic = parseInt(parts[0], 10);
          bpDiastolic = parseInt(parts[1], 10);
        }
      }
    }

    const isHrCrucial = hrVal !== null && (hrVal > 100 || hrVal < 60);
    const isBpCrucial = (bpSystolic !== null && bpSystolic > 140) || (bpDiastolic !== null && bpDiastolic > 90);

    return isHrCrucial || isBpCrucial;
  }, [healthResults]);

  // Dynamically generated report summary
  const healthSummaryText = useMemo(() => {
    let latestWeight = '--';
    let latestHeight = '--';
    let latestBMI = '--';
    let latestBMICategory = '--';

    if (bmiLogs && bmiLogs.length > 0) {
      const latest = bmiLogs[bmiLogs.length - 1];
      if (latest.weight) latestWeight = `${latest.weight} kg`;
      if (latest.height) latestHeight = `${latest.height} cm`;
      if (latest.bmi) {
        latestBMI = Number(latest.bmi).toFixed(1);
        if (latest.bmi < 18.5) latestBMICategory = 'Underweight';
        else if (latest.bmi < 25) latestBMICategory = 'Normal';
        else if (latest.bmi < 30) latestBMICategory = 'Overweight';
        else latestBMICategory = 'Obese';
      }
    } else {
      const bmiEntry = healthResults.find(r => r.type === 'bmi');
      if (bmiEntry && bmiEntry.data) {
        if (bmiEntry.data.weight) latestWeight = `${bmiEntry.data.weight} kg`;
        if (bmiEntry.data.height) latestHeight = `${bmiEntry.data.height} cm`;
        if (bmiEntry.data.bmi) {
          latestBMI = Number(bmiEntry.data.bmi).toFixed(1);
          latestBMICategory = bmiEntry.data.category || '--';
        }
      }
    }

    const vitalEntry = healthResults.find(r => r.type === 'vitals');
    const deviceEntry = healthResults.find(r => r.type === 'device');
    
    let heartRate = '--';
    let respiratoryRate = '--';
    let hrv = '--';
    let bloodPressure = '--';

    if (vitalEntry && vitalEntry.data) {
      const v = vitalEntry.data.vitals || vitalEntry.data;
      if (v.heartRate) heartRate = `${v.heartRate} bpm`;
      else if (v.heart_rate?.value) heartRate = `${v.heart_rate.value} bpm`;
      
      if (v.respiratoryRate) respiratoryRate = `${v.respiratoryRate} /min`;
      else if (v.respiratory_rate?.value) respiratoryRate = `${v.respiratory_rate.value} /min`;
      
      if (v.hrv) hrv = `${v.hrv} ms`;
      else if (v.hrv?.value) hrv = `${v.hrv.value} ms`;
    }

    if (deviceEntry && deviceEntry.data) {
      const dev = deviceEntry.data.device || deviceEntry.data;
      if (dev.heartRate && heartRate === '--') heartRate = `${dev.heartRate} bpm`;
      if (dev.bloodPressure) bloodPressure = dev.bloodPressure;
    }

    const totalWorkouts = exerciseLogs ? exerciseLogs.length : 0;
    const lastWorkout = exerciseLogs && exerciseLogs.length > 0 ? exerciseLogs[0] : null;

    const baseText = `LIFESYNC AI HEALTH REPORT SUMMARY
---------------------------------------------
Generated: ${new Date().toLocaleString()}

1. ANTHROPOMETRIC METRICS
   - Height: ${latestHeight}
   - Weight: ${latestWeight}
   - Calculated BMI: ${latestBMI} (${latestBMICategory})

2. CARDIOVASCULAR & PHYSIOLOGICAL METRICS
   - Heart Rate: ${heartRate}
   - Blood Pressure: ${bloodPressure}
   - Heart Rate Variability (HRV): ${hrv}
   - Respiratory Rate: ${respiratoryRate}

3. FITNESS & ACTIVITY STATUS
   - Total Workouts Logged: ${totalWorkouts}
   ${lastWorkout ? `- Last Workout: ${lastWorkout.name} (Duration: ${lastWorkout.duration}, Completed on ${new Date(lastWorkout.timestamp).toLocaleDateString()})` : '- No workouts logged recently'}

4. LATEST TRACKING STATUS
   - System Vitals Scan: ${vitalEntry ? 'Analyzed successfully' : 'Not scanned'}
   - Device Monitoring: ${deviceEntry ? 'Connected & Synced' : 'No device connected'}
---------------------------------------------
This report summary was generated using the local, secure NutriCare AI tracking database.`;

    const warning = isVitalsCrucial
      ? `🚨 CRITICAL HEALTH ALERT: Patient status crucial. Please review immediately. Urgent hospital visit may be required.\n\n`
      : '';

    return warning + baseText;
  }, [healthResults, bmiLogs, exerciseLogs, isVitalsCrucial]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDate || !appointmentTime) {
      alert('Please select a date and time.');
      return;
    }
    alert(`Booking confirmed with ${selectedDoc.name} on ${appointmentDate} at ${appointmentTime}!`);
    setBookingModalOpen(false);
    setAppointmentDate('');
    setAppointmentTime('');
  };

  const handleSendReport = () => {
    let sentCount = 0;
    
    if (sendViaWhatsApp) {
      const cleanPhone = selectedDoc.phone.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(healthSummaryText)}`;
      window.open(waUrl, '_blank');
      sentCount++;
      
      // Also send to saved emergency numbers if auto-send is enabled
      try {
        const savedRaw = localStorage.getItem('wa-auto-send-settings');
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          if (parsed.enabled && Array.isArray(parsed.numbers)) {
            parsed.numbers.forEach((num: string) => {
              if (num && num.trim()) {
                const cleanNum = num.replace(/[^0-9]/g, '');
                if (cleanNum) {
                  // Stagger opening tabs to avoid browser popup blockers blocking multiple opens
                  setTimeout(() => {
                    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(healthSummaryText)}`, '_blank');
                  }, 600 * sentCount);
                  sentCount++;
                }
              }
            });
          }
        }
      } catch (err) {
        console.error('Failed to auto-send to emergency numbers:', err);
      }
    }
    
    if (sendViaSMS) {
      alert(`[Demo SMS Simulation] A text message has been queued to send to ${selectedDoc.name}'s phone (${selectedDoc.phone}).`);
    }

    alert(`Report sent successfully to ${selectedDoc.name}${sentCount > 1 ? ` and ${sentCount - 1} emergency contact(s)` : ''}!`);
    setReportModalOpen(false);
  };

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
              <ActionButton 
                icon={Calendar} 
                label="Book Doctor" 
                onClick={() => {
                  setSelectedDoc(doc);
                  setBookingModalOpen(true);
                }} 
              />
              <ActionButton 
                icon={Send} 
                label="Send Report" 
                onClick={() => {
                  setSelectedDoc(doc);
                  setReportModalOpen(true);
                }} 
              />
              <ActionButton icon={Video} label="Video Call" onClick={() => navigate(`/video-call/${doc.id}`)} />
              <ActionButton icon={Phone} label="Call Doctor" onClick={() => window.location.href = `tel:${doc.phone}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModalOpen && selectedDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#002b2b] border border-teal-500/30 rounded-3xl p-6 shadow-2xl z-50 text-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="text-teal-400" size={20} />
                  Book Appointment
                </h3>
                <button 
                  onClick={() => setBookingModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 mb-6">
                <p className="text-sm font-bold text-teal-300">{selectedDoc.name}</p>
                <p className="text-xs text-white/60 mb-2">{selectedDoc.specialty} • {selectedDoc.hospital}</p>
                <p className="text-[11px] text-white/50">Available: {selectedDoc.schedule}</p>
                <p className="text-[11px] text-white/50">Fee: {selectedDoc.fee}</p>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Select Date</label>
                  <input 
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Select Time Slot</label>
                  <input 
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 transition-all text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-teal-950 rounded-xl font-bold text-sm transition-all"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Send Report Modal */}
      <AnimatePresence>
        {reportModalOpen && selectedDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-[#002b2b] border border-teal-500/30 rounded-3xl p-6 shadow-2xl z-50 text-white max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="text-teal-400" size={20} />
                  Send Health Report
                </h3>
                <button 
                  onClick={() => setReportModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-white/60 mb-4 flex-shrink-0">
                Preview the dynamic health summary report generated from your recent vitals scans, workouts, and metric logs before sharing it with <strong>{selectedDoc.name}</strong>.
              </p>

              <div className="flex-1 overflow-y-auto bg-black/30 border border-white/10 rounded-2xl p-4 mb-4 font-mono text-xs text-teal-300 whitespace-pre-wrap leading-relaxed shadow-inner max-h-[35vh]">
                {healthSummaryText}
              </div>

              {/* Delivery Channels */}
              <div className="flex flex-col gap-2.5 mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex-shrink-0">
                <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={sendViaWhatsApp}
                    onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                  />
                  <span>Send report summary via <strong>WhatsApp</strong> (Opens WhatsApp web/app)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={sendViaSMS}
                    onChange={(e) => setSendViaSMS(e.target.checked)}
                    className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                  />
                  <span>Send report summary via <strong>SMS Text Message</strong> (Demo Simulation)</span>
                </label>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button 
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendReport}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-teal-950 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Send Health Report
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
