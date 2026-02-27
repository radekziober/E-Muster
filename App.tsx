import React, { useState, useEffect } from 'react';
import { 
  Factory, LogOut, AlertTriangle, Clock, 
  FilePlus, Inbox, FolderOpen, Activity, Calendar, History, Ban
} from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { NewMusterWizardSMT } from './components/Wizard';
import { ChecklistScreen } from './components/ChecklistScreen';
import { MusterTable, ManagerKPI, FilterBar, AreaSwitcher, SectionSwitcher } from './components/Dashboard';
import { Card } from './components/UI';
import { User, Muster, ChecklistResults, Report5W2H } from './types';
import { AREAS, SECTION_CAPABILITIES } from './constants';
import { 
    getFormattedDateTime, generateRandomId, generateSerialNumber, 
    generateOrderId, generateProduct, getPcbSide, getCurrentShift, isTimestampInCurrentShift 
} from './utils';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'DASHBOARD' | 'CHECKLIST' | 'WIZARD_SMT' | 'WIZARD_SIMPLE'>('DASHBOARD');
  const [activeMuster, setActiveMuster] = useState<Muster | null>(null);
  const [filters, setFilters] = useState({ line: '', status: '' });
  
  // Empty initial state - no random forms
  const [mustersList, setMustersList] = useState<Muster[]>([]);
  
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  const handleOpenMuster = (muster: Muster) => { 
      setActiveMuster(muster); 
      setView('CHECKLIST'); 
  };
  
  const handleDeleteMuster = (id: string) => {
      if (window.confirm("Czy na pewno usunąć ten dokument roboczy?")) {
          setMustersList(prev => prev.filter(m => m.id !== id));
      }
  };

  const handleSectionChange = (newSection: string) => {
     setUser(prev => prev ? ({ ...prev, section: newSection }) : null);
  };

  const handleStatusUpdate = (id: string, newStatus: string, results: ChecklistResults, report5w2h: Report5W2H | undefined, updatedData: Partial<Muster>) => {
      setMustersList(prev => prev.map(m => m.id === id ? { 
          ...m, 
          status: newStatus, 
          checklistResults: results, 
          report5w2h: report5w2h || m.report5w2h, 
          ...updatedData 
      } : m));
  };

  const handleStartWizard = () => {
      if(!user?.section) return;
      const cap = SECTION_CAPABILITIES[user.section];
      if (cap && !cap.canCreate) return;
      
      // SMT uses the complex wizard, others use simplified simulation
      setView(user.area === 'SMT' ? 'WIZARD_SMT' : 'WIZARD_SIMPLE'); 
  };

  const handleWizardComplete = (data: Partial<Muster>) => {
      const newMuster = { 
          id: generateRandomId(6), 
          timestamp: getFormattedDateTime(), 
          status: 'INICJACJA', 
          ...data 
      } as Muster;
      
      setMustersList([newMuster, ...mustersList]); 
      setActiveMuster(newMuster); 
      setView('CHECKLIST');
  };

  // Logic for simple wizard (instant creation for non-SMT areas)
  useEffect(() => {
      if (view === 'WIZARD_SIMPLE' && user) {
        const sn1 = generateSerialNumber(); 
        const sn2 = generateSerialNumber(); 
        const sn3 = generateSerialNumber();
        
        // Simulate delay
        const timer = setTimeout(() => {
            handleWizardComplete({ 
                sn: sn1, 
                orderId: generateOrderId(), 
                product: generateProduct(), 
                reason: { label: 'Standard' }, 
                scenario: 'STANDARD', 
                checklistResults: { pcb1: {sn: sn1}, pcb2: {sn: sn2}, pcb3: {sn: sn3} }, 
                createdBy: user.id, 
                creationSection: user.section!, 
                line: user.line!, 
                side: getPcbSide(sn1),
                section: user.section!,
                verificationSteps: []
            });
        }, 800);
        return () => clearTimeout(timer);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);


  if (!user) return <LoginScreen onLogin={setUser} />;
  
  if (view === 'CHECKLIST' && activeMuster) {
      return (
        <ChecklistScreen 
            muster={activeMuster} 
            user={user} 
            onBack={() => setView('DASHBOARD')} 
            onStatusUpdate={handleStatusUpdate} 
        />
      );
  }

  if (view === 'WIZARD_SMT') {
      return (
        <NewMusterWizardSMT 
            onCancel={() => setView('DASHBOARD')} 
            onComplete={handleWizardComplete} 
            user={user} 
        />
      );
  }

  if (view === 'WIZARD_SIMPLE') {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-10 text-center">
                <Activity className="animate-spin mx-auto mb-4 text-blue-600" size={40}/>
                <h3 className="font-bold text-slate-700">Generowanie Pakietu...</h3>
            </Card>
        </div>
      );
  }

  const applyFilters = (list: Muster[]) => {
      let filtered = list;
      if (user.role === 'KIEROWNIK') {
          // Managers only see lines in their area
          filtered = filtered.filter(m => AREAS[user.area].lines.includes(m.line));
      }
      if (filters.line) filtered = filtered.filter(m => m.line === filters.line);
      if (filters.status) filtered = filtered.filter(m => m.status === filters.status);
      return filtered;
  };

  const finalStatuses = ['ZWOLNIONY_DO_PRODUKCJI', 'ZABLOKOWANY_NOK'];

  // Logic to determine which musters to show in "Active Processes"
  const operatorActive = mustersList.filter(m => {
      if (user.role === 'KIEROWNIK') return false;
      
      // Strict Line Check: Must match the operator's current line
      if (user.line && m.line !== user.line) return false;

      const isFinal = finalStatuses.includes(m.status);

      // 1. Always show pending items (NOT final)
      if (!isFinal) return true;

      // 2. Show final items ONLY if they are from the CURRENT SHIFT
      if (isFinal && isTimestampInCurrentShift(m.timestamp)) return true;

      return false;
  });

  const managerActive = mustersList.filter(m => 
      user.role === 'KIEROWNIK' && 
      ['OCZEKUJE_NA_ZWOLNIENIE', 'DO_DECYZJI_KIEROWNIKA'].includes(m.status)
  );

  // History List: Shows finished documents where the user participated (Created OR Processed in their area)
  const historyList = mustersList.filter(m => {
      const isFinal = finalStatuses.includes(m.status);
      if (!isFinal) return false;

      if (user.role === 'KIEROWNIK') return true; // Manager sees all final in their area (filtered by applyFilters)
      
      // Check if user created it OR if user's area was part of the process history
      const createdByMe = m.createdBy === user.id;
      const processedInMyArea = m.processedBy?.some(entry => entry.area === user.area);
      
      return createdByMe || processedInMyArea; 
  });

  const displayActive = applyFilters(user.role === 'KIEROWNIK' ? managerActive : operatorActive);
  const displayHistory = applyFilters(historyList);
  
  const canCreate = user.role === 'OPERATOR' && SECTION_CAPABILITIES[user.section || '']?.canCreate;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
              <Factory />
              <h1 className="font-bold text-xl tracking-wide">E-MUSTER</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-right">
              {user.role === 'KIEROWNIK' && (
                  <AreaSwitcher currentArea={user.area} onAreaChange={(a) => setUser({...user, area: a})} />
              )}
              <div>
                  <div className="font-bold">{user.name}</div>
                  <div className="text-blue-300 text-xs">{user.role} | {user.area}</div>
              </div>
              <button onClick={() => setUser(null)} className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors">
                  <LogOut size={18}/>
              </button>
          </div>
      </header>
      
      {user.role === 'OPERATOR' && (
          <div className="bg-yellow-300 text-black p-2 px-4 flex justify-between items-center font-bold text-sm shadow-md sticky top-0 z-30">
              <div className="flex items-center gap-2">
                  <AlertTriangle size={16}/> 
                  <span>Linia: {user.line}</span>
                  <span className="mx-2 text-yellow-600">|</span>
                  <span className="flex items-center gap-1">
                    Sekcja:
                    <SectionSwitcher 
                      currentLine={user.line!} 
                      currentSection={user.section!} 
                      onSectionChange={handleSectionChange} 
                    />
                  </span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-400/50 px-3 py-1 rounded-full">
                  <Clock size={16}/>
                  <span>{getCurrentShift()}</span>
              </div>
          </div>
      )}

      <main className="max-w-7xl mx-auto p-6 animate-fade-in">
          {user.role === 'OPERATOR' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card 
                    onClick={handleStartWizard} 
                    disabled={!canCreate} 
                    className={`bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none relative overflow-hidden group ${!canCreate ? 'grayscale opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                  >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"/>
                      <div className="flex justify-between mb-4 relative z-10">
                          {!canCreate ? <Ban size={32} className="text-slate-300"/> : <FilePlus size={32} className="text-blue-200"/>}
                          <span className="bg-white/20 text-xs py-1 px-2 rounded backdrop-blur-sm">Start</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-1 relative z-10">Nowy Dokument</h3>
                      <p className="text-blue-100 text-sm relative z-10">{!canCreate ? 'Tworzenie zablokowane tutaj.' : 'Rozpocznij procedurę.'}</p>
                  </Card>
                  
                  <Card className="hover:border-orange-400 group">
                      <div className="flex justify-between mb-4">
                          <Inbox size={32} className="text-orange-500 group-hover:scale-110 transition-transform"/>
                          <span className="bg-orange-100 text-orange-700 text-xs font-bold py-1 px-2 rounded-full">
                              {operatorActive.filter(m => m.status.includes('DO_WERYFIKACJI')).length} Oczekujące
                          </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-700">Do Weryfikacji</h3>
                      <p className="text-slate-400 text-xs mt-1">Oczekiwanie na działania z innych sekcji</p>
                  </Card>
                  
                  <Card 
                    onClick={() => setShowHistoryTable(!showHistoryTable)} 
                    className={`hover:border-green-400 cursor-pointer group ${showHistoryTable ? 'ring-2 ring-green-500' : ''}`}
                  >
                      <div className="flex justify-between mb-4">
                          <FolderOpen size={32} className="text-green-500 group-hover:scale-110 transition-transform"/>
                      </div>
                      <h3 className="text-xl font-bold text-slate-700">Moje Dokumenty</h3>
                      <p className="text-slate-400 text-xs mt-1">Historia i status moich zgłoszeń</p>
                  </Card>
              </div>
          )}

          {user.role === 'KIEROWNIK' && (
              <>
                <ManagerKPI musters={mustersList} />
                <FilterBar onFilterChange={(key, val) => setFilters({...filters, [key]: val})} lines={AREAS[user.area].lines} />
              </>
          )}
          
          <div className="space-y-8">
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
                    <Activity size={18}/> {user.role === 'KIEROWNIK' ? 'Zadania Bieżące (Do Decyzji)' : 'Aktywne Procesy (Bieżąca Zmiana)'}
                </div>
                <MusterTable 
                    musters={displayActive} 
                    onOpen={handleOpenMuster} 
                    onDelete={handleDeleteMuster} 
                    user={user} 
                    emptyMessage="Brak bieżących zadań." 
                />
            </div>

            {showHistoryTable && user.role === 'OPERATOR' && (
                <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden mb-8 animate-slide-up">
                    <div className="p-4 border-b border-green-200 bg-green-50 font-bold text-green-800 flex items-center gap-2">
                        <History size={18}/> Historia Dokumentów (Wszystkie)
                    </div>
                    <MusterTable musters={displayHistory} onOpen={handleOpenMuster} user={user} emptyMessage="Brak historii." />
                </div>
            )}

            {user.role === 'KIEROWNIK' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-500 flex items-center gap-2">
                        <Calendar size={18}/> Archiwum / Historia Zatwierdzeń
                    </div>
                    <MusterTable 
                        musters={displayHistory} 
                        onOpen={handleOpenMuster} 
                        user={user} 
                        emptyMessage="Brak historii w tym obszarze." 
                    />
                </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default App;