import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_OLLAMA_API_KEY;
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || "gemma4:31b";

const SYSTEM_PROMPT =
  "You are a friendly customer-support assistant. Be polite and concise. " +
  "Do not invent order status, refund outcomes, policies or account details. " +
  "If business-specific information is unavailable, say so and suggest contacting a human agent.";

/* Fades in when scrolled into view and fades out when it leaves. */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "in" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

const SUGGESTIONS = [
  "How do I return an item?",
  "What are your support hours?",
  "Help me write a complaint",
  "ఆర్డర్ ఆలస్యం అయితే ఏమి చేయాలి?",
];

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  async function send(text) {
    const content = text.trim();
    if (!content || loading) return;
    if (!API_KEY) {
      setError("Add VITE_OLLAMA_API_KEY to client/.env and restart npm run dev.");
      return;
    }
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/ollama/api/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          stream: false,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...next.slice(-12)],
        }),
      });
      if (!res.ok) throw new Error(`Ollama returned status ${res.status}. Check your API key and model name.`);
      const data = await res.json();
      const reply = data?.message?.content?.trim();
      if (!reply) throw new Error("The model returned an empty reply. Try again.");
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Could not reach Ollama Cloud. Check your connection, or see the CORS note in the README."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat" id="chat">
      <div className="chat-head">
        <span className="dot" /> Support assistant
        <button className="ghost" onClick={() => { setMessages([]); setError(""); }} disabled={!messages.length}>
          New chat
        </button>
      </div>

      <div className="chat-body" aria-live="polite">
        {messages.length === 0 && (
          <div className="empty">
            <p>Ask about returns, delivery, accounts or anything else. Try one:</p>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>{m.content}</div>
        ))}
        {loading && (
          <div className="bubble assistant typing"><i /><i /><i /></div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question"
          aria-label="Your message"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>Send</button>
      </form>
    </div>
  );
}

const STEPS = [
  ["Ask in your own words", "Type a question in English or Telugu. No forms, no menus."],
  ["Get an answer in seconds", "The assistant replies using the recent conversation as context."],
  ["Reach a person when needed", "For account or refund decisions, you are pointed to a human agent."],
];

const TOPICS = [
  ["Returns and refunds", "How the process works and what to prepare."],
  ["Delivery questions", "What to do about delays and missing parcels."],
  ["Account help", "Sign-in problems, profile changes and settings."],
  ["Drafting messages", "Complaints, follow-ups and polite requests."],
];

const FAQ = [
  ["Can it check my order status?", "Not yet. It has no access to order data, so it will say so instead of guessing."],
  ["Is my chat saved?", "No. Messages stay in this browser tab and disappear when you close it."],
  ["Which languages work?", "English and Telugu, depending on what the selected model supports."],
];

export default function App() {
  const [open, setOpen] = useState(null);
  return (
    <>
      <nav className="nav">
        <strong>Helpline</strong>
        <a href="#chat">Start chatting</a>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <h1 className="hero-title">
            <span>Questions</span>
            <span>answered</span>
            <span>before the kettle boils.</span>
          </h1>
          <p>
            An AI support assistant that handles the everyday questions, and is
            honest when it needs a human to take over.
          </p>
        </div>
        <Chat />
      </header>

      <section className="section">
        <Reveal><h2>How a conversation goes</h2></Reveal>
        <div className="steps">
          {STEPS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 120} className="step">
              <span className="num">{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section band">
        <Reveal><h2>What you can ask about</h2></Reveal>
        <div className="topics">
          {TOPICS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 100} className="topic">
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section narrow">
        <Reveal><h2>Good to know</h2></Reveal>
        {FAQ.map(([q, a], i) => (
          <Reveal key={q} delay={i * 80}>
            <div className={`faq ${open === i ? "open" : ""}`}>
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                {q}<span className="plus" />
              </button>
              <div className="faq-a"><p>{a}</p></div>
            </div>
          </Reveal>
        ))}
      </section>

      <Reveal>
        <footer className="footer">
          <p>Answers are AI-generated and may be wrong. Check important details with a human agent.</p>
        </footer>
      </Reveal>
    </>
  );
}
