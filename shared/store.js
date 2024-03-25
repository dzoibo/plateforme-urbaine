import { writable } from 'svelte/store';

// Créez le store pour les valeurs d'attribution uniques

export const dataStore = writable({ dataArr: [], mandatData: [], icspData: [],projetData:[] , themeData:[], communeData: [], regionData: [], keyCommuneID_Commune: [] });
export const rangeValue = writable([]);
export const accordMode = writable('');
export const storeIndicateur5 = writable([]);
export const storeIndicateur4 = writable([]);
export const storeIndicateur3 = writable([]);
export const storeIndicateur2 = writable([]);
export const storeIndicateur = writable([]);
export const storeIndicateurICSP = writable([]);
export const heightNavBar = writable(0);
export const map = writable({});
export const scaleStore= writable('id_REGION');
export const storeCommune= writable('');
export const storeAccordsBeneficiaire= writable(true);
export const storeIcspCommune= writable(true);
export const storeWrapper= writable(false);
