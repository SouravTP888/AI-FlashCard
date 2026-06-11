# Synapse AI — Premium Flashcard & Study Deck Generator

A state-of-the-art revision deck generator featuring modern CSS glassmorphism, responsive dashboard grids, fluid animations, interactive 3D active recall cards, and direct/proxy integration with the Google Gemini API.

---

## Key Features

- **Translucent Glassmorphic UI**: High-end EdTech SaaS aesthetic with vibrant neon highlights, depth shadows, and interactive components.
- **Dual Connection Architecture**:
  - **Local Server Proxy**: Proxies requests via the built-in Express server (Node.js) on port 3000.
  - **Direct Browser Client**: Makes direct calls using standard client-entered API keys, saved securely in `localStorage`—ideal for static hosting (e.g. GitHub Pages).
- **Responsive Workspace**: Designed to look stunning on monitors, tablets, and mobile screens.
- **Upload & Paste options**: Supports direct `.txt` file dragging-and-dropping (under 2MB) alongside large-format text areas.
- **Study Mode Carousel**: Toggle between a structural dashboard grid and a large focused single-card Carousel view for studying.
- **Export & Utility Controls**: 
  - One-click markdown-friendly copy-buffer for all sections.
  - Custom structured JSON exporter.
  - Automatic Dark/Light mode theme syncing.

---

## Tech Stack & Structure

- **Structure**: Semantic HTML5 with Lucide Vectors (Web CDNs)
- **Styling**: Vanilla CSS3 custom variables, HSL color tokens, HMR-friendly layout grids, and Webkit filters.
- **Logic**: Pure modern JavaScript ES6 modules with browser standard file/clipboard mechanics.
- **AI Integrations**: Direct Google Gemini API requests or local Express proxying.

```
/ai-flashcard-generator
│
├── index.html       # Structural layout and components
├── style.css        # Custom design system and glassmorphism styling
├── script.js        # Event listeners, state control, and API fetching
├── server.ts        # Express Node proxy (runs Vite & Gemini API)
└── package.json     # Node dev scripts and dependencies
```

---

## Local Setup

### Prerequisites

You must have [Node.js](https://nodejs.org) installed on your system.

### Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Configure your Gemini API Key.
   Create a `.env.local` file in the root directory and add:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the address displayed in the terminal (usually `http://localhost:3000`).

---

## API Schema Formatting

The application is configured to demand and receive structured JSON formats from Gemini:

```json
{
  "flashcards": [
    {
      "question": "Active recall question",
      "answer": "Precise revision answer"
    }
  ],
  "keyConcepts": [
    {
      "term": "Framework or Vocabulary word",
      "definition": "Official definition",
      "explanation": "Intuitive analogy or real-world example"
    }
  ],
  "revisionCards": [
    "High-yield bullet summary card #1",
    "High-yield bullet summary card #2"
  ]
}
```
