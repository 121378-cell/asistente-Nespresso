
import React, { useState } from 'react';
import { faults } from '../data/faultsData';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ToolIcon from './icons/ToolIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import SearchIcon from './icons/SearchIcon';
import GlobeIcon from './icons/GlobeIcon';
import SparklesIcon from './icons/SparklesIcon';

interface KnowledgeBaseProps {
  onProblemSelect: (problem: string, useGoogleSearch?: boolean) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onProblemSelect }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFault = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaults = faults.filter((fault) => {
    const term = searchTerm.toLowerCase();
    // Buscamos en el síntoma y también en las causas para ser más útiles
    return (
      fault.symptom.toLowerCase().includes(term) ||
      fault.causes.some(cause => cause.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 my-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-xl text-gray-700 font-bold mb-2 text-center">Base de Conocimiento de Fallos Comunes</h2>
      <p className="text-gray-500 mb-6 text-center">
        Aquí tienes ayuda para los problemas más habituales. Haz clic en uno para ver la solución o busca tu problema.
      </p>

      {/* Barra de Búsqueda */}
      <div className="relative mb-6 max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
            placeholder="Buscar por síntoma (ej: fuga, no enciende...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredFaults.length === 0 ? (
             <div className="text-center py-8 px-4 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300 shadow-sm">
                <p className="mb-4 text-lg">No hemos encontrado problemas guardados que coincidan con "<strong>{searchTerm}</strong>".</p>
                <p className="mb-6 text-sm">¿Cómo quieres proceder?</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                        onClick={() => onProblemSelect(`Tengo un problema que no está en la lista: ${searchTerm}`, false)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Consultar al Asistente (Interno)
                    </button>
                    
                    <button 
                        onClick={() => onProblemSelect(`Busca en la web información reciente sobre cómo solucionar este problema en una cafetera Nespresso profesional: ${searchTerm}`, true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-medium rounded-full hover:bg-green-100 transition-colors border border-green-200"
                    >
                        <GlobeIcon className="w-5 h-5" />
                        Buscar Solución en la Web
                    </button>
                </div>
             </div>
        ) : (
            filteredFaults.map((fault) => (
            <div key={fault.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white transition-shadow hover:shadow-md">
                <button
                onClick={() => toggleFault(fault.id)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:bg-blue-50"
                aria-expanded={openId === fault.id}
                aria-controls={`fault-${fault.id}`}
                >
                <span className="text-base">{fault.symptom}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${openId === fault.id ? 'rotate-180' : ''}`} />
                </button>
                {openId === fault.id && (
                <div id={`fault-${fault.id}`} className="p-5 border-t border-gray-200 bg-gray-50/70 animate-fade-in-slow">
                    
                    <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Posibles Causas</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {fault.causes.map((cause, index) => <li key={index}>{cause}</li>)}
                    </ul>
                    </div>

                    <div className="mb-6">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            <ToolIcon className="w-5 h-5" />
                            Pasos para la Solución
                        </h3>
                        <div className="space-y-4">
                            {fault.solutionSteps.map((step) => (
                                <div key={step.step} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-bold rounded-full">{step.step}</div>
                                    <p className="flex-1 text-gray-800 pt-1">{step.description.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={i} className="font-bold text-blue-600">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    })}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-3">
                            <LightbulbIcon className="w-5 h-5" />
                            Consejos para que no vuelva a pasar
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700">
                            {fault.preventionTips.map((tip, index) => <li key={index}>{tip}</li>)}
                        </ul>
                    </div>

                    <div className="mt-6 text-center">
                        <button 
                        onClick={() => onProblemSelect(`Hola, necesito más ayuda con este problema: "${fault.symptom}"`, false)}
                        className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                        ¿No funcionó? Pedir más ayuda
                        </button>
                    </div>

                </div>
                )}
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
