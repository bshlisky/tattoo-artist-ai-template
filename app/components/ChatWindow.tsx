"use client";

import { type Message } from "ai";
import { useChat } from "ai/react";
import React, { useState, useEffect, useRef } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";

import { ChatMessageBubble } from "@/app/components/ChatMessageBubble";
import { LoadingIndicator } from "@/app/components/LoadingIndicator";
import { Button } from "./ui/button";
import { LoaderCircle, Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import { getTheme } from "@/app/themes";

const theme = getTheme();

// Check if message is likely to trigger image generation
function isImageGenerationMessage(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  const imageKeywords = [
    'design', 'create', 'generate', 'show me', 'make', 'draw',
    'image', 'picture', 'sketch', 'visualize',
    // Modification keywords
    'adjust', 'modify', 'alter', 'make it', 'do it', 'instead',
    'more colorful', 'add shading', 'brighter', 'darker',
    // Cover-up keywords  
    'cover up', 'cover-up', 'hide this', 'transform this', 'turn this into',
    'redesign', 'incorporate',
  ];
  
  // Check for uploaded image reference
  const hasUploadedImage = lowerContent.includes('[image:') || lowerContent.includes('temp_image:');
  
  // Check for image-related keywords
  const hasImageKeyword = imageKeywords.some(keyword => lowerContent.includes(keyword));
  
  return hasUploadedImage || hasImageKeyword;
}

function ChatMessages(props: {
  messages: Message[];
  emptyStateComponent: ReactNode;
  sourcesForMessages: Record<string, any>;
  aiEmoji?: string;
  className?: string;
  onPinDesign?: (imageUrl: string, description: string) => void;
  isLoading?: boolean;
  uploadedImages?: {[key: string]: string};
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [props.messages, props.isLoading]);

  // Auto-scroll during streaming (when last message is being updated)
  useEffect(() => {
    if (props.messages.length > 0) {
      const lastMessage = props.messages[props.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Small delay to ensure content is rendered before scrolling
        const timeoutId = setTimeout(() => {
          scrollToBottom();
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [props.messages.length > 0 ? props.messages[props.messages.length - 1]?.content : null]);

  // Determine if we're waiting for an image generation
  const lastUserMessage = props.messages.filter(m => m.role === 'user').pop();
  const isWaitingForImage = props.isLoading && lastUserMessage && isImageGenerationMessage(lastUserMessage.content);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 lg:p-6">
      {props.messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          {props.emptyStateComponent}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-2 lg:space-y-4">
          {props.messages.map((m, i) => {
            const sourceKey = (props.messages.length - 1 - i).toString();
            return (
              <ChatMessageBubble
                key={m.id}
                message={m}
                aiEmoji={props.aiEmoji}
                sources={props.sourcesForMessages[sourceKey]}
                onPinDesign={props.onPinDesign}
                uploadedImages={props.uploadedImages}
              />
            );
          })}
          
          {/* Show image generation loading indicator only for image requests */}
          {isWaitingForImage && (
            <div className="flex justify-start">
              <div className="max-w-[85%] lg:max-w-[70%]">
                <LoadingIndicator 
                  isGenerating={true} 
                  estimatedTime={60} 
                />
              </div>
            </div>
          )}
          
          {/* Show simple typing indicator for text-only responses */}
          {props.isLoading && !isWaitingForImage && (
            <div className="flex gap-3 lg:gap-4 p-3 lg:p-4 justify-start">
              <div className="flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full bg-gray-700 border border-gray-600 relative">
                <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full opacity-60"></div>
              </div>
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

export function ChatInput(props: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onStop?: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  placeholder?: string;
  children?: ReactNode;
  className?: string;
  actions?: ReactNode;
  onImageUpload?: (file: File) => void;
  pendingImage?: { file: File; preview: string } | null;
  onRemovePendingImage?: () => void;
}) {
  const disabled = props.loading && props.onStop == null;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && props.onImageUpload) {
      props.onImageUpload(file);
    }
    // Clear the file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file && props.onImageUpload) {
          props.onImageUpload(file);
        }
        break;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Trigger form submission
      const form = e.currentTarget.closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  return (
    <div className="p-3 lg:p-6 border-t border-gray-700/30 bg-black/20 backdrop-blur-sm relative">
      {/* Subtle ink drip */}
      <div className="absolute top-0 left-1/4 w-0.5 h-2 bg-gradient-to-b from-gray-400 to-transparent opacity-15"></div>
      
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();

          if (props.loading) {
            props.onStop?.();
          } else {
            props.onSubmit(e);
          }
        }}
        className={cn("flex w-full flex-col", props.className)}
      >
        {/* Image Preview */}
        {props.pendingImage && (
          <div className="mb-3 bg-purple-900/20 border border-purple-600/30 rounded-xl p-3 relative animate-pulse">
            {/* Subtle ink drip */}
            <div className="absolute top-2 right-8 w-0.5 h-2 bg-gradient-to-b from-purple-400 to-transparent opacity-20"></div>
            
            <div className="flex items-start gap-3">
              <div className="relative">
                <img
                  src={props.pendingImage.preview}
                  alt="Pending upload"
                  className="w-16 h-16 object-cover rounded-lg border border-purple-600/30 shadow-lg"
                />
                <button
                  onClick={props.onRemovePendingImage}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors touch-manipulation"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-purple-200 font-serif font-medium">📎 Image Ready to Send</p>
                <p className="text-xs text-gray-400 truncate">{props.pendingImage.file.name}</p>
                <p className="text-xs text-purple-300 font-serif italic">Type your request and hit send</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-600/30 rounded-2xl flex items-center gap-2 lg:gap-3 p-3 lg:p-4 relative">
          {/* Subtle ink accent in input */}
          <div className="absolute top-2 right-4 w-1 h-1 bg-gray-400 rounded-full opacity-10"></div>
          
          <input
            ref={inputRef}
            value={props.value}
            placeholder={props.pendingImage ? "Describe what you want to do with this image..." : props.placeholder}
            onChange={props.onChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            className="flex-1 border-none outline-none bg-transparent text-gray-100 placeholder-gray-400 text-base lg:text-sm min-h-[44px] lg:min-h-0 py-2 lg:py-0 font-serif"
          />

          <div className="flex gap-1 lg:gap-2 items-center">
            {/* Image Upload Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-gray-300 hover:text-gray-200 active:text-white hover:bg-gray-700/30 active:bg-gray-700/50 p-2 lg:p-1 h-11 w-11 lg:h-auto lg:w-auto touch-manipulation"
            >
              <Upload className="size-5 lg:size-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button 
              type="submit" 
              disabled={disabled}
              className={cn(
                "text-white px-4 lg:px-6 py-3 lg:py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-base lg:text-sm min-h-[44px] lg:min-h-0 touch-manipulation font-serif",
                props.pendingImage 
                  ? "bg-purple-700 hover:bg-purple-600 active:bg-purple-800" 
                  : "bg-gray-700 hover:bg-gray-600 active:bg-gray-800"
              )}
            >
              {props.loading ? (
                <LoaderCircle className="animate-spin size-5 lg:size-4" />
              ) : (
                <>
                  <span>{props.pendingImage ? "📎" : "🖋️"}</span>
                  <span>{props.pendingImage ? "Send with Image" : "Send"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}



export function ChatWindow(props: {
  endpoint: string;
  emptyStateComponent: ReactNode;
  placeholder?: string;
  emoji?: string;
  onPinDesign?: (imageUrl: string, description: string) => void;
  suggestedPrompts?: Array<{title: string; prompt: string}>;
}) {
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [uploadedImages, setUploadedImages] = useState<{[key: string]: string}>({});
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);

  const chat = useChat({
    api: props.endpoint,
    body: {
      uploadedImages: uploadedImages,
    },
    onResponse(response) {
      const sourcesHeader = response.headers.get("x-sources");
      const sources = sourcesHeader
        ? JSON.parse(Buffer.from(sourcesHeader, "base64").toString("utf8"))
        : [];

      const messageIndexHeader = response.headers.get("x-message-index");
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    streamMode: "text",
    onFinish: () => {
      // Response complete - useChat handles loading state automatically
    },
    onError: (e) => {
      toast.error(`Error while processing your request`, {
        description: e.message,
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      // Convert file to data URL for preview
      const dataURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Set as pending image instead of immediately sending
      setPendingImage({ file, preview: dataURL });
      toast.success("Image attached! Type your request and hit send.");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    }
  };

  const handleRemovePendingImage = () => {
    setPendingImage(null);
  };

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (chat.isLoading) return;
    
    // Handle pending image if present
    if (pendingImage) {
      try {
        // Store the image
        const imageId = Date.now().toString();
        setUploadedImages(prev => ({ ...prev, [imageId]: pendingImage.preview }));
        
        // Create message with image and text
        const textContent = chat.input.trim();
        const imageMessage = `[IMAGE:${imageId}] ${pendingImage.file.name}${textContent ? `\n\n${textContent}` : ''}`;
        
        // Clear pending image and input
        setPendingImage(null);
        
        // Send message with image
        chat.append({
          role: "user",
          content: imageMessage,
        });

        // Clear the input
        chat.setInput('');
        return;
      } catch (error) {
        console.error('Error sending image:', error);
        toast.error("Failed to send image");
        return;
      }
    }
    
    chat.handleSubmit(e);
  }

  // Create enhanced empty state component with suggested prompts
  const enhancedEmptyStateComponent = props.suggestedPrompts ? (
    <div className="flex flex-col items-center justify-center text-center p-4 lg:p-8 relative max-w-4xl mx-auto">
      {/* Subtle ink drips around the welcome area */}
      <div className="absolute top-8 left-1/4 w-0.5 h-3 bg-gradient-to-b from-gray-400 to-transparent opacity-10"></div>
      <div className="absolute bottom-16 right-1/3 w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent opacity-15"></div>
      
      <div className="mb-6 lg:mb-8">
        <div className="w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-4 lg:mb-6 flex items-center justify-center text-gray-300 relative">
          {theme.name === 'Tae\'Tu' ? (
            <img 
              src="/tae_tu_round.jpg" 
              alt="Tae'Tu Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          ) : (
            <>
              {/* Subtle ink effect for Dreadmoor */}
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full opacity-30"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gradient-to-b from-gray-400 to-transparent opacity-20 rounded-full"></div>
            </>
          )}
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 lg:mb-4 font-serif tracking-wide">
          Welcome to {theme.name.toUpperCase()}
        </h2>
        <p className="text-base lg:text-lg text-gray-300 max-w-sm lg:max-w-md mx-auto leading-relaxed px-4 lg:px-0 font-serif italic">
          {theme.description}
        </p>
      </div>

      {/* Suggested Prompts Grid */}
      <div className="w-full max-w-3xl mb-6 lg:mb-8">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-200 mb-4 lg:mb-6 font-serif">
          Get Started with These Ideas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {props.suggestedPrompts.map((prompt, index) => (
                         <button
               key={index}
               onClick={() => {
                 chat.setInput(prompt.prompt);
                 setTimeout(() => {
                   const inputElement = document.querySelector('input[placeholder*="Describe your next artwork"]') as HTMLInputElement;
                   if (inputElement) {
                     inputElement.focus();
                   }
                 }, 100);
               }}
               className="group bg-gray-800/30 hover:bg-gray-700/40 border border-gray-700/30 hover:border-gray-600/50 rounded-xl p-4 lg:p-5 transition-all duration-200 active:scale-95 touch-manipulation relative overflow-hidden text-left"
             >
               {/* Subtle ink accent */}
               <div className="absolute top-2 right-3 w-0.5 h-2 bg-gradient-to-b from-gray-400 to-transparent opacity-10 group-hover:opacity-20 transition-opacity"></div>
               
               <div className="text-sm lg:text-base font-medium text-gray-200 mb-2 lg:mb-3 font-serif group-hover:text-white transition-colors">
                 {prompt.title}
               </div>
               <div className="text-xs lg:text-sm text-gray-400 font-serif italic group-hover:text-gray-300 transition-colors leading-relaxed">
                 Click to try
               </div>
             </button>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-2 opacity-50">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse delay-200"></div>
        <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  ) : props.emptyStateComponent;

  return (
    <div className="flex flex-col h-full">
      <ChatMessages
        aiEmoji={props.emoji}
        messages={chat.messages}
        emptyStateComponent={enhancedEmptyStateComponent}
        sourcesForMessages={sourcesForMessages}
        onPinDesign={props.onPinDesign}
        isLoading={chat.isLoading}
        uploadedImages={uploadedImages}
      />
      
      <ChatInput
        value={chat.input}
        onChange={chat.handleInputChange}
        onSubmit={sendMessage}
        loading={chat.isLoading}
        placeholder={props.placeholder ?? "Describe your vision or paste/upload an image..."}
        onImageUpload={handleImageUpload}
        pendingImage={pendingImage}
        onRemovePendingImage={handleRemovePendingImage}
      />
    </div>
  );
} 