import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API router
  app.post("/api/generate", async (req, res) => {
    try {
      const { content, option = "standard" } = req.body;

      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Please enter some notes or study material to process." });
      }

      if (!apiKey) {
        return res.status(500).json({ 
          error: "Gemini API Key is missing. Please configure GEMINI_API_KEY in the Secrets panel." 
        });
      }

      // We'll customize the prompt based on the user's focus option (e.g., standard, formulas, quick-review, in-depth)
      let customInstruction = "You are an elite academic assistant and tutor. Your task is to process study materials, lesson notes, textbook chapter excerpts, or general educational documents, and convert them into three high-yield learning resource sections: Flashcards, Key Concepts, and Study/Revision Notes.";
      
      if (option === "exam-prep") {
        customInstruction += " Focus heavily on potential exam topics, conceptual testing, definitions, and active recall. Ask deeper application questions in flashcards.";
      } else if (option === "summarized") {
        customInstruction += " Prioritize conciseness, quick reference, streamlined definitions, and high-impact cheat-sheet points.";
      } else if (option === "conceptual") {
        customInstruction += " Highlight core theories, framework relations, the 'why' behind concepts, and comprehensive conceptual breakdowns.";
      }

      const prompt = `Please analyze the following student notes/study material and generate structured academic revision resources according to the specified schema:
      
      --- STUDY MATERIAL ---
      ${content}
      --- END STUDY MATERIAL ---`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: customInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "A high-yield question suitable for active recall (e.g., 'What is the primary function of mitochondria?'). Keep it clear and focused." },
                    answer: { type: Type.STRING, description: "A comprehensive, accurate, and easy-to-digest answer." }
                  },
                  required: ["question", "answer"]
                },
                description: "List of 8 to 15 educational flashcards mapping the central ideas of the material."
              },
              keyConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING, description: "The term, jargon, theory, historical figure, formula, or core idea." },
                    definition: { type: Type.STRING, description: "A short, precise, textbook-level definition." },
                    explanation: { type: Type.STRING, description: "A brief, friendly explanation or everyday analogy to make this intuitive." }
                  },
                  required: ["term", "definition", "explanation"]
                },
                description: "List of 6 to 12 key terms, theories, vocabulary words, or central concepts."
              },
              revisionNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A bulleted summary list of 8 to 15 key points, takeaways, summaries, or structured facts."
              }
            },
            required: ["flashcards", "keyConcepts", "revisionNotes"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from the Gemini model.");
      }

      // Try parsing the json output
      const resultData = JSON.parse(responseText.trim());
      return res.json(resultData);

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      return res.status(500).json({ 
        error: err.message || "An error occurred while generating study materials. Please check your API key and try again." 
      });
    }
  });

  // Vite preview / development vs production bundles
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
    console.log(`AI Flashcard Generator backend running on port ${PORT}`);
  });
}

startServer();
