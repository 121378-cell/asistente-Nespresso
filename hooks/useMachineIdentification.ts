import { useAppContext } from '../context/AppContext';
import { generateResponse } from '../services/geminiService';
import { Message, Role } from '../types';
import { parseSerialNumber } from '../utils/machineUtils';
import { checklists } from '../data/checklistData';

/**
 * Custom hook para manejar la identificación de máquinas
 * Incluye identificación por serial, cámara y gestión de checklist
 */
export const useMachineIdentification = () => {
  const {
    messages,
    addMessage,
    setMachineModel,
    setSerialNumber,
    isWaitingForModel,
    setIsWaitingForModel,
    showChecklist,
    setShowChecklist,
    initialUserQuery,
    setInitialUserQuery,
    setIsLoading,
  } = useAppContext();

  /**
   * Callback cuando se identifica un modelo (por cámara o texto)
   */
  const onModelIdentified = async (model: string | null, serial: string | null) => {
    // Si no se identificó nada
    if (!model && !serial) {
      const noIdMessage: Message = {
        role: Role.MODEL,
        text: 'No he podido identificar un modelo o número de serie. Por favor, ¿podrías intentarlo de nuevo o escribirlo manualmente?',
      };
      addMessage(noIdMessage);
      setIsLoading(false);
      return;
    }

    // Guardar información de la máquina
    setMachineModel(model);
    setSerialNumber(serial);
    setIsWaitingForModel(false);

    // Mostrar checklist si existe para este modelo
    if (model && checklists[model]) {
      setShowChecklist(true);
    }

    // Mensaje de confirmación
    const confirmationMessage: Message = {
      role: Role.MODEL,
      text: `¡Genial! He registrado el modelo **${model || 'Desconocido'}** (N/S: ${serial || 'No detectado'}). ${model && checklists[model] ? 'He abierto un checklist de revisión inicial para ti. ' : ''}Ahora, déjame procesar tu consulta original.`,
    };
    addMessage(confirmationMessage);

    // Si no hay consulta inicial, terminar aquí
    if (!initialUserQuery) {
      setIsLoading(false);
      return;
    }

    // Procesar la consulta inicial del usuario
    try {
      setIsLoading(true);

      const cleanHistory = messages.filter((m) => m.role === Role.MODEL).slice(0, 1);

      const response = await generateResponse(
        cleanHistory,
        initialUserQuery.message,
        initialUserQuery.file,
        initialUserQuery.useGoogleSearch,
        model
      );

      const newModelMessage: Message = {
        role: Role.MODEL,
        text: response.text ?? '',
        ...(response.groundingMetadata && { groundingMetadata: response.groundingMetadata }),
      };
      addMessage(newModelMessage);
    } catch (error: any) {
      const errorMessageText = error?.message || 'Un error ha ocurrido.';
      const errorMessage: Message = { role: Role.MODEL, text: String(errorMessageText) };
      addMessage(errorMessage);
    } finally {
      setInitialUserQuery(null);
      setIsLoading(false);
    }
  };

  /**
   * Procesar entrada de texto del usuario para identificación
   */
  const processUserIdentification = (userInput: string) => {
    const serialAttempt = parseSerialNumber(userInput);

    let identifiedModel: string | null = null;
    let identifiedSerial: string | null = null;

    if (serialAttempt) {
      identifiedModel = serialAttempt.model;
      identifiedSerial = serialAttempt.serial;
    } else {
      // Asumir que el usuario escribió el nombre del modelo directamente
      identifiedModel = userInput;
    }

    onModelIdentified(identifiedModel, identifiedSerial || '');
  };

  /**
   * Solicitar identificación de modelo al usuario
   */
  const requestModelIdentification = (
    userMessage: string,
    file?: File,
    useGoogleSearch?: boolean
  ) => {
    setInitialUserQuery({ message: userMessage, file, useGoogleSearch });
    const askForModelMessage: Message = {
      role: Role.MODEL,
      text: '¡Entendido! Antes de continuar, ¿podrías decirme el modelo exacto de la cafetera Nespresso Profesional? O, si lo prefieres, **introduce su número de serie** y yo intentaré identificarla. También puedes usar el botón de la cámara.',
    };
    addMessage(askForModelMessage);
    setIsWaitingForModel(true);
    setIsLoading(false);
  };

  return {
    showChecklist,
    setShowChecklist,
    onModelIdentified,
    processUserIdentification,
    requestModelIdentification,
    isWaitingForModel,
  };
};
