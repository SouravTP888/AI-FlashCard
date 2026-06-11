import { useState } from "react";
import { KeyConcept } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Search, Copy, Check, Lightbulb, HelpCircle, BookOpen } from "lucide-react";

interface KeyConceptsListProps {
  concepts: KeyConcept[];
}

export default function KeyConceptsList({ concepts }: KeyConceptsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (concept: KeyConcept, idx: number) => {
    const formatted = `**Term:** ${concept.term}\n**Definition:** ${concept.definition}\n**Explanation:** ${concept.explanation}`;
    navigator.clipboard.writeText(formatted);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredConcepts = concepts.filter(
    (c) =>
      c.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Key Terms Glossary</h3>
          <p className="text-xs text-slate-500">
            A comprehensive definitions index. Click a concept card to view analogies or additional study context.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-72 shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search concepts, terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {filteredConcepts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">No matching concepts found</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="text-xs text-indigo-600 dark:text-indigo-400 underline mt-1 font-semibold"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredConcepts.map((concept, index) => {
            const originalIndex = concepts.indexOf(concept);
            const isExpanded = expandedIndex === originalIndex;

            return (
              <motion.div
                key={originalIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.05, 0.4) }}
                className={`border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.85)] rounded-2xl p-4.5 transition-all text-left group ${
                  isExpanded
                    ? "bg-amber-50/70 dark:bg-amber-950/20"
                    : "bg-white dark:bg-slate-800 hover:bg-slate-50/75"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                      <span className="w-5 h-5 flex items-center justify-center bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 rounded-lg text-2xs font-bold font-mono">
                        {originalIndex + 1}
                      </span>
                      <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {concept.term}
                      </h4>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-2.5 font-medium leading-relaxed">
                      {concept.definition}
                    </p>
                  </div>

                  {/* Actions column */}
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(concept, originalIndex)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        copiedIndex === originalIndex
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800"
                          : "border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                      title="Copy formula/concept card"
                    >
                      {copiedIndex === originalIndex ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Animated accordion block */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/80 grid grid-cols-1 gap-3.5">
                        <div className="bg-amber-500/[0.04] dark:bg-amber-500/[0.02] p-3.5 rounded-xl border border-amber-500/10 dark:border-amber-500/5 flex gap-3 text-xs leading-relaxed">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Intuitive Explanation / Analogy:</span>
                            <span className="text-slate-600 dark:text-slate-300 ml-1 whitespace-pre-line">
                              {concept.explanation}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
