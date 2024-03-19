  //Déclaration du Google Sheet
  var csv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFAJVY3-0fFRSmxyD0pXQoLCQ6Hs-1dq4KcE09LbodgpFg2Gvu_uL--jOWeVohV8FhrA5LCla01WcP/pub?gid=241696036&single=true&output=tsv';


  var globalGeoJSON = {
      type: 'FeatureCollection',
      features: []
  };

  var globalGeoJSONCentroid = {
      type: 'FeatureCollection',
      features: []
  };

  var uniqueGeoJSON = [];
  var uniqueGeoJSONToBeModified = [];
  accessData = []

  const departments = ["Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"];

  //ANCHOR -  Appel du Google Sheet
  Papa.parse(csv, {
      download: true,
      delimiter: '	', // Délimiteur de colonnes 
      header: true,
      dynamicTyping: true,
      complete: function(results) {
          // Les données sont stockées dans results.data
          data = results.data
          accessData = [data]

          //SECTION - Construction des listes déroulantes
          //ANCHOR - Traitement des bénéficiaires
          // Créez un tableau pour stocker les items uniques
          var appuiBeneficiairesItems = [];

          // Parcourez les lignes du CSV
          for (var i = 0; i < data.length; i++) {
              var row = data[i];
              // Récupérez la valeur de la colonne "Appui Beneficiaires" de chaque ligne
              var appuiBeneficiairesValue = row["Ville/Bénéficiaire(s)"];
              if (appuiBeneficiairesValue != null) {
                  appuiBeneficiairesValue = appuiBeneficiairesValue.toString()
                      // Divisez la valeur en items individuels en utilisant la virgule comme séparateur
                  var items = appuiBeneficiairesValue.split(',');
                  // Supprimez les espaces vides autour de chaque item et éliminez les doublons
                  items = items.map(item => item.trim());
                  /*           items = [...new Set(items)]; */
                  // Ajoutez les items uniques au tableau global
                  appuiBeneficiairesItems = appuiBeneficiairesItems.concat(items);
              }
          }

          // Maintenant, BeneficiairesItems contient une liste unique de tous les items Beneficiaires dans le CSV
          appuiBeneficiairesItems = [...new Set(appuiBeneficiairesItems)];

          // Déclaration de la balise select pour les institutions
          var selectBeneficiaire = document.getElementById("selectBeneficiaire");

          // Ajout de chaque institution unique à la liste déroulante
          appuiBeneficiairesItems.forEach(function(projet) {
              var option = document.createElement("option");
              option.text = projet;
              selectBeneficiaire.appendChild(option);
          });

          //ANCHOR - Traitement des bailleurs
          // Créez un tableau pour stocker les items uniques
          var appuiBailleursItems = [];

          // Parcourez les lignes du CSV
          for (var i = 0; i < data.length; i++) {
              var row = data[i];
              // Récupérez la valeur de la colonne "Appui Bailleurs" de chaque ligne
              var appuiBailleursValue = row["Bailleur(s)"];
              if (appuiBailleursValue != null) {
                  appuiBailleursValue = appuiBailleursValue.toString()
                      // Divisez la valeur en items individuels en utilisant la virgule comme séparateur
                  var items = appuiBailleursValue.split(',');
                  // Supprimez les espaces vides autour de chaque item et éliminez les doublons
                  items = items.map(item => item.trim());
                  /*           items = [...new Set(items)]; */
                  // Ajoutez les items uniques au tableau global
                  appuiBailleursItems = appuiBailleursItems.concat(items);
              }
          }

          // Maintenant, BailleursItems contient une liste unique de tous les items Bailleurs dans le CSV
          appuiBailleursItems = [...new Set(appuiBailleursItems)];

          // Déclaration de la balise select pour les institutions
          var selectBailleur = document.getElementById("selectBailleur");

          // Ajout de chaque institution unique à la liste déroulante
          appuiBailleursItems.forEach(function(projet) {
              var option = document.createElement("option");
              option.text = projet;
              selectBailleur.appendChild(option);
          });

          //ANCHOR - Traitement des institutions
          // Créez un tableau pour stocker les items uniques
          var appuiInstitutionnelItems = [];

          // Parcourez les lignes du CSV
          for (var i = 0; i < data.length; i++) {
              var row = data[i];
              // Récupérez la valeur de la colonne "Appui institutionnel" de chaque ligne
              var appuiInstitutionnelValue = row["Appui institutionnel"];
              if (appuiInstitutionnelValue != null) {
                  appuiInstitutionnelValue = appuiInstitutionnelValue.toString()
                      // Divisez la valeur en items individuels en utilisant la virgule comme séparateur
                  var items = appuiInstitutionnelValue.split(',');
                  // Supprimez les espaces vides autour de chaque item et éliminez les doublons
                  items = items.map(item => item.trim());
                  /*           items = [...new Set(items)]; */
                  // Ajoutez les items uniques au tableau global
                  appuiInstitutionnelItems = appuiInstitutionnelItems.concat(items);
              }

          }


          // Maintenant, appuiInstitutionnelItems contient une liste unique de tous les items "Appui institutionnel" dans le CSV
          appuiInstitutionnelItems = [...new Set(appuiInstitutionnelItems)];

          // Déclaration de la balise select pour les institutions
          var selectInstitution = document.getElementById("selectInstitution");

          /*      appuiInstitutionnelItemsEnDur = ["MINHDU", "MINEPAT", "MINDDEVEL", "MINDCAF", "CVUC", "CUD", "CUM", "CUY", "CUD", "CUY", "MINDCAF", "MINAT", "FEICOM",
                       "MINESUP", "NASLA", "CA"
                   ] */
          // Ajout de chaque institution unique à la liste déroulante
          appuiInstitutionnelItems.forEach(function(projet) {
              var option = document.createElement("option");
              option.text = projet;
              selectInstitution.appendChild(option);
          });

          //ANCHOR - Selection du thème
          //NOTE - Thèmes écris en dur pour le moment ! ATTENTION si nouveau thème
          // Liste des thèmes depuis le Google Sheet (séparés par des virgules)
          var themesFromSheet = [
              "Renforcement des capacités/Compétences",
              "Equipements de bureaux et matériels",
              "Appui institutionnel/gouvernance",
              "Environnement",
              "Assainissement solide/liquide et drainage",
              "Travaux d’Infrastructures urbaines structurantes",
              "Travaux d’Infrastructures urbaines légères",
              "Planification (urbaine, régional, transports etc.)",
              "Etudes urbaines (Transports - mobilité - déchets - eau - assainissement)",
              "Concertation (à tous les niveaux)",
              "Outils numérique pour la gestion du territoire"
          ];


          // Récupération la balise select pour les thèmes
          var selectTheme = document.getElementById("selectTheme");

          // Ajoutez chaque thème à la liste déroulante
          themesFromSheet.forEach(function(theme) {
              var option = document.createElement("option");
              option.text = theme.trim(); // Supprimez les espaces avant et après le thème
              selectTheme.appendChild(option);
          });



          // Créez un ensemble (Set) pour stocker les valeurs uniques de la colonne "Projet"
          var projetsUniques = new Set();
          // Parcours des lignes du CSV
          for (var i = 0; i < data.length; i++) {
              var row = data[i];
              var projet = row["Nom"];

              // Ajoutez le texte à l'ensemble (Set) pour obtenir des valeurs uniques
              if (projet) {
                  projetsUniques.add(projet);
              }
          }

          //ANCHOR - Récupérer la balise select pour les projets
          var selectProjet = document.getElementById("selectProjet");

          // Ajoutez chaque projet unique à la liste déroulante
          projetsUniques.forEach(function(projet) {
              var option = document.createElement("option");
              option.text = projet;
              selectProjet.appendChild(option);
          });


          //ANCHOR -  Ajout d'un gestionnaire d'événements pour le changement de sélection des institutions
          selectBeneficiaire.addEventListener("change", function() {
              var communeSelect;
              var nomCommune = selectBeneficiaire.value;

              map.jumpTo({ center: [12.6392, 5.9601], zoom: 2 })

              var infoPanel = document.getElementById('infoPanel');
              infoPanel.innerHTML = ''; // Effacez le contenu précédent
              selectTheme.value = ''; // Réinitialisation la liste déroulante du thème
              selectBailleur.value = ''; // Réinitialisation la liste déroulante du thème
              selectProjet.value = ''; // Réinitialisation la liste déroulante de l'institution


              filteredMyTable = filteringMyData2(nomCommune, "Ville/Bénéficiaire(s)")


              var propertyDiv3 = document.createElement('div');
              propertyDiv3.classList.add('titleForInfo');
              propertyDiv3.innerHTML = '<h1>Commune : ' + nomCommune + '</h1><h2>Liste des projets</h2>';
              infoPanel.appendChild(propertyDiv3);

              // Filtre pour name égal à "Benjo"
              var filter = ['==', ['get', 'name'], nomCommune];
              // Appliquez le filtre à la couche existante
              map.setFilter('commune_geojson', filter);
              setTimeout(function() {
                  // Obtenez les polygones filtrés
                  var filteredFeatures = map.querySourceFeatures('commune_geojson', {
                      filter: ['==', ['get', 'name'], nomCommune]
                  });



                  // Calculez la bbox du polygone filtré

                  var bbox = turf.bbox(filteredFeatures[0].geometry);


                  // Ajustez la vue de la carte pour afficher la bbox
                  map.fitBounds(bbox, { padding: 100 }); // Vous pouvez ajuster la marge (padding) selon vos préférences


                  for (let i = 0; i < filteredMyTable.length; i++) {
                      var properties = filteredMyTable[i]; // Obtenir les propriétés du premier polygone cliqué

                      // Afficher les propriétés dans le panneau HTML
                      displayProperties(properties);
                  }
              }, 200)



          })

          //ANCHOR -  Ajout d'un gestionnaire d'événements pour le changement de sélection des institutions
          selectInstitution.addEventListener("change", function() {
              resetCommune()
              var infoPanel = document.getElementById('infoPanel');
              infoPanel.innerHTML = ''; // Effacez le contenu précédent
              selectTheme.value = ''; // Réinitialisation la liste déroulante du thème
              selectBailleur.value = ''; // Réinitialisation la liste déroulante du thème
              selectProjet.value = ''; // Réinitialisation la liste déroulante de l'institution
              selectBeneficiaire.value = ''; // Reset la liste déroulante du thème
              var institutionSelectionne = selectInstitution.value;

              // Utilisez la valeur sélectionnée pour créer un filtre
              var filter = ['in', institutionSelectionne, ['get', "Appui institutionnel"]]
                  // Appliquez le filtre à la couche existante
              map.setFilter('maine', filter);


              filteredGeoJson = filteringMyData(institutionSelectionne, "Appui institutionnel")
              map.getSource('maineCentroid').setData(filteredGeoJson);


              map.setPaintProperty('maine', 'fill-opacity', [
                  'case', ['boolean', ['feature-state', 'hover'], false],
                  0.9,
                  0.5
              ]);

          })

          //ANCHOR -  Ajout d'un gestionnaire d'événements pour le changement de sélection des institutions
          selectBailleur.addEventListener("change", function() {
              resetCommune()
              var infoPanel = document.getElementById('infoPanel');
              infoPanel.innerHTML = ''; // Effacez le contenu précédent
              selectTheme.value = ''; // Réinitialisation la liste déroulante du thème
              selectInstitution.value = ''; // Réinitialisation la liste déroulante du thème
              selectProjet.value = ''; // Réinitialisation la liste déroulante de l'institution
              selectBeneficiaire.value = ''; // Reset la liste déroulante du thème
              var bailleurSelectionne = selectBailleur.value;

              // Utilisez la valeur sélectionnée pour créer un filtre
              var filter = ['in', bailleurSelectionne, ['get', "Bailleur(s)"]]
                  // Appliquez le filtre à la couche existante
              map.setFilter('maine', filter);


              filteredGeoJson = filteringMyData(bailleurSelectionne, "Bailleur(s)")
              map.getSource('maineCentroid').setData(filteredGeoJson);


              map.setPaintProperty('maine', 'fill-opacity', [
                  'case', ['boolean', ['feature-state', 'hover'], false],
                  0.9,
                  0.5
              ]);

          })


          //ANCHOR -  Ajout d'un gestionnaire d'événements pour le changement de sélection des projets
          selectProjet.addEventListener("change", function() {
              resetCommune()
              selectInstitution.value = ''; // Réinitialisez la liste déroulante du thème
              selectTheme.value = ''; // Réinitialisez la liste déroulante de l'institution
              selectBailleur.value = ''; // Réinitialisation la liste déroulante du thème
              selectBeneficiaire.value = ''; // Reset la liste déroulante du thème
              var infoPanel = document.getElementById('infoPanel');
              infoPanel.innerHTML = ''; // Effacez le contenu précédent
              var projetSelectionne = selectProjet.value;

              // Utilisez la valeur sélectionnée pour créer un filtre
              var filter = ["==", "Nom", projetSelectionne];

              filteredGeoJson = filteringMyData(projetSelectionne, "Nom")
              map.getSource('maineCentroid').setData(filteredGeoJson);

              // Appliquez le filtre à la couche existante
              map.setFilter('maine', filter);

              map.setPaintProperty('maine', 'fill-opacity', [
                  'case', ['boolean', ['feature-state', 'hover'], false],
                  0.9,
                  0.5
              ]);

          })

          //ANCHOR -  Ajout d'un gestionnaire d'événements pour le changement de sélection
          selectTheme.addEventListener("change", function() {
              resetCommune()
              selectProjet.value = ''; // Réinitialisez la liste déroulante de l'institution
              selectBailleur.value = ''; // Réinitialisation la liste déroulante du thème
              selectInstitution.value = ''; // Réinitialisation la liste déroulante du thème
              selectBeneficiaire.value = ''; // Reset la liste déroulante du thème

              var infoPanel = document.getElementById('infoPanel');
              infoPanel.innerHTML = ''; // Effacez le contenu précédent
              var themeSelectionne = selectTheme.value;

              // Créez un filtre pour n'afficher que les polygones avec le thème sélectionné
              var filter = ["==", themeSelectionne, "VRAI"];

              filteredGeoJson = filteringMyData("VRAI", themeSelectionne)
              map.getSource('maineCentroid').setData(filteredGeoJson);

              // Appliquez le filtre à la couche existante
              map.setFilter('maine', filter);


              map.setPaintProperty('maine', 'fill-opacity', [
                  'case', ['boolean', ['feature-state', 'hover'], false],
                  0.9,
                  0.5
              ]);

          })

          selectTheme.value = ''; // Réinitialisez la liste déroulante du thème
          selectProjet.value = ''; // Réinitialisez la liste déroulante de projet
          selectInstitution.value = ''; // Réinitialisez la liste déroulante du institution
          selectBailleur.value = ''; // Réinitialisez la liste déroulante du thème
          selectBeneficiaire.value = ''; // Reset la liste déroulante du thème
          //SECTION - Construction des geojsons
          // Parcours des lignes du CSV

          for (var i = 0; i < data.length; i++) {
              var row = data[i];
              // Extraction des objets GeoJSON des colonnes spécifiques
              var geoJSONObjects = [];
              for (var key in row) {
                  if (key.endsWith('_geom')) {
                      var geoJSON = JSON.parse(row[key]);

                      if (geoJSON != null) {
                          var properties = {

                              "name": key.replace('_geom', ''),
                              "Acronyme": row["Acronyme"],
                              "id": key.replace('_geom', '') + "_" + row["Nom"],
                              "Nom": row["Nom"]
                          };

                          // Parcourez les autres propriétés de row et ajoutez-les à properties
                          for (var prop in row) {
                              if (prop !== key || !key.includes("_geom")) {
                                  properties[prop] = row[prop];
                              }
                          }

                          // Maintenant, properties contient toutes les propriétés de row
                          featureToPush = {
                              "type": "Feature",
                              "geometry": geoJSON,
                              "properties": properties
                          };

                          geoJSONObjects.push(featureToPush);
                          centroid = turf.centroid(featureToPush)
                          centroid.properties.name = key.replace('_geom', '')
                          globalGeoJSONCentroid.features.push(centroid)
                      }

                  }
              }


              // Ajout des objets GeoJSON extraits à l'objet GeoJSON global
              geoJSONObjects.forEach(function(geoJSON) {
                  globalGeoJSON.features.push(geoJSON);
              });
          }


          uniqueGeoJSON = countObject(globalGeoJSONCentroid)

          // Une fois la donnée traitée, on load la map
          loadMap()

      },
      error: function(error) {
          console.error('Erreur lors de la lecture des données :', error);
      }
  });

  // Définissez la bbox du Cameroun
  let bbox = [
      [-6.81, -6.492371],
      [31.841812, 18.227069]

  ]; // Coordonnées de la bbox du Cameroun


  //SECTION Ajout de la map
  const map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets/style.json?key=DCyzrtb9UVD3OAplX1YV',
      center: [12.6392, 5.9601],
      zoom: 2,
      maxBounds: bbox // Sets bounds as max
  });

  let hoveredStateId = null;

  function loadMap() {

      map.on('load', () => {

          map.addSource('projet_line', {
              type: 'geojson',
              data: 'projet/projet_line.geojson',
              'generateId': true, //This ensures that all features have unique IDs,
          });
          map.addLayer({
              'id': 'projet_line',
              'type': 'line',
              'source': 'projet_line',
              'layout': {},
              'paint': {
                  'line-color': 'blue',
                  'line-width': 2,
                  'line-opacity': 0.9
              },
              'minzoom': 9.5
          });

          map.addSource('projet_polygon', {
              type: 'geojson',
              data: 'projet/projet_polygon.geojson',
              'generateId': true, //This ensures that all features have unique IDs,
          });
          map.addLayer({
              'id': 'projet_polygon',
              'type': 'fill',
              'source': 'projet_polygon',
              'layout': {},
              'paint': {
                  'fill-color': 'red',
                  'fill-opacity': 0.9
              },
              'minzoom': 9.5
          });

          map.addSource('projet_symbol', {
              type: 'geojson',
              data: 'projet/projet_point.geojson',
              'generateId': true
          });

          map.loadImage('img/travaux-routiers.png', function(error, image) {
              if (error) throw error;

              map.addImage('custom-marker', image);

              map.addLayer({
                  'id': 'projet_symbol',
                  'type': 'symbol',
                  'source': 'projet_symbol',
                  'layout': {
                      'icon-image': 'custom-marker', // Nom de l'image du marqueur personnalisé
                      'icon-size': 1, // Taille du marqueur (1 signifie 100% de la taille d'origine)
                      'icon-offset': [0, -15], // Décalage vertical du marqueur pour l'aligner correctement
                      'icon-allow-overlap': true // Permettre aux marqueurs de se chevaucher
                  },
                  'minzoom': 9.5
              });
          });

          // Ajout des événements de clic pour les couches de ligne et de polygone
          map.on('click', 'projet_line', showPopup);
          map.on('click', 'projet_polygon', showPopup);
          map.on('click', 'projet_symbol', showSymbolPopup);
          // Gestionnaire d'événement pour le survol (hover) des couches de ligne et de polygone
          map.on('mouseenter', 'projet_line', function() {
              map.getCanvas().style.cursor = 'pointer'; // Changement du curseur au survol
          });
          map.on('mouseleave', 'projet_line', function() {
              map.getCanvas().style.cursor = ''; // Rétablissement du curseur par défaut quand la souris quitte
          });
          map.on('mouseenter', 'projet_polygon', function() {
              map.getCanvas().style.cursor = 'pointer'; // Changement du curseur au survol
          });
          map.on('mouseleave', 'projet_polygon', function() {
              map.getCanvas().style.cursor = ''; // Rétablissement du curseur par défaut quand la souris quitte
          });
          // Gestionnaire d'événement pour le survol (hover) de la couche de symbole
          map.on('mouseenter', 'projet_symbol', function() {
              map.getCanvas().style.cursor = 'pointer'; // Changement du curseur au survol
          });
          map.on('mouseleave', 'projet_symbol', function() {
              map.getCanvas().style.cursor = ''; // Rétablissement du curseur par défaut quand la souris quitte
          });


          map.addSource('commune_geojson', {
              type: 'geojson',
              data: 'communes_communaute_cameroun.geojson',
              'generateId': true //This ensures that all features have unique IDs
          });
          map.addLayer({
              'id': 'commune_geojson',
              'type': 'fill',
              'source': 'commune_geojson',
              'layout': {},
              'paint': {
                  'fill-color': '#FFC90C',
                  'fill-opacity': 0.6
              },
              /*     minZoom: 10,*/
              // Utilisez la valeur sélectionnée pour créer un filtre
              filter: ['==', ['get', 'name'], '']
                  // Appliquez le filtre à la couche existante

          });


          map.addSource('world', {
              type: 'geojson',
              data: "ne_50m_admin_0_countries.geojson",
              'generateId': true //This ensures that all features have unique IDs
          });
          map.addLayer({
              'id': 'world',
              'type': 'fill',
              'source': 'world',
              'layout': {},
              'paint': {
                  'fill-color': "white",

                  'fill-opacity': [
                      "case", ["==", ["get", "ADMIN"], "Cameroon"], 0, // Cameroun (Gardez la couleur d'origine)
                      0.7 // Tous les autres pays en blanc
                  ],

              },

          });


          map.addSource('maine', {
              type: 'geojson',
              data: globalGeoJSON,
              'generateId': true //This ensures that all features have unique IDs
          });
          map.addLayer({
              'id': 'maine',
              'type': 'fill',
              'source': 'maine',
              'layout': {},
              'paint': {
                  'fill-color': [
                      'case', ['boolean', ['feature-state', 'hover'], false],
                      '#FFC90C',
                      '#ff6702'
                  ],

                  'fill-opacity': [
                      'case', ['boolean', ['feature-state', 'hover'], false],
                      0.8,
                      0.2
                  ]
              },
              'maxzoom': 9 // Masquez la couche lorsque le zoom est supérieur à 15
          });


          map.addSource('maineCentroid', {
              type: 'geojson',
              data: uniqueGeoJSON[0],
              'generateId': true //This ensures that all features have unique IDs
          });
          map.addLayer({
              'id': 'maineCentroid',
              'type': 'symbol',
              'source': 'maineCentroid',
              'layout': {
                  'text-field': [
                      'concat',
                      // Mettre le nom de la région en majuscules
                      ['get', 'name'],
                      '\n', // Ajouter un retour à la ligne
                      '———\n', // Trait horizontal comme séparateur
                      'nombre de projet(s) : ', // Parenthèse ouvrante
                      ['to-string', ['/', ['get', 'sum_names'], 1]], // Nombre total de features
                      '', // Parenthèse fermante
                  ],
                  'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                  'text-size': 11,
                  'text-letter-spacing': 0.05,
                  'text-transform': 'uppercase', // Mettre le texte en majuscules
              },
              'paint': {
                  'text-color': 'black',
                  /* 
                                          'text-halo-color': '#fff', // Couleur du halo (blanc)
                                          'text-halo-width': 1.5, // Largeur du halo
                   */
              },


          });



          map.on('click', function(e) {
              var infoPanel = document.getElementById('infoPanel');
              infoPanel.innerHTML = ''; // Effacer le contenu précédent
              // Récupérer les coordonnées du clic
              var coordinates = e.lngLat;

              // Utilisation la méthode queryRenderedFeatures pour obtenir les polygones cliqués
              var features = map.queryRenderedFeatures(e.point, {
                  layers: ['maine'] // 
              });

              // Vérifier s'il y a des polygones cliqués
              if (features.length > 0) {
                  name = features[0].properties.name
                  var propertyDiv3 = document.createElement('div');
                  propertyDiv3.classList.add('titleForInfo');
                  propertyDiv3.innerHTML = '<h1>Région : ' + name + '</h1><h2>Liste des projets</h2>';
                  infoPanel.appendChild(propertyDiv3);

                  for (let i = 0; i < features.length; i++) {
                      var properties = features[i].properties; // Obtenir les propriétés du premier polygone cliqué
                      // Afficher les propriétés dans le panneau HTML
                      displayProperties(properties);
                  }
              }

          });


          // When the user moves their mouse over the state-fill layer, we'll update the
          // feature state for the feature under the mouse.
          map.on('mousemove', 'maine', (e) => {
              if (e.features.length > 0) {
                  if (hoveredStateId) {
                      map.setFeatureState({
                          source: 'maine',
                          id: hoveredStateId
                      }, {
                          hover: false
                      });
                  }
                  hoveredStateId = e.features[0].id;

                  map.setFeatureState({
                      source: 'maine',
                      id: hoveredStateId
                  }, {
                      hover: true
                  });
              }
          });

          // When the mouse leaves the state-fill layer, update the feature state of the
          // previously hovered feature.
          map.on('mouseleave', 'maine', () => {
              if (hoveredStateId) {
                  map.setFeatureState({
                      source: 'maine',
                      id: hoveredStateId
                  }, {
                      hover: false
                  });
              }
              hoveredStateId = null;
          });


      });
  }



  // Gestion du bouton d'affichage du dropdown
  const toggleBtn = document.querySelector(".toggle-btn");
  const dropdownPanel = document.querySelector("#infoPanel");

  toggleBtn.addEventListener("click", function() {
      dropdownPanel.style.display = dropdownPanel.style.display === "none" ? "block" : "none";
      toggleBtn.classList.toggle("active");

  });

  // Récupérer le bouton reset
  var reset = document.getElementById("reset");
  // Ajout d'un gestionnaire d'événements pour le changement de sélection
  reset.addEventListener("click", function() {
      uniqueGeoJSON = []
      uniqueGeoJSON = countObject(globalGeoJSONCentroid)

      map.getSource('maineCentroid').setData(uniqueGeoJSON[0]);
      var infoPanel = document.getElementById('infoPanel');
      infoPanel.innerHTML = ''; // Effacez le contenu précédent

      selectTheme.value = ''; // Reset la liste déroulante du thème
      selectBeneficiaire.value = ''; // Reset la liste déroulante du thème
      selectProjet.value = ''; // REset la liste déroulante de l'institution
      selectBailleur.value = ''; // REset la liste déroulante de l'institution
      selectInstitution.value = ''; // reset la liste déroulante du thème

      map.jumpTo({ center: [12.6392, 5.9601], zoom: 2 })
          // Supprimer tous les filtres de la couche 'votre_couche'
      map.setFilter('maine', null);
      // Utilisez la valeur sélectionnée pour créer un filtre
      var filter = ['==', ['get', 'name'], '']
          // Appliquez le filtre à la couche existante
      map.setFilter('commune_geojson', filter);

      map.setPaintProperty('maine', 'fill-opacity', [
          'case', ['boolean', ['feature-state', 'hover'], false],
          0.9,
          0.2
      ]);

  })

  function countObject(globalGeoJSONCentroid) {

      // On crée un objet pour stocker les sommes par nom
      const sumsByName = {};

      //  On parcours les attribtus du GeoJSON
      globalGeoJSONCentroid.features.forEach(feature => {
          const name = feature.properties.name;

          // Si le nom existe dans l'objet sumsByName, on ajoute 1 à la somme existante, sinon, on le reset à 1
          sumsByName[name] = (sumsByName[name] || 0) + 1;
      });

      // Parcours des fonctionnalités globalGeoJSONCentroid pour ajouter l'attribut "sum_names"
      globalGeoJSONCentroid.features.forEach(feature => {
          const name = feature.properties.name;

          // Ajout l'attribut "sum_names" à chaque fonctionnalité en utilisant la somme correspondante de sumsByName
          feature.properties.sum_names = sumsByName[name];
      });

      // On crée un geojson unique des régions avec le nombre de projets par territoire
      uniqueGeoJSON.push({
          type: 'FeatureCollection',
          features: [...new Set(globalGeoJSONCentroid.features.map(JSON.stringify))].map(JSON.parse)
      });


      uniqueGeoJSONToBeModified = uniqueGeoJSON

      return uniqueGeoJSON;
  }


  function filteringMyData(value, field) {
      // Filtrer les objets ayant "l'institution" dans "Appui institutionnel"
      const filteredData = data.filter(obj => {
          var appuiInstitutionnel = obj[field];
          if (appuiInstitutionnel !== null) {
              appuiInstitutionnel = appuiInstitutionnel.toString()
          }
          return appuiInstitutionnel && typeof appuiInstitutionnel === "string" && appuiInstitutionnel.includes(value);
      });

      // Initialiser un objet pour stocker les résultats
      const countObj = {};



      // Parcourir les objets filtrés et compter les occurrences
      filteredData.forEach(obj => {
          departments.forEach(department => {

              if (obj[department] != null) {

                  // Si la propriété n'est pas null, incrémenter le compteur ou initialiser à 1
                  countObj[department] = (countObj[department] || 0) + 1;
              }
          });
      });

      // Filtrer les fonctionnalités GeoJSON en fonction de votre JSON
      const filteredFeatures = uniqueGeoJSONToBeModified[0].features.filter(feature => {
          const featureName = feature.properties.name;
          feature.properties.sum_names = countObj[featureName];
          return countObj.hasOwnProperty(featureName);
      });

      // Créer un nouvel objet GeoJSON avec les fonctionnalités filtrées
      const filteredGeoJson = {
          "type": "FeatureCollection",
          "features": filteredFeatures
      };

      return filteredGeoJson
  }



  function filteringMyData2(value, field) {
      dataProjet = []

      // Filtrer les objets ayant "l'institution" dans "Appui institutionnel"
      const filteredData = data.filter(obj => {
          var appuiInstitutionnel = obj[field];
          if (appuiInstitutionnel !== null) {
              appuiInstitutionnel = appuiInstitutionnel.toString()
          }
          return appuiInstitutionnel && typeof appuiInstitutionnel === "string" && appuiInstitutionnel.includes(value);
      });
      dataProjet = filteredData

      return dataProjet
  }



  function displayProperties(properties) {


      var attributsANePASAfficher = [
          "name", "id", "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest",
          "Adamaoua_geom", "Centre_geom", "Est_geom", "Extrême-Nord_geom", "Littoral_geom", "Nord_geom", "Nord-Ouest_geom", "Ouest_geom", "Sud_geom", "Sud-Ouest_geom",
          "Renforcement des capacités/Compétences", "Equipements de bureaux et matériels", "Appui institutionnel/gouvernance", "Environnement",
          "Assainissement solide/liquide et drainage", "Travaux d’Infrastructures urbaines structurantes", "Travaux d’Infrastructures urbaines légères",
          "Planification (urbaine, régional, transports etc.)", "Etudes urbaines (Transports - mobilité - déchets - eau - assainissement)", "Concertation (à tous les niveaux)",
          "Outils numérique pour la gestion du territoire"
      ];

      var propertyDiv4 = document.createElement('div');
      // Ajoutez une classe à l'élément
      propertyDiv4.classList.add('property');
      for (var key in properties) {
          // On peuple la div avec les textes
          var value = properties[key];
          if (!attributsANePASAfficher.includes(key)) { // Utilisation de la négation (!) pour vérifier si la clé n'est pas dans l'array
              var propertyDiv = document.createElement('div');
              // Ajoutez une classe à l'élément
              propertyDiv.innerHTML = '<b >' + key + ':</b> ' + value;
              propertyDiv4.appendChild(propertyDiv);
          }
      }
      infoPanel.appendChild(propertyDiv4);
      var propertyDiv2 = document.createElement('div');
      propertyDiv2.innerHTML = '<hr>';
      infoPanel.appendChild(propertyDiv2);

  }

  function resetCommune() {
      map.jumpTo({ center: [12.6392, 5.9601], zoom: 2 })
          // Utilisez la valeur sélectionnée pour créer un filtre
      var filter = ['==', ['get', 'name'], '']
          // Appliquez le filtre à la couche existante
      map.setFilter('commune_geojson', filter);
  }

  // Fonction pour afficher un popup lorsque l'utilisateur clique sur une caractéristique
  function showSymbolPopup(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.Name; // Remplacez 'description' par le nom de votre propriété contenant les informations du popup

      // Créez un popup personnalisé
      new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
  }

  // Fonction pour afficher un popup lorsque l'utilisateur clique sur une caractéristique
  function showPopup(e) {
    console.log('lets show the pop up');
      var coordinates = e.lngLat;
      var description = e.features[0].properties.Name; // Remplacez 'description' par le nom de votre propriété contenant les informations du popup

      // Créez un popup personnalisé
      new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
  }