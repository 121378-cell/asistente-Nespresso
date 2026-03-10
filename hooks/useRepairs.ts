import { useAppContext } from '../context/AppContext';
import { SavedRepair, UsedPart } from '../types';
import { checklists } from '../data/checklistData';
import { apiService } from '../services/apiService';
import { db, LocalRepair } from '../src/db';

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
    usedParts,
  } = useAppContext();

  /**
   * Guardar la reparación actual
   */
  const handleSaveRepair = async (partsOverride: UsedPart[] = []) => {
    const partsToSave = partsOverride.length > 0 ? partsOverride : usedParts;

    // Intentar recuperar metadatos del checklist si existen para el número de serie actual
    let checklistMeta = null;
    if (serialNumber) {
      const savedMeta = localStorage.getItem(`checklist_meta_${serialNumber}`);
      if (savedMeta) {
        checklistMeta = JSON.parse(savedMeta);
      }
    }

    const defaultName = `${machineModel || 'General'} - ${serialNumber || 'Sin S/N'} - ${new Date().toLocaleDateString()}`;
    const name = prompt('Dale un nombre a esta reparación:', defaultName);

    if (name) {
      const timestamp = Date.now();
      const repairData: Omit<SavedRepair, 'id'> = {
        name,
        machineModel,
        serialNumber,
        messages,
        timestamp,
        usedParts: partsToSave,
        // Extendemos el objeto con los metadatos si existen
        ...(checklistMeta ? { metadata: checklistMeta } : {}),
      } as any; // Cast as any to include metadata which is not in SavedRepair type yet

      // 1. Guardar localmente primero (Offline First)
      let localId: number | undefined;
      try {
        localId = await db.repairs.add({
          ...repairData,
          isSynced: false,
        } as LocalRepair);
        console.log('Reparación guardada localmente con ID:', localId);
      } catch (dbError) {
        console.error('Error al guardar en IndexedDB:', dbError);
      }

      // 2. Intentar sincronizar con el backend
      try {
        const savedRepair = await apiService.createRepair(repairData);

        // Si tenemos piezas, asociarlas en el backend
        if (partsToSave.length > 0) {
          for (const part of partsToSave) {
            await apiService.addPartToRepair(savedRepair.id, part.id, part.quantity);
          }
        }

        // 3. Si la sincronización tuvo éxito, actualizar el registro local
        if (localId !== undefined) {
          await db.repairs.update(localId, {
            id: savedRepair.id,
            isSynced: true,
          });
        }

        alert('¡Parte de trabajo guardado y sincronizado con éxito!');
      } catch (error) {
        console.warn('Backend no disponible, la reparación se sincronizará más tarde:', error);
        alert(
          'Reparación guardada localmente. Se sincronizará automáticamente cuando haya conexión.'
        );
      }
    }
  };

  /**
   * Cargar una reparación existente
   */
  const handleLoadRepair = (repair: SavedRepair | LocalRepair) => {
    if (!repair) return;

    // Verificar que los mensajes sean válidos
    const safeMessages = Array.isArray(repair.messages) ? repair.messages : [];
    const isInitialState =
      messages.length <= 2 && messages.some((m) => m.text && m.text.includes('Hola, preséntate.'));

    // Confirmar si hay una conversación en progreso
    if (
      !isInitialState &&
      !window.confirm(
        '¿Seguro que quieres cargar esta reparación? Se perderá tu conversación actual no guardada.'
      )
    ) {
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
   * Se permite guardar si hay mensajes (chat) o si se ha identificado una máquina (flujo de parte)
   */
  const isSaveDisabled = messages.length < 3 && !machineModel;

  return {
    handleSaveRepair,
    handleLoadRepair,
    isSaveDisabled,
  };
};
