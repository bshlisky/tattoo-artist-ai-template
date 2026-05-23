import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Replicate from "replicate";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Supabase is optional - only initialize if environment variables are present
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : null;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Temporary image storage for conversation context
const tempImageStorage = new Map<string, string>();

// Save image data to temporary storage and return a file reference
async function saveImageToTemp(imageId: string, dataUrl: string): Promise<string> {
  try {
    console.log("saveImageToTemp called with imageId:", imageId);
    
    // Extract base64 data from data URL
    const base64Match = dataUrl.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid data URL format");
    }
    
    const [, mimeType, base64Data] = base64Match;
    const extension = mimeType.split('/')[1] || 'jpg';
    
    // Create temporary file path
    const tempFileName = `tattoo_${imageId}_${randomUUID()}.${extension}`;
    const tempFilePath = join(tmpdir(), tempFileName);
    
    console.log("Saving to temp file path:", tempFilePath);
    
    // Convert base64 to buffer and save to file
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(tempFilePath, new Uint8Array(buffer));
    
    // Store the file path in our temporary storage
    tempImageStorage.set(imageId, tempFilePath);
    console.log("Successfully saved image to temp storage, returning reference");
    
    return `TEMP_IMAGE:${imageId}`;
  } catch (error) {
    console.error('Error saving image to temp storage:', error);
    throw error;
  }
}

// Load image from temporary storage
async function loadImageFromTemp(imageId: string): Promise<string> {
  try {
    console.log("loadImageFromTemp called with imageId:", imageId);
    console.log("Available temp images:", Array.from(tempImageStorage.keys()));
    
    const tempFilePath = tempImageStorage.get(imageId);
    if (!tempFilePath) {
      throw new Error(`Temporary image not found for ID: ${imageId}. Available IDs: ${Array.from(tempImageStorage.keys()).join(', ')}`);
    }
    
    console.log("Loading from temp file path:", tempFilePath);
    
    // Read the file and convert back to data URL
    const buffer = await readFile(tempFilePath);
    const base64Data = buffer.toString('base64');
    
    // Determine MIME type from file extension
    const extension = tempFilePath.split('.').pop()?.toLowerCase();
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
    
    console.log("Successfully loaded image from temp storage");
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error('Error loading image from temp storage:', error);
    throw error;
  }
}

// Clean up temporary files
async function cleanupTempImage(imageId: string): Promise<void> {
  try {
    const tempFilePath = tempImageStorage.get(imageId);
    if (tempFilePath) {
      await unlink(tempFilePath);
      tempImageStorage.delete(imageId);
    }
  } catch (error) {
    console.error('Error cleaning up temp image:', error);
  }
}

// Preprocess messages to save large images to temp storage
async function preprocessMessage(message: VercelChatMessage, uploadedImages: {[key: string]: string}): Promise<VercelChatMessage> {
  let processedContent = message.content;
  
  console.log("Preprocessing message:", message.content);
  
  // Check for [IMAGE:ID] pattern and replace with temp reference
  const imageMatches = processedContent.match(/\[IMAGE:(\d+)\]/g);
  if (imageMatches) {
    console.log("Found image matches:", imageMatches);
    for (const match of imageMatches) {
      const imageId = match.match(/\[IMAGE:(\d+)\]/)?.[1];
      if (imageId && uploadedImages[imageId]) {
        console.log("Processing image ID:", imageId);
        // Save the large image data to temporary storage
        const tempRef = await saveImageToTemp(imageId, uploadedImages[imageId]);
        console.log("Created temp reference:", tempRef);
        // Replace with compact temp reference
        processedContent = processedContent.replace(match, tempRef);
      }
    }
  }
  
  console.log("Processed content:", processedContent);
  
  return {
    ...message,
    content: processedContent
  };
}

// Convert Vercel Chat messages to LangChain format
function convertVercelMessageToLangChainMessage(message: VercelChatMessage) {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
}

