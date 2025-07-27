import React, { useEffect, useState, useRef } from 'react';
import { Bot } from '../App';
import { SendIcon, ArrowLeftIcon, SettingsIcon, TrashIcon } from 'lucide-react';
import { sendMessageToBot } from '../lib/api';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type ChatWindowProps = {
  bot: Bot;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (bot: Bot) => void;
};

export const ChatWindow = ({
  bot,
  onClose,
  onDelete,
  onUpdate
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: `¡Hola! Soy ${bot.name}. ¿En qué puedo ayudarte hoy?`,
    sender: 'bot',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(bot.name);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('mistralai/mistral-7b-instruct');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const formattedMessages = updatedMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch('http://localhost:8000/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
          instructions: bot.description || '',
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : 'Error al comunicarse con la IA',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = () => {
    if (newName.trim() && newName !== bot.name) {
      onUpdate({ ...bot, name: newName });
    }
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl h-[80vh] bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden" style={{
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
    }}>
      {/* Header con selector de modelo */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800" style={{
        background: 'linear-gradient(to right, rgba(10,20,40,0.9), rgba(20,30,60,0.9))',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800">
            <ArrowLeftIcon className="w-5 h-5 text-cyan-400" />
          </button>
          {isRenaming ? (
            <div className="flex items-center">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                onBlur={handleRename}
              />
              <button
                onClick={handleRename}
                className="ml-2 text-xs bg-cyan-600 px-2 py-1 rounded hover:bg-cyan-500"
              >
                Guardar
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center" style={{
                backgroundColor: 'rgba(10, 20, 40, 0.7)',
                boxShadow: `0 0 10px ${bot.color}, inset 0 0 5px ${bot.color}`,
                border: `1px solid ${bot.color}`
              }}></div>
              <h2 className="text-xl font-medium">{bot.name}</h2>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-gray-800 text-cyan-400 border border-gray-700 rounded px-2 py-1 text-sm"
          >
            <option value="mistralai/mistral-7b-instruct">Mistral 7B</option>
            <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>

          </select>
          <button
            onClick={() => setIsRenaming(!isRenaming)}
            className="p-2 rounded-full hover:bg-gray-800"
            title="Renombrar bot"
          >
            <SettingsIcon className="w-5 h-5 text-gray-400 hover:text-cyan-400" />
          </button>
          <button
            onClick={() => onDelete(bot.id)}
            className="p-2 rounded-full hover:bg-gray-800"
            title="Eliminar bot"
          >
            <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
              style={message.sender === 'bot' ? {
                boxShadow: `0 0 10px rgba(0, 255, 255, 0.1)`
              } : {}}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-cyan-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 border border-gray-700 rounded-lg px-4 py-2 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-200"></div>
                <span>Pensando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-white"
            placeholder="Escribe un mensaje..."
            rows={1}
            disabled={isLoading}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${
              !input.trim() || isLoading
                ? 'bg-gray-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25'
            }`}
            aria-label="Enviar mensaje"
          >
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};