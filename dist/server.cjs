var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
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
            type: import_genai.Type.OBJECT,
            properties: {
              flashcards: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    question: { type: import_genai.Type.STRING, description: "A high-yield question suitable for active recall (e.g., 'What is the primary function of mitochondria?'). Keep it clear and focused." },
                    answer: { type: import_genai.Type.STRING, description: "A comprehensive, accurate, and easy-to-digest answer." }
                  },
                  required: ["question", "answer"]
                },
                description: "List of 8 to 15 educational flashcards mapping the central ideas of the material."
              },
              keyConcepts: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    term: { type: import_genai.Type.STRING, description: "The term, jargon, theory, historical figure, formula, or core idea." },
                    definition: { type: import_genai.Type.STRING, description: "A short, precise, textbook-level definition." },
                    explanation: { type: import_genai.Type.STRING, description: "A brief, friendly explanation or everyday analogy to make this intuitive." }
                  },
                  required: ["term", "definition", "explanation"]
                },
                description: "List of 6 to 12 key terms, theories, vocabulary words, or central concepts."
              },
              revisionNotes: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
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
      const resultData = JSON.parse(responseText.trim());
      return res.json(resultData);
    } catch (err) {
      console.error("AI Generation Error:", err);
      return res.status(500).json({
        error: err.message || "An error occurred while generating study materials. Please check your API key and try again."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Flashcard Generator backend running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
