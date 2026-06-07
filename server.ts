import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase file parsing limits since we work with base64 images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Helper to check if API key exists and lazily instantiate GoogleGenAI
let _ai: any = null;
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error(
      "GEMINI_API_KEY is not defined or is set to placeholder value. Please add a valid API key in Settings > Secrets."
    );
  }
  if (!_ai) {
    _ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return _ai;
}

// Config status API
app.get("/api/config", (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const configured = !!key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "";
  res.json({ configured });
});

// JSON Response Schema for Campaign Details & Prompts
const campaignSchema = {
  type: Type.OBJECT,
  properties: {
    campaignName: {
      type: Type.STRING,
      description: "A clever, chic, punchy name of the advertising campaign (2-4 words)."
    },
    brandSlogan: {
      type: Type.STRING,
      description: "An elegant, memorable brand slogan or tagline for the product."
    },
    consistencyAnchor: {
      type: Type.STRING,
      description: "A highly descriptive visual guide specifying the core physical features of the product (dimensions, texture, base colors, specific accent trims, finish, branding labels, logo styling) to ensure perfect consistency across mediums. NEVER include human models, hands, or user triggers."
    },
    shots: {
      type: Type.ARRAY,
      description: "List of the specific media shots to generate.",
      items: {
        type: Type.OBJECT,
        properties: {
          medium: {
            type: Type.STRING,
            description: "The identifier for this advertisement medium: e.g. billboard, newspaper, social_post, etc."
          },
          mediumTitle: {
            type: Type.STRING,
            description: "Chic title for this shot (e.g. 'Metropolitan Highway Billboard', 'Heritage Typography Press Print', 'Minimalist Lifestyle Grid Post')."
          },
          mediumDescription: {
            type: Type.STRING,
            description: "Creative styling approach for this specific medium context (no people)."
          },
          imagePrompt: {
            type: Type.STRING,
            description: "A detailed visual image prompt for gemini-2.5-flash-image (Nano-Banana). Incorporate the exact details of the consistencyAnchor to recreate the product accurately. Choose a composition style (close-up, dramatic high-angle, etc.), professional studio or organic environment lighting, a high-quality stylized atmospheric backing (urban dusk sky, linen tabletop, clean newsprint page), and enforce ABSOLUTELY NO PEOPLE OR HUMAN BODY PARTS. The product must be the standalone focus of the scene."
          },
          aspectRatio: {
            type: Type.STRING,
            description: "Supported standard aspect ratios: Use '16:9' for billboard/screens, '3:4' for newspaper/posters, and '1:1' for social posts."
          }
        },
        required: ["medium", "mediumTitle", "mediumDescription", "imagePrompt", "aspectRatio"]
      }
    }
  },
  required: ["campaignName", "brandSlogan", "consistencyAnchor", "shots"]
};

// Helper to determine cohesive design photographic preview fallbacks based on visual prompt text
function getCohesiveImageFallback(prompt: string, stylePreset: string): string {
  const p = (prompt || "").toLowerCase();
  
  // 1. Apothecary vial / green potion / neon bottle / biohazard
  if (p.includes("vial") || p.includes("apothecary") || p.includes("elixir") || p.includes("potion") || p.includes("radioactive") || p.includes("liquid") || p.includes("glass")) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80";
  }
  
  // 2. Earbuds / wireless earbud cases / headphones / alloy
  if (p.includes("earbud") || p.includes("audio") || p.includes("headphone") || p.includes("sound") || p.includes("alloy")) {
    return "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80";
  }
  
  // 3. Mug / Ceramic / Coffee cup / clay / brutalist
  if (p.includes("mug") || p.includes("cup") || p.includes("ceramic") || p.includes("clay") || p.includes("concrete") || p.includes("brutalist")) {
    return "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80";
  }
  
  // 4. Thermos flask / steel water bottle
  if (p.includes("thermos") || p.includes("flask") || p.includes("bottle") || p.includes("canister")) {
    return "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1000&q=80";
  }
  
  // 5. Watch / Timepiece
  if (p.includes("watch") || p.includes("clock") || p.includes("time") || p.includes("dial")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";
  }
  
  // 6. Skincare / cosmetic
  if (p.includes("perfume") || p.includes("cosmetic") || p.includes("skincare") || p.includes("lotion") || p.includes("soap")) {
    return "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=1000&q=80";
  }

  // Preset fallback logic
  const preset = (stylePreset || "").toLowerCase();
  if (preset.includes("classic") || preset.includes("vintage") || preset.includes("heritage")) {
    return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1000&q=80";
  }
  if (preset.includes("brutalist") || preset.includes("industrial") || preset.includes("concrete")) {
    return "https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?auto=format&fit=crop&w=1000&q=80";
  }
  if (preset.includes("vibrant") || preset.includes("cyber") || preset.includes("pop") || preset.includes("neon")) {
    return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80";
  }
  
  // Absolute standard elegant product placeholder
  return "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=80";
}

