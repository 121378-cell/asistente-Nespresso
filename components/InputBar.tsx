import React, { useState, useRef, useEffect } from 'react';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopCircleIcon from './icons/StopCircleIcon';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/geminiService';
import CloseIcon from './icons/CloseIcon';

interface InputBarProps {
  onSendMessage: (message: string, file?: File, useGoogleSearch?: boolean) => void;
  isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, audioBlob, startRecording, stopRecording, reset } = useAudioRecorder();

  useEffect(() => {
    if (audioBlob) {
      const transcribe = async () => {
        const audioFile = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
        const transcribedText = await transcribeAudio(audioFile);
        setInput(prev => prev ? `${prev} ${transcribedText}` : transcribedText);
        reset();
      };
      transcribe();
    }
  }, [audioBlob, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || file) && !isLoading && status !== 'recording') {
      onSendMessage(input.trim(), file, useGoogleSearch);
      setInput('');
      removeFile();
    }
  };

  const isRecording = status === 'recording';

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 border-t border-gray-200">
        {filePreview && (
            <div className="max-w-4xl mx-auto mb-2 p-2 bg-gray-100 rounded-lg relative w-fit">
                {file?.type.startsWith('image/') 
                    ? <img src={filePreview} alt="Preview" className="max-h-24 rounded" />
                    : <video src={filePreview} className="max-h-24 rounded" />
                }
                <button onClick={removeFile} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5 hover:bg-red-500">
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-4 max-w-4xl mx-auto">
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload"/>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isRecording} className="flex-shrink-0 w-11 h-11 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors">
            <PaperclipIcon className="w-6 h-6" />
        </button>
        <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isLoading} className="flex-shrink-0 w-11 h-11 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors">
            {isRecording ? <StopCircleIcon className="w-6 h-6 text-red-500 animate-pulse" /> : <MicrophoneIcon className="w-6 h-6" />}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Esperando respuesta..." : isRecording ? "Grabando... habla ahora." : "Describe el problema aquí..."}
          disabled={isLoading || isRecording}
          className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 text-gray-800"
          aria-label="User input"
        />
        <button
          type="submit"
          disabled={isLoading || isRecording || (!input.trim() && !file)}
          className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Send message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
       <div className="max-w-4xl mx-auto mt-2 flex justify-center items-center">
            <label htmlFor="google-search-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id="google-search-toggle" className="sr-only" checked={useGoogleSearch} onChange={() => setUseGoogleSearch(!useGoogleSearch)} />
                    <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useGoogleSearch ? 'transform translate-x-full bg-blue-500' : ''}`}></div>
                </div>
                <div className="ml-3 text-xs text-gray-600 font-medium">
                    {useGoogleSearch ? "Búsqueda Web Activada" : "Activar Búsqueda Web"}
                </div>
            </label>
        </div>
    </div>
  );
};

export default InputBar;
