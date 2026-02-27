import React, { useState } from 'react';
import { 
    AlertOctagon, ClipboardCheck, CheckCircle, Filter, Trash2, 
    ChevronsUpDown, Factory
} from 'lucide-react';
import { Card, Button, StatusBadge, getStatusColor } from './UI';
import { Muster, User } from '../types';
import { AREAS, LINES_STRUCTURE } from '../constants';
import { isSmtLine } from '../utils';

interface ManagerKPIProps {
  musters: Muster[];
}

export const ManagerKPI: React.FC<ManagerKPIProps> = ({ musters }) => {
  const toApprove = musters.filter(m => m.status === 'OCZEKUJE_NA_ZWOLNIENIE').length;
  const toDecide = musters.filter(m => m.status === 'DO_DECYZJI_KIEROWNIKA').length;
  const released = musters.filter(m => m.status === 'ZWOLNIONY_DO_PRODUKCJI').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-orange-50 border-orange-200">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xs font-bold text-orange-600 uppercase">Do Decyzji (NOK)</p>
                <h3 className="text-2xl font-bold text-slate-800">{toDecide}</h3>
            </div>
            <AlertOctagon className="text-orange-500" size={24} />
        </div>
      </Card>
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xs font-bold text-yellow-600 uppercase">Do Zatwierdzenia</p>
                <h3 className="text-2xl font-bold text-slate-800">{toApprove}</h3>
            </div>
            <ClipboardCheck className="text-yellow-500" size={24} />
        </div>
      </Card>
      <Card className="bg-green-50 border-green-200">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xs font-bold text-green-600 uppercase">Zwolnione Dzisiaj</p>
                <h3 className="text-2xl font-bold text-slate-800">{released}</h3>
            </div>
            <CheckCircle className="text-green-500" size={24} />
        </div>
      </Card>
    </div>
  );
};

interface FilterBarProps {
  onFilterChange: (key: string, value: string) => void;
  lines: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, lines }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm items-center">
      <div className="flex items-center gap-2 text-slate-500 text-sm font-bold px-2">
          <Filter size={16}/> Filtruj:
      </div>
      <select onChange={(e) => onFilterChange('line', e.target.value)} className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500">
        <option value="">Wszystkie Linie</option>
        {lines.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <select onChange={(e) => onFilterChange('status', e.target.value)} className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500">
        <option value="">Wszystkie Statusy</option>
        <option value="DO_DECYZJI_KIEROWNIKA">🔴 Do Decyzji (NOK)</option>
        <option value="OCZEKUJE_NA_ZWOLNIENIE">🟡 Oczekuje na Zwolnienie</option>
        <option value="ZWOLNIONY_DO_PRODUKCJI">🟢 Zwolnione</option>
        <option value="ZABLOKOWANY_NOK">⚫ Zablokowane</option>
      </select>
    </div>
  );
};

interface MusterTableProps {
  musters: Muster[];
  onOpen: (muster: Muster) => void;
  onDelete?: (id: string) => void;
  user: User;
  emptyMessage?: string;
}

export const MusterTable: React.FC<MusterTableProps> = ({ musters, onOpen, onDelete, user, emptyMessage = "Brak dokumentów." }) => {
   if (musters.length === 0) return <div className="p-8 text-center text-slate-400 italic">{emptyMessage}</div>;
   
   const showSmtColumns = musters.some(m => isSmtLine(m.line)) || user?.area === 'SMT';

   return (
      <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <th className="p-4 border-b">Czas</th>
                <th className="p-4 border-b">Zmiana</th>
                <th className="p-4 border-b">Produkt</th>
                <th className="p-4 border-b">Zlecenie</th>
                {showSmtColumns && <th className="p-4 border-b">Strona</th>}
                <th className="p-4 border-b">Linia</th>
                {showSmtColumns && <th className="p-4 border-b">Powód</th>}
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Akcja</th>
            </tr>
        </thead>
        <tbody>
            {musters.map(m => {
                const hour = parseInt(m.timestamp.split(' ')[1]?.split(':')[0] || '12');
                const shift = (hour >= 7 && hour < 19) ? 'I' : 'II';
                const isDraft = m.status === 'INICJACJA';

                return (
                    <tr key={m.id} className="hover:bg-slate-50 border-b last:border-0 transition-colors">
                        <td className="p-4 font-mono text-sm text-slate-600">{m.timestamp}</td>
                        <td className="p-4 text-sm"><span className="font-bold">{shift}</span> <span className="text-xs text-slate-400">({shift==='I'?'07-19':'19-07'})</span></td>
                        <td className="p-4 font-bold text-slate-800">{m.product}</td>
                        <td className="p-4 font-mono text-sm">{m.orderId}</td>
                        {showSmtColumns && <td className="p-4">{isSmtLine(m.line) ? <span className={`text-xs px-2 py-1 rounded font-bold ${m.side === 'TOP' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>{m.side}</span> : <span className="text-slate-300">-</span>}</td>}
                        <td className="p-4 text-sm font-medium">{m.line}</td>
                        {showSmtColumns && <td className="p-4 text-sm text-slate-600 truncate max-w-[150px]" title={m.reason?.label}>{isSmtLine(m.line) ? m.reason?.label : <span className="text-slate-300">-</span>}</td>}
                        <td className="p-4"><StatusBadge status={m.status} /></td>
                        <td className="p-4 flex gap-2">
                            <Button onClick={() => onOpen(m)} variant="secondary" className="py-1 px-3 text-xs h-8">Otwórz</Button>
                            {isDraft && onDelete && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(m.id); }} 
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Usuń wersję roboczą"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </td>
                    </tr>
                )
            })}
        </tbody>
      </table>
      </div>
   )
}

interface SectionSwitcherProps {
    currentLine: string;
    currentSection: string;
    onSectionChange: (section: string) => void;
}

export const SectionSwitcher: React.FC<SectionSwitcherProps> = ({ currentLine, currentSection, onSectionChange }) => {
    const sections = LINES_STRUCTURE[currentLine] || [];
    const [isOpen, setIsOpen] = useState(false);

    if (sections.length <= 1) return <span>{currentSection}</span>;

    return (
        <div className="relative inline-block">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 font-bold hover:bg-black/10 px-2 py-0.5 rounded transition-colors">
                {currentSection} <ChevronsUpDown size={14}/>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 bg-white text-slate-800 shadow-xl rounded-lg py-1 z-50 min-w-[200px] border border-slate-200 animate-fade-in">
                         <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase border-b border-slate-100">Zmień Sekcję</div>
                         {sections.map(s => (
                             <button key={s} onClick={() => { onSectionChange(s); setIsOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${s === currentSection ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}>
                                 {s}
                             </button>
                         ))}
                    </div>
                </>
            )}
        </div>
    );
};

export const AreaSwitcher = ({ currentArea, onAreaChange }: { currentArea: string, onAreaChange: (a: string) => void }) => { 
    const [isOpen, setIsOpen] = useState(false); 
    return (
        <div className="relative">
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-blue-800">
                <Factory size={16} /> Obszar: <span className="font-bold">{currentArea}</span> <ChevronsUpDown size={16} className="ml-1" />
            </Button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-slate-200 animate-fade-in">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Wybierz Obszar</div>
                        {Object.keys(AREAS).map(area => (
                            <button key={area} onClick={() => { onAreaChange(area); setIsOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm transition-colors ${area === currentArea ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>
                                {area}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    ); 
};