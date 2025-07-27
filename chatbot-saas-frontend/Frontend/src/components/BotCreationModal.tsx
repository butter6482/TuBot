import React, { useState } from 'react';
import { XIcon, UploadIcon, TrashIcon } from 'lucide-react';
import { Bot } from '../App';
type BotCreationModalProps = {
  onClose: () => void;
  onSave: (bot: Omit<Bot, 'id' | 'color'>) => void;
};
export const BotCreationModal = ({
  onClose,
  onSave
}: BotCreationModalProps) => {
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [documentName, setDocumentName] = useState('');
  const handleAddDocument = () => {
    if (documentName.trim()) {
      setDocuments([...documents, documentName]);
      setDocumentName('');
    }
  };
  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        name,
        personality,
        documents
      });
    }
  };
  return <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-cyan-500 rounded-lg w-full max-w-md p-6 relative" style={{
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
    }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <XIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Crear Nuevo Bot
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-cyan-300 mb-1">
                Nombre
              </label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Nombre de tu bot" required />
            </div>
            <div>
              <label htmlFor="personality" className="block text-sm font-medium text-cyan-300 mb-1">
                Personalidad e instrucciones
              </label>
              <textarea id="personality" value={personality} onChange={e => setPersonality(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[100px]" placeholder="Describe cómo quieres que sea tu bot..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-1">
                Documentos de contexto
              </label>
              <div className="flex space-x-2">
                <input type="text" value={documentName} onChange={e => setDocumentName(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Nombre del documento" />
                <button type="button" onClick={handleAddDocument} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-md">
                  <UploadIcon className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
              {documents.length > 0 && <div className="mt-2 space-y-1">
                  {documents.map((doc, index) => <div key={index} className="flex items-center justify-between bg-gray-800 px-3 py-1 rounded">
                      <span className="text-sm truncate">{doc}</span>
                      <button type="button" onClick={() => handleRemoveDocument(index)} className="text-gray-400 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>)}
                </div>}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white">
              Cancelar
            </button>
            <button type="submit" className="ml-3 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-md hover:shadow-lg hover:shadow-cyan-500/25">
              Crear Bot
            </button>
          </div>
        </form>
      </div>
    </div>;
};