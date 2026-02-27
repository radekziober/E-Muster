import React, { useState } from 'react';
import { AlertOctagon, MessageSquare, X } from 'lucide-react';
import { Button } from './UI';
import { Muster, Report5W2H, User } from '../types';
import { AREAS } from '../constants';

interface Form5W2HProps {
  muster: Muster;
  nokSns: string[];
  onClose: () => void;
  onSave: (report: Report5W2H) => void;
  user: User;
  readOnly?: boolean;
}

export const Form5W2H: React.FC<Form5W2HProps> = ({ muster, nokSns, onClose, onSave, user, readOnly = false }) => {
  const [formData, setFormData] = useState<Report5W2H>({ 
    problem: '', 
    who: 'MACHINE', 
    description: '', 
    ...muster.report5w2h 
  });
  
  const [managerComments, setManagerComments] = useState<Record<string, string>>(muster.report5w2h?.managerComments || {});
  const [activeCommentField, setActiveCommentField] = useState<string | null>(null);

  const handleSubmit = () => {
    const report: Report5W2H = { ...formData, managerComments, when: new Date().toLocaleDateString() };
    onSave(report);
  };

  const renderField = (label: string, fieldKey: string, content: React.ReactNode) => (
    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 relative">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
      <div className="text-slate-800 font-medium">{content}</div>
      {user.role === 'KIEROWNIK' && !readOnly && (
        <button 
          onClick={() => setActiveCommentField(activeCommentField === fieldKey ? null : fieldKey)} 
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-blue-600"
        >
          <MessageSquare size={16}/>
        </button>
      )}
      {activeCommentField === fieldKey && (
        <textarea 
          className="w-full mt-2 p-2 text-sm border rounded" 
          placeholder="Komentarz..." 
          value={managerComments[fieldKey] || ''} 
          onChange={e => setManagerComments({...managerComments, [fieldKey]: e.target.value})} 
        />
      )}
      {managerComments[fieldKey] && activeCommentField !== fieldKey && (
        <div className="mt-2 text-xs text-blue-600 italic">Kierownik: {managerComments[fieldKey]}</div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-slide-up">
        <div className="bg-red-600 p-4 text-white flex justify-between items-center rounded-t-2xl">
          <h2 className="text-lg font-bold flex gap-2 items-center"><AlertOctagon/> 5W2H Report</h2>
          {!readOnly && <button onClick={onClose}><X/></button>}
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Opis Problemu</label>
            {readOnly ? (
              renderField("Problem", "problem", formData.problem)
            ) : (
              <input 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                value={formData.problem} 
                onChange={e => setFormData({...formData, problem: e.target.value})} 
                placeholder="Krótki opis usterki..."
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("What (Produkt)", "what", muster.product)}
            {renderField("Where (Linia)", "where", muster.line)}
            {renderField("Who (Zgłaszający)", "who", formData.who)}
            {renderField("When (Data)", "when", new Date().toLocaleString())}
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold mb-1">NOK SNs</label>
            <div className="flex gap-2">
              {nokSns.map(sn => <span key={sn} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">{sn}</span>)}
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-3">
          {!readOnly ? (
            <>
              <Button variant="secondary" onClick={onClose}>Anuluj</Button>
              <Button variant="danger" onClick={handleSubmit}>ZAPISZ RAPORT</Button>
            </>
          ) : (
            user.role === 'KIEROWNIK' && muster.status === 'DO_DECYZJI_KIEROWNIKA' ? (
              <Button variant="danger" onClick={() => onSave({ ...formData, managerComments })}>ZATWIERDŹ DECYZJĘ NOK</Button>
            ) : (
              <Button variant="secondary" onClick={onClose}>Zamknij</Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

interface HandoverModalProps {
  currentArea: string;
  onClose: () => void;
  onConfirm: (data: { targetArea: string, targetLine: string }) => void;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({ currentArea, onClose, onConfirm }) => {
  const [targetArea, setTargetArea] = useState('');
  const [targetLine, setTargetLine] = useState('');
  const availableAreas = Object.keys(AREAS).filter(a => a !== currentArea);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-slide-up">
        <h3 className="text-lg font-bold mb-4">Przekaż do Innego Obszaru</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Obszar Docelowy</label>
            <select 
              value={targetArea} 
              onChange={e => {setTargetArea(e.target.value); setTargetLine('')}} 
              className="w-full p-3 border rounded-lg bg-white"
            >
              <option value="">Wybierz</option>
              {availableAreas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
          </div>
          {targetArea && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Linia Docelowa</label>
              <select 
                value={targetLine} 
                onChange={e => setTargetLine(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white"
              >
                <option value="">Wybierz</option>
                {AREAS[targetArea].lines.map(line => <option key={line} value={line}>{line}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>Anuluj</Button>
          <Button variant="success" onClick={() => onConfirm({targetArea, targetLine})} disabled={!targetArea || !targetLine}>
            PRZEKAŻ
          </Button>
        </div>
      </div>
    </div>
  );
};