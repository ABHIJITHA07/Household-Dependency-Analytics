import React, { useState, useRef, useEffect } from 'react';
import { insightService } from '../../services/insight.service.js';
import { useHousehold } from '../../hooks/useHousehold.js';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Trash2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

const CHAT_STORAGE_KEY = 'gemini_chat_messages_v1';
const CHAT_OPEN_KEY = 'gemini_chat_is_open_v1';

const DEFAULT_WELCOME = {
  id: 'welcome-1',
  sender: 'assistant',
  text: 'Hi! How can I help you understand your household finances today?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export default function GeminiChatWidget({ currentHouseholdId = null }) {
  const { activeHouseholdId, activeHousehold } = useHousehold();
  const effectiveHouseholdId = currentHouseholdId || activeHouseholdId || activeHousehold?.id || null;

  const [isOpen, setIsOpen] = useState(() => {
    try {
      const savedState = sessionStorage.getItem(CHAT_OPEN_KEY);
      return savedState ? JSON.parse(savedState) : false;
    } catch {
      return false;
    }
  });

  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not restore chat session:', e);
    }
    return [DEFAULT_WELCOME];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "How can my household increase monthly savings?",
    "Explain my household dependency ratio.",
    "Where can I reduce discretionary expenses?",
    "Tips for building an emergency fund."
  ];

  // Persist open/closed state
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_OPEN_KEY, JSON.stringify(isOpen));
    } catch (e) {
      console.warn('Could not save chat open state:', e);
    }
  }, [isOpen]);

  // Persist messages array
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat messages:', e);
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setError(null);
    setIsLoading(true);

    try {
      const res = await insightService.chat(trimmed, effectiveHouseholdId);
      const replyData = res.data?.data || res.data || {};
      const replyText = replyData.reply || 'Thank you for your question. Here are suggestions based on standard financial resilience principles.';

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        disclaimer: replyData.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      setLastFailedMessage(null);
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message || 'Failed to reach Gemini AI Assistant.';
      setError(errMsg);
      setLastFailedMessage(trimmed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const resetMsg = {
      id: `welcome-reset-${Date.now()}`,
      sender: 'assistant',
      text: 'Hi! How can I help you understand your household finances today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([resetMsg]);
    setError(null);
    setLastFailedMessage(null);
  };

  return (
    <div style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 1000 }}>
      {/* Floating Circular Chatbot Toggle Button */}
      {!isOpen && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            id="gemini-chat-toggle-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Gemini AI Assistant"
            title="Ask Gemini"
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-dark-peach) 0%, #B85B43 100%)',
              color: '#FFFFFF',
              border: '2px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 8px 24px rgba(74, 59, 53, 0.22), 0 2px 8px rgba(246, 183, 168, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              outline: 'none',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08) translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(74, 59, 53, 0.28), 0 4px 12px rgba(246, 183, 168, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 59, 53, 0.22), 0 2px 8px rgba(246, 183, 168, 0.4)';
            }}
          >
            <Bot size={26} color="#FFFFFF" />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-pistachio)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--color-surface)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Sparkles size={10} color="var(--color-cocoa)" />
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Panel Window */}
      {isOpen && (
        <div
          id="gemini-chat-window"
          className="animate-slide-up"
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            zIndex: 1000,
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 16px 40px rgba(74, 59, 53, 0.18), 0 4px 16px rgba(246, 183, 168, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--color-dark-peach) 0%, #B85B43 100%)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Bot size={20} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                  Gemini AI Assistant
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', opacity: 0.9, marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ADE80' }}></span>
                  <span>gemini-2.5-flash • Interactive</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={clearChat}
                title="Clear Chat"
                aria-label="Clear Chat"
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'; }}
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                aria-label="Close Chat"
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'; }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--color-surface-alt)'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: msg.sender === 'user' ? '82%' : '88%',
                    padding: '11px 15px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: msg.sender === 'user' ? 'var(--color-dark-peach)' : 'var(--color-surface)',
                    color: msg.sender === 'user' ? '#FFFFFF' : 'var(--color-dark-text)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--color-border)',
                    boxShadow: msg.sender === 'user'
                      ? '0 3px 10px rgba(224, 149, 132, 0.3)'
                      : '0 2px 8px rgba(74, 59, 53, 0.05)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line'
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>

                  {msg.disclaimer && (
                    <div
                      style={{
                        marginTop: '8px',
                        paddingTop: '6px',
                        borderTop: '1px solid var(--color-border)',
                        fontSize: '0.72rem',
                        color: 'var(--color-muted-text)',
                        fontStyle: 'italic'
                      }}
                    >
                      ⚠️ {msg.disclaimer}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontSize: '0.70rem',
                    color: 'var(--color-muted-text)',
                    marginTop: '4px',
                    padding: '0 4px'
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Quick Prompt Suggestions */}
            {messages.length <= 2 && (
              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px dashed var(--color-border)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted-text)', marginBottom: '8px' }}>
                  Suggested Questions:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      style={{
                        textAlign: 'left',
                        fontSize: '0.80rem',
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-dark-text)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-soft-peach)';
                        e.currentTarget.style.borderColor = 'var(--color-dark-peach)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                      }}
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '10px 14px',
                    fontSize: '0.84rem',
                    color: 'var(--color-muted-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(74, 59, 53, 0.05)'
                  }}
                >
                  <Sparkles size={16} color="var(--color-dark-peach)" style={{ animation: 'spin 2s linear infinite' }} />
                  <span>Gemini is thinking...</span>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-peach)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-danger)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
                {lastFailedMessage && (
                  <button
                    type="button"
                    onClick={() => handleSendMessage(lastFailedMessage)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: 'var(--color-danger)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Text Input Footer */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <input
              id="gemini-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your household finances..."
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-family)',
                color: 'var(--color-dark-text)',
                backgroundColor: 'var(--color-surface-alt)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'var(--transition-fast)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-dark-peach)';
                e.target.style.boxShadow = '0 0 0 3px rgba(246, 183, 168, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />

            <button
              id="gemini-chat-send-btn"
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              title="Send Message"
              aria-label="Send Message"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-dark-peach)',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !inputText.trim() ? 0.5 : 1,
                transition: 'var(--transition-fast)',
                boxShadow: '0 4px 12px rgba(224, 149, 132, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && inputText.trim()) {
                  e.currentTarget.style.backgroundColor = '#B85B43';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && inputText.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--color-dark-peach)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
