import React, { useState, useEffect } from "react";
import { BadgeCheck, HelpCircle, XCircle, ChevronRight, Award, Lock, ArrowRight } from "lucide-react";
import { QuizQuestion } from "../types";

interface QuizProps {
  quizList: QuizQuestion[];
  chapterTitle: string;
  onUnlockBadge: (badgeName: string) => void;
  unlockedBadges: string[];
}

export default function QuizPanel({ quizList, chapterTitle, onUnlockBadge, unlockedBadges }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Reset states when the quiz data changes
  useEffect(() => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setQuizScore(0);
    setQuizComplete(false);
  }, [quizList]);

  if (!quizList || quizList.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[420px]" id="quiz-panel">
        <Lock className="h-8 w-8 text-slate-600 mb-2" />
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">Assigned Chapters</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
          No quizzes assigned to this section yet. Play the video chapters to unlock test units!
        </p>
      </div>
    );
  }

  const currentQuestion = quizList[currentIdx];

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsSubmitted(true);
    if (selectedOpt === currentQuestion.correctIndex) {
      setQuizScore((v) => v + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsSubmitted(false);

    if (currentIdx < quizList.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Finished all quiz items!
      setQuizComplete(true);
      const passRate = (quizScore + (selectedOpt === currentQuestion.correctIndex ? 1 : 0)) / quizList.length;
      if (passRate >= 0.5) {
        // Unlock badge!
        const cleanName = `${chapterTitle.split(":")[0]} Specialist`;
        onUnlockBadge(cleanName);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setQuizScore(0);
    setQuizComplete(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-[525px] justify-between shadow-xl" id="quiz-panel">
      {/* Quiz Header info */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-bold">Chapter Evaluation</span>
          <h3 className="text-sm font-bold text-slate-100 truncate max-w-xs">{chapterTitle}</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-950 border border-slate-800 rounded-full px-2.5 py-0.5 font-mono">
          {!quizComplete ? `${currentIdx + 1} / ${quizList.length}` : "Finished"}
        </span>
      </div>

      {/* Main quiz question block */}
      {!quizComplete ? (
        <div className="flex-grow flex flex-col justify-between py-4 select-none min-h-0">
          <div className="overflow-y-auto pr-1 flex-1 flex flex-col justify-start">
            <h4 className="text-sm text-slate-200 font-medium font-sans leading-relaxed mb-4 flex gap-2">
              <HelpCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{currentQuestion.question}</span>
            </h4>

            {/* Answer Options Radio Rows */}
            <div className="flex flex-col gap-2.5">
              {currentQuestion.options.map((opt, i) => {
                let optionStyle = "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900";
                
                if (selectedOpt === i) {
                  optionStyle = "bg-indigo-950/70 border-indigo-600 text-indigo-300 font-semibold";
                }

                if (isSubmitted) {
                  if (i === currentQuestion.correctIndex) {
                    optionStyle = "bg-emerald-950/90 border-emerald-500 text-emerald-300 font-bold shadow shadow-emerald-950/40";
                  } else if (selectedOpt === i) {
                    optionStyle = "bg-rose-950/90 border-rose-500 text-rose-300 line-through decoration-rose-400";
                  } else {
                    optionStyle = "bg-slate-950/60 border-slate-800/40 text-slate-500 pointer-events-none";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => !isSubmitted && setSelectedOpt(i)}
                    disabled={isSubmitted}
                    className={`p-3 rounded-xl border text-left text-xs font-sans tracking-tight transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                  >
                    <span>{opt}</span>
                    {isSubmitted && i === currentQuestion.correctIndex && <BadgeCheck className="h-4 w-4 text-emerald-400 shrink-0" />}
                    {isSubmitted && selectedOpt === i && i !== currentQuestion.correctIndex && <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ahmad's Live explanation box on submit */}
          {isSubmitted && (
            <div className="mt-4 p-3 bg-slate-950/90 rounded-xl border border-slate-800/80 animate-fade-in flex flex-col gap-1.5 select-text">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Ahmad's Feedback</span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-4 shrink-0">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOpt === null}
                className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs flex justify-center items-center gap-1.5 transition-all ${
                  selectedOpt !== null 
                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10" 
                    : "bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed"
                }`}
              >
                SUBMIT ASSIGNMENT <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-2.5 rounded-xl font-bold font-sans text-xs bg-indigo-600 hover:bg-indigo-500 text-slate-100 flex justify-center items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10"
              >
                {currentIdx < quizList.length - 1 ? "NEXT EXERCISE" : "FINISH TEST"} <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Evaluation report / Completion stats */
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="h-16 w-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg shadow-emerald-950/20 mb-4 animate-bounce">
            <Award className="h-9 w-9" />
          </div>

          <h3 className="text-base font-bold text-slate-100">Chapter Evaluation Completed!</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
            You scored <span className="font-bold text-emerald-400">{quizScore} out of {quizList.length}</span>!
          </p>

          {/* Display Badge unlocking feedback */}
          {quizScore / quizList.length >= 0.5 ? (
            <div className="mt-4 p-3.5 bg-slate-950 border border-emerald-950/65 rounded-xl flex items-center gap-3 max-w-sm">
              <div className="h-9 w-9 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-800">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold block">Badge Milestone</span>
                <span className="text-xs text-slate-200 font-bold font-sans">{chapterTitle} Specialist unlocked!</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-400/90 mt-4 max-w-xs italic">
              Score at least 50% to secure your official Academy credential. Ahmad suggests rewatching the core timeline chapters.
            </p>
          )}

          <div className="grid grid-cols-1 w-full gap-2 mt-6">
            <button
              onClick={handleRestart}
              className="py-2 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs transition-all w-full"
            >
              Replay Exam Unit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
