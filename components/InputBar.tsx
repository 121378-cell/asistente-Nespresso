import React, { useState, useRef, useEffect } from 'react';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopCircleIcon from './icons/StopCircleIcon';
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
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInput((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
        }
      };

      recognitionRef.current.onerror = (event: { error: string }) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || file) && !isLoading) {
      if (isRecording) {
        recognitionRef.current?.stop();
      }
      onSendMessage(input.trim(), file, useGoogleSearch);
      setInput('');
      removeFile();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 border-t border-gray-200">
      {filePreview && (
        <div
          className="max-w-4xl mx-auto mb-2 p-2 bg-gray-100 rounded-lg relative w-fit"
          role="region"
          aria-label="Vista previa del archivo adjunto"
        >
          {file?.type.startsWith('image/') ? (
            <img
              src={filePreview}
              alt="Vista previa de imagen adjunta"
              className="max-h-24 rounded"
            />
          ) : (
            <video
              src={filePreview}
              className="max-h-24 rounded"
              aria-label="Vista previa de video adjunto"
            />
          )}
          <button
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5 hover:bg-red-500"
            aria-label="Eliminar archivo adjunto"
            type="button"
          >
            <CloseIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 md:gap-4 max-w-4xl mx-auto"
        role="search"
        aria-label="Formulario de mensaje"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          aria-label="Seleccionar archivo para adjuntar"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isRecording}
          className="flex-shrink-0 w-11 h-11 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
          aria-label="Adjuntar imagen o video"
          title="Adjuntar archivo"
        >
          <PaperclipIcon className="w-6 h-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isLoading}
          className="flex-shrink-0 w-11 h-11 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
          aria-label={isRecording ? 'Detener dictado por voz' : 'Iniciar dictado por voz'}
          aria-pressed={isRecording}
          title={isRecording ? 'Detener dictado' : 'Dictar mensaje'}
        >
          {isRecording ? (
            <StopCircleIcon className="w-6 h-6 text-red-500 animate-pulse" aria-hidden="true" />
          ) : (
            <MicrophoneIcon className="w-6 h-6" aria-hidden="true" />
          )}
        </button>
        <label htmlFor="message-input" className="sr-only">
          Mensaje para el asistente
        </label>
        <input
          id="message-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isLoading
              ? 'Esperando respuesta...'
              : isRecording
                ? 'Escuchando... di lo que necesites.'
                : 'Describe el problema aquí...'
          }
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 text-gray-800"
          aria-label="Escribe tu mensaje sobre reparación de cafeteras"
          aria-describedby="input-help"
          aria-required="false"
        />
        <span id="input-help" className="sr-only">
          Describe el problema de tu cafetera Nespresso o haz una pregunta
        </span>
        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !file)}
          className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Enviar mensaje"
          title="Enviar mensaje"
        >
          <SendIcon className="w-6 h-6" aria-hidden="true" />
        </button>
      </form>
      <div
        className="max-w-4xl mx-auto mt-2 flex justify-center items-center"
        role="region"
        aria-label="Opciones de búsqueda"
      >
        <label htmlFor="google-search-toggle" className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id="google-search-toggle"
              className="sr-only"
              checked={useGoogleSearch}
              onChange={() => setUseGoogleSearch(!useGoogleSearch)}
              aria-label="Activar búsqueda web con Google"
              aria-describedby="search-description"
            />
            <div className="block bg-gray-300 w-10 h-6 rounded-full" aria-hidden="true"></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useGoogleSearch ? 'transform translate-x-full bg-blue-500' : ''}`}
              aria-hidden="true"
            ></div>
          </div>
          <div className="ml-3 text-xs text-gray-600 font-medium" id="search-description">
            {useGoogleSearch ? 'Búsqueda Web Activada' : 'Activar Búsqueda Web'}
          </div>
        </label>
      </div>
    </div>
  );
};

export default InputBar;
