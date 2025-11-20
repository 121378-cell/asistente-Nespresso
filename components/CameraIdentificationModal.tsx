
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { identifyMachineFromImage } from '../services/geminiService';
import { parseSerialNumber } from '../utils/machineUtils';
import CloseIcon from './icons/CloseIcon';
import CameraIcon from './icons/CameraIcon';
import LoadingSpinner from './LoadingSpinner';
import SearchIcon from './icons/SearchIcon';

interface CameraIdentificationModalProps {
  onClose: () => void;
  onIdentify: (data: { model: string; serialNumber: string }) => void;
}

const CameraIdentificationModal: React.FC<CameraIdentificationModalProps> = ({ onClose, onIdentify }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualSerial, setManualSerial] = useState('');

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Puedes intentar introducir el número de serie manualmente abajo.");
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setError(null);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const base64Image = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];

    try {
      const result = await identifyMachineFromImage(base64Image);
      if (!result.model && !result.serialNumber) {
        throw new Error("No se pudo identificar el modelo ni el número de serie. Intenta con una foto más clara y nítida de la etiqueta.");
      }
      stopCamera();
      onIdentify(result);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSerial.trim()) return;

    const result = parseSerialNumber(manualSerial);
    
    if (result) {
        stopCamera();
        onIdentify({ model: result.model, serialNumber: result.serial });
    } else {
        setError("Número de serie no reconocido. Asegúrate de que es un número de serie válido de Nespresso Profesional (ej: contiene una 'Z' en la 6ª posición para Zenius).");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Identificar Máquina</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6 flex-1 flex flex-col items-center justify-center">
            {isLoading ? (
                <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Analizando imagen... Esto puede tardar un momento.</p>
                </div>
            ) : (
                <>
                    <div className="w-full mb-6">
                        <p className="text-center text-gray-600 mb-4 text-sm">Apunta la cámara a la etiqueta del número de serie.</p>
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 w-full text-center text-sm">{error}</p>}
                        <div className="w-full aspect-video bg-gray-900 rounded-md overflow-hidden relative shadow-inner mx-auto max-w-md">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                            {!stream && !error && <div className="absolute inset-0 flex items-center justify-center text-white"><LoadingSpinner /></div>}
                        </div>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="flex justify-center mt-4">
                            <button 
                                onClick={handleCapture} 
                                disabled={!stream || isLoading}
                                className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors shadow"
                            >
                                <CameraIcon className="w-5 h-5" />
                                Capturar Foto
                            </button>
                        </div>
                        {error && stream === null && <button onClick={startCamera} className="block mx-auto mt-2 text-sm text-blue-600 hover:underline">Reintentar cámara</button>}
                    </div>

                    <div className="w-full flex items-center gap-4 mb-6">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <span className="text-gray-400 text-sm font-medium uppercase">O Manualmente</span>
                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

                    <form onSubmit={handleManualSubmit} className="w-full max-w-md bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label htmlFor="manualSerial" className="block text-sm font-medium text-gray-700 mb-2">Introduce el Número de Serie:</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                id="manualSerial"
                                value={manualSerial}
                                onChange={(e) => setManualSerial(e.target.value)}
                                placeholder="Ej: 11345Z..." 
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                            />
                            <button 
                                type="submit"
                                disabled={!manualSerial.trim()}
                                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                <SearchIcon className="w-4 h-4" />
                                Validar
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">El asistente detectará el modelo automáticamente basándose en el código del número de serie.</p>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default CameraIdentificationModal;
