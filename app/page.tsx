"use client";

import React from "react";
import { ChatWindow } from "@/app/components/ChatWindow";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { getTheme } from "@/app/themes";

const theme = getTheme();

interface PinnedDesign {
  id: string;
  imageUrl: string;
  description: string;
  timestamp: number;
}

export default function TattooConsultantPage() {
  const [pinnedDesigns, setPinnedDesigns] = useState<PinnedDesign[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(450); // Default width in pixels - roughly 25% of screen
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePinDesign = (imageUrl: string, description: string) => {
    const newDesign: PinnedDesign = {
      id: Date.now().toString(),
      imageUrl,
      description,
      timestamp: Date.now(),
    };
    setPinnedDesigns(prev => [newDesign, ...prev]);
  };

  const handleDownloadDesign = async (imageUrl: string, description: string) => {
    try {
      toast.success('Starting download...', {
        description: description.slice(0, 50) + (description.length > 50 ? '...' : ''),
      });
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename from description
      const filename = `tattoo-design-${description.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.jpg`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
      
      toast.success('Download complete!', {
        description: `Saved as ${filename}`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed', {
        description: 'Unable to download the image. Please try again.',
      });
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newSidebarWidth = containerRect.right - e.clientX;
    
    // Set min and max width constraints
    const minWidth = 280;
    const maxWidth = Math.min(600, containerRect.width * 0.6);
    
    setSidebarWidth(Math.max(minWidth, Math.min(maxWidth, newSidebarWidth)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const suggestedPrompts = [
    {
      title: "Design a New Tattoo",
      prompt: "I want a tattoo design with a Japanese dragon wrapping around my forearm. Make it bold and detailed with traditional elements."
    },
    {
      title: "Understand Tattoo Meaning",
      prompt: "What does a koi fish swimming upstream symbolize? I want to understand the cultural significance before getting this tattoo."
    },
    {
      title: "Modify Existing Design",
      prompt: "I have this rose tattoo but want to add more shading and make the petals look more realistic. Can you help me visualize the changes?"
    },
    {
      title: "Cover-Up Solution",
      prompt: "I need to cover up an old tribal tattoo on my shoulder. Can you design something that would work as a cover-up?"
    },
    {
      title: "Style Transformation",
      prompt: "Take this simple butterfly design and transform it into a realistic black and grey style suitable for my wrist."
    },
    {
      title: "Placement Ideas",
      prompt: "I want a meaningful quote tattoo but I'm not sure about placement. Show me how it would look on different parts of my body."
    }
  ];

  const handleDownloadAll = async () => {
    if (pinnedDesigns.length === 0) return;
    
    toast.info(`Starting bulk download`, {
      description: `Downloading ${pinnedDesigns.length} tattoo designs...`,
    });
    
    for (let i = 0; i < pinnedDesigns.length; i++) {
      const design = pinnedDesigns[i];
      await handleDownloadDesign(design.imageUrl, design.description);
      // Small delay between downloads to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    toast.success('All downloads complete!', {
      description: `Successfully downloaded ${pinnedDesigns.length} tattoo designs.`,
    });
  };

  const PinnedDesigns = (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 lg:p-6 mb-4 lg:mb-6 relative">
      {/* Subtle ink accent */}
      <div className="absolute top-4 right-8 w-1 h-2 bg-gradient-to-b from-gray-400 to-transparent opacity-15 rounded-full"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="text-gray-300">📌</div>
        <h3 className="text-lg font-semibold text-white font-serif">Pinned Designs</h3>
        <div className="bg-gray-800/50 text-gray-300 text-xs px-2 py-1 rounded-full ml-auto font-serif">{pinnedDesigns.length}</div>
      </div>
      
      {pinnedDesigns.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleDownloadAll}
            className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white text-sm px-3 py-3 lg:py-2 rounded-lg flex items-center justify-center gap-2 transition-colors touch-manipulation font-serif"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download All ({pinnedDesigns.length})</span>
          </button>
        </div>
      )}
      
      {pinnedDesigns.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center relative">
            {/* Subtle ink drip */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-gray-400 to-transparent opacity-20"></div>
            
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-800/30 flex items-center justify-center">
              <div className="animate-spin text-gray-400">⚫</div>
            </div>
            <p className="text-sm font-serif italic">Your pinned tattoo designs will appear here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 lg:space-y-4 max-h-60 lg:max-h-80 overflow-y-auto">
          {pinnedDesigns.map((design) => (
            <div key={design.id} className="bg-gray-800/20 border border-gray-700/30 rounded-lg overflow-hidden group relative">
              {/* Subtle ink drip on each design */}
              <div className="absolute top-1 right-3 w-0.5 h-2 bg-gradient-to-b from-gray-400 to-transparent opacity-10"></div>
              
              <div className="relative">
                <img
                  src={design.imageUrl}
                  alt={design.description}
                  className="w-full h-28 lg:h-24 object-cover"
                />
                {/* Mobile: Always visible buttons below image */}
                <div className="lg:hidden absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleDownloadDesign(design.imageUrl, design.description)}
                    className="bg-gray-700/90 hover:bg-gray-600 active:bg-gray-800 text-white p-2 rounded-full transition-colors touch-manipulation backdrop-blur-sm"
                    title="Download design"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPinnedDesigns(prev => prev.filter(d => d.id !== design.id))}
                    className="bg-red-600/90 hover:bg-red-500 active:bg-red-700 text-white p-2 rounded-full transition-colors touch-manipulation backdrop-blur-sm"
                    title="Remove from pinned"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {/* Desktop: Hover overlay */}
                <div className="hidden lg:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
                  <button
                    onClick={() => handleDownloadDesign(design.imageUrl, design.description)}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-colors font-serif"
                    title="Download design"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setPinnedDesigns(prev => prev.filter(d => d.id !== design.id))}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-colors font-serif"
                    title="Remove from pinned"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
              
              {/* Mobile: Action buttons below image */}
              <div className="lg:hidden flex gap-2 p-3">
                <button
                  onClick={() => handleDownloadDesign(design.imageUrl, design.description)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors touch-manipulation font-serif"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setPinnedDesigns(prev => prev.filter(d => d.id !== design.id))}
                  className="bg-red-600/80 hover:bg-red-500 active:bg-red-700 text-white p-2 rounded-lg transition-colors touch-manipulation"
                  title="Remove"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="p-3 lg:p-2">
                <p className="text-xs text-gray-300 truncate font-serif">{design.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const InstagramGallery = (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 lg:p-6 mb-4 lg:mb-6 relative">
      {/* Subtle ink accent */}
      <div className="absolute top-6 right-6 w-0.5 h-4 bg-gradient-to-b from-gray-400 to-transparent opacity-15"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="text-gray-300">📸</div>
        <h3 className="text-base lg:text-lg font-semibold text-white font-serif">{theme.name === 'Dreadmoor' ? 'Dreadmoor Gallery' : "Tae'Tu Artist Gallery"}</h3>
        <a 
          href={theme.name === 'Dreadmoor' ? 'https://www.instagram.com/dreadmoortattoo/' : 'https://www.instagram.com/taetu_artist/'}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-200 transition-colors ml-auto"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </div>
      
      {/* Instagram embed widget */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg">
          <iframe
            src={theme.name === 'Dreadmoor' 
              ? 'https://www.instagram.com/dreadmoortattoo/embed' 
              : 'https://www.instagram.com/taetu_artist/embed'}
            width="100%"
            height="480"
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
            className="border-0"
          />
        </div>
        
        <a 
          href={theme.name === 'Dreadmoor' ? 'https://www.instagram.com/dreadmoortattoo/' : 'https://www.instagram.com/taetu_artist/'}
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full text-center text-gray-300 hover:text-gray-200 active:text-white text-sm py-3 lg:py-2 transition-colors block touch-manipulation bg-gray-800/30 hover:bg-gray-700/40 rounded-lg border border-gray-700/30 font-serif relative"
        >
          {/* Subtle ink accent */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-gray-400 to-transparent opacity-20"></div>
          Follow {theme.name === 'Dreadmoor' ? '@dreadmoortattoo' : '@taetu_artist'}
        </a>
      </div>
    </div>
  );

  const CareProducts = (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 lg:p-6 relative">
      {/* Subtle ink accent */}
      <div className="absolute top-6 left-4 w-0.5 h-3 bg-gradient-to-b from-gray-400 to-transparent opacity-15"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="text-gray-300">✨</div>
        <h3 className="text-base lg:text-lg font-semibold text-white font-serif">Recommended Care Products</h3>
      </div>
      <div className="space-y-3 lg:space-y-4">
        {/* Product 1 */}
        <div className="bg-gray-800/20 rounded-lg border border-gray-700/20 overflow-hidden relative">
          {/* Subtle ink drip */}
          <div className="absolute top-2 right-4 w-0.5 h-2 bg-gradient-to-b from-gray-400 to-transparent opacity-10"></div>
          
          <div className="flex flex-col sm:flex-row gap-3 p-3 lg:p-4">
            <img 
              src="https://static.wixstatic.com/media/6c881d_c4ef5f48707949d6975b7c73d3eeef9b~mv2.png/v1/fill/w_465,h_840,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/6c881d_c4ef5f48707949d6975b7c73d3eeef9b~mv2.png"
              alt="5.0 oz Tattoo Aftercare & Protectant"
              className="w-full sm:w-16 lg:w-20 h-24 sm:h-16 lg:h-20 object-cover rounded-lg border border-gray-600/30 flex-shrink-0"
            />
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-white font-medium text-sm lg:text-base leading-tight font-serif">5.0 oz Tattoo Aftercare & Protectant</h4>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed font-serif">Professional-grade antimicrobial protection</p>
                <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
                  <span>⭐</span>
                  <span>4.9</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-300 font-bold text-base lg:text-lg font-serif">$40.00</p>
                <a 
                  href="https://www.taetullc.com/product-page/5-0-oz-tattoo-aftercare-amp-protectant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white text-xs lg:text-sm px-4 py-2 lg:px-3 lg:py-1 rounded-full transition-colors touch-manipulation font-serif"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product 2 */}
        <div className="bg-gray-800/20 rounded-lg border border-gray-700/20 overflow-hidden relative">
          {/* Subtle ink drip */}
          <div className="absolute top-3 left-6 w-0.5 h-1.5 bg-gradient-to-b from-gray-300 to-transparent opacity-15"></div>
          
          <div className="flex flex-col sm:flex-row gap-3 p-3 lg:p-4">
            <img 
              src="https://static.wixstatic.com/media/66cf45_e2de28b09b2440a886a137949efa5ce3~mv2.png/v1/fill/w_630,h_840,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/66cf45_e2de28b09b2440a886a137949efa5ce3~mv2.png"
              alt="Tae Tu Adhesive Healing Bandage"
              className="w-full sm:w-16 lg:w-20 h-24 sm:h-16 lg:h-20 object-cover rounded-lg border border-gray-600/30 flex-shrink-0"
            />
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-white font-medium text-sm lg:text-base leading-tight font-serif">Tae Tu Adhesive Healing Bandage</h4>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed font-serif">Waterproof, breathable, transparent protection</p>
                <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
                  <span>⭐</span>
                  <span>4.8</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-300 font-bold text-base lg:text-lg font-serif">$24.95</p>
                <a 
                  href="https://www.taetullc.com/product-page/tae-tu-adhesive-healing-bandage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white text-xs lg:text-sm px-4 py-2 lg:px-3 lg:py-1 rounded-full transition-colors touch-manipulation font-serif"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <a 
          href="https://www.taetullc.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center text-gray-300 hover:text-gray-200 active:text-white text-sm py-3 lg:py-2 transition-colors block touch-manipulation bg-gray-800/30 hover:bg-gray-700/40 rounded-lg border border-gray-700/30 font-serif relative"
        >
          {/* Subtle ink accent */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-gray-400 to-transparent opacity-20"></div>
          View All Products
        </a>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row h-[calc(100vh-56px-48px)] sm:h-[calc(100vh-64px-48px)]">
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden border-b border-gray-700/30 p-3 sm:p-4 flex-shrink-0 bg-black/20 backdrop-blur-sm relative">
        {/* Subtle ink accent */}
        <div className="absolute bottom-0 left-8 w-6 h-0.5 bg-gradient-to-r from-gray-400 to-transparent opacity-20"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-gray-300">🖋️</div>
            <h2 className="text-base sm:text-lg font-semibold text-white font-serif">Taetu - your AI creative consultant</h2>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-lg bg-gray-800/50 border border-gray-600/30 text-gray-200 hover:bg-gray-700/50 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Desktop Header */}
        <div className="hidden lg:block border-b border-gray-700/30 p-4 flex-shrink-0 bg-black/10 backdrop-blur-sm relative">
          {/* Subtle ink accent */}
          <div className="absolute bottom-0 left-12 w-8 h-0.5 bg-gradient-to-r from-gray-400 to-transparent opacity-20"></div>
          
          <div className="flex items-center gap-2">
            <div className="text-gray-300">🖋️</div>
            <h2 className="text-lg font-semibold text-white font-serif">Taetu - your AI creative consultant</h2>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ChatWindow
            endpoint="/api/chat"
            emoji="💀"
            placeholder="Describe your next artwork..."
            emptyStateComponent={<div />}
            onPinDesign={handlePinDesign}
            suggestedPrompts={suggestedPrompts}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-black/95 backdrop-blur-sm border-l border-gray-700/30 z-50 overflow-y-auto">
              <div className="p-4 relative">
                {/* Subtle ink drips */}
                <div className="absolute top-8 right-12 w-0.5 h-4 bg-gradient-to-b from-gray-400 to-transparent opacity-20"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white font-serif">Designs & Products</h3>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-2 rounded-lg bg-gray-800/50 border border-gray-600/30 text-gray-200 hover:bg-gray-700/50 transition-colors"
                    aria-label="Close sidebar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {PinnedDesigns}
                {InstagramGallery}
                {CareProducts}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Resize Handle */}
      <div 
        className={`hidden lg:block w-1 bg-purple-700/20 hover:bg-purple-600/40 cursor-col-resize flex-shrink-0 relative group transition-colors duration-200 ${
          isResizing ? 'bg-purple-600/60' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
          <div className="w-1 h-8 bg-purple-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div 
        className="hidden lg:block p-6 border-l border-gray-700/30 bg-black/20 backdrop-blur-sm flex-shrink-0 overflow-y-auto relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Subtle ink drips */}
        <div className="absolute top-12 left-4 w-0.5 h-6 bg-gradient-to-b from-gray-400 to-transparent opacity-15"></div>
        <div className="absolute top-32 right-8 w-0.5 h-3 bg-gradient-to-b from-gray-300 to-transparent opacity-10"></div>
        
        {PinnedDesigns}
        {InstagramGallery}
        {CareProducts}
      </div>
    </div>
  );
}
