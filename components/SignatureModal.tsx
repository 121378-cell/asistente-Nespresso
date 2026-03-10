import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import CloseIcon from './icons/CloseIcon';
import TrashIcon from './icons/TrashIcon';
import SaveIcon from './icons/SaveIcon';

interface SignatureModalProps {
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ onClose, onSave }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('Por favor, firma antes de guardar.');
      return;
    }
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Firma del Cliente</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b">
          <p className="text-sm text-gray-600 mb-4 text-center italic">
            Por favor, firme en el recuadro de abajo para confirmar la recepción del servicio.
          </p>
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden h-48 touch-none">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                className: 'w-full h-full',
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 p-4 justify-between">
          <button
            onClick={clear}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            Limpiar
          </button>
          <button
            onClick={save}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <SaveIcon className="w-5 h-5" />
            Guardar Firma
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
