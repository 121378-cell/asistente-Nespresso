import { useState } from 'react';

/**
 * Custom hook para manejar el estado de los modales
 */
export const useModals = () => {
  const [showVeoModal, setShowVeoModal] = useState(false);
  const [showSavedRepairsModal, setShowSavedRepairsModal] = useState(false);
  const [showDatabaseDashboard, setShowDatabaseDashboard] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);

  const toggleVeoModal = () => setShowVeoModal((prev) => !prev);
  const toggleSavedRepairsModal = () => setShowSavedRepairsModal((prev) => !prev);
  const toggleDatabaseDashboard = () => setShowDatabaseDashboard((prev) => !prev);
  const toggleCameraModal = () => setShowCameraModal((prev) => !prev);
  const toggleCreateReportModal = () => setShowCreateReportModal((prev) => !prev);

  return {
    // Estados
    showVeoModal,
    showSavedRepairsModal,
    showDatabaseDashboard,
    showCameraModal,
    showCreateReportModal,

    // Setters directos
    setShowVeoModal,
    setShowSavedRepairsModal,
    setShowDatabaseDashboard,
    setShowCameraModal,
    setShowCreateReportModal,

    // Toggles
    toggleVeoModal,
    toggleSavedRepairsModal,
    toggleDatabaseDashboard,
    toggleCameraModal,
    toggleCreateReportModal,
  };
};
