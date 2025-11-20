
import React, { useState, useRef, useEffect } from 'react';
import { GenerateVideosOperation } from '@google/genai';
import { generateVideo, checkVideoStatus, checkApiKey, requestApiKey } from '../services/videoGenerationService';
import { fileToBase64 } from '../utils/fileUtils';
import CloseIcon from './icons/CloseIcon';
import LoadingSpinner from './LoadingSpinner';

interface VideoGeneratorModalProps {
  onClose: () => void;
}

type AspectRatio = '16:9' | '9:16';

const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    checkApiKey().then(setHasApiKey);
  }, []);

  const handleSelectKey = async () => {
    await requestApiKey();
    setHasApiKey(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setGeneratedVideoUrl(null);
      setError(null);
    }
  };

  const pollOperation = async (operation: GenerateVideosOperation) => {
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      try {
        operation = await checkVideoStatus(operation);
      } catch (e) {
        console.error(e);
        setError('Hubo un error al verificar el estado del vídeo.');
        setIsLoading(false);
        return null;
      }
    }
    return operation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !prompt) {
      setError('Por favor, sube una imagen y escribe una descripción.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Preparando para generar el vídeo...');
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      setLoadingMessage('Iniciando la generación de vídeo... Esto puede tardar varios minutos.');
      let operation = await generateVideo(prompt, { imageBytes: base64Image, mimeType: imageFile.type }, aspectRatio);
      
      setLoadingMessage('Procesando el vídeo en los servidores de Google... Mantén esta ventana abierta.');
      const finalOperation = await pollOperation(operation);

      if (finalOperation?.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = `${finalOperation.response.generatedVideos[0].video.uri}&key=${process.env.API_KEY}`;
        const response = await fetch(downloadLink);
        const videoBlob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(videoBlob));
      } else {
        setError('No se pudo generar el vídeo. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const renderContent = () => {
    if (hasApiKey === null) {
      return <div className="p-8 text-center">Verificando configuración...</div>;
    }

    if (!hasApiKey) {
      return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Se requiere una API Key</h2>
            <p className="text-gray-600 mb-6">Para usar la generación de vídeo, necesitas seleccionar una API Key de tu proyecto. El uso de esta función puede incurrir en costes. Consulta la <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">documentación de facturación</a>.</p>
            <button onClick={handleSelectKey} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">Seleccionar API Key</button>
            <button onClick={onClose} className="mt-2 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
        </div>
      );
    }
    
    if (error) {
       // Reset button for errors
    }

    if (isLoading) {
      return (
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">{loadingMessage}</p>
        </div>
      );
    }

    if (generatedVideoUrl) {
      return (
        <div className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">¡Tu vídeo está listo!</h3>
            <video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-md shadow-md"></video>
            <a href={generatedVideoUrl} download="generated_video.mp4" className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600">Descargar Vídeo</a>
            <button onClick={() => setGeneratedVideoUrl(null)} className="mt-4 ml-2 inline-block px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300">Crear otro</button>
        </div>
      );
    }

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Generar Vídeo con Veo</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
        
        {/* Tabla de Contenidos / Navegación Rápida */}
        <nav className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Contenido</h3>
          <ul className="flex flex-col md:flex-row md:justify-around space-y-1 md:space-y-0 text-sm">
            <li><a href="#video-image-upload" className="text-blue-600 hover:underline">1. Subir imagen</a></li>
            <li><a href="#video-prompt-description" className="text-blue-600 hover:underline">2. Descripción del vídeo</a></li>
            <li><a href="#video-aspect-ratio" className="text-blue-600 hover:underline">3. Configuración de orientación</a></li>
          </ul>
        </nav>

        <form onSubmit={handleSubmit}>
          <div id="video-image-upload" className="mb-4 pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">1. Sube una imagen de inicio</label>
            <div onClick={() => fileInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" className="mx-auto h-24 w-auto rounded" />
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
                <div className="flex text-sm text-gray-600">
                  <p className="pl-1">{imageFile ? `Archivo: ${imageFile.name}` : 'Haz clic para subir un archivo'}</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
              </div>
            </div>
            <input ref={fileInputRef} id="file-upload-veo" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
          </div>

          <div id="video-prompt-description" className="mb-4 pt-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">2. Describe qué quieres que pase en el vídeo</label>
            <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ej: un coche futurista aparece y se va volando"></textarea>
          </div>

          <div id="video-aspect-ratio" className="mb-6 pt-2">
            <label className="block text-sm font-medium text-gray-700">3. Elige la orientación</label>
            <div className="mt-2 flex gap-4">
              <label className={`flex-1 p-3 border rounded-md cursor-pointer text-center ${aspectRatio === '16:9' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}>
                <input type="radio" name="aspectRatio" value="16:9" checked={aspectRatio === '16:9'} onChange={() => setAspectRatio('16:9')} className="sr-only" />
                <span>Horizontal (16:9)</span>
              </label>
              <label className={`flex-1 p-3 border rounded-md cursor-pointer text-center ${aspectRatio === '9:16' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}>
                <input type="radio" name="aspectRatio" value="9:16" checked={aspectRatio === '9:16'} onChange={() => setAspectRatio('9:16')} className="sr-only" />
                <span>Vertical (9:16)</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={!imageFile || !prompt || isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
            Generar Vídeo
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      {/* Añadido scroll-smooth para que la navegación interna sea fluida */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto scroll-smooth" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 z-10"><CloseIcon className="w-6 h-6" /></button>
        {renderContent()}
      </div>
    </div>
  );
};

export default VideoGeneratorModal;
