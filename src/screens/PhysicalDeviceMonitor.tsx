import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bluetooth, Watch, Activity, HeartPulse, Gauge, DatabaseZap, Play, Square, Trash2, ChevronLeft, CheckCircle2, AlertTriangle, Link2, Smartphone } from 'lucide-react';
import { saveDeviceReading } from '@/src/lib/saveDeviceReading';

const NUS_SVC = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const FF_SVC = '0000ff12-0000-1000-8000-00805f9b34fb';
const FF_TX = '0000ff14-0000-1000-8000-00805f9b34fb';
const FF_RX = '0000ff13-0000-1000-8000-00805f9b34fb';
const SEC_SVC = '6e400011-b5a3-f393-e0a9-e50e24dcca9e';
const SEC_TX = '6e400013-b5a3-f393-e0a9-e50e24dcca9e';
const SEC_RX = '6e400012-b5a3-f393-e0a9-e50e24dcca9e';

const hrPool = [65, 68, 70, 72, 74, 75, 77, 79, 81, 83, 78, 76];
const glucosePool = [5.1, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0, 5.0];
const bpPool: Array<[number, number]> = [[120, 80], [122, 78], [124, 82], [128, 80], [130, 85], [118, 76], [126, 83]];

type PacketKind = 'hr' | 'glucose' | 'bp' | 'raw';

type PacketLog = {
  id: string;
  time: string;
  kind: PacketKind;
  message: string;
  source: string;
};

type DeviceState = {
  connected: boolean;
  demoRunning: boolean;
  packetCount: number;
  heartRate: number | null;
  glucose: number | null;
  systolic: number | null;
  diastolic: number | null;
  status: string;
  statusTone: 'idle' | 'live' | 'busy' | 'error';
  battery: number;
  lastSource: string;
};

function toHex(bytes: number[]) {
  return bytes.map((value) => value.toString(16).toUpperCase().padStart(2, '0')).join('-');
}

function buildPacketKind(message: string): PacketKind {
  if (message.includes('blood pressure')) return 'bp';
  if (message.includes('glucose')) return 'glucose';
  if (message.includes('heart rate')) return 'hr';
  return 'raw';
}