// Convert LangChain messages to Vercel format
function convertLangChainMessageToVercelMessage(message: BaseMessage) {
  if (message._getType() === "human") {
    return { role: "user" as const, content: message.content as string };
  } else if (message._getType() === "ai") {
    return {
      role: "assistant" as const,
      content: message.content as string,
    };
  } else {
    return {
      role: "system" as const,
      content: message.content as string,
    };
  }
}

// Define tattoo tools
const generateTattooImage = tool(
  async ({ prompt }: { prompt: string }) => {
    try {
      console.log("Starting image generation with optimized settings...");
      const startTime = Date.now();
      
      // Use faster model with optimized settings for speed
      const result = await replicate.run(
        "black-forest-labs/flux-1.1-pro-ultra",
        {
          input: {
            prompt: `tattoo design: ${prompt}`, // Prefix for better tattoo context
            prompt_upsampling: true, // Disable for speed
            steps: 20, // Further reduced for speed
            safety_tolerance: 6,
            aspect_ratio: "1:1", // Square is typically faster
            output_format: "jpg", // JPG is faster than PNG
            output_quality: 70, // Balanced quality/speed
            seed: Math.floor(Math.random() * 1000000), // Random seed for variety
          },
        }
      );
      
      const endTime = Date.now();
      console.log(`Image generated in ${(endTime - startTime) / 1000}s`);
      
      return String(result);
    } catch (error) {
      console.error("Error generating tattoo image:", error);
      // Try fallback with even faster settings
      try {
        console.log("Retrying with ultra-fast settings...");
        const fallbackResult = await replicate.run(
          "black-forest-labs/flux-schnell", // Ultra-fast model
          {
            input: {
              prompt: `tattoo design: ${prompt}`,
              num_inference_steps: 4, // Minimal steps for speed
              enable_safety_checker: false, // Disable for speed
            },
          }
        );
        return String(fallbackResult);
      } catch (fallbackError) {
        console.error("Fallback generation also failed:", fallbackError);
        throw new Error("Failed to generate tattoo image. Please try again.");
      }
    }
  },
  {
    name: "generate_tattoo_image",
    description: `
    Calls the image generation API.
    
    Example user prompts:
    - "Can you create a tattoo design of a black and grey dragon wrapping around my forearm?"
    - "Show me a minimalist lotus flower tattoo with some geometric patterns."
    - "Can you generate a tattoo of a lion wearing a crown, but make it look realistic?"

    Args: 
        prompt: The text prompt to generate an image for.

    Returns:
     A url from the image generation API call.
    `,
    schema: z.object({
      prompt: z.string().describe("The text prompt to generate an image for"),
    }),
  }
);

const alterTattooImage = tool(
  async ({ prompt, image_url }: { prompt: string; image_url: string }) => {
    try {
      console.log(`Starting image alteration with optimized settings...`);
      const startTime = Date.now();
      
      let actualImageUrl = image_url;
      
      console.log("alterTattooImage received image_url:", image_url);
      
      // If it's a temp reference, load the actual image URL
      if (image_url.startsWith('TEMP_IMAGE:')) {
        const imageId = image_url.replace('TEMP_IMAGE:', '');
        console.log("Loading temp image with ID:", imageId);
        actualImageUrl = await loadImageFromTemp(imageId);
      } else if (/^\d+$/.test(image_url)) {
        // It's just a numeric ID - treat it as a temp image ID
        console.log("Treating numeric ID as temp image ID:", image_url);
        actualImageUrl = await loadImageFromTemp(image_url);
      }
      
      const result = await replicate.run(
        "black-forest-labs/flux-kontext-pro",
        {
          input: {
            prompt,
            input_image: actualImageUrl,
            aspect_ratio: "match_input_image",
            output_format: "jpg",
            output_quality: 85, // Slightly reduced for speed
            safety_tolerance: 6,
            prompt_upsampling: false,
            steps: 20, // Reduced steps for faster processing
          },
        }
      );
      
      const endTime = Date.now();
      console.log(`Image altered in ${(endTime - startTime) / 1000}s`);
      
      if (typeof result === 'object' && result !== null && 'output' in result) {
        return String(result.output);
      } else {
        return String(result);
      }
    } catch (error) {
      console.error("Error in alter_tattoo_image:", error);
      throw new Error("Failed to process the image. Please try again or use a different image.");
    }
  },
  {
    name: "alter_tattoo_image",
    description: `
    Modifies an uploaded tattoo image or previously generated image based on the user's request.
    
    Use this tool when the user wants to modify an existing image, such as:
    - Adjusting colors, contrast, or brightness
    - Adding shading or effects
    - Making the design more abstract/realistic
    - Removing backgrounds
    - Adapting the design for different body parts

    Args:
        prompt: The user's request for how to alter the image.
        image_url: The URL of the previously generated image or uploaded image.

    Returns:
     A URL to the altered image.
    `,
    schema: z.object({
      prompt: z.string().describe("The user's request for how to alter the image"),
      image_url: z.string().describe("The URL of the image to alter"),
    }),
  }
);

