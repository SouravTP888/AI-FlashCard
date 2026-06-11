import { useState } from "react";
import { Copy, Check, ClipboardCheck, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

interface RevisionNotesListProps {
  notes: string[];
}

export default function RevisionNotesList({ notes }: RevisionNotesListProps) {
  const [checkedIndices, setCheckedIndices] = useState<Record<number, boolean>>({});
  const [copiedAll, setCopiedAll] = useState(false);

  const handleToggleCheck = (index: number) => {
    setCheckedIndices((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopyAll = () => {
    const formatted = notes.map((note, idx) => `- ${note}`).join("\n");
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const checkedCount = Object.values(checkedIndices).filter(Boolean).length;
  const totalCount = notes.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Control row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Study Guide Bullet Notes</h3>
          <p className="text-xs text-slate-500">
            Click physical checkboxes to cross off notes as you study and memorize them.
          </p>
        </div>
        
        <button
          onClick={handleCopyAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold select-none transition-colors self-stretch sm:self-auto justify-center ${
            copiedAll
              ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied Notes!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Notes Block</span>
            </>
          )}
        </button>
      </div>

      {/* Progress tracker */}
      <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 flex items-center gap-4">
        <div className="relative shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-50 dark:bg-slate-900 rounded-full border border-indigo-200/40 dark:border-slate-800">
          <ClipboardCheck className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span className="text-slate-700 dark:text-slate-300">Section Completion</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {checkedCount} of {totalCount} revision segments read and reviewed
          </span>
        </div>
      </div>

      {/* Checklist points */}
      <div className="space-y-3">
        {notes.map((note, index) => {
          const isChecked = !!checkedIndices[index];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: Math.min(index * 0.04, 0.4) }}
              onClick={() => handleToggleCheck(index)}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 border-slate-900 dark:border-slate-100 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.85)] transition-all cursor-pointer text-left ${
                isChecked
                  ? "bg-slate-100 dark:bg-slate-900/30 opacity-60"
                  : "bg-emerald-50/70 dark:bg-slate-800 hover:bg-emerald-50/90"
              }`}
            >
              <button
                type="button"
                className={`w-5 h-5 flex items-center justify-center rounded-md border-2 border-slate-900 text-white transition-all shrink-0 mt-0.5 ${
                  isChecked
                    ? "bg-slate-900 border-slate-900 dark:bg-indigo-500 dark:border-indigo-500"
                    : "bg-white hover:bg-indigo-100"
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3.5px] text-emerald-400" />}
              </button>

              <p 
                className={`text-slate-700 dark:text-slate-200 text-sm leading-relaxed transition-all select-none ${
                  isChecked ? "line-through text-slate-400 dark:text-slate-500" : ""
                }`}
              >
                {note}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
