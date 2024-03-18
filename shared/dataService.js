/* eslint-disable @typescript-eslint/ban-ts-comment */
// dataService.js
import Papa from "papaparse";

export async function fetchData() {

    const feicom =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiCvFI_dzAV6jTiAnRq6ikqaeteoXMtZXjpHyk3MfVSYUt3jocJA38mxfdsSYatw/pub?gid=606824651&single=true&output=tsv";
    const mandat =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiCvFI_dzAV6jTiAnRq6ikqaeteoXMtZXjpHyk3MfVSYUt3jocJA38mxfdsSYatw/pub?gid=647677433&single=true&output=tsv";
    const icsp = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiCvFI_dzAV6jTiAnRq6ikqaeteoXMtZXjpHyk3MfVSYUt3jocJA38mxfdsSYatw/pub?gid=962052684&single=true&output=tsv";
    const commune = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTiCvFI_dzAV6jTiAnRq6ikqaeteoXMtZXjpHyk3MfVSYUt3jocJA38mxfdsSYatw/pub?gid=961481301&single=true&output=tsv';

    const projet = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSjD-pVg7fmwAN9jdpvkHYprUqvtw3b3ONw3_Q_BtzelSCgzg1ZIO23RM5m6zNParkGKzZaKfFo25Gv/pub?gid=241696036&single=true&output=tsv';

    const [mandatData, dataArr, icspData, communeData,projectData] = await Promise.all([
        fetchDataFromSheet(mandat),
        fetchDataFromSheet(feicom),
        fetchDataFromSheet(icsp),
        fetchDataFromSheet(commune),
        fetchDataFromSheet(projet)
    ]); 
    console.log('voici les projes fetch',projectData)
    return { mandatData, dataArr, icspData, communeData, projectData};
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