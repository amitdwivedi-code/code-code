import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, language = 'python', className = '' }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const langClass = language === 'python' || language === 'py' ? 'language-python' : 'language-javascript';

  return (
    <div className={`rounded-xl overflow-hidden font-mono text-xs shadow-inner bg-slate-950 border border-slate-800 ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-indigo-400">{language === 'python' ? 'Python 3.12' : 'JavaScript'}</span>
        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-slate-500">Syntax Highlighted</span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto m-0 bg-transparent text-slate-100">
        <code className={langClass}>
          {code}
        </code>
      </pre>
    </div>
  );
};