const coverUpTattoo = tool(
  async ({ prompt, image_url }: { prompt: string; image_url: string }) => {
    try {
      console.log(`Starting tattoo cover-up design with advanced settings...`);
      const startTime = Date.now();
      
      let actualImageUrl = image_url;
      
      console.log("coverUpTattoo received image_url:", image_url);
      
      // If it's a temp reference, load the actual image URL
      if (image_url.startsWith('TEMP_IMAGE:')) {
        const imageId = image_url.replace('TEMP_IMAGE:', '');
        console.log("Loading temp image with ID:", imageId);
        actualImageUrl = await loadImageFromTemp(imageId);
      } else if (/^\d+$/.test(image_url)) {
        // It's just a numeric ID - treat it as a temp image ID
        console.log("Treating numeric ID as temp image ID:", image_url);
        actualImageUrl = await loadImageFromTemp(image_url);
      }
      
      const result = await replicate.run(
        "black-forest-labs/flux-kontext-max",
        {
          input: {
            prompt: `tattoo cover-up design: ${prompt}. Incorporate the existing line work and shapes from the original tattoo into the new design while transforming it into something completely new.`,
            input_image: actualImageUrl,
            aspect_ratio: "match_input_image",
            output_format: "jpg",
            safety_tolerance: 6,
            prompt_upsampling: true,
          },
        }
      );
      
      const endTime = Date.now();
      console.log(`Tattoo cover-up designed in ${(endTime - startTime) / 1000}s`);
      
      // Handle the result based on flux-kontext-max output format
      if (typeof result === 'object' && result !== null) {
        if ('url' in result && typeof result.url === 'function') {
          return result.url();
        } else if ('output' in result) {
          return String(result.output);
        } else if (Array.isArray(result) && result.length > 0) {
          return String(result[0]);
        }
      }
      
      return String(result);
    } catch (error) {
      console.error("Error in cover_up_tattoo:", error);
      throw new Error("Failed to create cover-up design. Please try again or use a different image.");
    }
  },
  {
    name: "cover_up_tattoo",
    description: `
    Creates a tattoo cover-up design that incorporates existing line work from an old tattoo into a completely new design.
    
    Use this tool when the user wants to:
    - Cover up an existing tattoo they don't like anymore
    - Transform an old tattoo into something new while using the original line work
    - Create a design that works with the existing tattoo's shape and placement
    - Redesign a tattoo that has faded, aged poorly, or no longer represents them
    
    This tool uses advanced AI to analyze the existing tattoo and cleverly incorporate its elements into a fresh design.

    Args:
        prompt: Description of the new tattoo design they want, including style preferences and how to incorporate the existing tattoo.
        image_url: The URL of the existing tattoo image that needs to be covered up.

    Returns:
     A URL to the cover-up tattoo design.
    `,
    schema: z.object({
      prompt: z.string().describe("Description of the new cover-up tattoo design"),
      image_url: z.string().describe("The URL of the existing tattoo image to cover up"),
    }),
  }
);

