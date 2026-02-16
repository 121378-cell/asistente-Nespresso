import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateResponse } from '../services/geminiService';
import { Message, Role } from '../types';
import { fileToDataURL } from '../utils/fileUtils';

/**
 * Custom hook para manejar la lógica del chat
 * Incluye inicialización, envío de mensajes y auto-scroll
 */
export const useChat = () => {
  const {
    messages,
    setMessages,
    addMessage,
    isLoading,
    setIsLoading,
    machineModel,
    chatContainerRef,
  } = useAppContext();

  // Inicializar el chat con mensaje de bienvenida
  useEffect(() => {
    let isCancelled = false;

    const initializeChat = async () => {
      try {
        const response = await generateResponse([], 'Hola, preséntate.');
        if (!isCancelled) {
          setMessages([{ role: Role.MODEL, text: response.text ?? '' }]);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          const errorMessageText =
            error instanceof Error
              ? error.message
              : 'Lo siento, no pude iniciar. Por favor, recarga la página.';
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

    return () => {
      isCancelled = true;
    };
  }, [setMessages, setIsLoading]);

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, chatContainerRef]);

  /**
   * Enviar un mensaje al chat
   */
  const handleSendMessage = async (userMessage: string, file?: File, useGoogleSearch?: boolean) => {
    if (isLoading || (!userMessage.trim() && !file)) return;

    setIsLoading(true);

    // Preparar archivo adjunto si existe
    let attachment;
    if (file) {
      const dataUrl = await fileToDataURL(file);
      attachment = { url: dataUrl, type: file.type };
    }

    // Agregar mensaje del usuario
    const newUserMessage: Message = { role: Role.USER, text: userMessage, attachment };
    addMessage(newUserMessage);

    try {
      // Generar respuesta del modelo
      const response = await generateResponse(
        messages,
        userMessage,
        file,
        useGoogleSearch,
        machineModel
      );

      const newModelMessage: Message = {
        role: Role.MODEL,
        text: response.text ?? '',
        ...(response.groundingMetadata && { groundingMetadata: response.groundingMetadata }),
      };

      addMessage(newModelMessage);
    } catch (error: unknown) {
      const errorMessageText = error instanceof Error ? error.message : 'Un error ha ocurrido.';
      const errorMessage: Message = { role: Role.MODEL, text: String(errorMessageText) };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSendMessage,
    chatContainerRef,
  };
};
