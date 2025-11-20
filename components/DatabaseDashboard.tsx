import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface Stats {
    totalRepairs: number;
    totalMessages: number;
    recentRepairs: number;
    repairsByModel: { model: string; count: number }[];
    repairsByMonth: any[];
}

const DatabaseDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'search' | 'query'>('stats');
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState('');

    // Custom Query state
    const [customQuery, setCustomQuery] = useState('');
    const [queryResult, setQueryResult] = useState<any>(null);

    useEffect(() => {
        loadStats();
        loadModels();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await apiService.getStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadModels = async () => {
        try {
            const data = await apiService.getModels();
            setModels(data);
        } catch (err) {
            console.error('Failed to load models', err);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const data = await apiService.searchRepairs({
                query: searchQuery,
                model: selectedModel,
            });
            setSearchResults(data.repairs);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format: 'json' | 'csv') => {
        apiService.exportData(format, {
            query: searchQuery,
            model: selectedModel,
        });
    };

    const handleRunQuery = async () => {
        try {
            setLoading(true);
            const data = await apiService.runCustomQuery(customQuery);
            setQueryResult(data.result);
        } catch (err: any) {
            setQueryResult({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Base de Datos</h2>
                            <p className="text-gray-400 text-sm">Gestión y Análisis de Datos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'stats' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Estadísticas
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'search' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Búsqueda y Exportación
                    </button>
                    <button
                        onClick={() => setActiveTab('query')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'query' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Consulta SQL Directa
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
                            {error}
                        </div>
                    )}

                    {activeTab === 'stats' && stats && (
                        <div className="space-y-6">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">Total Reparaciones</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRepairs}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">Mensajes Totales</h3>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalMessages}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">Últimos 30 Días</h3>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.recentRepairs}</p>
                                </div>
                            </div>

                            {/* Models Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reparaciones por Modelo</h3>
                                <div className="space-y-4">
                                    {stats.repairsByModel.map((item, index) => (
                                        <div key={index} className="flex items-center">
                                            <span className="w-32 text-sm text-gray-600 truncate">{item.model}</span>
                                            <div className="flex-1 mx-4 bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${(item.count / stats.totalRepairs) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'search' && (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, serie..."
                                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <select
                                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                    >
                                        <option value="">Todos los modelos</option>
                                        {models.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleSearch}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Buscar
                                    </button>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Exportar CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Exportar JSON
                                    </button>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serie</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensajes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {searchResults.map((repair) => (
                                            <tr key={repair.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(repair.timestamp).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {repair.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {repair.machineModel || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {repair.serialNumber || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {repair.messages.length}
                                                </td>
                                            </tr>
                                        ))}
                                        {searchResults.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    No se encontraron resultados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'query' && (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                                ⚠️ <strong>Precaución:</strong> Esta herramienta ejecuta consultas SQL directas a la base de datos. Úsala con cuidado.
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <textarea
                                    className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                    placeholder="SELECT * FROM &quot;SavedRepair&quot; LIMIT 10;"
                                    value={customQuery}
                                    onChange={(e) => setCustomQuery(e.target.value)}
                                />
                                <button
                                    onClick={handleRunQuery}
                                    className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Ejecutar Consulta
                                </button>
                            </div>

                            {queryResult && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-medium text-gray-700">
                                        Resultados
                                    </div>
                                    <div className="p-6 overflow-x-auto">
                                        <pre className="text-xs font-mono bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            {JSON.stringify(queryResult, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatabaseDashboard;