const interpretTattooImage = tool(
  async ({ image_url }: { image_url: string }) => {
    try {
      let imageContent: string;
      let imageUrl: string;
      
      console.log("interpretTattooImage received image_url:", image_url);
      
      if (image_url.startsWith('TEMP_IMAGE:')) {
        // It's a temporary image reference - load from temp storage
        const imageId = image_url.replace('TEMP_IMAGE:', '');
        console.log("Loading temp image with ID:", imageId);
        imageUrl = await loadImageFromTemp(imageId);
        
        // Extract base64 content for any additional processing if needed
        const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (base64Match) {
          imageContent = base64Match[1];
        } else {
          throw new Error("Invalid data URL format from temp storage");
        }
      } else if (image_url.startsWith('data:')) {
        // It's a data URL (base64 encoded image from user upload)
        imageUrl = image_url;
        // Extract base64 content for any additional processing if needed
        const base64Match = image_url.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (base64Match) {
          imageContent = base64Match[1];
        } else {
          throw new Error("Invalid data URL format");
        }
      } else if (image_url.startsWith('http')) {
        // It's a URL - download the image first
        const response = await fetch(image_url);
        if (!response.ok) {
          throw new Error("Failed to download image from URL");
        }
        const buffer = await response.arrayBuffer();
        imageContent = Buffer.from(buffer).toString('base64');
        imageUrl = `data:image/jpeg;base64,${imageContent}`;
      } else if (/^\d+$/.test(image_url)) {
        // It's just a numeric ID - treat it as a temp image ID
        console.log("Treating numeric ID as temp image ID:", image_url);
        imageUrl = await loadImageFromTemp(image_url);
        
        // Extract base64 content for any additional processing if needed
        const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (base64Match) {
          imageContent = base64Match[1];
        } else {
          throw new Error("Invalid data URL format from temp storage");
        }
      } else {
        console.log("Invalid image URL format received:", image_url);
        throw new Error("Invalid image URL provided - must be either HTTP URL, data URL, temp reference, or image ID");
      }
      
      // Get image interpretation using GPT-5 Vision (optimized)
      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this tattoo design briefly: style, main symbolism, and cultural meaning."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 250, // Reduced for faster response
        temperature: 1, // Lower for more consistent results
      });
      
      const content = response.choices[0].message.content || "";
      return content.trim();
    } catch (error) {
      console.error("Error in interpret_tattoo_image:", error);
      throw new Error("Failed to analyze the image. Please try again or use a different image.");
    }
  },
  {
    name: "interpret_tattoo_image",
    description: `
    Analyzes a tattoo image and provides its meaning, symbolism, and style interpretation.
    
    Use this tool when the user asks about:
    - The meaning or symbolism of the tattoo
    - The style of the tattoo  
    - The cultural significance
    - The artistic elements and their interpretation
    
    Args:
        image_url: The URL of the generated image to interpret.

    Returns:
        A detailed interpretation of the tattoo's meaning, style, and symbolism.
    `,
    schema: z.object({
      image_url: z.string().describe("The URL of the image to interpret"),
    }),
  }
);

