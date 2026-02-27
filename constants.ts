import React from 'react';
import { SectionCapability, ChecklistItem } from './types';

export const AREAS: Record<string, { lines: string[]; sections: string[] }> = {
  SMT: { 
    lines: ['CMPO-1', 'CMPO-2', 'CMPO-3', 'CMPO-4', 'CMPO-5', 'DMPO-7', 'DMPO-8'], 
    sections: ['Montaż SMT', 'Gniazdo AOI'] 
  },
  THT: { 
    lines: ['CMPR-2', 'CMPR-3', 'DMPR-4'], 
    sections: ['Montaż Ręczny', 'Lutowanie na Fali', 'AOI THT', 'Tester ICT'] 
  },
  TESTY: { 
    lines: ['CFCT-1', 'DFCT-2', 'CXRAY-1', 'DXRAY-1', 'DXRAY-2'], 
    sections: ['FCT', 'AOI Test', 'X-RAY', 'Tester ICT'] 
  },
  DEPANEL: { 
    lines: ['CSTANZE-2', 'CSTANZE-3', 'DSTANZE-1', 'DFREZARKA-1', 'DFREZARKA-2'], 
    sections: ['Stanowisko Depanelizacji'] 
  }
};

export const LINES_STRUCTURE: Record<string, string[]> = {
  'CMPO-1': ['Montaż SMT', 'Gniazdo AOI'], 'CMPO-2': ['Montaż SMT', 'Gniazdo AOI'], 
  'CMPO-3': ['Montaż SMT', 'Gniazdo AOI'], 'CMPO-4': ['Montaż SMT', 'Gniazdo AOI'], 
  'CMPO-5': ['Montaż SMT', 'Gniazdo AOI'], 'DMPO-7': ['Montaż SMT', 'Gniazdo AOI'], 
  'DMPO-8': ['Montaż SMT', 'Gniazdo AOI'],
  'CMPR-2': ['Montaż Ręczny', 'Lutowanie na Fali', 'AOI THT', 'Tester ICT'],
  'CMPR-3': ['Montaż Ręczny', 'Lutowanie na Fali', 'AOI THT', 'Tester ICT'],
  'DMPR-4': ['Montaż Ręczny', 'Lutowanie na Fali', 'AOI THT'],
  'CFCT-1': ['FCT'], 'DFCT-2': ['FCT'],
  'CXRAY-1': ['AOI Test', 'X-RAY', 'Tester ICT'],
  'DXRAY-1': ['X-RAY', 'Tester ICT'],
  'DXRAY-2': ['AOI Test', 'X-RAY', 'Tester ICT'],
  'CSTANZE-2': ['Stanowisko Depanelizacji'], 'CSTANZE-3': ['Stanowisko Depanelizacji'], 
  'DSTANZE-1': ['Stanowisko Depanelizacji'], 'DFREZARKA-1': ['Stanowisko Depanelizacji'], 
  'DFREZARKA-2': ['Stanowisko Depanelizacji'],
};

export const SECTION_CAPABILITIES: Record<string, SectionCapability> = {
  'Montaż SMT': { canCreate: true, canFinish: false },
  'Gniazdo AOI': { canCreate: false, canFinish: true },
  'Montaż Ręczny': { canCreate: true, canFinish: false },
  'Lutowanie na Fali': { canCreate: false, canFinish: false },
  'AOI THT': { canCreate: false, canFinish: true },
  'Tester ICT': { canCreate: false, canFinish: true },
  'FCT': { canCreate: true, canFinish: true },
  'AOI Test': { canCreate: true, canFinish: false },
  'X-RAY': { canCreate: true, canFinish: false },
  'Stanowisko Depanelizacji': { canCreate: true, canFinish: true }
};

