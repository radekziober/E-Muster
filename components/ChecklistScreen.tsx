import React, { useState, useCallback } from 'react';
import { ChevronLeft, ScanBarcode, Lock, Server, Database, DownloadCloud, Check, X, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Button } from './UI';
import { Form5W2H, HandoverModal } from './Modals';
import { User, Muster, ChecklistResults, Report5W2H, HistoryEntry } from '../types';
import { SCENARIOS, SECTION_CAPABILITIES, CHECKLIST_DEFINITIONS, LINES_STRUCTURE } from '../constants';
import { getPcbSide, generateSerialNumber, isSmtLine, getFormattedDateTime } from '../utils';

interface ChecklistScreenProps {
  muster: Muster;
  user: User;
  onBack: () => void;
  onStatusUpdate: (id: string, newStatus: string, results: ChecklistResults, report: Report5W2H | undefined, updatedMusterData: Partial<Muster>) => void;
}

export const ChecklistScreen: React.FC<ChecklistScreenProps> = ({ muster, user, onBack, onStatusUpdate }) => {
  const [activeTab, setActiveTab] = useState<'pcb1' | 'pcb2' | 'pcb3'>('pcb1');
  const [results, setResults] = useState<ChecklistResults>(muster.checklistResults || { pcb1: {}, pcb2: {}, pcb3: {} });
  const [isThreeSampleMode, setIsThreeSampleMode] = useState(
      Object.values(results.pcb1).filter(k => k !== 'sn').some(v => v === 'NOK')
  );
  
  const [pcb2Sn, setPcb2Sn] = useState(muster.checklistResults?.pcb2?.sn || '');
  const [pcb3Sn, setPcb3Sn] = useState(muster.checklistResults?.pcb3?.sn || '');
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [show5W2H, setShow5W2H] = useState(false);

  const isManager = user.role === 'KIEROWNIK';
  const sectionConfig = SECTION_CAPABILITIES[user.section || ''] || { canCreate: false, canFinish: false };
  
  // Check if status specifically targets the current user section to allow editing for intermediate steps
  const isReadOnly = isManager || 
      (!sectionConfig.canCreate && !sectionConfig.canFinish && !muster.status.includes(user.section || '---')) || 
      ['ZWOLNIONY_DO_PRODUKCJI', 'ZABLOKOWANY_NOK', 'OCZEKUJE_NA_ZWOLNIENIE', 'DO_DECYZJI_KIEROWNIKA'].includes(muster.status);
  
  const items = CHECKLIST_DEFINITIONS[user.section || ''] || [];
  const isSmt = isSmtLine(muster.line);
  const currentSN = results[activeTab]?.sn;

  const handleCheck = (itemId: string, status: string) => {
    if (isReadOnly) return;
    const newResults = { ...results, [activeTab]: { ...results[activeTab], [itemId]: status } };
    setResults(newResults);
    
    // Automatically switch to 3-sample mode if Leader (PCB1) fails
    if (activeTab === 'pcb1' && status === 'NOK' && !isThreeSampleMode) {
      setIsThreeSampleMode(true);
    }
  };

  const handleFetchMesData = (itemId: string) => {
    setLoadingFields(prev => ({ ...prev, [itemId]: true }));
    // Simulate API call
    setTimeout(() => { 
        handleCheck(itemId, Math.random() > 0.1 ? 'OK' : 'NOK'); 
        setLoadingFields(prev => ({ ...prev, [itemId]: false })); 
    }, 1000);
  };

  const isTabCompleteAndOk = useCallback((tab: 'pcb1' | 'pcb2' | 'pcb3') => {
    const tabRes = results[tab];
    if(!tabRes) return false;
    const answeredCount = Object.keys(tabRes).filter(key => key !== 'sn').length;
    if (answeredCount < items.length) return false;
    return Object.keys(tabRes).filter(key => key !== 'sn').every(key => tabRes[key] === 'OK');
  }, [results, items.length]);

  const isTabNok = useCallback((tab: 'pcb1' | 'pcb2' | 'pcb3') => {
      const tabRes = results[tab];
      if(!tabRes) return false;
      return Object.keys(tabRes).filter(key => key !== 'sn').some(key => tabRes[key] === 'NOK');
  }, [results]);

  const handleFinish = (action: string, handoverData: any = null) => {
    let newStatus = muster.status;
    let updatedMuster: Partial<Muster> = { checklistResults: results };
    
    // Create Log Entry
    const logEntry: HistoryEntry = {
        user: user.name,
        area: user.area,
        section: user.section || '',
        action: action,
        timestamp: getFormattedDateTime()
    };
    const prevHistory = muster.processedBy || [];
    updatedMuster.processedBy = [...prevHistory, logEntry];

    if (action === 'HANDOVER') {
        const lineSections = LINES_STRUCTURE[user.line!] || [];
        const currentIndex = lineSections.indexOf(user.section!);
        if (currentIndex >= 0 && currentIndex < lineSections.length - 1) {
            const nextSection = lineSections[currentIndex + 1];
            newStatus = `DO_WERYFIKACJI: ${nextSection}`;
            updatedMuster.section = nextSection;
        } else {
             alert("Brak zdefiniowanej kolejnej sekcji w tej linii.");
             return;
        }
    } else if (action === 'CROSS_AREA_HANDOVER') {
        newStatus = `DO_WERYFIKACJI_OBSZAR: ${handoverData.targetArea}`;
        updatedMuster.line = handoverData.targetLine;
        updatedMuster.area = handoverData.targetArea;
        updatedMuster.previousArea = user.area;
        // Reset section to first of new line or leave empty to force selection
        const newLineSections = LINES_STRUCTURE[handoverData.targetLine] || [];
        if (newLineSections.length > 0) {
            updatedMuster.section = newLineSections[0];
            // If we set the section, we might want to update status to verify specific section
            newStatus = `DO_WERYFIKACJI: ${newLineSections[0]}`; 
        } else {
             updatedMuster.section = ''; 
        }

    } else if (action === 'FINISH') {
        newStatus = 'OCZEKUJE_NA_ZWOLNIENIE';
    } else if (action === 'MANAGER_APPROVE') {
        newStatus = 'ZWOLNIONY_DO_PRODUKCJI';
    } else if (action === 'MANAGER_BLOCK') {
        newStatus = 'ZABLOKOWANY_NOK';
    }

    onStatusUpdate(muster.id, newStatus, results, undefined, updatedMuster);
    onBack();
  };

  const getNokSns = () => {
    const noks = [];
    if (isTabNok('pcb1')) noks.push(results.pcb1.sn);
    if (isTabNok('pcb2')) noks.push(results.pcb2.sn);
    if (isTabNok('pcb3')) noks.push(results.pcb3.sn);
    return noks;
  };

  const handleSave5W2H = (report: Report5W2H) => {
    if (isManager) {
        handleFinish('MANAGER_BLOCK');
    } else {
        onStatusUpdate(muster.id, 'DO_DECYZJI_KIEROWNIKA', results, report, {});
        setShow5W2H(false);
        onBack();
    }
  };

  // Auto open 5W2H for manager if blocked
  React.useEffect(() => {
    if (isManager && muster.status === 'DO_DECYZJI_KIEROWNIKA' && !show5W2H && muster.report5w2h) {
        setShow5W2H(true);
    }
  }, [isManager, muster.status]);

  const scenarioKey = muster.scenario;
  const scenarioDef = (SCENARIOS as any)[scenarioKey];
  const scenario = scenarioKey === 'STANDARD' 
    ? { title: 'Standard', badgeClass: 'bg-slate-200 text-slate-700' } 
    : (scenarioDef || { title: 'Nieznany', badgeClass: 'bg-gray-200 text-gray-700' });

  // Dynamic check for position in line
  const lineSections = LINES_STRUCTURE[user.line || ''] || [];
  const currentSectionIndex = lineSections.indexOf(user.section || '');
  const isLastSection = currentSectionIndex >= 0 && currentSectionIndex === lineSections.length - 1;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 animate-fade-in">
      <div className="bg-white shadow-sm border-b border-slate-200 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft /></button>
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    Inspekcja: {user.section} 
                    <span className={`text-xs px-2 py-1 rounded-full ${scenario.badgeClass}`}>{scenario.title}</span>
                </h2>
                <div className="text-xs text-slate-500">Zlecenie: <b>{muster.orderId}</b></div>
            </div>
        </div>
        {isReadOnly && <div className="px-4 py-1 bg-slate-200 rounded text-xs font-bold uppercase text-slate-600">Tryb Podglądu</div>}
      </div>
      
      <div className="px-4 pt-4 flex gap-2 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <button onClick={() => setActiveTab('pcb1')} className={`px-6 py-3 rounded-t-lg font-bold text-sm flex items-center gap-2 border-t border-x transition-all ${activeTab === 'pcb1' ? 'bg-white border-slate-300 text-blue-600 -mb-px z-10' : 'bg-slate-100 text-slate-500'}`}>
            <ScanBarcode size={16}/> {results.pcb1.sn} {isSmt && `(${getPcbSide(results.pcb1.sn)})`}
        </button>
        {(isThreeSampleMode || muster.checklistResults.pcb2.sn) && (
            <>
                <button onClick={() => isThreeSampleMode && setActiveTab('pcb2')} disabled={!isThreeSampleMode} className={`px-6 py-3 rounded-t-lg font-bold text-sm flex items-center gap-2 border-t border-x transition-all ${activeTab === 'pcb2' ? 'bg-white border-slate-300 text-blue-600 -mb-px z-10' : 'bg-slate-100 text-slate-500'} ${!isThreeSampleMode ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    {isThreeSampleMode ? <ScanBarcode size={16}/> : <Lock size={14}/>} {results.pcb2.sn || 'PCB 2'} <span className="text-[10px] uppercase bg-slate-200 px-1 rounded">Zapas</span>
                </button>
                <button onClick={() => isThreeSampleMode && setActiveTab('pcb3')} disabled={!isThreeSampleMode} className={`px-6 py-3 rounded-t-lg font-bold text-sm flex items-center gap-2 border-t border-x transition-all ${activeTab === 'pcb3' ? 'bg-white border-slate-300 text-blue-600 -mb-px z-10' : 'bg-slate-100 text-slate-500'} ${!isThreeSampleMode ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    {isThreeSampleMode ? <ScanBarcode size={16}/> : <Lock size={14}/>} {results.pcb3.sn || 'PCB 3'} <span className="text-[10px] uppercase bg-slate-200 px-1 rounded">Zapas</span>
                </button>
            </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {isThreeSampleMode && activeTab !== 'pcb1' && !currentSN && !isReadOnly && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center animate-pulse">
                <ScanBarcode className="mx-auto text-orange-400 mb-4" size={48}/>
                <h3 className="text-lg font-bold text-orange-800 mb-2">Zeskanuj {activeTab.toUpperCase()}</h3>
                <Button onClick={() => {
                    const sn = generateSerialNumber();
                    if(activeTab === 'pcb2') setPcb2Sn(sn); else setPcb3Sn(sn);
                    setResults(prev => ({...prev, [activeTab]: {...prev[activeTab], sn}}));
                }}>[ SYMULACJA SKANU ]</Button>
            </div>
        )}
        
        {currentSN && (
            <div className="space-y-3 max-w-3xl mx-auto">
                {items.map(item => { 
                   const status = results[activeTab]?.[item.id];
                   return (
                    <div key={item.id} className={`bg-white p-4 rounded-xl border flex items-center justify-between transition-colors ${status === 'NOK' ? 'border-red-300 bg-red-50' : status === 'OK' ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${item.type === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {item.type}
                          </div>
                          <div className="font-medium text-slate-800">{item.text}</div>
                      </div>
                      <div className="flex gap-2">
                        {isReadOnly ? (
                            status ? <span className={`font-bold ${status==='OK'?'text-green-600':'text-red-600'}`}>{status}</span> : '-'
                        ) : item.type === 'A' ? (
                            loadingFields[item.id] ? <span className="text-blue-600 flex gap-2 items-center"><Server className="animate-pulse" size={16}/> Pobieranie...</span> : 
                            status ? <div className={`flex gap-2 px-4 py-2 rounded font-bold text-sm ${status==='OK'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}><Database size={16}/> MES: {status}</div> : 
                            <Button size="sm" variant="outline" onClick={() => handleFetchMesData(item.id)}><DownloadCloud size={16}/> POBIERZ</Button>
                        ) : (
                            <>
                                <button onClick={() => handleCheck(item.id, 'OK')} className={`px-4 py-2 rounded font-bold text-sm flex gap-2 transition-all ${status==='OK'?'bg-green-600 text-white shadow-md transform scale-105':'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'}`}><Check size={16}/> OK</button>
                                <button onClick={() => handleCheck(item.id, 'NOK')} className={`px-4 py-2 rounded font-bold text-sm flex gap-2 transition-all ${status==='NOK'?'bg-red-600 text-white shadow-md transform scale-105':'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600'}`}><X size={16}/> NOK</button>
                            </>
                        )}
                      </div>
                    </div>
                   )
                })}
            </div>
        )}
        
        {muster.report5w2h && (
            <div className="max-w-3xl mx-auto mt-6">
                <Button variant="danger" onClick={() => setShow5W2H(true)} className="w-full py-4 shadow-red-200 shadow-lg">ZOBACZ RAPORT 5W2H <AlertOctagon size={18}/></Button>
            </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-2xl z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <div className="text-sm text-slate-500 font-medium">
               {isThreeSampleMode ? <span className="text-orange-600 font-bold flex gap-2 items-center"><AlertTriangle size={18}/> Tryb Naprawczy (3 PCB)</span> : (isManager ? "TRYB KIEROWNIKA" : "Weryfikacja Pakietu (Lider OK)")}
           </div>
           <div className="flex gap-3">
             {isManager ? (
                muster.status === 'OCZEKUJE_NA_ZWOLNIENIE' ? <Button variant="success" onClick={() => handleFinish('MANAGER_APPROVE')}>ZWOLNIJ PROCES</Button> : 
                muster.status === 'DO_DECYZJI_KIEROWNIKA' ? <Button variant="danger" onClick={() => setShow5W2H(true)}>DECYZJA (5W2H)</Button> : <Button variant="secondary" onClick={onBack}>Zamknij</Button>
             ) : (
                !isReadOnly ? (
                    !isThreeSampleMode ? (
                        (isTabCompleteAndOk('pcb1') || muster.scenario === 'STANDARD') ? (
                            <>
                              <Button variant="outline" onClick={onBack}>Zapisz Roboczo</Button>
                              
                              {/* Dynamic Action Buttons based on position in Line */}
                              {!isLastSection ? (
                                <Button variant="success" onClick={() => handleFinish('HANDOVER')}>PRZEKAŻ WEWNĄTRZ OBSZARU</Button>
                              ) : (
                                <>
                                    <Button variant="success" onClick={() => setShowHandoverModal(true)}>PRZEKAŻ DO INNEGO OBSZARU</Button>
                                    <Button variant="primary" onClick={() => handleFinish('FINISH')}>ZAKOŃCZ (DO KIEROWNIKA)</Button>
                                </>
                              )}
                            </>
                        ) : <Button disabled>Wypełnij wszystkie pola (PCB 1)</Button>
                    ) : (
                        (isTabCompleteAndOk('pcb2') && isTabCompleteAndOk('pcb3')) ? 
                            <Button variant="success" onClick={() => handleFinish('HANDOVER')}>PRZEKAŻ PAKIET (NAPRAWCZY)</Button> : 
                            ((isTabNok('pcb2') || isTabNok('pcb3')) ? 
                                <Button variant="danger" onClick={() => setShow5W2H(true)}>ZGŁOŚ NOK (5W2H)</Button> : 
                                <Button disabled>Wypełnij PCB 2 i 3</Button>
                            )
                    )
                ) : <Button variant="secondary" onClick={onBack}>Zamknij</Button>
             )}
           </div>
        </div>
      </div>
      
      {show5W2H && <Form5W2H muster={muster} nokSns={getNokSns()} onClose={() => setShow5W2H(false)} onSave={handleSave5W2H} user={user} readOnly={isManager && muster.status !== 'DO_DECYZJI_KIEROWNIKA' ? true : (isManager ? false : (muster.status === 'DO_DECYZJI_KIEROWNIKA' || isReadOnly))} />}
      {showHandoverModal && <HandoverModal currentArea={user.area} onClose={() => setShowHandoverModal(false)} onConfirm={(data) => handleFinish('CROSS_AREA_HANDOVER', data)} />}
    </div>
  );
};