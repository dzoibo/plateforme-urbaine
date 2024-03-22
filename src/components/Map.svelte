<script>
  // @ts-nocheck
  import {
    dataStore,
    rangeValue,
    rangeValueAccord,
    storeIndicateur,
    heightNavBar
  } from '../../shared/store';
  import {
    findMinMax,
    formattedValue,
    rechercheMulticriteres,
    fetchIdCommunesFromCommunesID,
    calculateTotalProjetByRegion,
    getOverallBbox
  } from '../../shared/utilitaire';
  import {
    Drawer,
    Card,
    Tooltip,
    Tabs,
    TabItem,
    Listgroup
  } from 'flowbite-svelte';
  import { sineIn } from 'svelte/easing';
  import {
    MapLibre,
    GeolocateControl,
    NavigationControl,
    ScaleControl,
    FullscreenControl,
    Control,
    ControlGroup,
    ControlButton,
    VectorTileSource,
    FillLayer,
    LineLayer,
    hoverStateFilter,
    JoinedData,
    GeoJSON,
    MarkerLayer,
    SymbolLayer,
    Popup
  } from 'svelte-maplibre';
  import maplibregl from 'maplibre-gl';
  import { onMount, onDestroy } from 'svelte';

  let width;
  let dataForMap = [];
  let communeData = [];
  let projetData= [];
  let keyCommuneID_Commune = [];
  let projetPerRegion=[];
  let MinMax = {};
  let geojsonRegionCentroid;
  let geojsonMunicipaliteCentroid;
  let unsubscribe;
  let nom_commune;
  let clickedLayerInfo = null; // Variable to store information about the clicked layer
  let anneeFinMandat = [];
  let currentZoom = 0;
  let valueSliderICSP = 0; // Initialisez avec une valeur par défaut
  let valueSliderAccord = []; // Initialisez avec une valeur par défaut
  let storeIndicateurForMap = [];
  let allProject = [];
  let scale;
  let getbbox = [];
  let heightNavBarForSideBar;
  let sidebarId;
  let showCom = false;
  let showReg = true;
  let toolTipStyle="bg-white text-black font-normal z-10";
  let heightSideBar;
  // START EXTRACT
  let map = maplibregl.Map | undefined;
  let loaded = false;

  let center = [12, 6];
  let zoom = 5;

  // bbox du Cameroun
  let bbox = [
    [-6.81, -6.492371],
    [31.841812, 18.227069]
  ];
  let previousZoom=0;
  let layer='reg';
  let lastLayerUpdateTime='0';

  let geojsonProjetLineCentroid;
  let geojsonProjetPolygonCentroid;
  let geojsonProjetPointCentroid;

  let paintProperties = {
    'fill-opacity': hoverStateFilter(0.7, 0.4),
    'fill-color': [
      'case',
      ['!=', ['feature-state', 'value'], null],
      [
        'interpolate',
        ['linear'],
        ['feature-state', 'value'],
        MinMax.min,
        '#FFC90C',
        MinMax.max,
        '#ff6702'
      ],
      'rgba(255, 255, 255, 0)'
    ]
  };
  let hiddenBackdropFalse = true;

  let transitionParamsBottom = {
    y: 320,
    duration: 200,
    easing: sineIn
  };

  let transitionParamsRight = {
    x: 320,
    duration: 200,
    easing: sineIn
  };

  const attributsToHide = [
        "name", "id", "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest",
        "Adamaoua_geom", "Centre_geom", "Est_geom", "Extrême-Nord_geom", "Littoral_geom", "Nord_geom", "Nord-Ouest_geom", "Ouest_geom", "Sud_geom", "Sud-Ouest_geom",
        "Renforcement des capacités/Compétences", "Equipements de bureaux et matériels", "Appui institutionnel/gouvernance", "Environnement",
        "Assainissement solide/liquide et drainage", "Travaux d’Infrastructures urbaines structurantes", "Travaux d’Infrastructures urbaines légères",
        "Planification (urbaine, régional, transports etc.)", "Etudes urbaines (Transports - mobilité - déchets - eau - assainissement)", "Concertation (à tous les niveaux)",
        "Outils numérique pour la gestion du territoire", "id_REGION","id_COMMUNE","Nom","Acronyme","Bailleur(s)"
    ];

  // On mount
  onMount(async () => {
    const response = await fetch('./data/limite_region_centroide.geojson');
    geojsonRegionCentroid = await response.json();


    const responseMunicipalite = await fetch('./data/limite_municipalite_centroide.geojson');
    geojsonMunicipaliteCentroid = await responseMunicipalite.json();

    const responseProjetLine= await fetch('./data/projet/projet_line.geojson');
    geojsonProjetLineCentroid = await responseProjetLine.json();

    const responseProjetPolygon= await fetch('./data/projet/projet_polygon.geojson');
    geojsonProjetPolygonCentroid = await responseProjetPolygon.json();

    const responseProjetPoint= await fetch('./data/projet/projet_point.geojson');
    geojsonProjetPointCentroid = await responseProjetPoint.json()



    unsubscribe = dataStore.subscribe((store) => {
      communeData = store.communeData;
      keyCommuneID_Commune = store.keyCommuneID_Commune;
      projetData = store.projetData;
      dataForMap= projetData;

    });

    // Récupération de la data provenant de layout.svete
    rangeValue.subscribe(($rangeValue) => {
      valueSliderICSP = $rangeValue;
    });

   

    // Récupération de la data provenant de layout.svete
    storeIndicateur.subscribe(($storeIndicateur) => {
      storeIndicateurForMap = $storeIndicateur;
    });

    // Récupération de la data provenant de layout.svete
    rangeValueAccord.subscribe(($rangeValueAccord) => {
      valueSliderAccord = $rangeValueAccord;
    });

    // Récupération de la data provenant de layout.svete
    heightNavBar.subscribe(($heightNavBar) => {
      heightNavBarForSideBar = $heightNavBar;
    });

  });

  // Sélectionnez l'élément du drawer par son identifiant
  sidebarId = document.getElementById('sidebar6');

  // Reactivité
  $: {
    
    let selectedCommune = [];
    if (showCom) {
      scale = 'id_COMMUNE';
      toggleLayer('com');
    } else {
      scale = 'id_REGION';
      toggleLayer('reg');
    }

    if (sidebarId) {
      heightSideBar = sidebarId.offsetHeight;
    }
    if (dataForMap.length > 0 ) {
      if (storeIndicateurForMap.some((item) => item.indicateur === 'beneficiaire')  ) {
          if (map && loaded) {
            selectedCommune = storeIndicateurForMap.find(
                (item) => item.indicateur === 'beneficiaire'
              ).data;

            let getID = fetchIdCommunesFromCommunesID(
              selectedCommune,
              keyCommuneID_Commune,
              'id_COMMUNE',
              'key'
            );
            updateGetBox(getID);
          }
      } else {
        // Cas où aucune condition n'est satisfaite, donc selectedCommune est un tableau vide
        selectedCommune = [];
      }
      
      if (getbbox.length > 0) {
        scale = 'id_COMMUNE';
        toggleLayer('com');
      }
      projetPerRegion=calculateTotalProjetByRegion(projetData,scale,storeIndicateurForMap);
      MinMax = findMinMax(projetPerRegion, 'value');


      /* statisticsPerRegion = calculateTotalByRegion(
        dataForMap,
        valueSliderICSP[0],
        valueSliderICSP[1],
        scale,
        storeIndicateurForMap.icsp
      ); */
      paintProperties = getUpdatedPaintProperties(MinMax);

    }
  }

  function handleLayerClick(e) {
    clickedLayerInfo=e
    nom_commune = e.detail.features[0].properties['ref:COG'];
      allProject = rechercheMulticriteres(
        dataForMap,
        nom_commune,
        scale,
        storeIndicateurForMap
      );

      hiddenBackdropFalse = false;
  }

  // Dans votre composant Svelte
  function handleLayerClickIfNeeded(e) {
    if (showCom) {
      handleLayerClick(e);
    }
  }

  function getUpdatedPaintProperties(MinMax) {
    return {
      'fill-opacity': hoverStateFilter(0.6, 0.8),
      'fill-color': [
        'case',
        ['!=', ['feature-state', 'value'], null],
        [
          'interpolate',
          ['linear'],
          ['feature-state', 'value'],
          MinMax.min,
          '#FFC90C',
          MinMax.max,
          '#ff6702'
        ],
        'rgba(255, 255, 255, 0)'
      ]
    };
  }

  function updateGetBox(getID){
    getbbox = fetchIdCommunesFromCommunesID(getID, communeData, 'bbox', 'id_COMMUNE');
    const overallBbox = getOverallBbox(getbbox);
    if (getbbox.length > 0) {
      map.fitBounds(overallBbox, {
        padding: 20, // Espace de marge autour de la BoundingBox
        maxZoom: 15 // Niveau de zoom maximal
      });
    } else {
      map.fitBounds(bbox, {
        duration: 500,
        center: center,
        zoom: zoom // Niveau de zoom maximal
      });
    }
  }
  /**
   * when a commune is selected, we need to remove zoom before being able to toggle the layer
  */
  function clearFilterBeforeToggleZoom(layer){
    if(getbbox!==[]){
      if(theme==='icsp'){
        storeIcspCommune.set(false);
      }else if (theme==='accord'){
        storeAccordsBeneficiaire.set(false);
      }
      updateGetBox('');
      setTimeout(() => {
        toggleLayer(layer);
      }, 1000);
    }else{
       toggleLayer(layer);
    }
  } 

   //automalticaly change the scale
  function toggleLayerOnZoom(){
    const currentTime = Date.now();
    let tempLayer=layer;
    if(currentZoom>previousZoom){
      if(currentZoom>=5.75 && !showCom){
        tempLayer='com';
      }
    }else{
      if(currentZoom<5.75 && !showReg){
        tempLayer='reg';
      }
    }
    if(currentTime-lastLayerUpdateTime<1000 && layer===tempLayer){
      return;
    }else{
      layer=tempLayer;
      lastLayerUpdateTime=Date.now();
      toggleLayer(layer);
      previousZoom=currentZoom;
    }
    
  }
  function toggleLayer(layer) {
    showReg = layer === 'reg' ? true : false;
    showCom = layer === 'com' ? true : false;
    // Supprimez la classe "active" de tous les boutons
    const buttons = document.querySelectorAll('.maplibregl-ctrl-icon');
    buttons.forEach((button) => {
      button.classList.remove('active');
    });

    // Ajoutez la classe "active" uniquement au bouton cliqué
    const button = document.querySelector(`#${layer}`);
    if (button) {
      button.classList.add('active');
    }

    // Pour forcer l'actualisation des Labels REG et DEP
    if (map) {
      if (!getOverallBbox) {
        map.setZoom(map.getZoom() + 0.0000001);
      }
    }
  }

  // On se désabonne pour éviter les fuites de data
  onDestroy(() => {
    unsubscribe;
  });