export const CHECKLIST_DEFINITIONS: Record<string, ChecklistItem[]> = {
  'Montaż SMT': [
    { id: 'smt_1', text: 'Wynik automatycznej kontroli SPI', type: 'A' }, 
    { id: 'smt_2', text: 'Występowanie pasty w obcych miejscach', type: 'W' }, 
    { id: 'smt_3', text: 'Obecność układów scalonych (P&P)', type: 'W' }, 
    { id: 'smt_4', text: 'Pozycja układów scalonych', type: 'W' }, 
    { id: 'smt_5', text: 'Polaryzacja układów scalonych', type: 'W' }, 
    { id: 'smt_6', text: 'Brak podniesionych komponentów Pin in Paste', type: 'W' }
  ],
  'Gniazdo AOI': [
    { id: 'aoi_1', text: 'Wynik automatycznej kontroli AOI', type: 'A' }, 
    { id: 'aoi_2', text: 'Dostępność logów w Repair Station', type: 'A' }, 
    { id: 'aoi_3', text: 'Brak kulek lutu', type: 'W' }, 
    { id: 'aoi_4', text: 'Brak zanieczyszczeń PCB', type: 'W' }
  ],
  'Montaż Ręczny': [
    { id: 'tht_1', text: 'Obecność komponentów THT', type: 'W' }, 
    { id: 'tht_2', text: 'Poprawność montażu', type: 'W' }, 
    { id: 'tht_3', text: 'Polaryzacja komponentów', type: 'W' }
  ],
  'Lutowanie na Fali': [
    { id: 'fala_1', text: 'Poprawność programu maszynowego', type: 'W' }, 
    { id: 'fala_2', text: 'Brak zalań lutowiem', type: 'W' }
  ],
  'AOI THT': [{ id: 'aoitht_1', text: 'Wynik automatycznej kontroli AOI', type: 'A' }],
  'Tester ICT': [{ id: 'ict_1', text: 'Wynik testu ICT', type: 'A' }],
  'FCT': [{ id: 'fct_1', text: 'Wynik testu FCT_HLP', type: 'A' }],
  'X-RAY': [{ id: 'xray_1', text: 'Wynik kontroli X-RAY', type: 'A' }],
  'AOI Test': [{ id: 'aoitest_1', text: 'Wynik automatycznej kontroli AOI', type: 'A' }],
  'Stanowisko Depanelizacji': [{ id: 'dep_1', text: 'Linia cięcia w granicy mostków', type: 'W' }]
};

export const SCENARIOS = {
  SCENARIO_A: { 
    id: 'SCENARIO_A', 
    title: 'Nawadnianie do Pieca', 
    description: 'Tryb Start-Stop. Weryfikacja przed piecem.', 
    colorClass: 'text-orange-600 bg-orange-50 border-orange-200 hover:border-orange-400', 
    badgeClass: 'bg-orange-100 text-orange-700' 
  },
  SCENARIO_B: { 
    id: 'SCENARIO_B', 
    title: 'Pełny Przepływ', 
    description: 'Ciągła produkcja. Pobranie ze strumienia.', 
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-400', 
    badgeClass: 'bg-blue-100 text-blue-700' 
  },
  SCENARIO_C: { 
    id: 'SCENARIO_C', 
    title: 'Seria Próbna', 
    description: 'Tryb Inżynierski. Limitowana partia.', 
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200 hover:border-purple-400', 
    badgeClass: 'bg-purple-100 text-purple-700' 
  }
};

export const MUSTER_REASONS = [
  { id: 'A1', label: 'Po awarii / naprawie maszyny kluczowej', scenario: 'SCENARIO_A' },
  { id: 'A2', label: 'Po przeglądzie UTR', scenario: 'SCENARIO_A' },
  { id: 'A3', label: 'Zmiana grupy projektowej (np. MIB na AED)', scenario: 'SCENARIO_A' },
  { id: 'A4', label: 'Po postoju dłuższym niż 2h (krótszym niż 12h)', scenario: 'SCENARIO_A' },
  { id: 'A5', label: 'Po postoju dłuższym niż 12h', scenario: 'SCENARIO_A' },
  
  { id: 'B1', label: 'Zmiana ID projektu w obrębie jednej grupy projektowej', scenario: 'SCENARIO_B' },
  { id: 'B2', label: 'Przejęcie Zmiany', scenario: 'SCENARIO_B' },
  { id: 'B3', label: 'Po konserwacji operatorskiej', scenario: 'SCENARIO_B' },

  { id: 'C1', label: 'Wdrożenie / Sample', scenario: 'SCENARIO_C' },
  { id: 'C2', label: 'Specjalne testy inżynierskie', scenario: 'SCENARIO_C' },
];

export const MOCK_USERS = [
  { login: 'operator', pass: 'test', name: 'Jan Kowalski', baseRole: 'OPERATOR', id: 'OPR_001' },
  { login: 'kierownik', pass: 'test2', name: 'Anna Nowak', baseRole: 'KIEROWNIK', id: 'MGR_001' }
];