// Main Generation API endpoint
app.post("/api/generate-campaign", async (req, res) => {
  try {
    const { productDescription, selectedMediums, stylePreset } = req.body;

    if (!productDescription) {
      return res.status(400).json({ error: "Product description is required." });
    }

    if (!selectedMediums || !Array.isArray(selectedMediums) || selectedMediums.length === 0) {
      return res.status(400).json({ error: "At least one medium must be selected." });
    }

    const ai = getGenAI();

    // 1. Generate campaign concept and image prompts using gemini-3.5-flash
    const planningPrompt = `
      Take the following product description: "${productDescription}"
      We are preparing a beautifully cohesive cross-channel brand advertisement campaign. 
      The preferred general visual aesthetic/style is: "${stylePreset || "minimal-lux"}".
      
      You must devise a campaign name, a slogan, and detailed visual prompts for each of these mediums: ${selectedMediums.join(", ")}.
      
      CRITICAL INSTRUCTIONS:
      1. Define a detailed 'consistencyAnchor' describing the physical looks of the product to ensure identical visualization across all channels.
      2. For each requested medium, write a highly descriptive prompt for gemini-2.5-flash-image (Nano-Banana model).
      3. CRITICAL LIMITATION: You are strictly FORBIDDEN from including any human elements in the scenes. No people, no hands holding the product, no arms, no silhouettes, no crowds in backgrounds. The shots must be completely human-free, focusing purely on the product, pristine architecture, text layouts, nature, or object arrangements.
    `;

    const configResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: planningPrompt,
      config: {
        systemInstruction: `You are an award-winning Creative Director specializing in minimalist print, digital, and outdoor advertising. Write elegant campaigns focused entirely on product design and environment, strictly forbidding human models. Always produce valid JSON matching the schema.`,
        responseMimeType: "application/json",
        responseSchema: campaignSchema,
      }
    });

    const configText = configResponse.text;
    if (!configText) {
      throw new Error("Failed to receive structured config output from Gemini.");
    }

    const campaignData = JSON.parse(configText.trim());

    // 2. Generate each image part sequentially using gemini-2.5-flash-image (Nano-Banana)
    const generatedShots = [];
    for (let i = 0; i < campaignData.shots.length; i++) {
      const shot = campaignData.shots[i];
      // Insert a minor throttle sleep gap between successful/separate visual mediums
      if (i > 0) {
        await sleep(3000);
      }
      
      try {
        console.log(`Generating image for medium ${shot.medium} with prompt: ${shot.imagePrompt}`);
        const imageResponse = await generateWithRetry(ai, shot.imagePrompt, shot.aspectRatio);

        // Extract the image base64
        let base64Image = "";
        if (imageResponse.candidates?.[0]?.content?.parts) {
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (!base64Image) {
          console.error(`No inline image data received for shot format ${shot.medium}`);
          throw new Error("No image bytes returned in candidate parts.");
        }

        generatedShots.push({
          ...shot,
          imageUrl: base64Image,
          success: true,
          fallbackUsed: false
        });
      } catch (imageErr: any) {
        console.error(`Error generating image for ${shot.medium}:`, imageErr);
        // Load exquisite cohesive photographic fallback when rate limited or filtered
        const fallbackUrl = getCohesiveImageFallback(shot.imagePrompt, stylePreset);
        const parsedErrorMsg = typeof imageErr === 'object' ? (imageErr.message || JSON.stringify(imageErr)) : String(imageErr);
        generatedShots.push({
          ...shot,
          imageUrl: fallbackUrl,
          success: true, // Mark true so mockup renders with beautiful Unsplash asset
          fallbackUsed: true,
          errorMsg: parsedErrorMsg
        });
      }
    }

    res.json({
      success: true,
      campaignName: campaignData.campaignName,
      brandSlogan: campaignData.brandSlogan,
      consistencyAnchor: campaignData.consistencyAnchor,
      shots: generatedShots
    });

  } catch (err: any) {
    console.error("API Error creating campaign:", err);
    res.status(500).json({ error: err.message || "Internal server error." });
  }
});

