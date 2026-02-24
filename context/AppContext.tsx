import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Message } from '../types';
import { db, LocalMessage } from '../src/db';

// Define el tipo del contexto
interface AppContextType {
  // Estado
  messages: Message[];
  machineModel: string | null;
  serialNumber: string | null;
  isLoading: boolean;
  isWaitingForModel: boolean;
  showChecklist: boolean;
  isOnline: boolean;
  initialUserQuery: {
    message: string;
    file?: File;
    useGoogleSearch?: boolean;
  } | null;
  chatContainerRef: React.RefObject<HTMLDivElement>;

  // Acciones
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
  setMachineModel: React.Dispatch<React.SetStateAction<string | null>>;
  setSerialNumber: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsWaitingForModel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowChecklist: React.Dispatch<React.SetStateAction<boolean>>;
  setInitialUserQuery: React.Dispatch<
    React.SetStateAction<{
      message: string;
      file?: File;
      useGoogleSearch?: boolean;
    } | null>
  >;
  setMachineInfo: (model: string | null, serial: string | null) => void;
  resetConversation: () => void;
}

// Crear el contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Props del Provider
interface AppProviderProps {
  children: ReactNode;
}

// Provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [machineModel, setMachineModel] = useState<string | null>(null);
  const [serialNumber, setSerialNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWaitingForModel, setIsWaitingForModel] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [initialUserQuery, setInitialUserQuery] = useState<{
    message: string;
    file?: File;
    useGoogleSearch?: boolean;
  } | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load messages from IndexedDB on startup
  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const localMessages = await db.messages.orderBy('localId').toArray();
        if (localMessages.length > 0) {
          // Map local messages back to App format
          setMessages(
            localMessages.map((m: LocalMessage) => ({
              role: m.role,
              text: m.text,
              attachment: m.attachment,
              groundingMetadata: m.groundingMetadata,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load local messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocalData();

    // Online/Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función helper para agregar un mensaje
  const addMessage = async (message: Message) => {
    setMessages((prev) => [...prev, message]);

    // Persist to IndexedDB
    try {
      await db.messages.add({
        ...message,
        isSynced: false,
      });
    } catch (error) {
      console.error('Failed to persist message locally:', error);
    }
  };

  // Función para establecer información de la máquina
  const setMachineInfo = (model: string | null, serial: string | null) => {
    setMachineModel(model);
    setSerialNumber(serial);
  };

  // Función para resetear la conversación
  const resetConversation = async () => {
    setMessages([]);
    setMachineModel(null);
    setSerialNumber(null);
    setIsWaitingForModel(false);
    setShowChecklist(false);
    setInitialUserQuery(null);

    // Clear local messages too on reset
    try {
      await db.messages.clear();
    } catch (error) {
      console.error('Failed to clear local messages:', error);
    }
  };

  const value: AppContextType = {
    // Estado
    messages,
    machineModel,
    serialNumber,
    isLoading,
    isWaitingForModel,
    showChecklist,
    isOnline,
    initialUserQuery,
    chatContainerRef,

    // Acciones
    setMessages,
    addMessage,
    setMachineModel,
    setSerialNumber,
    setIsLoading,
    setIsWaitingForModel,
    setShowChecklist,
    setInitialUserQuery,
    setMachineInfo,
    resetConversation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider');
  }
  return context;
};

export default AppContext;
