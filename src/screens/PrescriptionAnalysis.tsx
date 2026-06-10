import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Loader, 
  Plus, 
  Trash2, 
  Eye, 
  BookOpen, 
  Check, 
  Ban 
} from 'lucide-react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { apiService } from '@/src/services/api';
import { cn } from '@/src/lib/utils';
import { appendHealthResult } from '@/src/lib/healthResults';

interface ExtractedData {
  doctor: string;
  medicines: Array<{ name: string; dosage: string; frequency: string }>;
  toEat: string[];
  toAvoid: string[];
  advice: string;
}

interface PrescriptionRecord {
  id: string;
  timestamp: string;
  image: string; // Base64 jpeg string
  extracted: ExtractedData;
}

export default function PrescriptionAnalysis() {
  const navigate = useNavigate();
  const [records, setRecords] = useLocalStorage<PrescriptionRecord[]>('prescription-logs', []);
  
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Detail preview state
  const [activeRecord, setActiveRecord] = useState<PrescriptionRecord | null>(null);
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);

  // File Picker Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, JPEG).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAnalysis = async () => {
    if (!base64Image) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiService.analyzePrescription(base64Image);

      if (response.success && response.data) {
        const extracted: ExtractedData = response.data;
        const newRecord: PrescriptionRecord = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          image: base64Image,
          extracted
        };

        setRecords([newRecord, ...records]);

        appendHealthResult({
          id: newRecord.id,
          type: 'disease',
          timestamp: newRecord.timestamp,
          data: {
            label: `Prescription: ${extracted.doctor}`,
            kind: 'Prescription OCR',
            score: 100,
            note: extracted.advice,
            details: {
              doctor: extracted.doctor,
              medicines: extracted.medicines,
              toEat: extracted.toEat,
              toAvoid: extracted.toAvoid,
              advice: extracted.advice,
            }
          }
        });

        setActiveRecord(newRecord);
        setSuccess(true);
        // Reset picker
        setSelectedFile(null);
        setPreviewUrl(null);
        setBase64Image(null);
      } else {
        setError(response.message || 'Prescription OCR failed. Please try a clearer picture.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this prescription record?')) {
      const filtered = records.filter(r => r.id !== id);
      setRecords(filtered);
      if (activeRecord?.id === id) {
        setActiveRecord(null);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/health')} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            <FileText size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Prescription OCR Scan</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-[1fr_320px] gap-6 pb-24 items-start">
        
        {/* Left Area: Upload or Details View */}
        <div className="flex flex-col gap-6">
          
          {/* Prescription Extracted Results (Active Details) */}
          {activeRecord ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card !p-6 flex flex-col gap-6 border-teal-500/30"
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="text-teal-400" size={18} />
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">Extracted Instructions</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{activeRecord.extracted.doctor}</h2>
                  <p className="text-xs text-white/45">Scanned on {new Date(activeRecord.timestamp).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => {
                    setActiveRecord(null);
                    setSuccess(false);
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Diet: What to Eat / What to Avoid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* To Eat */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-3 font-bold text-sm">
                    <Check size={16} />
                    What to Eat
                  </div>
                  {activeRecord.extracted.toEat?.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-green-200">
                      {activeRecord.extracted.toEat.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-white/40 italic">No specific diet items listed.</p>
                  )}
                </div>

                {/* To Avoid */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-red-400 mb-3 font-bold text-sm">
                    <Ban size={16} />
                    What NOT to Eat
                  </div>
                  {activeRecord.extracted.toAvoid?.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-red-200">
                      {activeRecord.extracted.toAvoid.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-white/40 italic">No restriction items listed.</p>
                  )}
                </div>
              </div>

              {/* Medicines List */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">Prescribed Medicines</h3>
                {activeRecord.extracted.medicines?.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 font-bold text-white/70">
                          <th className="p-3">Medicine</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Frequency / Timing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeRecord.extracted.medicines.map((med, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-3 font-bold text-teal-300">{med.name}</td>
                            <td className="p-3 text-white/70">{med.dosage || '--'}</td>
                            <td className="p-3 text-white/70">{med.frequency || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">No medications listed.</p>
                )}
              </div>

              {/* Advice */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1 flex items-center gap-1.5">
                  <BookOpen size={12} />
                  General Doctor Advice
                </h3>
                <p className="text-xs text-white/85 leading-relaxed">{activeRecord.extracted.advice || 'No additional advice given.'}</p>
              </div>

              {/* Toggle Original Image button */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistoryDetail(!showHistoryDetail)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  {showHistoryDetail ? 'Hide Original Image' : 'View Uploaded Prescription'}
                </button>
              </div>

              {showHistoryDetail && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="rounded-2xl overflow-hidden border border-white/10 bg-black"
                >
                  <img src={activeRecord.image} alt="Original scanned prescription" className="w-full object-contain max-h-[400px]" />
                </motion.div>
              )}

            </motion.div>
          ) : (
            /* Upload Screen */
            <div className="glass-card !p-6 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black">Upload Prescription Image</h2>
                <p className="text-xs text-white/50 mt-1">
                  Upload a photo of your prescription. LifeSync AI will extract doctor diet notes, forbidden foods, and medicine routines.
                </p>
              </div>

              {/* Dropzone / Upload area */}
              <div className="relative">
                <input 
                  type="file" 
                  id="prescription-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                
                {previewUrl ? (
                  <div className="relative aspect-video max-h-[300px] mx-auto rounded-2xl overflow-hidden border border-white/20 bg-black/40">
                    <img src={previewUrl} alt="Prescription preview" className="w-full h-full object-contain" />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setBase64Image(null);
                      }}
                      className="absolute top-3 right-3 p-1.5 bg-red-600/80 hover:bg-red-600 rounded-full text-white transition-all shadow-lg"
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label 
                    htmlFor="prescription-file"
                    className="border-2 border-dashed border-white/15 hover:border-teal-400/50 bg-white/5 hover:bg-teal-500/5 transition-all rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]"
                  >
                    <Upload size={32} className="text-white/40 mb-3 group-hover:text-teal-400" />
                    <p className="text-sm font-bold text-white/80">Select prescription image</p>
                    <p className="text-[11px] text-white/40 mt-1">PNG, JPG, JPEG up to 15MB</p>
                  </label>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-3 flex items-center gap-2 text-xs">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl p-3 flex items-center gap-2 text-xs">
                  <CheckCircle size={14} className="flex-shrink-0" />
                  <span>Prescription parsed and saved successfully!</span>
                </div>
              )}

              <button
                onClick={triggerAnalysis}
                disabled={isLoading || !base64Image}
                className="py-3.5 btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100 transition-all font-bold shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Analyzing image (OCR)...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze Prescription with AI
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Right Area: Scan History */}
        <div className="flex flex-col gap-4">
          <div className="glass-card !p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
              <FileText size={16} />
              Scan History
            </h3>

            {records.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-xs text-white/40 leading-relaxed bg-white/5">
                No scanned prescriptions yet. Analyze your first to start tracking advice.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto">
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      setActiveRecord(rec);
                      setSuccess(false);
                      setShowHistoryDetail(false);
                    }}
                    className={cn(
                      "glass-card !p-3.5 flex items-center justify-between cursor-pointer transition-all border text-left",
                      activeRecord?.id === rec.id ? "bg-teal-500/15 border-teal-500/40" : "hover:bg-white/10 border-white/5"
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-xs truncate text-white">{rec.extracted.doctor}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{new Date(rec.timestamp).toLocaleDateString()}</p>
                      <p className="text-[9px] text-teal-400 mt-1 uppercase font-bold tracking-wider">
                        💊 {rec.extracted.medicines?.length || 0} Medicines
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => deleteRecord(rec.id, e)}
                      className="p-1.5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-all"
                      aria-label="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
