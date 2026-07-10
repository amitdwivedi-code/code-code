import React, { useRef } from 'react';

interface PinInputBoxProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

export const PinInputBox: React.FC<PinInputBoxProps> = ({ value, onChange, length = 4 }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(length, '').split('').slice(0, length);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join('').trim());
      return;
    }

    const digit = val[val.length - 1];
    const newDigits = [...digits];
    newDigits[index] = digit;
    const combined = newDigits.join('').replace(/\s/g, '');
    onChange(combined);

    if (index < length - 1 && digit) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join('').replace(/\s/g, ''));
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join('').replace(/\s/g, ''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    onChange(pasteData);
    const targetIdx = Math.min(pasteData.length, length - 1);
    inputRefs.current[targetIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-center space-x-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] !== undefined && digits[i] !== ' ' ? digits[i] : ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold font-mono rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
        />
      ))}
    </div>
  );
};
