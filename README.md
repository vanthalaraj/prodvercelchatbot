# AI Customer Support Chatbot (React + Ollama Cloud)

Frontend-only React app (Vite). The browser calls https://ollama.com/api/chat directly.

## Run
1. npm install
2. Copy .env.example to .env and set VITE_OLLAMA_API_KEY (and VITE_OLLAMA_MODEL if needed)
3. npm run dev  (open http://localhost:5173)

## Notes
- VITE_ variables are bundled into the page, so the key is visible in the browser.
  Fine for local use; use a backend before deploying publicly.
- CORS error? See the commented proxy in vite.config.js.
