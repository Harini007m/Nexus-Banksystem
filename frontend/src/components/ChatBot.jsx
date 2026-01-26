import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiSearch, FiFileText, FiCheckCircle } from 'react-icons/fi';
import botIcon from '../assets/chat-bot-icon.png';
import { FAQS } from '../data/chatbotData';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Nexus AI assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const SUGGESTED_QUESTIONS = [
        {
            question: "Why do banks check details before giving a loan?",
            icon: FiSearch,
            gradient: "from-blue-500 to-cyan-600"
        },
        {
            question: "What is KYC?",
            icon: FiFileText,
            gradient: "from-purple-500 to-pink-600"
        },
        {
            question: "Who gives final approval for a loan?",
            icon: FiCheckCircle,
            gradient: "from-orange-500 to-red-600"
        }
    ];

    const processMessage = async (text) => {
        const userMessage = { id: Date.now(), text: text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Normalize input
        const lowerInput = text.toLowerCase().trim();
        const words = lowerInput.split(/\s+/).filter(w => w.length > 3);

        // Intent: Greetings
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon'];
        if (greetings.some(g => lowerInput.includes(g))) {
            setTimeout(() => {
                const response = "Hello! I am your intelligent Nexus assistant. I can help you understand our loan approval process, roles, and technical requirements. How can I assist you today?";
                setMessages(prev => [...prev, { id: Date.now(), text: response, sender: 'bot' }]);
                setIsTyping(false);
            }, 1000);
            return;
        }

        // Search for matches based on keywords and scores
        let bestMatch = null;
        let highestScore = 0;
        let potentialMatches = [];

        FAQS.forEach(faq => {
            let score = 0;
            const faqQuestion = faq.question.toLowerCase();

            // Exact or partial question match (high priority)
            if (faqQuestion.includes(lowerInput)) score += 10;

            // Keyword matching (weighted based on relevance)
            faq.keywords.forEach(kw => {
                const lowerKw = kw.toLowerCase();
                if (lowerInput === lowerKw) score += 8; // Exact keyword match
                else if (lowerInput.includes(lowerKw)) score += 4; // Partial keyword match
                else if (lowerKw.includes(lowerInput) && lowerInput.length > 2) score += 3; // Input is part of a keyword
            });

            // Word-by-word matching for informal queries
            const queryWords = lowerInput.split(/\s+/).filter(w => w.length > 2);
            queryWords.forEach(word => {
                if (faqQuestion.includes(word)) score += 2;
                if (faq.keywords.map(k => k.toLowerCase()).some(k => k.includes(word))) score += 1.5;
            });

            if (score > 1.5) {
                potentialMatches.push({ faq, score });
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = faq;
                }
            }
        });

        setTimeout(() => {
            let botResponse = "";

            if (highestScore > 6) {
                // High confidence match
                const levelPrefix = bestMatch.level === 'high' ? "Certainly! From a strategic perspective: " :
                    bestMatch.level === 'intermediate' ? "As per our technical guidelines: " : "";
                botResponse = `${levelPrefix}${bestMatch.answer}`;
            } else if (highestScore > 2 && potentialMatches.length > 1) {
                // Potential matches: Ask clarification but provide the best one first
                const sorted = potentialMatches.sort((a, b) => b.score - a.score);
                botResponse = `I think you're asking about ${sorted[0].faq.question.replace('?', '')}. ${sorted[0].faq.answer}\n\nWas that what you were looking for? Or did you mean something related to ${sorted[1].faq.question}?`;
            } else if (bestMatch) {
                // Best effort match
                botResponse = `To answer your question about ${bestMatch.question.toLowerCase().replace('?', '')}: ${bestMatch.answer}`;
            } else {
                // Professional and helpful fallback (never "I don't know")
                botResponse = "Nexus Bank offers a wide range of services including Personal, Education, and Home loans with competitive interest rates starting at 7.5%. We prioritize security and efficiency through our 4-role consolidated approval system. Could you tell me more about what you're looking for so I can provide specific details?";
            }

            const botMessage = { id: Date.now() + 1, text: botResponse, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1200);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        await processMessage(inputText);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-80 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ height: '500px' }}
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm overflow-hidden border border-white/30">
                                    <img src={botIcon} alt="Nexus AI" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Nexus AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100 text-xs">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                            >
                                <FiX />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.sender === 'bot' && (
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 mr-2 self-end mb-1">
                                            <img src={botIcon} alt="Bot" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                        }`}>
                                        <p>{msg.text}</p>
                                        <p className="text-[10px] opacity-50 mt-1 text-right">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Suggested Questions */}
                            {messages.length === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-4"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Questions</span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {SUGGESTED_QUESTIONS.map((item, idx) => (
                                            <motion.button
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + (idx * 0.1), type: "spring" }}
                                                whileHover={{ scale: 1.02, x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => processMessage(item.question)}
                                                className="group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                                }}
                                            >
                                                {/* Gradient overlay on hover */}
                                                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                                                {/* Shimmer effect */}
                                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

                                                <div className="relative flex items-start gap-3">
                                                    {/* Icon */}
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-lg shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                                        <item.icon className="text-white" />
                                                    </div>

                                                    {/* Question text */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors leading-relaxed">
                                                            {item.question}
                                                        </p>
                                                    </div>

                                                    {/* Arrow indicator */}
                                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Bottom accent line */}
                                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {isTyping && (
                                <div className="flex justify-start items-end">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 mr-2 mb-1">
                                        <img src={botIcon} alt="Bot" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 border border-slate-700 flex gap-1">
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-slate-800/50 border-t border-slate-700/50">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-900 border border-slate-700/50 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform active:scale-95"
                                >
                                    <FiSend />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-50 overflow-hidden border-2 ${isOpen
                    ? 'bg-slate-800 border-slate-600 rotate-90 shadow-2xl'
                    : 'bg-slate-900 border-blue-500 hover:shadow-blue-500/50'
                    }`}
                style={{
                    boxShadow: isOpen ? '' : '0 0 15px #3b82f6, 0 0 30px #3b82f6'
                }}
            >
                {isOpen ? (
                    <FiX className="text-xl text-white" />
                ) : (
                    <img src={botIcon} alt="Chat" className="w-full h-full object-cover" />
                )}
            </motion.button>
        </div>
    );
};

export default ChatBot;
