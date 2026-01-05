import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatToAI } from '../../services/chatService';
import useAuth from '../../hooks/useAuth';
import styles from './CityBot.module.css';

const CityBot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username ? user.username : "Citizen";

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // --- LISTENING STATE ---
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hello ${displayName}! I am CityBot. How can I help?`, 
      sender: 'bot' 
    }
  ]);

  // Reset greeting if user changes
  useEffect(() => {
    const newName = user?.username || "Citizen";
    setMessages([{ id: Date.now(), text: `Hello ${newName}! I am CityBot. How can I help?`, sender: 'bot' }]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // --- VOICE HANDLER ---
  const handleMicClick = () => {
    if (!recognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Optional: Auto-send after speaking
        setTimeout(() => handleSend(null, transcript), 500); 
      };

      recognition.onerror = (event) => {
        console.error("Speech error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    }
  };

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || input;
    
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    const query = textToSend;
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatToAI(query);
      const aiText = response.data.response;

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'bot' }]);

      const lowerText = aiText.toLowerCase();
      if (lowerText.includes('opening events') || lowerText.includes('events page')) {
          navigate('/events');
      } else if (lowerText.includes('parking section') || lowerText.includes('parking page')) {
          navigate('/parking');
      } else if (lowerText.includes('facility') || lowerText.includes('facilities')) {
          navigate('/facilities');
      }

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection Weak. Try again.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* The Chat Window (Glass Panel) */}
      {isOpen && (
        <div className={styles.chatWindow}>
          
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.botIdentity}>
               <div className={styles.botDot}></div>
               <span>City Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>&times;</button>
          </div>
          
          {/* Chat Area */}
          <div className={styles.body}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.bot}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typingIndicator}>
                <span>●</span><span>●</span><span>●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className={styles.footer}>
            
            {/* Mic Button */}
            <button 
                type="button" 
                className={`${styles.micBtn} ${isListening ? styles.micActive : ''}`}
                onClick={handleMicClick}
                title="Speak"
            >
                {isListening ? (
                  <span className={styles.listeningWave}>||||</span> 
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
            </button>

            <input 
              type="text" 
              placeholder="Ask CityBot..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.input}
            />
            
            <button type="submit" className={styles.sendBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* --- UPDATED FLOATING BUTTON --- */}
      <button className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          /* Close Icon (X) */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <line x1="18" y1="6" x2="6" y2="18"></line>
             <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <>
            {/* Pulse Ring Animation */}
            <div className={styles.pulseRing}></div>
            
            {/* New Chat Icon (SVG) - Replaces Robot Emoji */}
             <svg
  fill="currentColor"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 45.342 45.342"
  aria-hidden="true"
>
  <g>
    <path d="M40.462,19.193H39.13v-1.872c0-3.021-2.476-5.458-5.496-5.458h-8.975v-4.49
      c1.18-0.683,1.973-1.959,1.973-3.423c0-2.182-1.771-3.95-3.951-3.95
      c-2.183,0-3.963,1.769-3.963,3.95c0,1.464,0.785,2.74,1.965,3.423v4.49h-8.961
      c-3.021,0-5.448,2.437-5.448,5.458v1.872H4.893c-1.701,0-3.091,1.407-3.091,3.108v6.653
      c0,1.7,1.39,3.095,3.091,3.095h1.381v1.887c0,3.021,2.427,5.442,5.448,5.442h2.564v2.884
      c0,1.701,1.393,3.08,3.094,3.08h10.596c1.701,0,3.08-1.379,3.08-3.08v-2.883h2.578
      c3.021,0,5.496-2.422,5.496-5.443V32.05h1.332c1.701,0,3.078-1.394,3.078-3.095v-6.653
      C43.54,20.601,42.165,19.193,40.462,19.193z

      M10.681,21.271c0-1.999,1.621-3.618,3.619-3.618
      c1.998,0,3.617,1.619,3.617,3.618c0,1.999-1.619,3.618-3.617,3.618
      C12.302,24.889,10.681,23.27,10.681,21.271z

      M27.606,34.473H17.75c-1.633,0-2.957-1.316-2.957-2.951
      c0-1.633,1.324-2.949,2.957-2.949h9.857c1.633,0,2.957,1.316,2.957,2.949
      S29.239,34.473,27.606,34.473z

      M31.056,24.889c-1.998,0-3.618-1.619-3.618-3.618
      c0-1.999,1.62-3.618,3.618-3.618c1.999,0,3.619,1.619,3.619,3.618
      C34.675,23.27,33.055,24.889,31.056,24.889z"/>
  </g>
</svg>
          </>
        )}
      </button>
    </div>
  );
};

export default CityBot;