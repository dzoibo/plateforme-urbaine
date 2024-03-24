/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
// utilitaires.js
// @ts-ignore

export function uniqueValues(tableau, attribut, option = false, id){
    const result = [];
    const seenValues = {};

    for (const objet of tableau) {
        const valeur = objet[attribut];
        const valeurID = objet[id];
        const id_COMMUNE = objet['id_COMMUNE'];
        const id_REGION = objet['id_REGION'];
        if (valeur !== null && !seenValues[valeur]) {
            const item = { 'key': valeur, checked: false, 'id': valeurID };

            if (option && id_COMMUNE) {
                item['id_COMMUNE'] = id_COMMUNE;
                item['id_REGION'] = id_REGION;
            }

            result.push(item);
            seenValues[valeur] = true;
        }
    }

    // Triez les clés par ordre ascendant
    result.sort((a, b) => a.key.localeCompare(b.key));

    return result;
}

export function removeDuplicatesByAttribute(array, attribute) {
    return array.reduce((accumulator, current) => {
        if (!accumulator.find(item => item[attribute] === current[attribute])) {
            accumulator.push(current);
        }
        return accumulator;
    }, []);
}


export function uniqueValuesInArrayOfObject(tableau, attribut) {
    // @ts-ignore
    const valeursUniques = new Set(tableau.map(objet => objet[attribut]));
    return Array.from(valeursUniques);
}

// Function to get statistics
// @ts-ignore
export function getSumOf(data, key) {
    const statistics = {};
    // @ts-ignore
    data.forEach(item => {
        const value = item[key];
        if (value) {
            // @ts-ignore
            if (statistics[value]) {
                // @ts-ignore
                statistics[value]++;
            } else {
                // @ts-ignore
                statistics[value] = 1;
            }
        }
    });

    // Convert the statistics object to an array of objects with the specified structure
    const result = Object.entries(statistics).map(([key, value]) => ({
        ['Région']: key,
        value
    }));

    return result;
}

export function getSumPerYear(data, startYear, endYear, scale) {
    const statistics = {};

    data.forEach(item => {
        const region = item[scale];
        const itemYear = parseInt(item['Année financement']);

        // Vérifier si l'année se trouve dans la plage spécifiée
        if (!isNaN(itemYear) && itemYear >= startYear && itemYear <= endYear) {
            if (statistics[region]) {
                statistics[region]++;
            } else {
                statistics[region] = 1;
            }
        }
    });

    // Convertir l'objet de statistiques en un tableau d'objets avec la structure spécifiée
    const result = Object.entries(statistics).map(([region, count]) => ({
        [scale]: region,
        'value': count
    }));

    return result;
}




//export function calculateTotalProjetByRegion(data, startYear, endYear, scale, filters) {
export function calculateTotalProjetByRegion(data, scale,filters) {
    if (!data || data.length === 0) {
        return []; // Si data est vide, retourne un tableau vide
    }
    let dataToUse = [];
    const areFiltersEmpty = filters.every(filter => filter.data.length === 0);
    // Si tous les filtres sont vides, calculer la somme entre les deux dates sans filtre
    if(!areFiltersEmpty) {
        dataToUse = data.filter(entry => indicatorFilterCallBack(filters, entry))
    }else{
        dataToUse = data;
    }
    const totalByRegion = {};
    for (const entry of dataToUse) {
        if(entry [scale]===null){
            continue;
        }
        const regionProjet=  entry[scale].split(",");
        for(const region of regionProjet){
            if(totalByRegion[region]){
                totalByRegion[region]++;
            }else{
                totalByRegion[region] = 1
            }
        }
    }
    const result = Object.entries(totalByRegion).map(([key, value]) => ({
        [scale]: key,
        'value': value
    }));
    return result;
}