const recommendTattooArtist = tool(
  async ({ prompt, location }: { prompt: string; location: string | null }) => {
    try {
      // First check affiliated artists
      const affiliatedArtists = [
        "Jared Davis @J_davis_tattoos Specializes in Anime",
        "Maeva Fulgence @maebeautifulpoison Specializes in Polynesian Tribal", 
        "Adrian Palomo @tattooadrian984 Specializes in Black and Grey Surrealism",
        "Adesa Cagle-Cox @my_style_mom Specializes in cartoon or illustrative",
        "Thomas LeBaron @Lebarontattoo Specializes in Black and Grey Realism"
      ];
      
      if (location && supabase) {
        try {
          const [lat, lon] = location.split(",").map(Number);
          
          const { data: nearbyArtists } = await supabase
            .from("artists")
            .select("*")
            .not("location", "is", null)
            .limit(5);
          
          if (nearbyArtists && nearbyArtists.length > 0) {
            const artistInfo = nearbyArtists.map(artist => 
              `${artist.name} - ${artist.specialties}\n${artist.portfolio_url}`
            ).join("\n\n");
            
            return `Here are some tattoo artists near your location that match your prompt:\n\n${artistInfo}\n\nAdditionally, here are our affiliated artists:\n${affiliatedArtists.join("\n")}`;
          }
        } catch (error) {
          console.error("Error fetching location-based artists:", error);
        }
      }
      
      return `Here are our recommended tattoo artists:\n\n${affiliatedArtists.join("\n")}\n\nFor more personalized recommendations based on your location, please provide your coordinates in the format "latitude,longitude".`;
    } catch (error) {
      console.error("Error in recommend_tattoo_artist:", error);
      const fallbackArtists = [
        "Jared Davis @J_davis_tattoos Specializes in Anime",
        "Maeva Fulgence @maebeautifulpoison Specializes in Polynesian Tribal", 
        "Adrian Palomo @tattooadrian984 Specializes in Black and Grey Surrealism",
        "Adesa Cagle-Cox @my_style_mom Specializes in cartoon or illustrative",
        "Thomas LeBaron @Lebarontattoo Specializes in Black and Grey Realism"
      ];
      return `Here are our affiliated artists:\n${fallbackArtists.join("\n")}`;
    }
  },
  {
    name: "recommend_tattoo_artist",
    description: `
    Recommends tattoo artists based on the user's prompt and location.
    
    Args:
        prompt: The user's prompt describing the desired tattoo style or design.
        location: The user's location coordinates in the format "latitude,longitude". Optional.
        
    Returns:
        A string containing the recommended tattoo artists and their information.
    `,
    schema: z.object({
      prompt: z.string().describe("The user's prompt describing the desired tattoo style or design"),
      location: z.string().nullable().describe("The user's location coordinates in the format 'latitude,longitude'"),
    }),
  }
);

