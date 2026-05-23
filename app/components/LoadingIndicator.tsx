"use client";

import { useState, useEffect } from "react";

interface LoadingIndicatorProps {
  isGenerating: boolean;
  estimatedTime?: number;
}

export function LoadingIndicator({ isGenerating, estimatedTime = 30 }: LoadingIndicatorProps) {
  const [elapsed, setElapsed] = useState(0);
  const [loadingText, setLoadingText] = useState("Preparing your tattoo design...");

  useEffect(() => {
    if (!isGenerating) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;

    const texts = [
      "Preparing your tattoo design...",
      "Channeling gothic inspiration...", 
      "Crafting intricate details...",
      "Adding artistic touches...",
      "Almost ready...",
    ];

    const textInterval = setInterval(() => {
      const textIndex = Math.min(Math.floor(elapsed / 5), texts.length - 1);
      setLoadingText(texts[textIndex]);
    }, 1000);

    return () => clearInterval(textInterval);
  }, [elapsed, isGenerating]);

  if (!isGenerating) return null;

  const progress = Math.min((elapsed / estimatedTime) * 100, 95);

  return (
    <div className="flex flex-col items-center gap-3 lg:gap-4 p-4 lg:p-6 bg-gray-800/20 border border-gray-700/30 rounded-2xl relative">
      {/* Subtle ink drips */}
      <div className="absolute top-2 right-4 w-0.5 h-3 bg-gradient-to-b from-gray-400 to-transparent opacity-15"></div>
      <div className="absolute bottom-4 left-6 w-0.5 h-2 bg-gradient-to-b from-gray-300 to-transparent opacity-10"></div>
      
      <div className="w-12 h-12 lg:w-16 lg:h-16 relative">
        <div className="absolute inset-0 border-3 lg:border-4 border-gray-800/30 rounded-full"></div>
        <div 
          className="absolute inset-0 border-3 lg:border-4 border-gray-500 rounded-full border-t-transparent animate-spin"
          style={{ 
            background: `conic-gradient(from 0deg, transparent ${360 - progress * 3.6}deg, rgba(107, 114, 128, 0.3) 0deg)`
          }}
        ></div>
        <div className="absolute inset-3 lg:inset-4 flex items-center justify-center relative">
          {/* Subtle ink effect without emoji */}
          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full opacity-60"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gradient-to-b from-gray-400 to-transparent opacity-20"></div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-200 font-medium mb-2 text-sm lg:text-base font-serif">{loadingText}</p>
        <div className="w-48 lg:w-64 h-2 bg-gray-900/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gray-600 to-gray-400 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-gray-300 text-xs lg:text-sm mt-2 font-serif">
          {elapsed}s / ~{estimatedTime}s
        </p>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-xs lg:text-sm">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
        <span className="text-center font-serif italic">Crafting with liquid ink artistry</span>
      </div>
    </div>
  );
} 