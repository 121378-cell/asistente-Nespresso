import React from 'react';
import { useAppContext } from './context/AppContext';
import { Role } from './types';

import { useChat } from './hooks/useChat';
import { useMachineIdentification } from './hooks/useMachineIdentification';
import { useModals } from './hooks/useModals';
import { useRepairs } from './hooks/useRepairs';
import { checklists } from './data/checklistData';
import ChatMessage from './components/ChatMessage';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import ThemeToggle from './components/ThemeToggle';
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
  const {
    messages,
    isLoading,
    machineModel,
    serialNumber,
    isWaitingForModel,
    addMessage,
    chatContainerRef,
  } = useAppContext();

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

  const handleSendMessageWithIdentification = async (
    userMessage: string,
    file?: File,
    useGoogleSearch?: boolean
  ) => {
    if (isLoading || (!userMessage.trim() && !file)) return;

    if (isWaitingForModel) {
      const attachment = file
        ? {
            url: await import('./utils/fileUtils').then((m) => m.fileToDataURL(file)),
            type: file.type,
          }
        : undefined;
      addMessage({ role: Role.USER, text: userMessage, attachment });
      processUserIdentification(userMessage.trim());
      return;
    }

    if (!machineModel) {
      const attachment = file
        ? {
            url: await import('./utils/fileUtils').then((m) => m.fileToDataURL(file)),
            type: file.type,
          }
        : undefined;
      addMessage({ role: Role.USER, text: userMessage, attachment });

      requestModelIdentification(userMessage, file, useGoogleSearch);
      return;
    }

    await handleSendMessage(userMessage, file, useGoogleSearch);
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 z-10 transition-colors duration-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CoffeeIcon className="h-8 w-8 text-gray-700" />
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Asistente de Reparacion Nespresso
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {machineModel
                  ? `Modelo: ${machineModel}${serialNumber ? ` (N/S: ${serialNumber})` : ''}`
                  : 'Tu experto electromecanico de confianza'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowDatabaseDashboard(true)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Base de Datos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
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
              title="Generar video con Veo"
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="hidden md:inline">Crear Video</span>
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
            <div className="text-center my-4">
              <button
                onClick={() => setShowCameraModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                title="Identificar modelo con camara"
              >
                <CameraIcon className="w-6 h-6 text-blue-500" />
                Usar camara para identificar modelo
              </button>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          {isLoading && <LoadingSpinner />}

          {!showChecklist && (
            <KnowledgeBase onProblemSelect={handleSendMessageWithIdentification} />
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 left-0 right-0">
        <InputBar onSendMessage={handleSendMessageWithIdentification} isLoading={isLoading} />
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
