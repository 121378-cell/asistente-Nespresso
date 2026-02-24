import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CloseIcon from './icons/CloseIcon';
import LoadingSpinner from './LoadingSpinner';
import { buildTraceHeaders } from '../services/requestTracing';

interface AsyncMetrics {
  queueDepth: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  dlqSize: number;
}

interface MetricsResponse {
  video: AsyncMetrics;
  image: AsyncMetrics;
  timestamp: string;
}

interface DlqItem {
  id: string;
  jobId: string;
  attempts: number;
  error: string;
}

interface DlqResponse {
  video: DlqItem[];
  image: DlqItem[];
}

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  'http://localhost:3001';

interface JobsDashboardProps {
  onClose: () => void;
}

const JobsDashboard: React.FC<JobsDashboardProps> = ({ onClose }) => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [dlqItems, setDlqItems] = useState<DlqResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [mRes, dRes] = await Promise.all([
        axios.get<MetricsResponse>(`${API_BASE_URL}/api/jobs/metrics`, {
          headers: buildTraceHeaders(),
        }),
        axios.get<DlqResponse>(`${API_BASE_URL}/api/jobs/dlq`, { headers: buildTraceHeaders() }),
      ]);
      setMetrics(mRes.data);
      setDlqItems(dRes.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos del dashboard. ¿Estás autenticado?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRedrive = async (type: 'video' | 'image', jobId: string) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/jobs/redrive`,
        { type, jobId },
        { headers: buildTraceHeaders() }
      );
      fetchData();
    } catch (err) {
      alert('Error al reintentar el trabajo');
    }
  };

  const renderMetricCard = (title: string, data: AsyncMetrics) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-500">En cola:</div>
        <div className="font-semibold text-blue-600">{data.queueDepth}</div>
        <div className="text-gray-500">Ejecutando:</div>
        <div className="font-semibold text-yellow-600">{data.runningJobs}</div>
        <div className="text-gray-500">Completados:</div>
        <div className="font-semibold text-green-600">{data.completedJobs}</div>
        <div className="text-gray-500">Fallidos:</div>
        <div className="font-semibold text-red-600">{data.failedJobs}</div>
        <div className="text-gray-500">DLQ:</div>
        <div className="font-semibold text-purple-600">{data.dlqSize}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl relative max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Dashboard de Procesamiento Async
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

          {isLoading && !metrics ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {metrics?.video && renderMetricCard('Generación de Video (Veo)', metrics.video)}
                {metrics?.image && renderMetricCard('Identificación de Imagen', metrics.image)}
              </div>

              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                Trabajos Fallidos (DLQ)
              </h3>
              <div className="space-y-4">
                {!dlqItems?.video?.length && !dlqItems?.image?.length ? (
                  <p className="text-gray-500 italic">
                    No hay trabajos fallidos en la cola de errores.
                  </p>
                ) : (
                  <>
                    {dlqItems?.video?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-red-500 shadow-sm flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-sm text-red-600">Video: {item.error}</p>
                          <p className="text-xs text-gray-500">
                            ID: {item.jobId} | Intentos: {item.attempts}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRedrive('video', item.jobId)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Reintentar
                        </button>
                      </div>
                    ))}
                    {dlqItems?.image?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-purple-500 shadow-sm flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-sm text-purple-600">Imagen: {item.error}</p>
                          <p className="text-xs text-gray-500">
                            ID: {item.jobId} | Intentos: {item.attempts}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRedrive('image', item.jobId)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Reintentar
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsDashboard;
