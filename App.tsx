
import React from 'react';
import { useAppContext } from './context/AppContext';
import { useChat } from './hooks/useChat';
import { useMachineIdentification } from './hooks/useMachineIdentification';
import { useModals } from './hooks/useModals';
import { useRepairs } from './hooks/useRepairs';
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
import { DatabaseDashboard } from './components/DatabaseDashboard';


const App: React.FC = () => {
  // Context - Estado global
  const {
    messages,
    isLoading,
    machineModel,
    serialNumber,
    isWaitingForModel,
    addMessage,
    chatContainerRef,
  } = useAppContext();

  // Custom Hooks - Lógica separada
  const { handleSendMessage } = useChat();

  const {
    showChecklist,
    setShowChecklist,
    onModelIdentified,
    processUserIdentification,
    requestModelIdentification,
  } = useMachineIdentification();

  const {
    showVeoModal,
    showSavedRepairsModal,
    showDatabaseDashboard,
    showCameraModal,
    setShowVeoModal,
    setShowSavedRepairsModal,
    setShowDatabaseDashboard,
    setShowCameraModal,
  } = useModals();

  const { handleSaveRepair, handleLoadRepair, isSaveDisabled } = useRepairs();

  // Manejador mejorado de envío de mensajes que integra identificación
  const handleSendMessageWithIdentification = async (
    userMessage: string,
    file?: File,
    useGoogleSearch?: boolean
  ) => {
    if (isLoading || (!userMessage.trim() && !file)) return;

    // Si estamos esperando identificación del modelo
    if (isWaitingForModel) {
      // Agregar mensaje del usuario primero
      const attachment = file ? { url: await import('./utils/fileUtils').then(m => m.fileToDataURL(file)), type: file.type } : undefined;
      addMessage({ role: 'USER' as const, text: userMessage, attachment });

      // Procesar identificación
      processUserIdentification(userMessage.trim());
      return;
    }

    // Si es la primera interacción, solicitar modelo
    if (!machineModel) {
      // Agregar mensaje del usuario
      const attachment = file ? { url: await import('./utils/fileUtils').then(m => m.fileToDataURL(file)), type: file.type } : undefined;
      addMessage({ role: 'USER' as const, text: userMessage, attachment });

      requestModelIdentification(userMessage, file, useGoogleSearch);
      return;
    }

    // Flujo normal de conversación
    await handleSendMessage(userMessage, file, useGoogleSearch);
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
              onClick={() => setShowDatabaseDashboard(true)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Base de Datos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </button>
            <button
              onClick={() => setShowSavedRepairsModal(true)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Reparaciones Guardadas"
            >
              <BookmarkIcon className="w-6 h-6" />
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
            <KnowledgeBase onProblemSelect={(problem, useGoogleSearch) => handleSendMessageWithIdentification(problem, undefined, useGoogleSearch)} />
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
        <InputBar onSendMessage={handleSendMessageWithIdentification} isLoading={isLoading} />
      </footer>

      {/* Modales */}
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
          onLoadRepair={handleLoadRepair}
          isSaveDisabled={isSaveDisabled}
        />
      )}
      {showDatabaseDashboard && (
        <DatabaseDashboard onClose={() => setShowDatabaseDashboard(false)} />
      )}
    </div>
  );
};

export default App;
