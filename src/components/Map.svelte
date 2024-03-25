<script>
  // @ts-nocheck
  import {
    dataStore,
    rangeValue,
    storeIndicateur,
    heightNavBar,
    storeWrapper

  } from '../../shared/store';
  import {
    findMinMax,
    formattedValue,
    findAllObjectsByAttribute,
    rechercheMulticriteresPourProjet,
    fetchIdCommunesFromCommunesID,
    calculateTotalProjetByRegion,
    getSumOf,
    uniqueValues,
    calculateTotalByRegion,
    sumISPValues,
    transformDataForBarChart,
    optionForBarChart,
    optionForLineChart,
    getSumPerYear,
    getSumSuperficy,
    uniqueValuesInArrayOfObject,
    rechercheMulticriteresPourFEICOM,
    sortByDescendingOrder,
    sortByAscendingOrder,
    zoomToFeatureByValue,
    getOverallBbox
  } from '../../shared/utilitaire';
  import {
    Drawer,
    Card,
    Tooltip,
    Tabs,
    TabItem,
    Listgroup,
    Chart,
    Badge,
  } from 'flowbite-svelte';
  import { sineIn } from 'svelte/easing';
  import {
    InfoCircleSolid,
    ArrowRightOutline,
    BadgeCheckOutline,
    CashOutline,
    ChartOutline,
    LandmarkOutline,
    GridSolid,
    InfoCircleOutline,
    MailBoxOutline,
    UsersGroupOutline,
    UsersOutline,
    UserOutline,
    NewspapperOutline,
    LinkOutline,
    EnvelopeOutline,
    MapPinAltSolid
  } from 'flowbite-svelte-icons';
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
  let regionData =[];
  let mandatData =[];
  let icspData = [];
  let keyCommuneID_Commune = [];
  let superficyPerRegion =[];
  let projetPerRegion=[];
  let MinMax = {};
  let geojsonRegionCentroid;
  let geojsonMunicipaliteCentroid;
  let unsubscribe;
  let nom_commune;
  let detailsMandatCommune = [];
  let currentGeneralInfo;
  let anneeDebutMandat = [];
  let anneeFinMandat = [];

  let clickedLayerInfo = null; // Variable to store information about the clicked layer
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
  let generalInfoItemStyle="flex items-center gap-1 mb-2 text-sm font-medium text-gray-900 dark:text-white";
  let generalInfoValueStyle="ml-1 text-xs text-gray-500 truncate dark:text-gray-400";
  let displayWrapper=true;
  
  let dataForBarChart = {};
  let dataForLineChart = {};
  let optionsForChart = {};
  let optionsForChartLine = {};

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
        "name", "id","id_THEME", "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest",
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
      icspData = store.icspData;
      keyCommuneID_Commune = store.keyCommuneID_Commune;
      dataForMap = store.projetData;
      regionData = store.regionData;
      mandatData = store.mandatData;
    });

    // Récupération de la data provenant de layout.svete
    rangeValue.subscribe(($rangeValue) => {
      valueSliderICSP = $rangeValue;
    });

   

    // Récupération de la data provenant de layout.svete
    storeIndicateur.subscribe(($storeIndicateur) => {
      storeIndicateurForMap = $storeIndicateur;
    });

    storeWrapper.subscribe(($wrapper) => {
      displayWrapper = $wrapper;
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
            updateGetBox(selectedCommune);
          }
      } else {
        // Cas où aucune condition n'est satisfaite, donc selectedCommune est un tableau vide
        selectedCommune = [];
      }
      
      if (getbbox.length > 0) {
        scale = 'id_COMMUNE';
        toggleLayer('com');
      }
      projetPerRegion=calculateTotalProjetByRegion(dataForMap,scale,storeIndicateurForMap);
      MinMax = findMinMax(projetPerRegion, 'value');

      superficyPerRegion = getSumSuperficy(
        communeData,
        scale
      );
      paintProperties = getUpdatedPaintProperties(MinMax);

    }
  }

  function handleLayerClick(e) {
    clickedLayerInfo=e
    if (showCom) {
      nom_commune = e.detail.features[0].properties['ref:COG'];
      detailsMandatCommune = findAllObjectsByAttribute(mandatData, 'id_COMMUNE', nom_commune);
      anneeDebutMandat = sortByDescendingOrder(detailsMandatCommune, 'DEBUT MANDAT');
      anneeFinMandat = sortByDescendingOrder(detailsMandatCommune, 'FIN MANDAT');
      const indexCommune = communeData.findIndex((commune)=>commune.id_COMMUNE === e.detail.features[0].properties['ref:COG']) 
      currentGeneralInfo=communeData[indexCommune];
    }else{
      const indexRegion = regionData.findIndex((region)=>region.id_REGION === e.detail.features[0].properties['ref:COG']);
      currentGeneralInfo=regionData[indexRegion];
      const indexSuperficy = superficyPerRegion.findIndex((region)=>region.id_REGION === e.detail.features[0].properties['ref:COG']);
      currentGeneralInfo={
        ...currentGeneralInfo,
        superficy: superficyPerRegion[indexSuperficy].value
      }
    }
    // Set the variable with information about the clicked layer
    // Set hiddenBackdropFalse to false to show the Drawer
    const region = e.detail.features[0].properties['ref:COG'];
    const label_reg = e.detail.features[0].properties.name;
    dataForBarChart.data = transformDataForBarChart(
      icspData,
      region,
      valueSliderICSP[0],
      valueSliderICSP[1],
      scale
    );
    dataForLineChart.data = sumISPValues(icspData, region, scale);
    dataForBarChart.year = valueSliderICSP[0] + ' / ' + valueSliderICSP[1];
    dataForLineChart.geo = label_reg;
    dataForBarChart.geo = label_reg;
    // Calcul de la somme des valeurs "y"
    dataForBarChart.sum = dataForBarChart.data.reduce(
      (total, currentItem) => total + currentItem.y,
      0
    );
    nom_commune = e.detail.features[0].properties['ref:COG'];
    allProject = rechercheMulticriteresPourProjet(
      dataForMap,
      nom_commune,
      scale,
      storeIndicateurForMap
    );
    map.style.zIndex =20;
    hiddenBackdropFalse=false;
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

  //changer l'affichage ISP par ICSP
  function changeItemToDisplay(data){
    let formalizedData=[];
    for (let i=0;i<data.length; i++){
      data[i].x='ICSP'+(1+i);
      formalizedData.push(data[i]);
    }
    return formalizedData
  }

  function displayItemValue(value) {
    if (value == null) {
      return `<span class="text-[15px] italic">Non disponible</span>`;
    } else {
      return `<span class="text-[15px] font-medium">${value}</span>`;
    }
  }

  // On se désabonne pour éviter les fuites de data
  onDestroy(() => {
    unsubscribe;
  });
</script>

<svelte:window bind:innerWidth={width} />
{#if displayWrapper===true}
  <div 
    on:click={()=>{storeWrapper.update(() => {
      return false
    });}}
    class=" hidden z-[10] justify-center items-center hover:bg-gray-200 rounded-md cursor-pointer bg-white absolute w-[31px] h-[31px] left-2 top-[75px]">
    <svg xmlns="http://www.w3.org/2000/svg" height="22" fill="gray" viewBox="0 -960 960 960" width="22">
      <path d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z"/>
    </svg>
  </div>
{/if}

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

    <div
      on:click={()=>{hiddenBackdropFalse=true}}
      class="flex z-50 justify-center items-center hover:bg-gray-200 rounded-md absolute w-[31px] h-[31px] bg-white left-1 border border-gray-200 top-6 sm:hidden">
      <svg xmlns="http://www.w3.org/2000/svg" height="22" fill="gray" viewBox="0 -960 960 960" width="22">
        <path d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z"/>
      </svg>
    </div>

    <div class="w-full p-4 text-center">
      <h2 class="my-2 text-center text-black poppins text-3xl font-extrabold w-full">
              {#if showCom }
                Commune: {clickedLayerInfo.detail.features[0].properties.name}
              {:else}
                Région: {currentGeneralInfo["nom_REGION"]}
              {/if}
            </h2>  
    </div>
    <Tabs style="full" class="space-x-0 w-full flex !flex-nowrap bg-white">
      
      {#if allProject.length>0}
        <TabItem open class="card-tab-item w-full " id="projets">
          <div slot="title" class="flex w-full justify-center text-lg items-center gap-2">
            <GridSolid size="md" />
            Liste des projets
            <h5
              id="historique"
              class="inline-flex items-center mb-4 text-sm font-light text-gray-400 dark:text-gray-200"
            >
            </h5>
          </div>

          <div class="my-2 pt-4 flex w-full justify-center text-lg items-center gap-2">
            Nombre de projets
            <h5
              id="stat"
              class="inline-flex items-center mb-4 text-sm font-light text-gray-400 dark:text-gray-200"
            >
            </h5>
          </div>
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
      {/if}
      
      
      <TabItem class="card-tab-item w-full" >
        <div slot="title" class="flex w-full justify-center text-lg items-center gap-2">
          <LandmarkOutline size="md" />
          Informations sur le territoire
          <h5
            id="historique"
            class="inline-flex items-center mb-4 text-sm font-light text-gray-400 dark:text-gray-200"
          >
          </h5>
        </div>
        <div id="detailMandatForAMunicipality" class="p-3 list-none flex flex-col items-center h-full" >
          <div class="my-2 flex w-full justify-center text-lg items-center gap-2">
            <InfoCircleOutline size="sm" />
            Informations générales
            <h5
              id="stat"
              class="inline-flex items-center mb-4 text-sm font-light text-gray-400 dark:text-gray-200"
            >
            </h5>
          </div>
          
          <Card padding="md" class="leading-[24px] mb-4 mt-3 !max-w-md w-full">
            
            {#if showCom && anneeFinMandat}
              <dl
                class="max-w-screen-xl gap-8 p-2 mx-auto text-gray-900  dark:text-white sm:p-8"
              >
                {#if anneeFinMandat[0].SUPERFICIE}
                  <div class="flex items-center justify-center">
                    <dt class="ml-1 text-3xl font-bold w-full poppins-medium text-center">
                      {formattedValue(anneeFinMandat[0].SUPERFICIE) || ''}
                    </dt>
                    <dd class="text-gray-500 ml-1 dark:text-gray-400">km²</dd>
                  </div>
                {/if}
                {#if anneeFinMandat[0].POPULATION}
                  <div class="flex items-center justify-center">
                    <dt class="ml-1 text-3xl font-bold w-full text-center">
                      {formattedValue(anneeFinMandat[0].POPULATION) || ''}
                    </dt>
                    <dd class="text-gray-500 ml-1 dark:text-gray-400">Habitants</dd>
                  </div>
                {/if}
              </dl>

              <Card class="mb-2 !px-1 !max-w-xl  w-full">
                <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
                  {#each anneeFinMandat as detailMandat}
                    {#if detailMandat['FIN MANDAT'] === anneeFinMandat[0]['FIN MANDAT']}
                      <li class=" py-1 sm:py-2">
                        <div class="flex items-start">
                          <div class="leading-3 flex-1 min-w-0 ms-4 mr-4">
                            <p class={generalInfoItemStyle} >
                              <UserOutline class="text-gray-700" size="sm" />
                              Maire: 
                              <span class={generalInfoValueStyle} >{detailMandat["CONSEILLER"]}</span>
                            </p>
                            <p class={generalInfoItemStyle}>  
                              <UsersOutline class="text-gray-700" size="sm" />
                              Adjoints Au maire: 
                              <span class={generalInfoValueStyle} >
                                {detailMandat["Nombre des adjoints aux Maires"]} 
                              </span>
                            </p>
                            <p class={generalInfoItemStyle}>
                              <UsersGroupOutline class="text-gray-700" size="sm" />
                              Conseillers Municipaux: 
                              <span class={generalInfoValueStyle} >
                                {detailMandat["Nombre de conseillers municipaux"]} 
                              </span>
                            </p>
                            <p class={generalInfoItemStyle} >
                              <MailBoxOutline class="text-gray-700"  size="sm" />
                              BP :  
                              <span class={generalInfoValueStyle} >{currentGeneralInfo["Boîte postale de la Mairie"]}</span> 
                            </p>

                            {#if currentGeneralInfo["Email mairie"]}
                              <p class={generalInfoItemStyle} >
                                <EnvelopeOutline class="text-gray-700"  size="sm" />
                                Adresse email :  
                                <span class={generalInfoValueStyle} >
                                  <a href="mailto:{currentGeneralInfo["Email mairie"]}">{currentGeneralInfo["Email mairie"]}</a>
                                </span> 
                              </p>
                            {/if}

                            {#if currentGeneralInfo["Longitude"] &&  currentGeneralInfo["Latitude"] }
                              <p class={generalInfoItemStyle} >
                                <MapPinAltSolid class="text-gray-700"  size="sm" />
                                Coordonnées(long, lat) :  
                                <span class={generalInfoValueStyle}> {currentGeneralInfo["Longitude"]} ;  {currentGeneralInfo["Latitude"]}</span> 
                              </p>
                            {/if}

                            {#if currentGeneralInfo["Site Web de la Mairie"] !==null}
                              <p class={generalInfoItemStyle} >
                                <LinkOutline size="sm" />
                                Site web:
                                <span class={"cursor-pointer "+generalInfoValueStyle} on:click={()=>{
                                  window.open("https://"+currentGeneralInfo["Site Web de la Mairie"],"_blank");
                                }} > {currentGeneralInfo["Site Web de la Mairie"]}</span>
                              </p>
                            {/if}
                            <p class={generalInfoItemStyle}>
                              <NewspapperOutline class="text-gray-700"  size="sm" />
                              Date de création: 
                              <span class={generalInfoValueStyle} >{currentGeneralInfo["Annee de creation"]}</span> 
                            </p>

                          </div>
                          
                          <div
                            class="text-sm font-semibold text-gray-900 dark:text-white"
                          >
                            <Badge color="green" rounded class="px-3.5 py-0.5">
                              {detailMandat.PARTI || ''}
                            </Badge>
                          </div>
                        </div>
                      </li>
                    {/if}
                  {/each}
                </ul>
              </Card> 
            {:else if (showReg)}
            <dl
            class="max-w-screen-xl gap-8 p-2 mx-auto text-gray-900  dark:text-white sm:p-8"
                >
              <div class="flex items-center justify-center">
                <dt class="ml-1 text-3xl font-bold poppins-medium w-full text-center">
                  {formattedValue(currentGeneralInfo.superficy)|| ''}
                </dt>
                <dd class="text-gray-500 ml-1 dark:text-gray-400">km²</dd>
              </div>
            </dl>
            <Card class="mb-2 !px-1 !max-w-xl  w-full">
              <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
                <li class=" py-1 sm:py-2">
                  <div class="flex items-start" >
                    <div class="leading-3 flex-1 min-w-0 ms-4 mr-4">
                      <p class={generalInfoItemStyle} >
                        <UserOutline class="text-gray-700" size="sm" />
                        President conseil: 
                        <span class={generalInfoValueStyle} >{currentGeneralInfo["nom_president"]}</span>
                      </p>
                      <p class={generalInfoItemStyle}>  
                        <UsersOutline class="text-gray-700" size="sm" />
                        1er Vice President: 
                        <span class={generalInfoValueStyle} >
                          {currentGeneralInfo["nom_vice_president1"]} 
                        </span>
                      </p>
                      <p class={generalInfoItemStyle}>  
                        <UsersOutline class="text-gray-700" size="sm" />
                        2eme Vice President: 
                        <span class={generalInfoValueStyle} >
                          {currentGeneralInfo["nom_vice_president2"]} 
                        </span>
                      </p>

                    </div>
                  </div>
                </li>
              </ul>
            </Card> 
            {/if}
          </Card>
        </div>
        <Tooltip triggeredBy="#stat" type="auto">
          Statistique des ICSP dans le temps pour un territoire choisi
        </Tooltip>
        <div class="my-2 flex w-full justify-center text-lg items-center gap-2">
          <GridSolid size="sm" />
          Stats des ICSP
          <h5
            id="stat"
            class="inline-flex items-center mb-4 text-sm font-light text-gray-400 dark:text-gray-200"
          >
            <InfoCircleSolid class="w-4 h-4 mt-4 me-2.5" />
          </h5>
        </div>

        <div class="p-4 lg:w-full sm:w-full flex justify-center mb-4">
          {#await dataForLineChart then}
            {#if dataForLineChart.data.data}
              <Card class="!max-w-md w-full">
                <div
                  class="w-full flex justify-center items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center">
                    <div
                      class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center me-3"
                    >
                      <ChartOutline class="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h5
                        class="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1 poppins-medium"
                      >
                        Evolution de l'ICSP <br />
                        <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
                          <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">
                            Territoire : {dataForBarChart.geo}
                          </dt>
                        </p>
                      </h5>
                    </div>
                  </div>
                </div>
                {#await optionForLineChart(dataForLineChart.data.label, dataForLineChart.data.data) then options}
                  <Chart {options} />
                {/await}
              </Card>
            {/if}
          {/await}
        </div>
        <div class="p-4 lg:w-full sm:w-full flex justify-center">
          {#await dataForBarChart then}
            {#if dataForBarChart.data}
              <Card class="!max-w-md w-full">
                <div
                  class="w-full h-full flex justify-center items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center">
                    <div
                      class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center me-3"
                    >
                      <CashOutline class="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h5
                        class="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1 poppins-medium"
                      >
                        ICSP pour le territoire : {dataForBarChart.geo}
                      </h5>
                      <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
                        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">
                          Total ICSP pour la période {dataForBarChart.year} :
                        </dt>
                        <dd class="text-gray-900 text-sm dark:text-white font-semibold">
                          {formattedValue(dataForBarChart.sum)} FCFA
                        </dd>
                      </p>
                    </div>
                  </div>
                </div>

                {#await optionForBarChart(changeItemToDisplay(dataForBarChart.data)) then options}
                  <!-- Utilisation de h-auto pour que la hauteur s'adapte au contenu -->
                  <Chart {options} />
                {/await}
              </Card>
            {/if}
          {/await}
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