// Robust image generator helper with automatic backoff retries for 429 situations and parsed dynamic delay extraction
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(ai: any, prompt: string, aspectRatio: string, retries = 5, initialDelay = 5000) {
  let attempt = 0;
  while (true) {
    try {
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1"
          }
        }
      });
      return imageResponse;
    } catch (err: any) {
      attempt++;
      
      let errMsg = "";
      try {
        errMsg = typeof err === "object" ? (err.message || JSON.stringify(err)) : String(err);
      } catch (e) {
        errMsg = String(err);
      }

      console.warn(`[Image Gen Attempt ${attempt}/${retries} failed]`, errMsg);
      
      if (attempt >= retries) {
        throw err;
      }

      // Generate default exponential wait time 
      let waitTimeMs = initialDelay * Math.pow(2.5, attempt - 1);
      
      // Look for rate-limit string like "Please retry in 58.380864009s"
      const matchSecs = errMsg.match(/retry in\s+([\d.]+)\s*(?:s|seconds)/i) || 
                        errMsg.match(/retry after\s+([\d.]+)\s*(?:s|seconds)/i) ||
                        errMsg.match(/(?:limit|quota|wait).*?([\d.]+)\s*s/i);

      if (matchSecs && matchSecs[1]) {
        const parsedSeconds = parseFloat(matchSecs[1]);
        if (!isNaN(parsedSeconds)) {
          // Setting wait time exactly to recommendations of API + 1.5 seconds safety pad
          waitTimeMs = (parsedSeconds * 1000) + 1500;
          console.log(`Extracted dynamic retry seconds: ${parsedSeconds}s. Setting sleep to ${waitTimeMs}ms.`);
        }
      } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        console.log("Detected 429 rate limit without specific time structure. Defaulting to 32-second protective sleep block.");
        waitTimeMs = Math.max(waitTimeMs, 32000);
      }

      console.log(`Pausing for ${waitTimeMs}ms before retry...`);
      await sleep(waitTimeMs);
    }
  }
}

// Single Shot Generator Route for On-Demand Retries (using Gemini 2.5 Flash Image / Nano-Banana)
app.post("/api/generate-single-shot", async (req, res) => {
  try {
    const { imagePrompt, aspectRatio } = req.body;

    if (!imagePrompt) {
      return res.status(400).json({ error: "imagePrompt is required." });
    }

    const ai = getGenAI();

    console.log(`[On-Demand Single Shot] Invoking Nano-Banana image model...`);
    const imageResponse = await generateWithRetry(ai, imagePrompt, aspectRatio);

    // Extract the image base64
    let base64Image = "";
    if (imageResponse.candidates?.[0]?.content?.parts) {
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No inline data bytes returned from the Gemini image generator.");
    }

    res.json({
      success: true,
      imageUrl: base64Image
    });

  } catch (err: any) {
    console.warn("API Error generating single shot, loading aesthetic placeholder fallback:", err);
    try {
      const { imagePrompt } = req.body;
      const fallbackUrl = getCohesiveImageFallback(imagePrompt || "", "");
      const parsedError = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
      res.json({
        success: true,
        imageUrl: fallbackUrl,
        fallbackUsed: true,
        errorMsg: parsedError
      });
    } catch (fallbackErr) {
      res.status(500).json({ error: "Failed to generate placeholder backup." });
    }
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully on http://localhost:${PORT}`);
  });
}

startServer();
