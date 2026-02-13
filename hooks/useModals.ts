import { useState } from 'react';

/**
 * Custom hook para manejar el estado de los modales
 */
export const useModals = () => {
  const [showVeoModal, setShowVeoModal] = useState(false);
  const [showSavedRepairsModal, setShowSavedRepairsModal] = useState(false);
  const [showDatabaseDashboard, setShowDatabaseDashboard] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const toggleVeoModal = () => setShowVeoModal((prev) => !prev);
  const toggleSavedRepairsModal = () => setShowSavedRepairsModal((prev) => !prev);
  const toggleDatabaseDashboard = () => setShowDatabaseDashboard((prev) => !prev);
  const toggleCameraModal = () => setShowCameraModal((prev) => !prev);

  return {
    // Estados
    showVeoModal,
    showSavedRepairsModal,
    showDatabaseDashboard,
    showCameraModal,

    // Setters directos
    setShowVeoModal,
    setShowSavedRepairsModal,
    setShowDatabaseDashboard,
    setShowCameraModal,

    // Toggles
    toggleVeoModal,
    toggleSavedRepairsModal,
    toggleDatabaseDashboard,
    toggleCameraModal,
  };
};
