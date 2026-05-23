"use client";

import type { Message } from "ai";
import { cn } from "@/utils/cn";
import { CheckIcon, ClipboardIcon, Pin } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources?: any;
  onPinDesign?: (imageUrl: string, description: string) => void;
  uploadedImages?: {[key: string]: string};
}) {
  const isUser = props.message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(props.message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if the message content contains an image URL or uploaded image
  const containsImageUrl = props.message.content.includes('https://replicate.delivery') ||
                          props.message.content.includes('http://') ||
                          props.message.content.includes('https://');

  let displayContent = props.message.content;
  let imageUrl = null;
  let uploadedImageData = null;

  // Check for uploaded images first [IMAGE:id]
  const uploadedImageMatch = props.message.content.match(/\[IMAGE:(\d+)\]/);
  if (uploadedImageMatch && props.uploadedImages) {
    const imageId = uploadedImageMatch[1];
    uploadedImageData = props.uploadedImages[imageId];
    if (uploadedImageData) {
      // Remove the [IMAGE:id] part from display content
      displayContent = displayContent.replace(/\[IMAGE:\d+\]\s*/, '');
    }
  }

  // If no uploaded image, check for external URLs
  if (!uploadedImageData) {
    // Extract ALL URLs first, regardless of format
    const allUrls = props.message.content.match(/https?:\/\/\S+/g) || [];

    // Find the first image URL (replicate.delivery or other image URLs)
    const foundImageUrl = allUrls.find(url => 
      url.includes('replicate.delivery') || 
      url.includes('imgur.com') ||
      url.includes('cloudinary.com') ||
      url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
    );

    if (foundImageUrl) {
      imageUrl = foundImageUrl.replace(/[.,:;!?()]$/, ''); // Clean trailing punctuation
      
      // Remove the URL from display content
      displayContent = displayContent.replace(foundImageUrl, '');
    }
  }

  // Remove ALL markdown image syntax - both with and without URLs
  displayContent = displayContent.replace(/!\[.*?\]\([^)]*\)/g, '');
  
  // Clean up any remaining broken markdown syntax
  displayContent = displayContent.replace(/\[.*?\]\(\s*\)/g, '');
  
  // Clean up any leftover markdown pieces
  displayContent = displayContent.replace(/!\[.*?\]\(/g, '');
  displayContent = displayContent.replace(/\]\(\s*$/g, '');

  // Clean up extra whitespace
  displayContent = displayContent.trim();

  return (
    <div className={cn(
      "flex gap-3 lg:gap-4 p-3 lg:p-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full bg-gray-700 border border-gray-600 relative">
          {/* Subtle ink effect without emoji */}
          <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full opacity-60"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gradient-to-b from-gray-400 to-transparent opacity-20"></div>
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%] lg:max-w-[70%] rounded-2xl px-3 lg:px-4 py-3 relative",
        isUser 
          ? "bg-gray-700 text-white" 
          : "bg-gray-800/30 border border-gray-700/30 text-gray-100"
      )}>
        {/* Subtle ink accent */}
        {!isUser && <div className="absolute top-2 right-2 w-1 h-1 bg-gray-400 rounded-full opacity-10"></div>}
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-200 font-serif">
            {isUser ? "You" : "Taetu"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 lg:h-6 lg:w-6 p-0 opacity-70 hover:opacity-100 active:opacity-100 text-gray-300 hover:text-gray-200 touch-manipulation"
          >
            {copied ? (
              <CheckIcon className="h-3 w-3" />
            ) : (
              <ClipboardIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        <div className="prose prose-sm max-w-none text-pretty leading-relaxed">
          {displayContent && (
            <div className="whitespace-pre-wrap break-words">
              {displayContent}
            </div>
          )}
          
          {(imageUrl || uploadedImageData) && (
            <div className="mt-3 relative group">
              <img
                src={uploadedImageData || imageUrl || ''}
                alt={uploadedImageData ? "Uploaded image" : "Generated tattoo design"}
                className="max-w-full h-auto rounded-xl shadow-2xl border border-gray-600/30"
                style={{ maxHeight: '400px' }}
              />
              {props.onPinDesign && !isUser && (imageUrl || uploadedImageData) && (
                <>
                  {/* Mobile: Always visible pin button */}
                  <button
                    onClick={() => props.onPinDesign!(uploadedImageData || imageUrl || '', displayContent || (uploadedImageData ? "Uploaded image" : "Generated tattoo design"))}
                    className="lg:hidden absolute top-2 right-2 bg-gray-700/90 hover:bg-gray-600 active:bg-gray-800 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors touch-manipulation"
                    title="Pin this design"
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  
                  {/* Desktop: Hover to reveal pin button */}
                  <button
                    onClick={() => props.onPinDesign!(uploadedImageData || imageUrl || '', displayContent || (uploadedImageData ? "Uploaded image" : "Generated tattoo design"))}
                    className="hidden lg:flex absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 items-center gap-1 font-serif"
                    title="Pin this design"
                  >
                    <Pin className="w-4 h-4" />
                    <span className="text-xs hidden group-hover:inline">Pin</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {props.sources && props.sources.length ? (
          <div className="mt-3 pt-3 border-t border-gray-700/30">
            <div className="text-xs text-gray-300 mb-2 font-medium">Sources:</div>
            <div className="text-xs text-gray-400 space-y-1">
              {props.sources?.map((source: any, i: number) => (
                <div key={"source:" + i}>
                  {i + 1}. &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined
                    ? ` (lines ${source.metadata?.loc?.lines?.from} to ${source.metadata?.loc?.lines?.to})`
                    : ""}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 border border-gray-500 relative">
          <span className="text-base lg:text-lg">🧑‍💼</span>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-gradient-to-b from-gray-300 to-transparent opacity-15"></div>
        </div>
      )}
    </div>
  );
} 