</script>

<svelte:window bind:innerWidth={width} />
<Drawer
  placement="right"
  style="top:{heightNavBarForSideBar}px"
  class="lg:w-2/5 md:w-1/3 sm:w-1/2 w-auto !p-0"
  transitionType="fly"
  backdrop={true}
  transitionParams={transitionParamsRight}
  bind:hidden={hiddenBackdropFalse}
  id="sidebar6"
>
  <div class="bg-[#00862b14] div-wrapper" style="height:{heightSideBar}px !important">
    <Tabs style="full" class="space-x-0 w-full flex !flex-nowrap bg-white">
      <TabItem open class="w-full " id="projets">
        <div slot="title" class="titleForInfo">
          {#if showReg}
            <h1 class="mt-2">Région : <span class="uppercase">{clickedLayerInfo.detail.features[0].properties.name}</span></h1>
          {:else}
            <h1>Commune: <span class="uppercase">{clickedLayerInfo.detail.features[0].properties.name}</span></h1>
          {/if}  
          <h2>Liste des projets</h2>
        </div>

        <h2 class="mb-6 -mt-4 text-center text-black-900 text-xl poppins-medium">
          <span class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">
            Nombre de projets : {allProject.length}</span
          >
        </h2>
        <div class="p-4 w-full justify-center overflow-x-auto">
          <ul class=" px-8 w-full flex flex-col items-center">
            {#each allProject  as projet}
              <Card class="leading-[20px] mb-4 !max-w-md w-full">
                <Listgroup class="border-0 dark:!bg-transparent ">
                  <div class="flex items-center space-x-1 rtl:space-x-reverse">
                    <div class="flex-1 min-w-0">

                      <div>
                        <span class="text-sm font-bold text-gray-900 dark:text-white">
                          Acronyme :
                        </span>
                        <span class="text-[13px] font-medium">{projet['Acronyme']}</span>
                      </div>

                      <div>
                        <span class="text-sm font-bold text-gray-900 dark:text-white">
                          Nom :
                        </span>
                        <span class="text-[13px] font-medium">{projet['Nom']}</span>
                      </div>

                      <div>
                        <span class="text-sm font-bold text-gray-900 dark:text-white">
                          Bailleur(s) :
                        </span>
                        <span class="text-[13px] font-medium">{projet['Bailleur(s)']}</span>
                      </div>

                      {#each Object.entries(projet) as [key, value]}
                        {#if !attributsToHide.includes(key) && value !==null }
                          <div>
                            <span class="text-sm font-bold text-gray-900 dark:text-white">
                              {key} :
                            </span>
                            <span class="text-[13px] font-medium">{value}</span>
                          </div>
                        {/if}
                      {/each}

                    </div>
                  </div>
                </Listgroup>
              </Card>
            {/each}
          </ul>
        </div>
      </TabItem>
      
    </Tabs>
  </div>
</Drawer>

<!-- Use the reactive dataArr to update the JoinedData component -->
{#if dataForMap.length > 0 }
  <MapLibre
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    {center}
    {zoom}
    maxBounds={bbox}
    attributionControl={false}
    on:zoomend={({ detail: { map } }) => (currentZoom = map.getZoom())}
    bind:map
    bind:loaded
    on:zoom={()=>toggleLayerOnZoom()}
    class="w-screen"
  >
    <NavigationControl position="top-right" />
    <GeolocateControl position="top-right" fitBoundsOptions={{ maxZoom: 25 }} />
    <FullscreenControl position="top-right" />
    <ScaleControl />

    <Control position="top-left" class="flex flex-col gap-y-2">
      <ControlGroup >

        <Tooltip triggeredBy="#reg-tooltip" class={toolTipStyle} placement ='right' >
          Échelle régionale
        </Tooltip>
        
        <div id="reg-tooltip">
          <ControlButton id="reg" class={showReg ? 'bg-gray-200' : ''} on:click={() => clearFilterBeforeToggleZoom('reg')}>REG</ControlButton>
        </div>

        <Tooltip triggeredBy="#com-tooltip" class={toolTipStyle} placement ='right' >
          Échelle communale
        </Tooltip>
        <div id="com-tooltip">
          <ControlButton id="com" class={showCom ? 'bg-gray-200 rounded-bl rounded-br' : ''} on:click={() => toggleLayer('com')}>COM</ControlButton>
        </div>
      </ControlGroup>
    </Control>

    <GeoJSON data="/data/mask.geojson">
      <FillLayer paint={{ 'fill-color': 'black', 'fill-opacity': 0.6 }}/>
    </GeoJSON>

    {#if showReg}
      <VectorTileSource url="pmtiles://data/regions.pmtiles" id="regions" promoteId="ref:COG">
        <FillLayer
          paint={paintProperties}
          manageHoverState
          hoverCursor="pointer"
          sourceLayer="regions"
          on:click={handleLayerClick}
        />
        <LineLayer
          paint={{
            'line-opacity': 1,
            'line-width': 1,
            'line-color': 'black'
          }}
          sourceLayer="regions"
        />

        <JoinedData data={projetPerRegion} idCol="id_REGION" sourceLayer="regions" />
      </VectorTileSource>

      <GeoJSON data={geojsonRegionCentroid}>
        <JoinedData data={projetPerRegion} idCol="id_REGION" />
        <MarkerLayer let:feature>
          {#each projetPerRegion as { id_REGION, value }}
            {#if feature.properties['ref:COG'] === id_REGION}
              <div class="bg-gray-100 text-xs bg-opacity-50 bg-trans rounded-full p-2 shadow align flex flex-col items-center">
                <div class="poppins-medium">{feature.properties.name}</div>
                ---
                <div class="poppins-light">NOMBRE DE PROJET(S): {formattedValue(value)}</div>
              </div>
            {/if}
          {/each}
        </MarkerLayer>
      </GeoJSON>
    {/if}
    

    <VectorTileSource
      url="pmtiles://data/municipalites.pmtiles"
      id="municipalites"
      promoteId="ref:COG"
    >
      <JoinedData data={projetPerRegion} idCol="id_COMMUNE" sourceLayer="municipalites" />

      <SymbolLayer
        paint={{
          'text-color': '#333',
          'text-opacity': 1,
          'text-halo-color': '#eee',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.5
        }}
        layout={{
          'text-allow-overlap': false,
          'text-field': ['get', 'name'],
          'text-halo-color': '#eee',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.5,
          'text-size': 400
        }}
        sourceLayer="municipalites"
      />
      <FillLayer
        paint={paintProperties}
        manageHoverState
        hoverCursor="pointer"
        sourceLayer="municipalites"
        on:click={handleLayerClickIfNeeded}
      ></FillLayer>

      <LineLayer
        paint={{
          'line-opacity': 0.7,

          // Autres propriétés de style...
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            0.1, // Valeur de largeur de ligne lorsque le zoom est à 0
            13,
            1, // Valeur de largeur de ligne lorsque le zoom est à 10
            20,
            2 // Valeur de largeur de ligne lorsque le zoom est à 15
          ],
          'line-color': 'gray'
        }}
        sourceLayer="municipalites"
      />
    </VectorTileSource>

    {#if showCom}
      <GeoJSON data={geojsonMunicipaliteCentroid} promoteId="ref:COG">
        <JoinedData data={projetPerRegion} idCol="id_COMMUNE" />
        <SymbolLayer
          paint={{
            'text-color': '#333',
            'text-opacity': 1,
            'text-halo-color': '#eee',
            'text-halo-width': 0.5,
            'text-halo-blur': 0.5
          }}
          layout={{
            'text-allow-overlap': false,
            'text-field': ['get', 'name'],
            'text-size': {
              stops: [
                [3, 3], // À un niveau de zoom de 3, la taille du texte est de 16
                [20, 54] // À un niveau de zoom de 5, la taille du texte est de 24
              ]
            }
          }}
        ></SymbolLayer>
      </GeoJSON>
    {/if}
  </MapLibre>
{/if}

<!-- 

sudo tippecanoe -o "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/departements.mbtiles" -l departements -z14 -Z0 "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/limites_departements.geojson" --force --no-line-simplification 
 
sudo tippecanoe -o "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/regions.mbtiles" -l regions -z13 -Z0 "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/limite_region.geojson" -f --no-line-simplification 
 
sudo tippecanoe -o "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/municipalites.mbtiles" -l municipalites -z14 -Z0 "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/limite_COMMUNE.geojson" -f --no-line-simplification 
 
"Plateforme urbaine Cameroun/data/pmtiles 2" convert "Plateforme urbaine Cameroun/data/regions.mbtiles"  "Plateforme urbaine Cameroun/data/region.pmtiles"                  
"Plateforme urbaine Cameroun/data/pmtiles 2" convert "Plateforme urbaine Cameroun/data/departements.mbtiles"  "Plateforme urbaine Cameroun/data/departements.pmtiles"                  
"Plateforme urbaine Cameroun/data/pmtiles 2" convert "Plateforme urbaine Cameroun/data/municipalites.mbtiles"  "Plateforme urbaine Cameroun/data/municipalites.pmtiles"                  
-->
