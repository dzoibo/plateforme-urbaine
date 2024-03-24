/* eslint-disable @typescript-eslint/ban-ts-comment */
// dataService.js
import Papa from "papaparse";

export async function fetchData() {

    const commune = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTYMzHPyArCNn2SlvIvQNYir_V1e7rLO7QbnAiTiDaAp7MPB3wCif4HXNBO37PnHA/pub?gid=961481301&single=true&output=tsv'
    const mandat='https://docs.google.com/spreadsheets/d/e/2PACX-1vTYMzHPyArCNn2SlvIvQNYir_V1e7rLO7QbnAiTiDaAp7MPB3wCif4HXNBO37PnHA/pub?gid=647677433&single=true&output=tsv';
    const icsp ='https://docs.google.com/spreadsheets/d/e/2PACX-1vTYMzHPyArCNn2SlvIvQNYir_V1e7rLO7QbnAiTiDaAp7MPB3wCif4HXNBO37PnHA/pub?gid=1383280162&single=true&output=tsv';
    const projet = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTYMzHPyArCNn2SlvIvQNYir_V1e7rLO7QbnAiTiDaAp7MPB3wCif4HXNBO37PnHA/pub?gid=218804066&single=true&output=tsv';
    const theme='https://docs.google.com/spreadsheets/d/e/2PACX-1vTYMzHPyArCNn2SlvIvQNYir_V1e7rLO7QbnAiTiDaAp7MPB3wCif4HXNBO37PnHA/pub?gid=1383280162&single=true&output=tsv';

    const [communeData, projetData,mandatData,icspData,themeData] = await Promise.all([
        fetchDataFromSheet(commune),
        fetchDataFromSheet(projet),
        fetchDataFromSheet(mandat),
        fetchDataFromSheet(icsp),
        fetchDataFromSheet(theme),

    ]); 
    return {communeData, projetData,mandatData,icspData,themeData};
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