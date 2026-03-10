import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {(offlineReady || needRefresh) && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl border border-blue-500 max-w-sm animate-fade-in-up">
          <div className="mb-4">
            {offlineReady ? (
              <p className="text-gray-800 dark:text-gray-200">
                La aplicación está lista para trabajar offline.
              </p>
            ) : (
              <p className="text-gray-800 dark:text-gray-200">
                Nueva versión disponible. ¿Quieres actualizar?
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {needRefresh && (
              <button
                onClick={() => updateServiceWorker(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Actualizar
              </button>
            )}
            <button
              onClick={() => close()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAPrompt;
