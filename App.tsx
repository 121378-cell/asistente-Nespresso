
import React, { useState, useEffect, useRef } from 'react';
import { GenerateContentResponse } from '@google/genai';
import { Message, Role, FileAttachment, SavedRepair } from './types';
import { generateResponse } from './services/geminiService';
import { fileToDataURL } from './utils/fileUtils';
import { parseSerialNumber } from './utils/machineUtils';
import { checklists } from './data/checklistData';
import ChatMessage from './components/ChatMessage';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import KnowledgeBase from './components/KnowledgeBase';
import CoffeeIcon from './components/icons/CoffeeIcon';
import SparklesIcon from './components/icons/SparklesIcon';
import BookmarkIcon from './components/icons/BookmarkIcon';
import VideoGeneratorModal from './components/VideoGeneratorModal';
import SavedRepairsModal from './components/SavedRepairsModal';
import Checklist from './components/Checklist';
import CameraIcon from './components/icons/CameraIcon';
import CameraIdentificationModal from './components/CameraIdentificationModal';


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVeoModal, setShowVeoModal] = useState(false);
  const [showSavedRepairsModal, setShowSavedRepairsModal] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State to manage the machine model conversation flow
  const [machineModel, setMachineModel] = useState<string | null>(null);
  const [serialNumber, setSerialNumber] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [initialUserQuery, setInitialUserQuery] = useState<{
    message: string;
    file?: File;
    useGoogleSearch?: boolean;
  } | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isWaitingForModel, setIsWaitingForModel] = useState(false);


  useEffect(() => {
    let isCancelled = false;

    const initializeChat = async () => {
      try {
        const response = await generateResponse([], "Hola, preséntate.");
        if (!isCancelled) {
          setMessages([{ role: Role.MODEL, text: response.text ?? "" }]);
        }
      } catch (error: any) {
        if (!isCancelled) {
          const errorMessageText = error?.message || "Lo siento, no pude iniciar. Por favor, recarga la página.";
          const errorMessage: Message = { role: Role.MODEL, text: String(errorMessageText) };
          setMessages([errorMessage]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();

    // Cleanup function to prevent state updates on an unmounted component
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const onModelIdentified = async (model: string | null, serial: string | null) => {
    if (!model && !serial) {
      const noIdMessage: Message = {
        role: Role.MODEL,
        text: "No he podido identificar un modelo o número de serie. Por favor, ¿podrías intentarlo de nuevo o escribirlo manualmente?"
      };
      setMessages(prev => [...prev, noIdMessage]);
      setIsLoading(false);
      setShowCameraModal(false);
      return;
    }

    setMachineModel(model);
    setSerialNumber(serial);
    setIsWaitingForModel(false);
    setShowCameraModal(false);

    if (model && checklists[model]) {
      setShowChecklist(true);
    }

    const confirmationMessage: Message = {
      role: Role.MODEL,
      text: `¡Genial! He registrado el modelo **${model || 'Desconocido'}** (N/S: ${serial || 'No detectado'}). ${model && checklists[model] ? 'He abierto un checklist de revisión inicial para ti. ' : ''}Ahora, déjame procesar tu consulta original.`
    };
    setMessages(prev => [...prev, confirmationMessage]);

    if (!initialUserQuery) {
      setIsLoading(false);
      return;
    }

    try {
      // This is a new async operation, so set loading state.
      setIsLoading(true);

      const cleanHistory = messages.filter(m => m.role === Role.MODEL).slice(0, 1);

      const response: GenerateContentResponse = await generateResponse(
        cleanHistory,
        initialUserQuery.message,
        initialUserQuery.file,
        initialUserQuery.useGoogleSearch,
        model
      );

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const newModelMessage: Message = {
        role: Role.MODEL,
        text: response.text ?? '',
        ...(groundingMetadata && { groundingMetadata }),
      };
      setMessages((prevMessages) => [...prevMessages, newModelMessage]);

    } catch (error: any) {
      const errorMessageText = error?.message || "Un error ha ocurrido.";
      const errorMessage: Message = { role: Role.MODEL, text: String(errorMessageText) };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setInitialUserQuery(null);
      setIsLoading(false);
    }
  };


  const handleSendMessage = async (userMessage: string, file?: File, useGoogleSearch?: boolean) => {
    if (isLoading || (!userMessage.trim() && !file)) return;

    setIsLoading(true);

    let attachment: FileAttachment | undefined;
    if (file) {
      const dataUrl = await fileToDataURL(file);
      attachment = { url: dataUrl, type: file.type };
    }

    const newUserMessage: Message = { role: Role.USER, text: userMessage, attachment };
    setMessages((prev) => [...prev, newUserMessage]);

    // If we are waiting for a model name/serial from user text input
    if (isWaitingForModel) {
      const userInput = userMessage.trim();
      const serialAttempt = parseSerialNumber(userInput);

      let identifiedModel: string | null = null;
      let identifiedSerial: string | null = null;

      if (serialAttempt) {
        identifiedModel = serialAttempt.model;
        identifiedSerial = serialAttempt.serial;
      } else {
        // Assume user typed the model name directly
        identifiedModel = userInput;
      }

      onModelIdentified(identifiedModel, identifiedSerial || '');
      return;
    }

    // If it's the first interaction, ask for the model/serial
    if (!machineModel) {
      setInitialUserQuery({ message: userMessage, file, useGoogleSearch });
      const askForModelMessage: Message = {
        role: Role.MODEL,
        text: "¡Entendido! Antes de continuar, ¿podrías decirme el modelo exacto de la cafetera Nespresso Profesional? O, si lo prefieres, **introduce su número de serie** y yo intentaré identificarla. También puedes usar el botón de la cámara."
      };
      setMessages(prev => [...prev, askForModelMessage]);
      setIsWaitingForModel(true);
      setIsLoading(false);
      return;
    }


    // Standard conversation flow
    try {
      const response: GenerateContentResponse = await generateResponse(
        messages,
        userMessage,
        file,
        useGoogleSearch,
        machineModel
      );

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      const newModelMessage: Message = {
        role: Role.MODEL,
        text: response.text ?? '',
        ...(groundingMetadata && { groundingMetadata }),
      };

      setMessages((prevMessages) => [...prevMessages, newModelMessage]);
    } catch (error: any) {
      const errorMessageText = error?.message || "Un error ha ocurrido.";
      const errorMessage: Message = { role: Role.MODEL, text: String(errorMessageText) };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRepair = async () => {
    const defaultName = `${machineModel || 'General'} - ${messages[1]?.text.substring(0, 30) || 'Reparación'}...`;
    const name = prompt("Dale un nombre a esta reparación:", defaultName);

    if (name) {
      const newRepair = {
        name,
        machineModel,
        serialNumber,
        messages,
        timestamp: Date.now(),
      };

      try {
        const { apiService } = await import('./services/apiService');
        await apiService.createRepair(newRepair);
        alert("¡Reparación guardada con éxito!");
      } catch (error) {
        console.error("Failed to save repair:", error);
        alert("Hubo un error al guardar la reparación. Asegúrate de que el backend esté funcionando.");
      }
    }
  };

  const handleLoadRepair = (repair: SavedRepair) => {
    if (!repair) return;

    // Safety check to prevent undefined messages
    const safeMessages = Array.isArray(repair.messages) ? repair.messages : [];
    const isInitialState = messages.length <= 2 && messages.some(m => m.text && m.text.includes("Hola, preséntate."));

    if (!isInitialState && !window.confirm("¿Seguro que quieres cargar esta reparación? Se perderá tu conversación actual no guardada.")) {
      return;
    }

    setMessages(safeMessages);
    setMachineModel(repair.machineModel);
    setSerialNumber(repair.serialNumber);
    setShowChecklist(!!(repair.machineModel && checklists[repair.machineModel]));
    setShowSavedRepairsModal(false);
  };


  return (
    <div className="flex flex-col h-screen font-sans">
      <header className="bg-white shadow-md p-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CoffeeIcon className="h-8 w-8 text-gray-700" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Asistente de Reparación Nespresso</h1>
              <p className="text-sm text-gray-500">
                {machineModel ? `Modelo: ${machineModel}${serialNumber ? ` (N/S: ${serialNumber})` : ''}` : "Tu experto electromecánico de confianza"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedRepairsModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-sm"
              title="Reparaciones Guardadas"
            >
              <BookmarkIcon className="w-5 h-5" />
              <span className="hidden md:inline">Reparaciones</span>
            </button>
            <button
              onClick={() => setShowVeoModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 font-semibold rounded-full hover:bg-purple-200 transition-colors shadow-sm"
              title="Generar vídeo con Veo"
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="hidden md:inline">Crear Vídeo</span>
            </button>
          </div>
        </div>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {showChecklist && machineModel && checklists[machineModel] && (
            <Checklist
              machineModel={machineModel}
              serialNumber={serialNumber || machineModel}
              items={checklists[machineModel]}
              onClose={() => setShowChecklist(false)}
            />
          )}
          {messages.length <= 1 && !isLoading && !showChecklist && (
            <KnowledgeBase onProblemSelect={(problem, useGoogleSearch) => handleSendMessage(problem, undefined, useGoogleSearch)} />
          )}
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isWaitingForModel && !isLoading && (
            <div className="flex justify-center items-center my-4 animate-fade-in">
              <button
                onClick={() => setShowCameraModal(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-md"
              >
                <CameraIcon className="w-6 h-6 text-blue-500" />
                Usar cámara para identificar modelo
              </button>
            </div>
          )}
          {isLoading && <LoadingSpinner />}
        </div>
      </main>

      <footer className="sticky bottom-0 left-0 right-0">
        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
      {showVeoModal && <VideoGeneratorModal onClose={() => setShowVeoModal(false)} />}
      {showCameraModal && (
        <CameraIdentificationModal
          onClose={() => setShowCameraModal(false)}
          onIdentify={({ model, serialNumber }) => onModelIdentified(model, serialNumber)}
        />
      )}
      {showSavedRepairsModal && (
        <SavedRepairsModal
          onClose={() => setShowSavedRepairsModal(false)}
          onSave={handleSaveRepair}
          onLoad={handleLoadRepair}
          isSaveDisabled={messages.length < 3}
        />
      )}
    </div>
  );
};

export default App;
