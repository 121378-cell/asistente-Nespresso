import { useAppContext } from '../context/AppContext';
import { SavedRepair } from '../types';
import { checklists } from '../data/checklistData';

/**
 * Custom hook para manejar el guardado y carga de reparaciones
 */
export const useRepairs = () => {
    const {
        messages,
        setMessages,
        machineModel,
        setMachineModel,
        serialNumber,
        setSerialNumber,
        setShowChecklist,
    } = useAppContext();

    /**
     * Guardar la reparación actual
     */
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
                const { apiService } = await import('../services/apiService');
                await apiService.createRepair(newRepair);
                alert("¡Reparación guardada con éxito!");
            } catch (error) {
                console.error("Failed to save repair:", error);
                alert("Hubo un error al guardar la reparación. Asegúrate de que el backend esté funcionando.");
            }
        }
    };

    /**
     * Cargar una reparación existente
     */
    const handleLoadRepair = (repair: SavedRepair) => {
        if (!repair) return;

        // Verificar que los mensajes sean válidos
        const safeMessages = Array.isArray(repair.messages) ? repair.messages : [];
        const isInitialState = messages.length <= 2 && messages.some(m => m.text && m.text.includes("Hola, preséntate."));

        // Confirmar si hay una conversación en progreso
        if (!isInitialState && !window.confirm("¿Seguro que quieres cargar esta reparación? Se perderá tu conversación actual no guardada.")) {
            return;
        }

        // Cargar la reparación
        setMessages(safeMessages);
        setMachineModel(repair.machineModel);
        setSerialNumber(repair.serialNumber);
        setShowChecklist(!!(repair.machineModel && checklists[repair.machineModel]));
    };

    /**
     * Verificar si el botón de guardar debe estar deshabilitado
     */
    const isSaveDisabled = messages.length < 3;

    return {
        handleSaveRepair,
        handleLoadRepair,
        isSaveDisabled,
    };
};
