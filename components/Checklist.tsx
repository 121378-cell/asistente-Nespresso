import React, { useState, useEffect } from 'react';
import { ChecklistItem } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ToolIcon from './icons/ToolIcon';
import CloseIcon from './icons/CloseIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface ChecklistProps {
  machineModel: string;
  serialNumber: string;
  items: ChecklistItem[];
  onClose: () => void;
}

interface ChecklistMeta {
  notes?: string;
  finalNotes?: string;
  technicianName?: string;
  startTime?: string;
  endTime?: string;
  extraibles?: boolean;
}

const Checklist: React.FC<ChecklistProps> = ({ machineModel, serialNumber, items, onClose }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [finalNotes, setFinalNotes] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [extraibles, setExtraibles] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const storageKey = `checklist_${serialNumber}`;
  const metaKey = `checklist_meta_${serialNumber}`;

  // Initialize items grouped by section
  const itemsBySection = items.reduce(
    (acc, item) => {
      const section = item.section || 'General';
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        setCheckedItems(JSON.parse(savedState));
      }

      const savedMeta = localStorage.getItem(metaKey);
      if (savedMeta) {
        const meta = JSON.parse(savedMeta) as ChecklistMeta;
        setNotes(meta.notes || '');
        setFinalNotes(meta.finalNotes || '');
        setTechnicianName(meta.technicianName || '');
        setStartTime(meta.startTime || '');
        setEndTime(meta.endTime || '');
        setExtraibles(meta.extraibles || false);
      } else {
        // Set default start time if new
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setStartTime(timeString);
      }
    } catch (error) {
      console.error('Failed to load checklist state:', error);
    }
  }, [storageKey, metaKey]);

  const saveMeta = (newMeta: ChecklistMeta) => {
    try {
      const currentMeta = JSON.parse(localStorage.getItem(metaKey) || '{}') as ChecklistMeta;
      localStorage.setItem(metaKey, JSON.stringify({ ...currentMeta, ...newMeta }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckboxChange = (id: string) => {
    const newCheckedState = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(newCheckedState);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newCheckedState));
    } catch (error) {
      console.error('Failed to save checklist state:', error);
    }
  };

  const handleTechnicianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTechnicianName(e.target.value);
    saveMeta({ technicianName: e.target.value });
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (field === 'startTime') {
      setStartTime(value);
      saveMeta({ startTime: value });
    } else {
      setEndTime(value);
      saveMeta({ endTime: value });
    }
  };

  const handleExtraiblesChange = () => {
    const newVal = !extraibles;
    setExtraibles(newVal);
    saveMeta({ extraibles: newVal });
  };

  const handleNotesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    field: 'notes' | 'finalNotes'
  ) => {
    const text = e.target.value;
    if (field === 'notes') {
      setNotes(text);
      saveMeta({ notes: text });
    } else {
      setFinalNotes(text);
      saveMeta({ finalNotes: text });
    }
  };

  const generateWordDocument = () => {
    const repairCode = `REP-${serialNumber.substring(0, 6)}`;

    let rowsHTML = '';

    Object.entries(itemsBySection).forEach(([section, sectionItems]: [string, ChecklistItem[]]) => {
      // Add Section Header Row
      rowsHTML += `
            <tr style="background-color: #f0f0f0;">
                <td colspan="3"><strong>${section}</strong></td>
            </tr>
        `;
      // Add Item Rows
      sectionItems.forEach((item) => {
        const isChecked = !!checkedItems[item.id];
        rowsHTML += `
                <tr>
                    <td>${item.text}</td>
                    <td style="text-align:center;">${isChecked ? 'OK' : ''}</td>
                    <td></td>
                </tr>
            `;
      });
    });

    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Checklist ${machineModel}</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                td, th { border: 1px solid black; padding: 5px; vertical-align: middle; }
                .header-box { height: 80px; }
                .circle { border: 1px solid black; border-radius: 50%; width: 20px; height: 20px; display: inline-block; text-align: center; line-height: 20px; margin-left: 10px; }
            </style>
        </head>
        <body>
            <table border="1">
                <tr>
                    <td colspan="2" style="width: 70%; height: 100px; vertical-align: top;">
                       <!-- Espacio para pegatina o logo -->
                       <h2 style="margin: 0;">femarec</h2>
                    </td>
                    <td style="width: 30%; vertical-align: top;">
                        <strong>EXTRAIBLES:</strong><br/><br/>
                        SI <span style="font-size: 16px;">${extraibles ? '☒' : '☐'}</span><br/>
                        NO <span style="font-size: 16px;">${!extraibles ? '☒' : '☐'}</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><strong>CODI REPARACIO:</strong> ${repairCode}</td>
                    <td><strong>AVARIA:</strong> ${finalNotes ? 'SI' : ''} &nbsp;&nbsp; <strong>OK:</strong> ${!finalNotes ? 'SI' : ''}</td>
                </tr>
                <tr>
                    <td colspan="3" style="background-color: #ddd;"><strong>Nº DE SERIE:</strong> ${serialNumber}</td>
                </tr>
                ${rowsHTML}
                <tr>
                    <td colspan="3" style="background-color: #ddd;"><strong>*Tempos</strong></td>
                </tr>
                 <tr>
                    <td><strong>Hora inici:</strong> ${startTime}</td>
                    <td colspan="2"><strong>Hora final:</strong> ${endTime}</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>Nom tècnic:</strong> ${technicianName}</td>
                </tr>
                <tr>
                    <td colspan="3" style="height: 100px; vertical-align: top;">
                        <strong>*Descripció avaria / Notes:</strong><br/>
                        ${notes}<br/>
                        ${finalNotes}
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword',
    });

    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `Checklist_${machineModel}_${serialNumber}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) {
    return (
      <div className="max-w-4xl mx-auto my-4 animate-fade-in">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex justify-between items-center p-3 text-left font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>Mostrar Checklist: {machineModel}</span>
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 my-4 max-w-4xl mx-auto border border-blue-200 rounded-lg shadow-lg bg-white animate-fade-in">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <ToolIcon className="w-6 h-6 text-blue-500" />
          Checklist: {machineModel}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={generateWordDocument}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            title="Descargar Word"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Descargar Word
          </button>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
            <ChevronDownIcon className="w-6 h-6 rotate-180" />
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Header Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nombre del Técnico
          </label>
          <input
            type="text"
            value={technicianName}
            onChange={handleTechnicianChange}
            className="w-full p-2 border rounded text-sm"
            placeholder="Tu nombre"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Hora Inicio
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Hora Final
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={extraibles}
                onChange={handleExtraiblesChange}
              />
              <div
                className={`block w-10 h-6 rounded-full transition-colors ${extraibles ? 'bg-green-500' : 'bg-gray-300'}`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${extraibles ? 'transform translate-x-full' : ''}`}
              ></div>
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700">
              Extraíbles Presentes (Sí/No)
            </div>
          </label>
        </div>
      </div>

      <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-100">
        <label className="block text-xs font-bold text-blue-800 uppercase mb-1">
          Descripción Avaria / Notas Iniciales
        </label>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e, 'notes')}
          className="w-full p-2 border border-blue-200 rounded text-sm h-16"
          placeholder="Describe el problema reportado..."
        />
      </div>

      <div className="space-y-6">
        {Object.entries(itemsBySection).map(
          ([section, sectionItems]: [string, ChecklistItem[]]) => (
            <div key={section}>
              <h3 className="text-md font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 bg-gray-100 px-2 py-1 rounded-t">
                {section}
              </h3>
              <ul className="space-y-1">
                {sectionItems.map((item) => (
                  <li key={item.id}>
                    <label className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={!!checkedItems[item.id]}
                          onChange={() => handleCheckboxChange(item.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span
                          className={`font-medium text-gray-800 ${checkedItems[item.id] ? 'text-green-700' : ''}`}
                        >
                          {item.text}
                        </span>
                      </div>
                      {checkedItems[item.id] && (
                        <span className="ml-auto text-xs font-bold text-green-600 px-2">OK</span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
          <DocumentTextIcon className="w-5 h-5 text-gray-500" />
          Resolución Final / Piezas Cambiadas
        </label>
        <textarea
          value={finalNotes}
          onChange={(e) => handleNotesChange(e, 'finalNotes')}
          placeholder="Detalla la resolución para el informe..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700 placeholder-gray-400 min-h-[80px]"
        />
      </div>
    </div>
  );
};

export default Checklist;
