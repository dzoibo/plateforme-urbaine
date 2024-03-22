import { writable } from 'svelte/store';

// Créez le store pour les valeurs d'attribution uniques

export const dataStore = writable({ communeData: [], keyCommuneID_Commune: [] , projetData:[] });
export const rangeValue = writable([]);
export const rangeValueAccord = writable([]);
export const buttonICSP = writable(true);
export const storeIndicateur = writable([]);
export const heightNavBar = writable(0);