export function rechercheMulticriteresPourProjet(dataForMap, id_couche, scale, dataAllIndicateur) {
    const filters=matchFilterIndicators(dataAllIndicateur);
    //export function rechercheMulticriteres(dataForMap, id_couche, scale, startYear, endYear, filters) {
        return dataForMap.filter(objet => {
           // const champAnnee = "Année financement";
            // Vérifiez si le nom du département correspond
            let correspondRegion = false;
            if(objet[scale]){
                correspondRegion = objet[scale].includes(id_couche);
            }
    
            // Vérifiez si l'année correspond à la période spécifiée
           // const correspondAnnee = parseInt(objet[champAnnee]) >= startYear && parseInt(objet[champAnnee]) <= endYear;
    
            // Vérifiez les critères de l'array filters
            const critereIndicateur = filters.every(indicateur => {
                if(indicateur==='theme'){
                    indicateur.data.every(valeur=>{
                        if(objet["Thème d'intervention"].includes(valeur)){
                            return true;
                        }
                    })
                    return false;
                }else{
                    const champIndicateur = indicateur.indicateur;
                    const valeursIndicateur = indicateur.data;
    
                    if (valeursIndicateur.length === 0) {
                        return true; // Aucun critère à vérifier, donc l'objet est toujours inclus
                    }
    
                    // Vérifiez si l'objet a la propriété correspondant à l'indicateur
                    if (!objet.hasOwnProperty(champIndicateur)) {
                        return false;
                    }
                    // Vérifiez si la valeur de l'objet correspond à l'une des valeurs de l'indicateur
                    return valeursIndicateur.includes(objet[champIndicateur]);
                }
            }); 
            //Retournez true si tous les critères correspondent
            //return correspondRegion && correspondAnnee && critereIndicateur;
            return correspondRegion && critereIndicateur;
        });
    }
    

function matchFilterIndicators(filters){
   let filtersCopy=[];
   for (const item of filters){
    filtersCopy.push({...item})
   }
    for(const filter of filtersCopy){// here we change indicateur label to match what we actually have in our database
        switch (filter.indicateur) {
          case 'theme':
            filter.indicateur="id_THEME";
          break;
          case 'nom':
            filter.indicateur="Nom";
          break;
          case 'institution':
            filter.indicateur="Appui institutionnel";
          break;
          case 'bailleur':
            filter.indicateur="Bailleur(s)";
          break;
          case 'beneficiaire':
            filter.indicateur="Ville/Bénéficiaire(s)";
          break;
        }
    }
    return filtersCopy
}

function indicatorFilterCallBack(dataAllIndicateur,entry){
    const filters=matchFilterIndicators(dataAllIndicateur);
    return filters.every(filter => 
    {
        const filterKey = filter.indicateur;
        const filterValues = filter.data;
        const entryValue = entry[filterKey] ;
        let isPresent= false;
        if(entryValue!==undefined & entryValue !==null){
            if(filterKey==='id_THEME'){
                isPresent= entryValue.toString().split(',').some(value => filterValues.includes(parseInt(value)));
            }else{
                isPresent= entryValue.toString().split(',').some(value => filterValues.includes(value));
            }
        }

        if (filterValues.length === 0) {
            return true; // Aucun critère à vérifier, donc l'objet est toujours inclus
        }
        // Vérifiez si l'objet a la propriété correspondant à l'indicateur
        if (!entry.hasOwnProperty(filterKey)) {
            return false;
        }
        // Vérifiez si la valeur de l'objet correspond à l'une des valeurs de l'indicateur
        return (!filterKey || isPresent);
    });
}
// @ts-ignore
export function findMinMax(array, key) {
    if (!array || array.length === 0) {
        return 0;
    }

    let min = array[0][key];
    let max = array[0][key];

    for (let i = 1; i < array.length; i++) {
        const value = array[i][key];

        if (value < min) {
            min = value;
        }

        if (value > max) {
            max = value;
        }
    }

    return { min, max };
}

export function sumISPValues(data, region, id_level) {
    const averages = {};

    for (const entry of data) {
        if (entry[id_level] === region) {
            const year = entry.ANNEE;
            const total = parseFloat(typeof entry.TOTAL === 'string' ? entry.TOTAL.replace(/\D+/g, '') : '0');

            if (!isNaN(total)) {
                if (!averages[year]) {
                    averages[year] = [];
                }

                averages[year].push(total);
            }
        }
    }

    return {
        data: Object.values(averages).map(yearData => yearData.reduce((acc, value) => acc + value, 0) / yearData.length),
        label: Object.keys(averages).map(Number),
    };
}


