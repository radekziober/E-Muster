import React, { useState, useEffect } from 'react';
import { User as UserIcon, ShieldAlert, Factory } from 'lucide-react';
import { Button } from './UI';
import { User } from '../types';
import { AREAS, MOCK_USERS, LINES_STRUCTURE } from '../constants';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'OPERATOR' | 'KIEROWNIK'>('OPERATOR');
  const [area, setArea] = useState('SMT');
  const [line, setLine] = useState('');
  const [section, setSection] = useState('');
  const [login, setLogin] = useState('operator');
  const [password, setPassword] = useState('test');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'OPERATOR') {
      setLogin('operator');
      setPassword('test');
    } else {
      setLogin('kierownik');
      setPassword('test2');
    }
    setError('');
  }, [activeTab]);

  useEffect(() => {
    if(AREAS[area]) {
      setLine(AREAS[area].lines[0]);
    }
  }, [area]);

  useEffect(() => {
    if (line) {
        const sections = LINES_STRUCTURE[line] || AREAS[area].sections;
        setSection(sections[0]);
    }
  }, [line, area]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const userRecord = MOCK_USERS.find(u => u.login === login && u.pass === password);

    if (!userRecord) {
      setError('Błędny login lub hasło.');
      return;
    }

    if (activeTab === 'KIEROWNIK' && userRecord.baseRole !== 'KIEROWNIK') {
      setError('Brak uprawnień kierowniczych.');
      return;
    }

    const userData: User = {
        name: userRecord.name,
        role: activeTab === 'OPERATOR' ? 'OPERATOR' : 'KIEROWNIK',
        baseRole: userRecord.baseRole as any,
        area,
        id: userRecord.id,
        line: activeTab === 'OPERATOR' ? line : null,
        section: activeTab === 'OPERATOR' ? section : null
    };
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        <div className="bg-blue-900 p-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">E-MUSTER</h1>
            <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest">System Kontroli Jakości</p>
        </div>
        
        <div className="flex border-b">
            <button onClick={() => setActiveTab('OPERATOR')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab==='OPERATOR'?'text-blue-600 border-b-2 border-blue-600 bg-white':'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                <UserIcon size={18}/> OPERATOR
            </button>
            <button onClick={() => setActiveTab('KIEROWNIK')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab==='KIEROWNIK'?'text-indigo-600 border-b-2 border-indigo-600 bg-white':'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                <ShieldAlert size={18}/> KIEROWNIK
            </button>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Login</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" value={login} onChange={(e) => setLogin(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasło</label>
                    <input type="password" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="mb-3">
                        <label className="block text-xs font-bold text-blue-700 mb-1 uppercase">Obszar</label>
                        <div className="relative">
                            <Factory size={16} className="absolute top-3.5 left-3 text-blue-400"/>
                            <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-3 pl-9 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-blue-300">
                                {Object.keys(AREAS).map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>

                    {activeTab === 'OPERATOR' && (
                        <div className="space-y-3 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Linia</label>
                                <select value={line} onChange={(e) => setLine(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                    {AREAS[area].lines.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sekcja</label>
                                <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                    {(LINES_STRUCTURE[line] || AREAS[area].sections).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center font-medium animate-pulse">{error}</div>}

            <Button onClick={handleLogin as any} className="w-full py-3 mt-4 shadow-lg shadow-blue-100">ZALOGUJ SIĘ</Button>
            
            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => onLogin({ name: 'Gość', role: 'GUEST', area: 'SMT', line: null, section: null, id: 'GUEST001', baseRole: 'GUEST' })} 
                className="text-sm text-slate-400 hover:text-slate-600 underline"
              >
                Wejdź jako Gość
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};