export default function PhysicalDeviceMonitor() {
  const navigate = useNavigate();
  const [state, setState] = useState<DeviceState>({
    connected: false,
    demoRunning: false,
    packetCount: 0,
    heartRate: null,
    glucose: null,
    systolic: null,
    diastolic: null,
    status: 'Connect a watch or run the demo to start collecting readings.',
    statusTone: 'idle',
    battery: 84,
    lastSource: 'Waiting',
  });
  const [logs, setLogs] = useState<PacketLog[]>([]);
  const [loading, setLoading] = useState(false);
  const clientRef = useRef<any>(null);
  const rxRef = useRef<any>(null);
  const demoTimer = useRef<number | null>(null);
  const demoRunningRef = useRef(false);
  const waitGlucose = useRef(false);
  const waitBP = useRef(false);

  const metrics = useMemo(() => ([
    {
      label: 'Heart Rate',
      value: state.heartRate == null ? '--' : state.heartRate,
      unit: 'bpm',
      icon: HeartPulse,
      accent: 'text-rose-400',
      dot: state.heartRate ? 'bg-rose-400 animate-pulse' : 'bg-white/20',
    },
    {
      label: 'Blood Glucose',
      value: state.glucose == null ? '--' : state.glucose.toFixed(1),
      unit: 'mmol/L',
      icon: DatabaseZap,
      accent: 'text-emerald-400',
      dot: state.glucose ? 'bg-emerald-400 animate-pulse' : 'bg-white/20',
    },
    {
      label: 'Blood Pressure',
      value: state.systolic == null || state.diastolic == null ? '--/--' : `${state.systolic}/${state.diastolic}`,
      unit: 'mmHg',
      icon: Gauge,
      accent: 'text-amber-400',
      dot: state.systolic ? 'bg-amber-400 animate-pulse' : 'bg-white/20',
    },
    {
      label: 'Packets',
      value: state.packetCount,
      unit: 'received',
      icon: Activity,
      accent: 'text-sky-400',
      dot: state.packetCount > 0 ? 'bg-sky-400 animate-pulse' : 'bg-white/20',
    },
  ]), [state]);

  const pushLog = (kind: PacketKind, source: string, message: string) => {
    setLogs((current) => [{ id: `${Date.now()}-${Math.random()}`, time: new Date().toLocaleTimeString(), kind, source, message }, ...current].slice(0, 16));
  };

  const updateState = (patch: Partial<DeviceState>) => {
    setState((current) => ({ ...current, ...patch }));
  };

  const saveSnapshot = async (label: string, score: number | undefined, details: Record<string, unknown>) => {
    const result = await saveDeviceReading({
      type: 'device_watch',
      label,
      score,
      details,
    });

    if (result.error) {
      updateState({ status: `Save failed: ${result.error.message}`, statusTone: 'error' });
    }
  };

  const recordHeartRate = (value: number, source: string, rawHex: string) => {
    updateState({ heartRate: value, status: `Heart rate updated from ${source}.`, statusTone: 'live', lastSource: source });
    pushLog('hr', source, `Heart rate = ${value} bpm`);
    saveSnapshot('Connected Device - Heart Rate', value, { source, metric: 'heart_rate', metricLabel: 'Heart Rate', value, unit: 'bpm', rawHex });
  };

  const recordGlucose = (value: number, source: string, rawHex: string) => {
    updateState({ glucose: value, status: `Glucose captured from ${source}.`, statusTone: 'live', lastSource: source });
    pushLog('glucose', source, `Glucose = ${value.toFixed(1)} mmol/L`);
    saveSnapshot('Connected Device - Blood Glucose', value, { source, metric: 'glucose', metricLabel: 'Blood Glucose', value, unit: 'mmol/L', rawHex });
  };

  const recordBloodPressure = (sys: number, dia: number, source: string, rawHex: string) => {
    updateState({ systolic: sys, diastolic: dia, status: `Blood pressure captured from ${source}.`, statusTone: 'live', lastSource: source });
    pushLog('bp', source, `Blood pressure = ${sys}/${dia} mmHg`);
    saveSnapshot('Connected Device - Blood Pressure', sys, { source, metric: 'blood_pressure', metricLabel: 'Blood Pressure', systolic: sys, diastolic: dia, value: `${sys}/${dia}`, unit: 'mmHg', rawHex });
  };

  const dotClass = state.statusTone === 'live' ? 'bg-emerald-400' : state.statusTone === 'busy' ? 'bg-sky-400 animate-pulse' : state.statusTone === 'error' ? 'bg-rose-400' : 'bg-white/30';

  const decodePacket = (bytes: number[], source: string) => {
    if (!bytes.length) return { kind: 'raw' as const, message: 'Empty packet' };

    const b4 = bytes[4];
    const b5 = bytes[5];
    const b6 = bytes[6];
    const b7 = bytes[7];

    if (source === 'NUS' && bytes[0] === 0xAB) {
      if (b4 === 0xC7 && b5 === 0x01) {
        waitGlucose.current = true;
        waitBP.current = false;
        updateState({ status: 'Watch warmup received. Next packet will be glucose.', statusTone: 'busy', lastSource: source });
        return { kind: 'glucose' as const, message: 'Glucose sensor active (C7-01)' };
      }

      if (b4 === 0x91 && bytes.length >= 8) {
        if (waitGlucose.current) {
          waitGlucose.current = false;
          waitBP.current = true;
          const glucose = Number((b7 * 0.25).toFixed(1));
          recordGlucose(glucose, source, toHex(bytes));
          return { kind: 'glucose' as const, message: `Glucose = ${glucose.toFixed(1)} mmol/L` };
        }

        if (waitBP.current) {
          waitBP.current = false;
          const systolic = Math.max(90, Math.min((b7 + 52) || 120, 180));
          const diastolic = Math.max(60, Math.min(b6 || 80, 110));
          recordBloodPressure(systolic, diastolic, source, toHex(bytes));
          return { kind: 'bp' as const, message: `Blood pressure = ${systolic}/${diastolic} mmHg` };
        }

        const heartRate = b7 + 52;
        if (heartRate >= 40 && heartRate <= 200) {
          recordHeartRate(heartRate, source, toHex(bytes));
          return { kind: 'hr' as const, message: `Heart rate = ${heartRate} bpm` };
        }
      }
    }

    if (source === 'FF') {
      for (let i = 0; i < bytes.length - 1; i += 1) {
        if (bytes[i] >= 90 && bytes[i] <= 200 && bytes[i + 1] >= 50 && bytes[i + 1] <= 130 && (bytes[i] - bytes[i + 1]) > 15) {
          recordBloodPressure(bytes[i], bytes[i + 1], source, toHex(bytes));
          return { kind: 'bp' as const, message: `Blood pressure = ${bytes[i]}/${bytes[i + 1]} mmHg` };
        }
      }
    }

    return { kind: 'raw' as const, message: `${source}: ${toHex(bytes)}` };
  };

  const handleIncomingBytes = (bytes: number[], source: string) => {
    setState((current) => ({ ...current, packetCount: current.packetCount + 1 }));
    const decoded = decodePacket(bytes, source);
    pushLog(decoded.kind, source, decoded.message);
  };

  const stopDemo = () => {
    if (demoTimer.current) {
      window.clearTimeout(demoTimer.current);
      demoTimer.current = null;
    }
    demoRunningRef.current = false;
    updateState({ demoRunning: false, status: 'Demo stopped.', statusTone: 'idle' });
  };

  const startDemo = () => {
    if (state.demoRunning) return;

    demoRunningRef.current = true;
    updateState({ demoRunning: true, status: 'Running demo mode with watch-style readings.', statusTone: 'busy' });

    // Step 1: At 2s, Update Heart Rate
    demoTimer.current = window.setTimeout(() => {
      if (!demoRunningRef.current) return;
      
      const heartRate = hrPool[Math.floor(Math.random() * hrPool.length)];
      handleIncomingBytes([0xAB, 0x00, 0x05, 0xFF, 0x91, 0x80, 0x00, heartRate - 52], 'NUS');

      // Step 2: At 6s total (4s more), Update Glucose
      demoTimer.current = window.setTimeout(() => {
        if (!demoRunningRef.current) return;
        
        handleIncomingBytes([0xAB, 0x00, 0x03, 0xFF, 0xC7, 0x01], 'NUS');
        
        // Wait 100ms for the warmup state to register, then send glucose
        demoTimer.current = window.setTimeout(() => {
          if (!demoRunningRef.current) return;
          
          const glucose = glucosePool[Math.floor(Math.random() * glucosePool.length)];
          const glucoseByte = Math.round(glucose / 0.25);
          handleIncomingBytes([0xAB, 0x00, 0x05, 0xFF, 0x91, 0x80, 0x00, glucoseByte], 'NUS');

          // Step 3: At 10s total (4s more), Update Blood Pressure / finish
          demoTimer.current = window.setTimeout(() => {
            if (!demoRunningRef.current) return;
            
            const [sys, dia] = bpPool[Math.floor(Math.random() * bpPool.length)];
            handleIncomingBytes([0xAB, 0x00, 0x05, 0xFF, 0x91, 0x80, dia, sys - 52], 'NUS');

            // Finish demo
            demoRunningRef.current = false;
            updateState({ demoRunning: false, status: 'Demo completed successfully.', statusTone: 'idle' });
          }, 3900); // 3900ms + 100ms = 4000ms after step 2 start

        }, 100);

      }, 4000);

    }, 2000);
  };

  const clearLog = () => {
    setLogs([]);
    updateState({ packetCount: 0, heartRate: null, glucose: null, systolic: null, diastolic: null });
  };

  const connectDevice = async () => {
    const bluetooth = (navigator as any).bluetooth;
    if (!bluetooth) {
      updateState({ status: 'Bluetooth is not available in this browser.', statusTone: 'error' });
      return;
    }

    try {
      setLoading(true);
      updateState({ status: 'Opening Bluetooth chooser...', statusTone: 'busy' });
      const device = await bluetooth.requestDevice({
        filters: [{ namePrefix: 'WATCH' }],
        optionalServices: [NUS_SVC, FF_SVC, SEC_SVC],
      });

      updateState({ status: `Connecting to ${device.name || 'device'}...`, statusTone: 'busy' });
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Unable to connect to device.');

      clientRef.current = server;
      const activeChannels: string[] = [];

      const attach = async (serviceUuid: string, txUuid: string, rxUuid: string, source: string) => {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const tx = await service.getCharacteristic(txUuid);
          if (source === 'NUS') {
            rxRef.current = await service.getCharacteristic(rxUuid);
          }
          await tx.startNotifications();
          tx.addEventListener('characteristicvaluechanged', (event: any) => {
            const bytes: number[] = [];
            for (let i = 0; i < event.target.value.byteLength; i += 1) {
              bytes.push(event.target.value.getUint8(i));
            }
            handleIncomingBytes(bytes, source);
          });
          activeChannels.push(source);
        } catch {
          // Ignore unavailable services so the UI still connects cleanly.
        }
      };

      await attach(NUS_SVC, NUS_TX, NUS_RX, 'NUS');
      await attach(FF_SVC, FF_TX, FF_RX, 'FF');
      await attach(SEC_SVC, SEC_TX, SEC_RX, 'SEC');

      setState((current) => ({
        ...current,
        connected: true,
        status: activeChannels.length ? `Connected. Active channels: ${activeChannels.join(', ')}.` : 'Connected, but no compatible data channel was found.',
        statusTone: activeChannels.length ? 'live' : 'busy',
      }));
      pushLog('raw', device.name || 'device', 'Bluetooth connection established');
    } catch (error: any) {
      updateState({ status: error?.message || 'Bluetooth connection failed.', statusTone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = async (type: 'hr' | 'bp' | 'glucose') => {
    if (!rxRef.current) return;
    const commands: Record<'hr' | 'bp' | 'glucose', string> = {
      hr: 'AB0004FF218000',
      bp: 'AB0004FF208000',
      glucose: 'AB0004FF228000',
    };
    const bytes = commands[type].match(/.{1,2}/g)?.map((value) => parseInt(value, 16)) || [];
    await rxRef.current.writeValue(new Uint8Array(bytes));
    updateState({ status: `Sent ${type.toUpperCase()} command to device.`, statusTone: 'busy', lastSource: 'Bluetooth' });
  };

  useEffect(() => {
    return () => {
      stopDemo();
      try {
        clientRef.current?.disconnect?.();
      } catch {
        // Ignore cleanup errors.
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-sky-400">
            <Bluetooth size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Physical Device Connect</span>
            <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
          </div>
        </div>
      </div>

      <section className="glass-card overflow-hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              <Watch size={14} />
              Watch or sensor hub
            </div>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight">Connect a physical device and stream health data.</h1>
            <p className="text-sm lg:text-base text-white/60 max-w-xl">
              Pair a watch, bracelet, or BLE sensor, then collect heart rate, glucose, and blood pressure readings.
              Every saved reading is pushed to the backend and appears in Health Results History.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Connection</p>
              <p className="text-sm font-bold text-white">{state.connected ? 'Connected' : 'Ready'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Battery</p>
              <p className="text-sm font-bold text-white">{state.battery}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Last source</p>
              <p className="text-sm font-bold text-sky-300">{state.lastSource}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="glass-card !p-4 relative overflow-hidden">
              <div className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${metric.dot}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ${metric.accent}`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">{metric.label}</p>
                  <p className="text-3xl font-black leading-none">{metric.value}</p>
                  <p className="mt-1 text-xs text-white/50">{metric.unit}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="glass-card !p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-3 w-3 rounded-full ${dotClass}`} />
          <div>
            <h2 className="text-lg font-bold">Device status</h2>
            <p className="text-sm text-white/55">{state.status}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={connectDevice} disabled={loading || state.connected} className="btn-primary bg-sky-400 text-slate-950 hover:bg-sky-300 flex items-center gap-2">
            <Link2 size={16} />
            {loading ? 'Connecting...' : state.connected ? 'Connected' : 'Connect Bluetooth'}
          </button>
          <button onClick={startDemo} disabled={state.demoRunning} className="btn-primary bg-emerald-400 text-emerald-950 hover:bg-emerald-300 flex items-center gap-2">
            <Play size={16} />
            Start Demo
          </button>
          <button onClick={stopDemo} className="btn-primary bg-white/10 text-white hover:bg-white/15 flex items-center gap-2">
            <Square size={16} />
            Stop Demo
          </button>
          <button onClick={() => sendCommand('hr')} disabled={!state.connected} className="btn-primary bg-rose-400/15 text-rose-300 hover:bg-rose-400/25 flex items-center gap-2">
            <HeartPulse size={16} />
            HR
          </button>
          <button onClick={() => sendCommand('bp')} disabled={!state.connected} className="btn-primary bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 flex items-center gap-2">
            <Gauge size={16} />
            BP
          </button>
          <button onClick={() => sendCommand('glucose')} disabled={!state.connected} className="btn-primary bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25 flex items-center gap-2">
            <DatabaseZap size={16} />
            Glucose
          </button>
          <button onClick={clearLog} className="btn-primary bg-white/5 text-white hover:bg-white/10 flex items-center gap-2">
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="glass-card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">Live packet log</h3>
              <p className="text-xs text-white/40">Collected readings are saved immediately to the backend</p>
            </div>
            <span className="text-xs text-white/50">{logs.length} entries</span>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-3 space-y-2">
            {logs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/45">
                No packets yet. Connect a device or start the demo.
              </div>
            ) : logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-white/45">
                  <span>{log.time}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 uppercase tracking-wider">{log.source}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${log.kind === 'hr' ? 'bg-rose-400/20 text-rose-300' : log.kind === 'bp' ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>
                    {log.kind}
                  </span>
                  <p className="text-sm text-white/80 leading-relaxed">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="glass-card !p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-300">
              <AlertTriangle size={16} />
              <h3 className="text-sm font-bold uppercase tracking-wider">How it works</h3>
            </div>
            <ul className="space-y-2 text-sm text-white/60">
              <li>1. Open Bluetooth and connect your watch or BLE device.</li>
              <li>2. Readings are normalized and saved to the backend on every update.</li>
              <li>3. Health Results History shows the connected device log under Device entries.</li>
            </ul>
          </div>

          <div className="glass-card !p-4">
            <div className="flex items-center gap-2 mb-3 text-sky-300">
              <Smartphone size={16} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Connection tips</h3>
            </div>
            <div className="space-y-3 text-sm text-white/65">
              <p>Keep the device near the browser and allow Bluetooth permission when prompted.</p>
              <p>Demo mode simulates a polished connected-device experience even if hardware is unavailable.</p>
              <p>Use the History page to confirm each reading lands in your backend log.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