export function zoomToFeatureByValue(map, sourceName, columnName, selectedValue, zoomLevel) {
    if (selectedValue.length == 1) {
        // Recherchez l'entité correspondante dans la couche vectorielle en utilisant la valeur sélectionnée
        const features = map.querySourceFeatures(sourceName, {
            sourceLayer: sourceName, // Vous pouvez spécifier la sourceLayer si nécessaire
            filter: ['==', columnName, selectedValue] // Remplacer ces valeurs par les vôtres
        });

        if (features.length > 0) {
            // Récupérer la géométrie (polygone) de l'entité
            const geometry = features[0].geometry;

            // Calculer le centre du polygone
            const centroid = calculatePolygonCentroid(geometry.coordinates[0]);

            // Utiliser le centre du polygone pour centrer la carte et ajuster le zoom
            map.flyTo({
                center: centroid,
                zoom: zoomLevel || 12, // Niveau de zoom souhaité (12 par défaut)
            });
        }
    }

}

// Fonction pour calculer le centre d'un polygone
export function calculatePolygonCentroid(coordinates) {
    let sumX = 0;
    let sumY = 0;
    const numPoints = coordinates.length;

    coordinates.forEach(point => {
        sumX += point[0];
        sumY += point[1];
    });

    return [sumX / numPoints, sumY / numPoints];
}

export function findAllObjectsByAttribute(array, nom_attribut, id) {
    return array.filter(obj => obj[nom_attribut] === id);
}

export function fetchIdCommunesFromCommunesID(communesArray, correspondanceArray, attributASelectionner, attributPourJointure) {
    const idCommunes = [];

    for (const commune of communesArray) {
        const correspondance = correspondanceArray.find(item => item[attributPourJointure] === commune);
        if (correspondance) {
            idCommunes.push(correspondance[attributASelectionner]);
        }
    }
    return idCommunes;
}

export function parseBboxString(bboxString) {
    const coordinates = bboxString.split(/\s+/).map(parseFloat);
    const bbox = [];

    while (coordinates.length >= 4) {
        const minLng = coordinates.shift();
        const minLat = coordinates.shift();
        const maxLng = coordinates.shift();
        const maxLat = coordinates.shift();

        bbox.push([minLng, minLat]);
        bbox.push([maxLng, maxLat]);
    }

    return bbox;
}

export function getOverallBbox(bboxes) {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    for (const bboxString of bboxes) {
        const [lng1, lat1, lng2, lat2] = bboxString.split(/\s+/).map(parseFloat);
        minLng = Math.min(minLng, lng1, lng2);
        minLat = Math.min(minLat, lat1, lat2);
        maxLng = Math.max(maxLng, lng1, lng2);
        maxLat = Math.max(maxLat, lat1, lat2);
    }

    return parseBboxString([minLng, minLat, maxLng, maxLat].join(" "));
}

export function sortByDescendingOrder(arr, property) {
    return arr.sort((a, b) => b[property] - a[property]);
}


