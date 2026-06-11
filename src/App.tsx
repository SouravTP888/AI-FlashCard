import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { DEMO_PRESETS } from "./demoData";
import { generatePDF } from "./pdfHelper";
import FlashcardViewer from "./components/FlashcardViewer";
import KeyConceptsList from "./components/KeyConceptsList";
import RevisionNotesList from "./components/RevisionNotesList";
import { StudyData, FocusOption, SavedDeck } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Moon, 
  Sun, 
  Info, 
  AlertCircle, 
  ArrowRight, 
  BookMarked,
  Layers,
  SearchCode,
  FileSpreadsheet,
  Clock,
  ChevronRight,
  RefreshCw
} from "lucide-react";

const STUDY_TIPS = [
  "Active recall (testing yourself) strengthens neuropathways far better than passive reading.",
  "Spaced repetition is the key. Reviewing this deck tomorrow, in 3 days, and in a week maximizes retention.",
  "Using the 'analogies' in our Key Concepts tab leverages dual-coding theory for memorable learning.",
  "Try crossing off completed revision points. Small completions release dopamine, keeping you motivated.",
  "Teaching a custom concept to a peer is the ultimate confirmation of your high-education mastery."
];

export default function App() {
  const [inputText, setInputText] = useState("");
  const [deckTitle, setDeckTitle] = useState("My Study Session");
  const [focusOption, setFocusOption] = useState<FocusOption>("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"flashcards" | "concepts" | "notes">("flashcards");
  const [tipIndex, setTipIndex] = useState(0);

  // Saved Decks History (Persisted locally for excellent student workflow)
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>(() => {
    const saved = localStorage.getItem("ai_flashcards_saved_decks");
    return saved ? JSON.parse(saved) : [];
  });

  // Dark/Light Mode Theme Toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("ai_flashcards_theme");
    return savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ai_flashcards_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ai_flashcards_theme", "light");
    }
  }, [isDarkMode]);

  // Synchronize Saved Decks to localStorage
  useEffect(() => {
    localStorage.setItem("ai_flashcards_saved_decks", JSON.stringify(savedDecks));
  }, [savedDecks]);

  // Rotate study tips during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setInputText(preset.content);
      setDeckTitle(preset.title);
      setFocusOption(preset.option);
      setErrorMessage("");
    }
  };

  // Generate study material
  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setErrorMessage("Please enter or paste your notes first.");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setStudyData(null);
    setTipIndex(0);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputText,
          option: focusOption
        })
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Generation unsuccessful. Please retry.");
      }

      setStudyData(body);
      
      // Auto-set a reasonable title if it remains a general placeholder
      let inferredTitle = deckTitle;
      if (deckTitle === "My Study Session" || deckTitle.trim() === "") {
        const textWords = inputText.trim().split(/\s+/).slice(0, 3).join(" ");
        inferredTitle = textWords ? `${textWords}... Study Deck` : "Custom Revision Deck";
        setDeckTitle(inferredTitle);
      }

      // Add to session saved decks list
      const newSavedDeck: SavedDeck = {
        id: Date.now().toString(),
        title: inferredTitle,
        createdAt: new Date().toLocaleDateString(),
        contentLength: inputText.length,
        data: body,
        option: focusOption
      };

      setSavedDecks((prev) => [newSavedDeck, ...prev]);
      setActiveTab("flashcards");
    } catch (err: any) {
      setErrorMessage(err.message || "Network exception. Please check your network and Gemini API keys.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle checklist states for flashcard subcomponent (we propagate state back up)
  const handleToggleMastered = (idx: number) => {
    if (!studyData) return;
    const updatedCards = [...studyData.flashcards];
    updatedCards[idx] = {
      ...updatedCards[idx],
      isMastered: !updatedCards[idx].isMastered
    };
    setStudyData({
      ...studyData,
      flashcards: updatedCards
    });
  };

  const handleToggleFlag = (idx: number) => {
    if (!studyData) return;
    const updatedCards = [...studyData.flashcards];
    updatedCards[idx] = {
      ...updatedCards[idx],
      isFlagged: !updatedCards[idx].isFlagged
    };
    setStudyData({
      ...studyData,
      flashcards: updatedCards
    });
  };

  const handleResetStats = () => {
    if (!studyData) return;
    const resetCards = studyData.flashcards.map(c => ({
      ...c,
      isMastered: false,
      isFlagged: false
    }));
    setStudyData({
      ...studyData,
      flashcards: resetCards
    });
  };

  // Select a historical deck
  const handleSelectSavedDeck = (deck: SavedDeck) => {
    setStudyData(deck.data);
    setDeckTitle(deck.title);
    setFocusOption(deck.option);
    setActiveTab("flashcards");
    setErrorMessage("");
  };

  // Delete a historical deck
  const handleDeleteSavedDeck = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setSavedDecks((prev) => prev.filter((d) => d.id !== id));
  };

  // Copy entire study deck to clipboard
  const handleCopyEntireDeck = () => {
    if (!studyData) return;
    
    let text = `# Study Session: ${deckTitle}\n\n`;
    
    text += `## REVISION NOTES\n`;
    studyData.revisionNotes.forEach((note, idx) => {
      text += `${idx + 1}. ${note}\n`;
    });
    
    text += `\n## KEY CONCEPTS & TERMS\n`;
    studyData.keyConcepts.forEach((c) => {
      text += `- **${c.term}**: ${c.definition}\n  *Intuitive Explanation:* ${c.explanation}\n`;
    });
    
    text += `\n## FLASHCARDS (Q&A)\n`;
    studyData.flashcards.forEach((card, idx) => {
      text += `Q${idx + 1}: ${card.question}\nA: ${card.answer}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Download high-yield PDF using the multi-page pdfHelper
  const handleDownloadPDF = () => {
    if (!studyData) return;
    generatePDF(deckTitle, studyData);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-indigo-500/20">
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          
          {/* Logo element */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">AI Flashcard <span className="text-indigo-600">Generator</span></h1>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Demo selector label (Desktop helper) */}
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
              Need Demo Material?
            </span>
            
            {/* Quick Demo selection */}
            <div className="hidden xs:flex gap-1.5 py-1 px-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
              <button
                type="button"
                onClick={() => handleLoadPreset("biology-cells")}
                className="px-2.5 py-1 rounded text-2xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                Biology
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset("history-ww1")}
                className="px-2.5 py-1 rounded text-2xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                History
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset("cs-databases")}
                className="px-2.5 py-1 rounded text-2xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                CompSci
              </button>
            </div>

            {/* Dark & Light mode switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors shrink-0 outline-none"
              title="Toggle Light / Dark aesthetic"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN HUB WORKSPACE LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Informative banner for college students */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-indigo-50/50 dark:bg-slate-900/40 border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)]">
          <div className="flex gap-3.5 text-left">
            <span className="p-2 sm:p-2.5 bg-indigo-600 rounded-xl text-white border-2 border-slate-900 dark:border-slate-100 shrink-0 self-start mt-0.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                Turn Lecture Transcripts & Notes into Interactive Study Aids
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl font-medium">
                Our academic generator engine analyses raw educational text to compile tailored active recall 3D cards, structured concept guides, and checklist revision notes. Perfect for college homework, chapters review, or pre-exam workouts.
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Dual Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* L: CONTROL INPUT BOX / SETTINGS PANELS (Col 5) */}
          <section className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-900 dark:border-slate-100 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.95)]">
              <div className="flex justify-between items-center mb-4.5">
                <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-650 shrink-0 animate-pulse"></div>
                  1. Study Material Input
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInputText("");
                      setDeckTitle("New Study Deck");
                      setErrorMessage("");
                    }}
                    className="text-2xs font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest"
                  >
                    Clear Input
                  </button>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                
                {/* Editable Deck Title */}
                <div>
                  <label className="block text-2xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1.5 text-left">
                    Study Resource Title
                  </label>
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    placeholder="e.g. Molecular Biology Week 2 Notes"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 dark:border-slate-200 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                {/* Main Study input area */}
                <div>
                  <label className="block text-2xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1.5 text-left">
                    Paste Lecture Slides / textbook excerpts / chapter summaries
                  </label>
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your seminar concepts, raw transcriptions, markdown study notes, or textbook definitions here... (minimum 50 characters)"
                      rows={12}
                      maxLength={12000}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 dark:border-slate-200 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    ></textarea>
                    
                    {/* Character/Word Counter */}
                    <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 font-medium">
                      {inputText.trim().length === 0 ? 0 : inputText.trim().split(/\s+/).length} words | {inputText.length} chars
                    </div>
                  </div>
                </div>

                {/* Focus Option Dropdown selector */}
                <div>
                  <label className="block text-2xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1.5 text-left">
                    2. AI Focus Orientation
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFocusOption("standard")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        focusOption === "standard"
                          ? "border-indigo-500 bg-indigo-50/20 dark:bg-slate-850 dark:border-indigo-600"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 hover:dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Balanced</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Proportional card decks and points</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFocusOption("exam-prep")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        focusOption === "exam-prep"
                          ? "border-indigo-500 bg-indigo-50/20 dark:bg-slate-850 dark:border-indigo-600"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 hover:dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Exam Prep</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Heavy focus on recall & applied science</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFocusOption("summarized")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        focusOption === "summarized"
                          ? "border-indigo-500 bg-indigo-50/20 dark:bg-slate-850 dark:border-indigo-600"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 hover:dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Quick Review</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Condensed cards, high-impact cards</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFocusOption("conceptual")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        focusOption === "conceptual"
                          ? "border-indigo-500 bg-indigo-50/20 dark:bg-slate-850 dark:border-indigo-600"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 hover:dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Conceptual</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Includes analogies and rich theoretical models</div>
                    </button>
                  </div>
                </div>

                {/* Error messages block */}
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Generation stopped</p>
                      <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Primary trigger button */}
                <button
                  type="submit"
                  disabled={isGenerating || inputText.trim().length === 0}
                  className="w-full relative overflow-hidden group py-3 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-sm shadow-indigo-600/10 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:pointer-events-none outline-none select-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Analysing & Constructing Deck...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Compile AI Study Resources</span>
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>

            {/* Tiny Bento: Quick Stats */}
            <div className="border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] rounded-[2rem] bg-indigo-50/50 dark:bg-slate-900 p-5 flex items-center justify-around">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-indigo-400">{studyData ? String(studyData.flashcards.length).padStart(2, '0') : "00"}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cards</div>
              </div>
              <div className="w-px h-10 bg-indigo-200 dark:bg-slate-700"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-emerald-400">{studyData ? String(studyData.keyConcepts.length).padStart(2, '0') : "00"}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concepts</div>
              </div>
              <div className="w-px h-10 bg-indigo-200 dark:bg-slate-700"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-amber-400">{studyData ? String(studyData.revisionNotes.length).padStart(2, '0') : "00"}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revision</div>
              </div>
            </div>

            {/* 3. SESSION SAVED DECKS / HISTORY LOGS */}
            {savedDecks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-900 dark:border-slate-100 p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] text-left">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Session Saved Decks ({savedDecks.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      if (confirm("Clear study deck history? This will delete all local session caches.")) {
                        setSavedDecks([]);
                      }
                    }}
                    className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {savedDecks.map((deck) => {
                    const isActive = studyData && deckTitle === deck.title;
                    return (
                      <div
                        key={deck.id}
                        onClick={() => handleSelectSavedDeck(deck)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer group transition-all ${
                          isActive
                            ? "bg-indigo-50/30 border-indigo-200 dark:bg-slate-800/80 dark:border-indigo-900/50"
                            : "bg-slate-50/50 border-slate-100 hover:border-slate-200 dark:bg-slate-950 dark:border-slate-880 hover:dark:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <p className={`font-semibold text-slate-700 dark:text-slate-200 truncate ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
                            {deck.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                            <span>{deck.createdAt}</span>
                            <span>•</span>
                            <span className="capitalize">{deck.option === "standard" ? "Balanced" : deck.option}</span>
                            <span>•</span>
                            <span>{deck.data.flashcards.length} cards</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDeleteSavedDeck(deck.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Cache"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
          </section>

          {/* R: OUTPUT DISPLAY SECTIONS (Col 7) */}
          <section className="lg:col-span-7">
            <AnimatePresence mode="wait">
              
              {/* STATE A: Loading block */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-900 dark:border-slate-100 p-8 sm:p-12 text-center h-[520px] flex flex-col justify-center items-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.95)] relative overflow-hidden"
                >
                  {/* Subtle background glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/2 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative space-y-6 max-w-md mx-auto">
                    {/* Animated icon stack */}
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 bg-indigo-600/15 dark:bg-indigo-500/15 rounded-2xl animate-ping uppercase"></div>
                      <div className="relative w-16 h-16 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Sparkles className="w-8 h-8 animate-pulse text-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-slate-800 dark:text-white">Analyzing material with Gemini AI</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-medium">
                        Structuring complete text semantics, crafting active-recall questions, extracting central concepts, and formulating high-yield review sheets...
                      </p>
                    </div>

                    {/* Fun Progress sliding indicator */}
                    <div className="w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mx-auto overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 h-full rounded-full animate-[loading-bar_2s_infinite] w-2/3"></div>
                    </div>

                    {/* High education studying tip display */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 transition-all text-left">
                      <div className="flex gap-2.5">
                        <BookOpen className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Active Study Tip:</span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed italic">
                            "{STUDY_TIPS[tipIndex]}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STATE B: Study Content generated/rendered */}
              {!isGenerating && studyData && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  
                  {/* Result Panel Top Utilities */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border-2 border-slate-900 dark:border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-650 shrink-0"></div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                          Now Studying
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-xl mt-1 tracking-tight truncate uppercase">
                        {deckTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 justify-between sm:justify-start">
                      <button
                        onClick={handleCopyEntireDeck}
                        className={`p-2.5 rounded-xl border-2 border-slate-900 dark:border-slate-100 text-xs font-semibold select-none flex items-center gap-1.5 transition-all outline-none ${
                          copiedAll
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                            : "bg-slate-50/50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-950 dark:text-slate-300 hover:dark:bg-slate-800"
                        }`}
                        title="Copy entire guide content as clear Markdown formatted text block"
                      >
                        {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-2xs uppercase tracking-wider font-bold">Copy Deck</span>
                      </button>

                      <button
                        onClick={handleDownloadPDF}
                        className="p-2.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-sm hover:translate-y-[1px] hover:shadow-none duration-100 flex items-center justify-center gap-1.5 outline-none border-2 border-slate-900 dark:border-slate-100"
                        title="Compile and download styled multi-page PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-2xs tracking-wider font-bold">Download PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Subsection selectors (Tabs style) */}
                  <div className="flex p-1.5 rounded-3xl bg-indigo-50/40 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
                    <button
                      onClick={() => setActiveTab("flashcards")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all select-none ${
                        activeTab === "flashcards"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Flashcards</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 font-bold ml-1">
                        {studyData.flashcards.length}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("concepts")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all select-none ${
                        activeTab === "concepts"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Key Concepts</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 font-bold ml-1">
                        {studyData.keyConcepts.length}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("notes")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all select-none ${
                        activeTab === "notes"
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Revision Notes</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 font-bold ml-1">
                        {studyData.revisionNotes.length}
                      </span>
                    </button>
                  </div>

                  {/* Subsection component rendering */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-900 dark:border-slate-100 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.95)]">
                    {activeTab === "flashcards" && (
                      <FlashcardViewer 
                        flashcards={studyData.flashcards} 
                        onToggleMastered={handleToggleMastered}
                        onToggleFlag={handleToggleFlag}
                        onResetStats={handleResetStats}
                      />
                    )}

                    {activeTab === "concepts" && (
                      <KeyConceptsList concepts={studyData.keyConcepts} />
                    )}

                    {activeTab === "notes" && (
                      <RevisionNotesList notes={studyData.revisionNotes} />
                    )}
                  </div>

                </motion.div>
              )}

              {/* STATE C: Empty initial state */}
              {!isGenerating && !studyData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-900 dark:border-slate-100 p-8 sm:p-12 text-center h-[520px] flex flex-col justify-center items-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.95)] relative overflow-hidden"
                >
                  <div className="relative space-y-6 max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                      <GraduationCap className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-slate-800 dark:text-white">Workspace Empty</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                        Paste your textbook chapters, class seminar lecture slides, notes, or exam study requirements into the editor on the left and compile. Alternatively, tap one of our pre-built academic templates from the top right to explore.
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 justify-center text-xs font-semibold animate-pulse">
                        <span>A waiting study guide editor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </section>

        </div>
      </main>

      {/* 3. Sleek Simple Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-900 mt-16 bg-white dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2 text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 AI Flashcard Generator. Designed for high-yield student retention and active recall exam prep.</p>
          <p className="font-mono text-[10px]">Powered secure-server by Google Gemini 3.5 Flash Model</p>
        </div>
      </footer>

    </div>
  );
}
