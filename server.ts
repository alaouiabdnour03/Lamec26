import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits to handle larger diagnostics if necessary
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini on server
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for report generation
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { diagnosticJson, promptTemplate } = req.body;
      if (!diagnosticJson) {
         res.status(400).json({ error: "diagnosticJson is required" });
         return;
      }

      const prompt = promptTemplate.replace('<<<DIAGNOSTIC_JSON>>>', diagnosticJson);

      // List of candidate models to try in sequence if one fails or is unavailable
      const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
      const fallbackModels = [
        "gemini-3.5-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-pro-preview",
        "gemini-3.1-flash-lite",
        "gemini-3-flash-preview"
      ];
      const modelsToTry = [primaryModel, ...fallbackModels.filter(m => m !== primaryModel)];

      let lastError: any = null;
      let textContent = "";

      for (const modelName of modelsToTry) {
        let attempts = 3;
        let delay = 1000;

        while (attempts > 0) {
          try {
            console.log(`Attempting content generation using model: ${modelName} (${attempts} attempts left)...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
            });

            if (response && response.text) {
              textContent = response.text;
              console.log(`Success with model ${modelName}!`);
              res.json({ text: textContent });
              return;
            }
          } catch (error: any) {
            lastError = error;
            console.error(`Error on model ${modelName} (attempt ${4 - attempts}):`, error?.message || error);
            
            // Check if the error is a 503 or transient/UNAVAILABLE status
            const errorMsg = String(error?.message || "").toLowerCase();
            const isTransient = errorMsg.includes("503") || 
                                errorMsg.includes("temporary") || 
                                errorMsg.includes("unavailable") || 
                                errorMsg.includes("high demand") ||
                                error?.status === 503;

            if (isTransient && attempts > 1) {
              attempts--;
              console.log(`Transient error detected, retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // exponential backoff
            } else {
              // Non-transient or no more attempts left, break out to try fallback model
              break;
            }
          }
        }
      }

      // If we exhausted all models and attempts
      console.error("All models and retry attempts exhausted.");
      res.status(502).json({ 
        error: `La génération de contenu par l'IA a échoué après plusieurs tentatives et modèles de secours. Erreur finale: ${lastError?.message || lastError}` 
      });

    } catch (error: any) {
      console.error("Gemini server-side route exception:", error);
      res.status(500).json({ error: error?.message || "Internal server error during Gemini content generation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