export function formattedValue(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function rechercheMulticritere(dataForMap, critères) {
    if (critères.length === 0) {
        // Si le tableau de critères est vide, retournez simplement l'array original
        return dataForMap;
    }

    // Utilisez la méthode filter pour filtrer les objets en utilisant les critères spécifiés
    return dataForMap.filter(objet => {
        return critères.every(critère => {
            const champ = critère.indicateur;
            const valeurs = critère.data;

            if (valeurs.length === 0) {
                return true; // Si aucune valeur n'est spécifiée, passez à la prochaine condition
            }

            return valeurs.includes(objet[champ]);
        });
    });
}



export function jsonToItem(data, title) {
    data = data[title].map((objet) => objet.key);

    // Supprimez les espaces avant le texte et triez par ordre alphabétique
    data = data.map((item) => item.trim()).sort((a, b) => a.localeCompare(b, 'fr'));

    return data;
}



export function getSumSuperficy(data,scale){ // for now "Information generale" doesn't care about filter and date so we don't need to handle it here
    if (!data || data.length === 0) {
        return []; 
    }

    const superficyByRegion={};
    for(const entry of data){
        const region =entry[scale];
        const superficy=typeof entry.SUPERFICIE==='number'? entry.SUPERFICIE : parseInt(entry.SUPERFICIE.replace(/\s/g, ''));
        if(!superficyByRegion[region]) {
            superficyByRegion[region] = superficy;
        }else{
            superficyByRegion[region] += superficy;
        }
    }

    

    const result = Object.entries(superficyByRegion).map(([key, value]) => ({
        [scale]: key,
        'value': value
    }));

    return result;

}

export function calculateTotalByRegion(data, startYear, endYear, scale, filters) {
    if (!data || data.length === 0) {
        return []; // Si data est vide, retourne un tableau vide
    }

    const areFiltersEmpty = filters.every(filter => filter.data.length === 0);

    // Si tous les filtres sont vides, calculer la somme entre les deux dates sans filtre
    if (areFiltersEmpty) {
        const totalByRegion = {};

        for (const entry of data) {
            const region = entry[scale];
            const totalString = (typeof entry.TOTAL === 'string' ? entry.TOTAL : '').replace(/,/g, '.').replace(/\D+/g, '');
            const total = parseFloat(totalString);
            const year = parseInt(entry.ANNEE);

            if (!isNaN(total) && year >= startYear && year <= endYear) {
                if (!totalByRegion[region]) {
                    totalByRegion[region] = total;
                } else {
                    totalByRegion[region] += total;
                }

            }
        }

        const result = Object.entries(totalByRegion).map(([key, value]) => ({
            [scale]: key,
            'value': value
        }));

        return result;
    }

    // Sinon, appliquer les filtres spécifiés
    const filteredData = data.filter(entry => {
        return filters.every(filter => {
            const filterKey = filter.indicateur;
            const filterValues = filter.data;
            const entryValue = entry[filterKey];
            return (!filterKey || entryValue === undefined || filterValues.includes(entryValue));
        });
    });

    // Calculer la somme des valeurs filtrées par région et entre les deux dates
    const totalByRegion = {};

    for (const entry of filteredData) {
        const region = entry[scale];
        const totalString = typeof entry.TOTAL === 'string' ? entry.TOTAL.replace(/\D+/g, '') : '0'; // Supprimer les caractères non numériques
        const total = parseFloat(totalString);
        const year = parseInt(entry.ANNEE);

        if (!isNaN(total) && year >= startYear && year <= endYear) {
            if (!totalByRegion[region]) {
                totalByRegion[region] = total;
            } else {
                totalByRegion[region] += total;
            }
        }
    }

    const result = Object.entries(totalByRegion).map(([key, value]) => ({
        [scale]: key,
        'value': value
    }));

    return result;
}

export function transformDataForBarChart(data, region, startYear, endYear, id_level) {
    // Filtrer les données pour la région et la plage d'années spécifiées
    const filteredData = data.filter((entry) => entry[id_level] === region && parseInt(entry.ANNEE) >= startYear && parseInt(entry.ANNEE) <= endYear);

    if (filteredData.length === 0) {
        // Aucune donnée correspondante trouvée
        return [];
    }

    // Créer un tableau d'objets pour chaque valeur ISP
    const chartData = [];
    for (let i = 1; i <= 4; i++) {
        const ispValues = filteredData.map((entry) => {
            const ispValue = entry[`ISP${i}`];

            if (typeof ispValue === 'string') {
                const cleanedValue = ispValue.replace(/,/g, '.').replace(/\s+/g, '');
                const floatValue = parseFloat(cleanedValue);

                return !isNaN(floatValue) ? floatValue : 0;
            } else if (typeof ispValue === 'number') {
                return ispValue;
            } else {
                return 0;
            }
        });


        const ispValueSum = ispValues.reduce((acc, val) => acc + val, 0);


        chartData.push({ x: `ISP${i}`, y: ispValueSum });

    }

    return chartData;
}

export function sortByAscendingOrder(arr, property) {
    return arr.sort((a, b) => a[property] - b[property]);
}

export function rechercheMulticriteresPourFEICOM(dataForMap, id_couche, scale, startYear, endYear, dataAllIndicateur) {
    return dataForMap.filter(objet => {
        const champDepartement = scale;
        const champAnnee = "Année financement";

        // Vérifiez si le nom du département correspond
        const correspondNomDepartement = objet[champDepartement] === id_couche;

        // Vérifiez si l'année correspond à la période spécifiée
        const correspondAnnee = parseInt(objet[champAnnee]) >= startYear && parseInt(objet[champAnnee]) <= endYear;

        // Vérifiez les critères de l'array dataAllIndicateur
        const critereIndicateur = dataAllIndicateur.every(indicateur => {
            const champIndicateur = indicateur.indicateur;
            const valeursIndicateur = indicateur.data;

            if (valeursIndicateur.length === 0) {
                return true; // Aucun critère à vérifier, donc l'objet est toujours inclus
            }

            // Vérifiez si l'objet a la propriété correspondant à l'indicateur
            if (!objet.hasOwnProperty(champIndicateur)) {
                return false;
            }

            // Vérifiez si la valeur de l'objet correspond à l'une des valeurs de l'indicateur
            return valeursIndicateur.includes(objet[champIndicateur]);
        });

        // Retournez true si tous les critères correspondent
        return correspondNomDepartement && correspondAnnee && critereIndicateur;
    });
}

export function optionForBarChart(dataForBarChart, region) {
    let optionsForChart = {
        colors: ['#1A56DB'],
        series: [{
            name: region,
            color: '#1A56DB',
            data: dataForBarChart
        }],
        chart: {
            type: 'bar',
            height: 'auto',
            fontFamily: 'Inter, sans-serif',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '70%',
                borderRadiusApplication: 'end',
                borderRadius: 8
            }
        },

        tooltip: {
            shared: true,
            intersect: false,
            style: {
                fontFamily: 'Inter, sans-serif'
            },
            custom: function({ series, seriesIndex, dataPointIndex }) {
                const formatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' });
                const formattedValue = formatter.format(series[seriesIndex][dataPointIndex]);
                return `<div class="text-center p-2">${formattedValue}</div>`;
            }

        },
        states: {
            hover: {
                filter: {
                    type: 'darken',
                    value: 1
                }
            }
        },
        stroke: {
            show: true,
            width: 0,
            colors: ['transparent']
        },
        grid: {
            show: false,
            strokeDashArray: 4,
            padding: {
                left: 2,
                right: 2,
                top: -14
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: false
        },
        xaxis: {
            floating: false,
            labels: {
                show: true,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            show: false
        },
        fill: {
            opacity: 1
        }
    };

    return optionsForChart;
}

export function optionForLineChart(label, data, geo) {

    let optionsForChartLine = {
        chart: {
            height: 'auto',
            maxWidth: '100%',
            type: 'area',
            fontFamily: 'Inter, sans-serif',
            dropShadow: {
                enabled: false
            },
            toolbar: {
                show: false
            }
        },
        tooltip: {
            enabled: true,
            x: {
                show: false
            },
            custom: function({ series, seriesIndex, dataPointIndex }) {
                const formatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' });
                const formattedValue = formatter.format(series[seriesIndex][dataPointIndex]);
                return `<div class="text-center p-2">${formattedValue}</div>`;
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.55,
                opacityTo: 0,
                shade: '#1C64F2',
                gradientToColors: ['#1C64F2']
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: 6
        },
        grid: {
            show: false,
            strokeDashArray: 0,
            padding: {
                left: 20,
                right: 10,
                top: 0,
                bottom: 0
            }
        },
        series: [{
            name: geo,
            data: data,
            color: '#1A56DB'
        }],
        xaxis: {
            categories: label,
            labels: {
                show: true,
                maxWidth: 1, // Spécifiez la largeur maximale pour les étiquettes de l'axe des Y
            },

            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            show: false
        }
    };
    return optionsForChartLine;
}

