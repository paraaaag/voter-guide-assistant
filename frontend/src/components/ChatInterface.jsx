import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatInterface.module.css';
import { askAssistant } from '../api';

export default function ChatInterface({ selectedState }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your election assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (event) => {
    event?.preventDefault();
    if (!input.trim() || !selectedState || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAssistant(userMsg, selectedState);
      setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support the Web Speech API.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!selectedState) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.emptyState}>Please select a state on the Home screen first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatCard}>
        <div className={styles.messageList} role="log" aria-live="polite">
          {messages.map((messageItem, index) => (
            <div key={index} className={`${styles.messageWrapper} ${messageItem.role === 'user' ? styles.wrapperUser : styles.wrapperBot}`}>
              <div className={`${styles.messageBubble} ${messageItem.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
                {messageItem.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.messageWrapper} ${styles.wrapperBot}`}>
              <div className={`${styles.messageBubble} ${styles.bubbleBot}`}>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputArea} onSubmit={handleSend}>
          <button 
            type="button" 
            className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
            onClick={handleMicClick}
            title="Voice Input"
            aria-label="Start voice input"
            aria-pressed={isListening}
          >
            {isListening ? '🎙️...' : '🎙️'}
          </button>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Type your question..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isLoading}
            aria-label="Type your message"
          />
          <button 
            type="submit" 
            className={styles.sendButton} 
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
