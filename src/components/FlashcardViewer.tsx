import { useState } from "react";
import { Flashcard } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, Flag, Info, Eye, EyeOff, LayoutGrid, Smartphone } from "lucide-react";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onToggleMastered: (index: number) => void;
  onToggleFlag: (index: number) => void;
  onResetStats: () => void;
}

export default function FlashcardViewer({
  flashcards,
  onToggleMastered,
  onToggleFlag,
  onResetStats
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const currentCard = flashcards[currentIndex];
  
  // Calculate statistics
  const masteredCount = flashcards.filter(f => f.isMastered).length;
  const flaggedCount = flashcards.filter(f => f.isFlagged).length;
  const totalCount = flashcards.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalCount) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalCount);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + totalCount) % totalCount);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="space-y-6">
      {/* Tab/Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Active Recall Deck</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Use the 3D cards to test your knowledge or switch to grid layout for quick reading.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
          {/* Layout switches */}
          <div className="flex items-center p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-lg">
            <button
              onClick={() => setViewMode("carousel")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "carousel"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Individual Flip Study"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Study Deck</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="All-cards Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Review Grid</span>
            </button>
          </div>

          <button
            onClick={onResetStats}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1"
            title="Reset flags and mastering statistics"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Reset Stats</span>
          </button>
        </div>
      </div>

      {/* Mini Stat Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-center">
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Progress Reviewed</div>
          <div className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-0.5">
            {currentIndex + 1} <span className="text-xs font-normal text-slate-400">/ {totalCount}</span>
          </div>
        </div>
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/40 dark:border-emerald-800/20 text-center">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>Mastered</span>
          </div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
            {masteredCount} <span className="text-xs font-normal text-emerald-400 dark:text-emerald-600">/ {totalCount}</span>
          </div>
        </div>
        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/40 dark:border-amber-800/20 text-center">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center gap-1">
            <Flag className="w-3 h-3 text-amber-500" />
            <span>Flagged</span>
          </div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-0.5">
            {flaggedCount} <span className="text-xs font-normal text-amber-400 dark:text-amber-600">active</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Carousel 3D Study view */}
      {viewMode === "carousel" && currentCard && (
        <div className="space-y-4">
          {/* Card Area */}
          <div className="relative h-[290px] w-full perspective-1000 cursor-pointer" onClick={handleFlip}>
            <div
              className={`relative w-full h-full text-center transition-transform duration-500 preserve-3d rounded-3xl border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] ${
                isFlipped ? "rotate-y-180" : ""
              } ${
                isFlipped
                  ? "bg-indigo-50/90 dark:bg-slate-900"
                  : "bg-white dark:bg-slate-900"
              }`}
            >
              {/* CARD FRONT (Question) */}
              <div className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between backface-hidden rounded-3xl">
                <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-slate-75">
                  <span className="text-2xs uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400">
                    Question Card {currentIndex + 1}
                  </span>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFlag(currentIndex)}
                      className={`p-1 rounded-md transition-colors ${
                        currentCard.isFlagged
                          ? "bg-amber-100 dark:bg-amber-900/45 text-amber-600 dark:text-amber-400"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600"
                      }`}
                      title={currentCard.isFlagged ? "Unflag" : "Flag for Review"}
                    >
                      <Flag className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => onToggleMastered(currentIndex)}
                      className={`p-1 rounded-md transition-colors ${
                        currentCard.isMastered
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600"
                      }`}
                      title={currentCard.isMastered ? "Unmark mastered" : "Mark as Mastered"}
                    >
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="my-auto px-4">
                  <p className="text-lg sm:text-xl font-serif text-slate-800 dark:text-slate-100 leading-tight italic font-semibold">
                    "{currentCard.question}"
                  </p>
                </div>

                <div className="flex justify-center items-center gap-1.5 text-xs text-indigo-500 font-bold tracking-widest animate-pulse">
                  <Eye className="w-3.5 h-3.5" />
                  <span>CLICK TO FLIP REVEAL</span>
                </div>
              </div>

              {/* CARD BACK (Answer) */}
              <div className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between backface-hidden rotate-y-180 rounded-3xl overflow-y-auto">
                <div className="flex justify-between items-center bg-emerald-50/50 dark:bg-slate-850 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-slate-800/50">
                  <span className="text-2xs uppercase tracking-widest font-bold text-emerald-700 dark:text-emerald-400">
                    EXPLANATION / ANSWER
                  </span>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFlag(currentIndex)}
                      className={`p-1 rounded-md transition-colors ${
                        currentCard.isFlagged
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600"
                      }`}
                      title={currentCard.isFlagged ? "Unflag" : "Flag for Review"}
                    >
                      <Flag className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => onToggleMastered(currentIndex)}
                      className={`p-1 rounded-md transition-colors ${
                        currentCard.isMastered
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600"
                      }`}
                      title={currentCard.isMastered ? "Unmark mastered" : "Mark as Mastered"}
                    >
                      <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="my-auto px-4 max-h-[175px] overflow-y-auto">
                  <p className="text-sm sm:text-base font-normal text-slate-700 dark:text-slate-200 leading-relaxed text-left sm:text-center whitespace-pre-line font-medium">
                    {currentCard.answer}
                  </p>
                </div>

                <div className="flex justify-center items-center gap-1.5 text-xs text-indigo-500 font-bold tracking-widest">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>CLICK TO VIEW QUESTION</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-all font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Slider bar */}
            <div className="flex-1 max-w-xs mx-auto text-center hidden xs:block">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1.5 inline-block">
                Progress: {progressPercent}%
              </span>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white transition-all font-medium text-sm"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-blue-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-blue-200/30 dark:border-slate-800/40 flex gap-3 text-xs text-slate-600 dark:text-slate-300">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p>
              Use the corner indicators to label cards. **Mastered** cards represent confident items, and **Flagged** items are card subjects that require extra reviews before exams.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 2: Complete deck Grid list view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {flashcards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.4) }}
                className={`p-5 rounded-2xl border transition-all ${
                  card.isMastered
                    ? "bg-emerald-50/20 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30"
                    : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-800"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-4 flex-1">
                    {/* Header line */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        Card {index + 1}
                      </span>
                      {card.isMastered && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5 fill-current" /> Complete
                        </span>
                      )}
                      {card.isFlagged && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                          <Flag className="w-2.5 h-2.5 fill-current" /> High-Priority Review
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Question */}
                      <div>
                        <div className="text-2xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">Question</div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 leading-relaxed">
                          {card.question}
                        </p>
                      </div>
                      {/* Right: Answer */}
                      <div className="border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                        <div className="text-2xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Answer Explanation</div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed whitespace-pre-line">
                          {card.answer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col gap-1.5 shrink-0 self-start">
                    <button
                      onClick={() => onToggleFlag(index)}
                      className={`p-2 rounded-xl transition-all border ${
                        card.isFlagged
                          ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-800"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-400 dark:border-slate-800 hover:dark:bg-slate-700"
                      }`}
                      title={card.isFlagged ? "Unflag" : "Flag for Review"}
                    >
                      <Flag className="w-4 h-4 fill-current" />
                    </button>
                    
                    <button
                      onClick={() => onToggleMastered(index)}
                      className={`p-2 rounded-xl transition-all border ${
                        card.isMastered
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-400 dark:border-slate-800 hover:dark:bg-slate-700"
                      }`}
                      title={card.isMastered ? "Unmark complete" : "Mark as Mastered"}
                    >
                      <CheckCircle className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
