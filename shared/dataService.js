/* eslint-disable @typescript-eslint/ban-ts-comment */
// dataService.js
import Papa from "papaparse";

export async function fetchData() {

    const commune = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSjD-pVg7fmwAN9jdpvkHYprUqvtw3b3ONw3_Q_BtzelSCgzg1ZIO23RM5m6zNParkGKzZaKfFo25Gv/pub?gid=1931056354&single=true&output=tsv';

    const projet = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSjD-pVg7fmwAN9jdpvkHYprUqvtw3b3ONw3_Q_BtzelSCgzg1ZIO23RM5m6zNParkGKzZaKfFo25Gv/pub?gid=241696036&single=true&output=tsv';

    const [communeData, projetData] = await Promise.all([
        fetchDataFromSheet(commune),
        fetchDataFromSheet(projet)
    ]); 
    return {communeData, projetData};
}

// @ts-ignore
function fetchDataFromSheet(url) {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            delimiter: "	",
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                resolve(results.data);
            },
            error: function(error) {
                reject(error);
            },
        });
    });
}