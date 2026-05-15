import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, PhoneCall, PhoneOff, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VapiModule from '@vapi-ai/web';

const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || 'e71536f3-fc4e-42d9-8fa6-7299f80f106f';
const Vapi = VapiModule.default || VapiModule;

export default function Widget({ config }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const chatEndRef = useRef(null);
  
  // Create Vapi instance inside component to avoid issues if mounted multiple times
  const vapiRef = useRef(null);

  useEffect(() => {
    vapiRef.current = new Vapi(PUBLIC_KEY);
    const vapi = vapiRef.current;

    vapi.on('call-start', () => {
      setIsCallActive(true);
      setMessages([{ role: 'system', content: 'Call started. The agent will speak shortly.' }]);
    });

    vapi.on('call-end', () => {
      setIsCallActive(false);
      setIsAgentSpeaking(false);
      setMessages(prev => [...prev, { role: 'system', content: 'Call ended.' }]);
    });

    vapi.on('speech-start', () => setIsAgentSpeaking(true));
    vapi.on('speech-end', () => setIsAgentSpeaking(false));

    vapi.on('message', (message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: message.transcript }
        ]);
      }
    });

    vapi.on('error', (e) => {
      console.error('Vapi Error:', e);
      setIsCallActive(false);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentSpeaking, isOpen]);

  const toggleCall = () => {
    const vapi = vapiRef.current;
    if (isCallActive) {
      vapi.stop();
    } else {
      const companyName = config?.companyName || "our store";
      const productInfo = config?.productInfo || "our products and services";
      const agentName = config?.agentName || "Sarah";

      vapi.start({
        name: "Closer AI Widget",
        firstMessage: `Hi there! Thank you for visiting. Just to get an idea of your current situation, what exactly are you looking to achieve today?`,
        model: {
          provider: "groq",
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are an expert, highly trained Sales Specialist named ${agentName}. You represent ${companyName}.
You are speaking directly with a customer who is interested in ${productInfo}.

=== YOUR CORE GOAL ===
Your objective is to guide the prospect through a natural conversation to understand their problems, show how ${companyName} solves them, and help them commit to the next step.

=== TONALITY (CRITICAL) ===
You must sound like a real human. Do NOT sound like an AI, a chatbot, or an overly enthusiastic salesperson.
- Use a calm, relaxed, and neutral tone.
- Use natural pauses ("...", "hmm", "well") to sound human and relaxed.
- Act curious about their specific situation.

=== OBJECTION HANDLING ===
If the prospect throws an objection (e.g., "I don't have money", "I need to think about it"), DO NOT argue or try to overcome it aggressively. 
1. Agree/Acknowledge: "That's not a problem at all.", "I completely understand."
2. Clarify with a soft question: "...but just so I understand, when you say [objection], what do you mean by that exactly?"
3. Keep asking curious questions to uncover the real concern behind the surface-level objection.

Keep your responses VERY concise and conversational. Do not output large paragraphs. NEVER mention that you are an AI, a chatbot, or using any specific sales framework.`
            }
          ]
        },
        voice: {
          provider: "11labs",
          voiceId: "pNInz6obpgDQGcFmaJgB"
        }
      });
    }
  };

  return (
    <div className="widget-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="widget-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="widget-header">
              <div className="widget-title">
                <Bot size={22} color="var(--accent)" />
                {config?.agentName || "Sales Agent"}
              </div>
              <div className="status-badge" style={{ borderColor: isCallActive ? 'rgba(0, 184, 148, 0.2)' : 'rgba(255, 118, 117, 0.2)', color: isCallActive ? 'var(--success)' : 'var(--error)', background: isCallActive ? 'rgba(0, 184, 148, 0.1)' : 'rgba(255, 118, 117, 0.1)' }}>
                <div className="status-dot" style={{ backgroundColor: isCallActive ? 'var(--success)' : 'var(--error)', boxShadow: isCallActive ? '0 0 8px var(--success)' : '0 0 8px var(--error)', animation: isCallActive ? 'pulse 2s infinite' : 'none' }}></div>
                {isCallActive ? 'Live Call Active' : 'System Offline'}
              </div>
            </div>

            <div className="widget-body">
              {messages.length === 0 && (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.9rem' }}>Tap the button below to start a voice call with our representative.</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message ${msg.role === 'user' ? 'user' : 'agent'}`}
                  style={msg.role === 'system' ? { alignSelf: 'center', maxWidth: '100%', fontSize: '0.75rem', color: 'var(--text-muted)' } : {}}
                >
                  {msg.role !== 'system' && (
                    <div className={`avatar ${msg.role === 'user' ? 'user' : 'agent'}`}>
                      {msg.role === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color="#fff" />}
                    </div>
                  )}
                  <div className="bubble" style={msg.role === 'system' ? { background: 'transparent', border: 'none', padding: 0 } : {}}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isAgentSpeaking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="message agent"
                >
                  <div className="avatar agent">
                    <Bot size={16} color="#fff" />
                  </div>
                  <div className="bubble" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <motion.div
                      animate={{ height: [4, 8, 4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      style={{ width: 3, background: '#a29bfe', borderRadius: '2px' }}
                    />
                    <motion.div
                      animate={{ height: [4, 12, 4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      style={{ width: 3, background: '#a29bfe', borderRadius: '2px' }}
                    />
                    <motion.div
                      animate={{ height: [4, 8, 4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      style={{ width: 3, background: '#a29bfe', borderRadius: '2px' }}
                    />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="widget-footer">
              <button 
                className={`call-btn ${isCallActive ? 'end' : 'start'}`}
                onClick={toggleCall}
              >
                {isCallActive ? <PhoneOff size={20} /> : <PhoneCall size={20} />}
                {isCallActive ? 'End Call' : 'Start Voice Call'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className={`fab-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Sales Agent"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