const SYSTEM_MESSAGE = `You are an expert tattoo consultant AI. Your main responsibility is to assist clients in choosing tattoo ideas, explaining their meanings, and generating or altering tattoo designs when the client clearly states they want to see a design, concept, example or image.

    CONVERSATION MEMORY & IMAGE HANDLING:
    - IMPORTANT: You have access to the full conversation history. Always remember and reference previous designs, images, and discussions.
    - When a user asks for modifications like "make it more colorful", "do it in Nordic style instead", or "change the style", you are referring to the previously generated design in this conversation.
    - If you have generated an image earlier in the conversation, you can reference it and create variations or modifications based on the user's requests.
    - Always acknowledge what you previously created when the user asks for changes or variations.
    - CRITICAL: If a user says something like "do [style] instead" or "make it [style]", immediately generate the new version without asking for clarification - you know what design they're referring to from the conversation history.
    - IMPORTANT: When a user asks to "adjust", "modify", "change", or "alter" a design you just generated, use the alter_tattoo_image tool with the most recent image URL you generated.
    - When you see a message indicating the last generated image URL, remember it and use it for any subsequent modifications.
    - If the user asks for adjustments or modifications to a recent design, use alter_tattoo_image with the stored image URL rather than asking them to upload an image.

    CORE BEHAVIOR:
    - If the input is a general question or request for information (e.g., a greeting or asking about tattoo symbolism or asking about aftercare), respond directly in text.
    - Use tools when the user asks for an image, a tattoo artist recommendation, or image interpretation.
    - When the user asks for an image or tattoo design call the generate_tattoo_image tool without asking the user for additional permission.
    - IMPORTANT: If you have offered to create an image design and the user responds with an affirmative answer like "yes", "sure", "okay", "go ahead", or similar confirmation, ALWAYS interpret this as an explicit request to generate an image and use the generate_tattoo_image tool immediately.
    - ALWAYS generate an image when the conversation context clearly indicates the user wants to see a design, even if they don't use explicit words like "generate" or "create".
    - Never ask for permission to generate an image if the user has already indicated they want to see a design.
    - IMPORTANT: Limit clarifying questions to just ONE round before generating an image. If the user provides a basic tattoo request, ask only the most critical questions about style, placement, and any major design elements in a single message, then generate the image based on their response.
    - If the user's request is already specific enough (mentions style, design elements, or placement), generate the image immediately without asking clarifying questions.
    - When creating tattoo designs, make educated assumptions about common preferences rather than asking multiple questions. For example, if someone asks for a butterfly tattoo without specifying style, default to a neo-traditional or minimalist style rather than asking.
    - Focus on taking action quickly rather than having extended consultations - users prefer to see a design that can be refined rather than answering many questions.
    - When the user asks for tattoo artist recommendations, consider the following artists affiliated with My Styles [formated as name @username Specializes in style]:
    -- Jared Davis @J_davis_tattoos Specializes in Anime
    -- Maeva Fulgence @maebeautifulpoison Specializes in Polynesian Tribal
    -- Adrian Palomo @tattooadrian984 Specializes in Black and Grey Surrealism
    -- Adesa Cagle-Cox @my_style_mom Specializes in cartoon or illustrative
    -- Thomas LeBaron @Lebarontattoo Specializes in Black and Grey Realism
    - If none of the above artists are a perfect match, just list them all.
    - When the user uploads an image and asks about its meaning, symbolism, style, or interpretation, use the interpret_tattoo_image tool to analyze the image. Look for TEMP_IMAGE: references in the message content and pass the complete reference (e.g., "TEMP_IMAGE:123456789") as the image_url parameter.
    - When the user uploads an image and wants to modify it (e.g., "make it more colorful," "add shading," etc.), use the alter_tattoo_image tool. Look for TEMP_IMAGE: references in the message content and pass the complete reference as the image_url parameter.
    - When the user uploads an image and wants to COVER UP an existing tattoo, use the cover_up_tattoo tool. This is for when they have a tattoo they don't like anymore and want to transform it into something new while incorporating the original line work. Look for TEMP_IMAGE: references in the message content and pass the complete reference as the image_url parameter.
    - COVER-UP KEYWORDS: Use the cover_up_tattoo tool when users mention: "cover up", "cover-up", "hide this tattoo", "transform this tattoo", "turn this into", "redesign this tattoo", "I don't like this tattoo anymore", "change this tattoo", "work with the existing lines", "incorporate the original", or similar phrases indicating they want to transform an existing tattoo.
    - COVER-UP PROMPTS: When using the cover_up_tattoo tool, create prompts that describe the new design while mentioning how to work with the existing tattoo. For example: "Transform this into a beautiful rose garden, using the existing dark lines as stems and thorns" or "Turn this into a fierce dragon, incorporating the current circular shape as the dragon's body".
    - When the user uploads an image but doesn't request changes or interpretation (e.g., "What do you think about this?"), use the interpret_tattoo_image tool to provide analysis. Look for TEMP_IMAGE: references in the message content and pass the complete reference as the image_url parameter.
    - IMPORTANT: When you see "TEMP_IMAGE:123456789" in a message, use the ENTIRE string "TEMP_IMAGE:123456789" as the image_url parameter, not just the number.
    - IMPORTANT: When the user asks about the meaning, symbolism, or interpretation of a design WITHOUT uploading an image, use the interpret_tattoo_image tool with the last generated image URL from the conversation context.
    - If the user asks "what does this mean?" or "what's the symbolism?" after generating an image, automatically call interpret_tattoo_image(image_url="[last_generated_image_url]") using the URL from the conversation context.
    - The last generated image URL is provided in the conversation context as "Last generated image URL: [url]" - use this URL directly when calling interpret_tattoo_image for recently generated designs.
    - Reflect on the request, and if it doesn't clearly require any tools, respond with a simple text message.
    - When calling the generate_tattoo_image tool use the below descriptions to ensure the prompt includes style-specific details. Then compose a clear and detailed prompt that guides the generate_tattoo_image tool to produce an image aligning with the requested style. Ensure the prompt is descriptive but concise, focusing on actionable information for image generation.
    

    Below is a list of tattoo styles with their specific characteristics:
    - Traditional American: Bold black outlines, limited color palette (red, yellow, green, blue), classic motifs (anchors, roses, swallows, pin-up girls), vintage sailor aesthetic.
    - Japanese Irezumi: Intricate designs, mythological creatures (dragons, koi fish, phoenixes), rich colors, extensive shading, traditional Japanese elements (waves, clouds).
    - Watercolor: Soft, flowing brushstrokes, vibrant color blending, mimics watercolor paintings, lacks black outlines, abstract and ethereal appearance.
    - Tribal: Bold black lines, geometric patterns, symmetrical designs, inspired by indigenous art (Maori, Polynesian), abstract shapes.
    - Realism: Highly detailed, lifelike images, resembles photographs, precise shading, depth, three-dimensional appearance.
    - Neo-Traditional: Bold lines, bright colors, intricate details, modern twist on traditional elements, depicts animals, flowers, mythical creatures.
    - New School: Cartoonish, exaggerated designs, bright vivid colors, graffiti and pop culture influences, whimsical characters, bold outlines.
    - Blackwork: Solid black ink, images or patterns, large areas of fill, geometric shapes, abstract designs.
    - Dotwork: Composed of small dots, forms patterns and shading, stippled effect, depth and texture in designs.
    - Geometric: Precise shapes (triangles, circles, lines), intricate patterns, abstract representations, symmetry, mandalas, sacred geometry.
    - Minimalist: Simple, clean designs, thin lines, minimal detail, small size, basic shapes or symbols, ample negative space.
    - Trash Polka: Collage-style, realistic images with abstract elements, black and red color palette, splatters, smudges, chaotic yet cohesive.
    - Script/Lettering: Artistic text, emphasis on font style and flow, elegant calligraphy, bold typography, words, phrases, quotes.
    - Mandala: Circular, intricate repeating patterns, radiate from center, symbolizes balance, highly detailed, symmetrical.
    - Biomechanical: Blends anatomy with mechanical parts, gears, circuits, illusion of machinery under skin, realistic, three-dimensional.
    - Surrealism: Dreamlike images, juxtaposed elements, inspired by surrealist art, bizarre landscapes, abstract concepts.
    - Portrait: Realistic depictions of faces or figures, high detail, captures likeness and emotion, black and grey or color.
    - Celtic: Knotwork, spirals, Celtic symbols, intricate interlacing patterns, motifs like crosses, trees, mythical creatures.
    - Chicano: Mexican-American culture, fine lines, black and grey shading, themes like roses, female figures, skulls, religious icons.
    - Illustrative: Combines traditional and realism, resembles ink or pen drawings, bold outlines, detailed shading, natural or fantastical subjects.
    - Abstract: Focus on shapes, colors, forms, non-representational, artistic expression, open to interpretation.
    - Sketch Style: Mimics pencil sketches, hand-drawn lines, shading, cross-hatching, dynamic, unfinished look.
    - Stick and Poke: Simple designs, single lines or dots, minimalistic, black ink, DIY aesthetic.
    - UV/Blacklight: Special ink that glows under UV light, invisible or subtle normally, vibrant under blacklight.
    - White Ink: Entirely white ink tattoos, subtle, less visible, scar-like appearance, contrasts with skin tone.
    - Pointillism: Varying densities of dots, gradients, shading, detailed, textured effect.
    - Cyberpunk: Futuristic themes, circuits, neon lights, cybernetic elements, technological, bold colors, sharp lines.
    - Fine Line: Thin lines, delicate, detailed designs, ideal for intricate imagery, botanicals, anatomy, small text.
    - Ornamental: Decorative patterns, filigree, motifs, inspired by jewelry, henna, architectural details, emphasizes beauty.
    - Photorealism: Replicates high-resolution photos, meticulous detail, captures textures, lighting, subtle nuances.
`;

