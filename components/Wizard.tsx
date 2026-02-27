import React, { useState } from 'react';
import { Package, Check, ScanBarcode, Flame, Activity, FlaskConical, ChevronRight, FilePlus, PlayCircle } from 'lucide-react';
import { Button } from './UI';
import { User, Muster } from '../types';
import { SCENARIOS, MUSTER_REASONS } from '../constants';
import { generateSerialNumber, generateOrderId, generateProduct, getPcbSide } from '../utils';

interface WizardProps {
  onCancel: () => void;
  onComplete: (data: Partial<Muster>) => void;
  user: User;
}

export const NewMusterWizardSMT: React.FC<WizardProps> = ({ onCancel, onComplete, user }) => {
  const [step, setStep] = useState(1);
  const [scannedSns, setScannedSns] = useState({ sn1: '', sn2: '', sn3: '' });
  const [scannedData, setScannedData] = useState<Partial<Muster> | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<any>(null);
  
  const handleScan = (key: 'sn1' | 'sn2' | 'sn3') => {
    // Simulation of scanning event
    const sn = generateSerialNumber();
    setScannedSns(prev => ({ ...prev, [key]: sn }));
  };

  const handleNextFromScan = () => {
    setScannedData({ 
      orderId: generateOrderId(), 
      product: generateProduct(), 
      line: user.line!, 
      side: getPcbSide(scannedSns.sn1), 
      createdBy: user.id, 
      creationSection: user.section! 
    });
    setStep(2);
  };

  const handleFinish = () => {
    onComplete({ 
      ...scannedData, 
      sn: scannedSns.sn1, 
      reason: selectedReason, 
      scenario: selectedScenarioId!, 
      checklistResults: { 
        pcb1: { sn: scannedSns.sn1 }, 
        pcb2: { sn: scannedSns.sn2 }, 
        pcb3: { sn: scannedSns.sn3 } 
      }, 
      status: 'INICJACJA', 
      verificationSteps: [] 
    });
  };

  const ScenarioIcon = ({ id }: { id: string }) => {
      switch(id) {
          case 'SCENARIO_A': return <Flame size={48} />;
          case 'SCENARIO_B': return <Activity size={48} />;
          case 'SCENARIO_C': return <FlaskConical size={48} />;
          default: return <Activity />;
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] flex flex-col">
        {/* Progress Bar */}
        <div className="flex justify-center gap-2 mb-6">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-2 w-16 rounded-full transition-colors duration-300 ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`}/>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {/* STEP 1: SCANNING */}
          {step===1 && (
            <div className="text-center space-y-8 py-4 animate-slide-up">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3">
                  <Package className="text-blue-600" size={32}/> Kompletowanie Pakietu (3 szt.)
                </h3>
                <p className="text-slate-500">Zeskanuj unikalne kody DataMatrix dla 3 płytek.</p>
              </div>
              
              <div className="grid gap-4">
                {(['sn1', 'sn2', 'sn3'] as const).map((key, idx) => (
                  <div key={key} className={`p-4 border-2 rounded-xl flex justify-between items-center transition-all ${scannedSns[key] ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${scannedSns[key] ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-500'}`}>
                        {idx+1}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{idx===0 ? 'Lider (Główna)' : 'Zapas'}</span>
                        <div className={`font-mono text-lg font-bold ${scannedSns[key] ? 'text-slate-800' : 'text-slate-400'}`}>
                          {scannedSns[key] || 'Oczekuje na skan...'}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant={scannedSns[key] ? "success" : "primary"} onClick={() => handleScan(key)}>
                      {scannedSns[key] ? <><Check size={16}/> ZESKANOWANO</> : <><ScanBarcode size={16}/> SKANUJ</>}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SCENARIO SELECTION */}
          {step===2 && (
            <div className="space-y-6 py-4 animate-slide-up">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800">Wybierz Scenariusz</h3>
                <p className="text-slate-500">Określ tryb pracy linii dla tego mustera.</p>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {Object.values(SCENARIOS).map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => {setSelectedScenarioId(s.id); setStep(3)}} 
                    className={`p-6 border-2 rounded-xl cursor-pointer text-center transition-all transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center gap-3 h-64 ${s.colorClass}`}
                  >
                    <div className="p-4 bg-white/80 rounded-full shadow-sm">
                        <ScenarioIcon id={s.id} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{s.title}</h4>
                      <p className="text-xs opacity-80 mt-1 leading-tight">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: REASON SELECTION */}
          {step===3 && (
            <div className="space-y-6 py-4 animate-slide-up">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800">Wybierz Powód</h3>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mt-2 ${(SCENARIOS as any)[selectedScenarioId!].badgeClass}`}>
                  <ScenarioIcon id={selectedScenarioId!} />
                  {(SCENARIOS as any)[selectedScenarioId!].title}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto p-1">
                {MUSTER_REASONS.filter(r => r.scenario === selectedScenarioId).map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => {setSelectedReason(r); setStep(4)}} 
                    className="p-5 text-left border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-md font-bold text-slate-700 flex justify-between items-center group transition-all"
                  >
                    {r.label}
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-200 flex items-center justify-center text-slate-400 group-hover:text-blue-700 transition-colors">
                      <ChevronRight size={20}/>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step===4 && (
            <div className="text-center py-10 space-y-8 animate-slide-up">
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <FilePlus size={48} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Gotowe do startu</h3>
                <p className="text-slate-500">Potwierdź dane, aby wygenerować dokument.</p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-md mx-auto text-left space-y-3 shadow-inner">
                 <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 text-sm uppercase font-bold">Zlecenie</span>
                    <span className="font-mono font-bold">{scannedData?.orderId}</span>
                 </div>
                 <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 text-sm uppercase font-bold">Scenariusz</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${(SCENARIOS as any)[selectedScenarioId!].badgeClass}`}>{(SCENARIOS as any)[selectedScenarioId!].title}</span>
                 </div>
                 <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 text-sm uppercase font-bold">Powód</span>
                    <span className="font-bold text-right w-1/2">{selectedReason?.label}</span>
                 </div>
                 <div className="flex justify-between pt-2">
                    <span className="text-slate-500 text-sm uppercase font-bold">Pakiet SN</span>
                    <div className="text-right font-mono text-xs">
                      <div>1. {scannedSns.sn1}</div>
                      <div>2. {scannedSns.sn2}</div>
                      <div>3. {scannedSns.sn3}</div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center bg-white">
          <Button variant="secondary" onClick={onCancel}>Anuluj</Button>
          
          <div className="flex gap-3">
            {step > 1 && <Button variant="secondary" onClick={()=>setStep(step-1)}>Wstecz</Button>}
            {step === 1 && <Button onClick={handleNextFromScan} disabled={!scannedSns.sn1 || !scannedSns.sn2 || !scannedSns.sn3}>Dalej</Button>}
            {step === 4 && <Button variant="success" onClick={handleFinish} size="lg">ROZPOCZNIJ PROCES <PlayCircle size={20}/></Button>}
          </div>
        </div>
      </div>
    </div>
  );
};