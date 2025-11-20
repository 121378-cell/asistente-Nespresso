
import React, { useState } from 'react';
import { Role, Message } from '../types';
import CoffeeIcon from './icons/CoffeeIcon';
import SpeakerIcon from './icons/SpeakerIcon';
import { generateSpeech } from '../services/geminiService';
import { playPcmAudio } from '../utils/audioUtils';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === Role.MODEL;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const messageClasses = `max-w-xl lg:max-w-2xl xl:max-w-3xl w-fit p-4 rounded-2xl mb-4 shadow-md ${
    isModel
      ? 'bg-white text-gray-800 rounded-bl-none'
      : 'bg-blue-500 text-white ml-auto rounded-br-none'
  }`;
  
  const textContent = message.text || '';
  const formattedText = textContent.split('\n').map((line, index) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
    return <p key={index} className="mb-2 last:mb-0">{parts}</p>;
  });

  const handleSpeak = async () => {
    if (isSpeaking) return;
    
    try {
        setIsLoadingAudio(true);
        const base64Audio = await generateSpeech(textContent);
        setIsLoadingAudio(false);
        setIsSpeaking(true);
        await playPcmAudio(base64Audio);
    } catch (error) {
        console.error("Failed to play audio", error);
        alert("No se pudo reproducir el audio. Inténtalo de nuevo.");
    } finally {
        setIsLoadingAudio(false);
        setIsSpeaking(false);
    }
  };

  // Safely check if grounding chunks exist and have length
  const hasGroundingChunks = message.groundingMetadata?.groundingChunks && 
                             Array.isArray(message.groundingMetadata.groundingChunks) && 
                             message.groundingMetadata.groundingChunks.length > 0;

  return (
    <div className={`flex items-start gap-4 ${!isModel ? 'justify-end' : ''}`}>
      {isModel && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
          <CoffeeIcon className="w-6 h-6" />
        </div>
      )}
      <div className={messageClasses}>
        {message.attachment && (
            <div className="mb-3 rounded-lg overflow-hidden">
                {message.attachment.type.startsWith('image/') ? (
                    <img src={message.attachment.url} alt="Adjunto" className="max-w-xs max-h-64 object-contain" />
                ) : (
                    <video src={message.attachment.url} controls className="max-w-xs max-h-64" />
                )}
            </div>
        )}
        
        <div className="prose prose-sm md:prose-base prose-blue max-w-none">
            {formattedText}
        </div>

        {isModel && (
            <div className="mt-2 flex justify-end border-t border-gray-100 pt-2">
                <button 
                    onClick={handleSpeak} 
                    disabled={isSpeaking || isLoadingAudio}
                    className={`p-1.5 rounded-full transition-colors ${isSpeaking ? 'text-blue-500 bg-blue-50 animate-pulse' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                    title="Leer en voz alta"
                >
                    {isLoadingAudio ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    ) : (
                        <SpeakerIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
        )}

         {hasGroundingChunks && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Fuentes:</h4>
            <ul className="space-y-2">
              {message.groundingMetadata!.groundingChunks.map((chunk, index) => {
                 if (chunk.web?.uri) {
                    return (
                        <li key={`web-${index}`} className="text-xs">
                            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline break-all">
                            <span className="text-gray-400">🔗</span> {chunk.web.title || chunk.web.uri}
                            </a>
                        </li>
                    );
                 }
                 return null;
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