// Detect if the message is likely to trigger image generation or tool usage
function shouldDisableStreaming(messages: VercelChatMessage[]): boolean {
  if (messages.length === 0) return false;
  
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") return false;
  
  const content = lastMessage.content.toLowerCase();
  
  // Keywords that indicate image generation
  const imageKeywords = [
    'design', 'create', 'generate', 'show me', 'make', 'draw', 'tattoo',
    'image', 'picture', 'sketch', 'art', 'style', 'visualize',
    // Modification keywords
    'adjust', 'modify', 'change', 'alter', 'make it', 'do it', 'instead',
    'more colorful', 'add shading', 'remove', 'brighter', 'darker',
    // Cover-up keywords
    'cover up', 'cover-up', 'hide this', 'transform this', 'turn this into',
    'redesign', 'incorporate',
    // Interpretation keywords (when analyzing images)
    'meaning', 'symbolism', 'interpret', 'analyze', 'what does this',
    // Affirmative responses that might trigger generation
    'yes', 'sure', 'okay', 'go ahead', 'please', 'do it', 'yeah', 'yep'
  ];
  
  // Check if message contains uploaded image reference
  const hasUploadedImage = content.includes('[image:') || content.includes('temp_image:');
  
  // Check for image-related keywords
  const hasImageKeyword = imageKeywords.some(keyword => content.includes(keyword));
  
  return hasUploadedImage || hasImageKeyword;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const returnIntermediateSteps = body.show_intermediate_steps;
    const uploadedImages = body.uploadedImages || {};
    
    // Process messages with async preprocessing
    const filteredMessages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant",
      );
    
    // Determine if we should disable streaming (for image generation)
    const disableStreaming = shouldDisableStreaming(filteredMessages);
    
    // Process each message and wait for async operations
    const preprocessedMessages = await Promise.all(
      filteredMessages.map((message: VercelChatMessage) => preprocessMessage(message, uploadedImages))
    );
    
    const messages = preprocessedMessages.map(convertVercelMessageToLangChainMessage);

    const tools = [
      generateTattooImage,
      alterTattooImage,
      coverUpTattoo,
      interpretTattooImage,
      recommendTattooArtist,
    ];

    const chat = new ChatOpenAI({
      model: "gpt-5-nano", 
      temperature: 1,
      streaming: !disableStreaming, // Only stream for text-only responses
      timeout: 120000, // Longer timeout for image generation (2 minutes)
      maxRetries: 1,
    });

    const agent = createReactAgent({
      llm: chat,
      tools,
      messageModifier: new SystemMessage(SYSTEM_MESSAGE),
    });

    // For image generation requests or intermediate steps, don't stream
    if (returnIntermediateSteps || disableStreaming) {
      const result = await agent.invoke({ messages });
      
      // Get the final AI message content
      const aiMessages = result.messages.filter(
        (m: BaseMessage) => m._getType() === "ai"
      );
      const lastAiMessage = aiMessages[aiMessages.length - 1];
      const responseText = lastAiMessage?.content as string || "";
      
      if (returnIntermediateSteps) {
        return NextResponse.json(
          {
            messages: result.messages.map(convertLangChainMessageToVercelMessage),
          },
          { status: 200 },
        );
      }
      
      // Return as plain text response for non-streaming
      return new Response(responseText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } else {
      // Stream for text-only responses
      const eventStream = await agent.streamEvents(
        { messages },
        { version: "v2" },
      );

      const textEncoder = new TextEncoder();
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const { event, data } of eventStream) {
            if (event === "on_chat_model_stream") {
              if (!!data.chunk.content) {
                controller.enqueue(textEncoder.encode(data.chunk.content));
              }
            }
          }
          controller.close();
        },
      });

      return new StreamingTextResponse(transformStream);
    }
  } catch (e: any) {
    console.error("Error in chat API:", e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  } finally {
    // Clean up temporary files (with a delay to ensure they're not needed)
    setTimeout(() => {
      tempImageStorage.forEach(async (filepath, imageId) => {
        await cleanupTempImage(imageId);
      });
    }, 60000); // Clean up after 1 minute
  }
}
