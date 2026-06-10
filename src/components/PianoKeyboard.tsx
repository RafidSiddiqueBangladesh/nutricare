import React, { useRef, useEffect, useState } from 'react';
import { playNote, WHITE_KEYS } from '../lib/audioEngine';
import { cn } from '../lib/utils';

interface PianoKeyboardProps {
  activeNote: string | null;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ activeNote }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [keyWidth, setKeyWidth] = useState(52);

  // Responsively compute key width based on container width
  useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 48; // 24px padding each side
      const totalKeys = WHITE_KEYS.length;
      const gap = 4; // gap between keys in px
      const totalGap = gap * (totalKeys - 1);
      const w = Math.floor((containerWidth - totalGap) / totalKeys);
      setKeyWidth(Math.max(28, Math.min(72, w)));
    };

    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const keyHeight = Math.max(120, keyWidth * 2.8);
  const fontSize = keyWidth < 38 ? '9px' : keyWidth < 52 ? '11px' : '13px';

  return (
    <div
      ref={containerRef}
      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl"
    >
      <div
        className="flex justify-center mx-auto"
        style={{ gap: 4, width: 'fit-content', maxWidth: '100%' }}
      >
        {WHITE_KEYS.map((key) => {
          const isActive = activeNote === key.note;
          return (
            <button
              key={key.note}
              onPointerDown={() => playNote(key.note)}
              style={{
                width: keyWidth,
                height: keyHeight,
                fontSize,
                borderRadius: '0 0 10px 10px',
                flexShrink: 0,
              }}
              className={cn(
                'relative flex flex-col justify-end pb-2 items-center group transition-all duration-100 select-none touch-none',
                'border',
                isActive
                  ? 'bg-teal-400 border-teal-300 text-teal-950 scale-95 shadow-[0_0_20px_rgba(45,212,191,0.6)]'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:scale-[0.98] shadow-md active:bg-teal-100 active:scale-95'
              )}
              aria-label={`Play ${key.note}`}
            >
              {/* Subtle top gloss */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
              <span
                className={cn(
                  'font-black tracking-tighter transition-all leading-none',
                  isActive ? 'text-teal-950' : 'text-slate-400 group-hover:text-slate-600'
                )}
                style={{ fontSize }}
              >
                {key.note.replace(/\d/, '')}
              </span>
              <span
                style={{ fontSize: Math.max(7, Number(fontSize.replace('px', '')) - 3) + 'px' }}
                className={cn('leading-none mt-0.5', isActive ? 'text-teal-800' : 'text-slate-300')}
              >
                {key.note.match(/\d/)?.[0]}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-white/45 mt-5">
        Click or tap keys to play — or hover your hand in front of the webcam
      </p>
    </div>
  );
};

export default PianoKeyboard;
