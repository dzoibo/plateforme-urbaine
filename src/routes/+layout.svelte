<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Main from '../components/Map.svelte';
  // Autre fichier, par exemple, votre composant ou page
  import {
    findMinMax,
    jsonToItem,
  } from '../../shared/utilitaire';
  import SearchBar from '../components/SearchBar.svelte';
  import {
    dataStore,
    rangeValue,
    rangeValueAccord,
    storeIndicateur,
    heightNavBar,
  } from '../../shared/store.js';
  import { fetchData } from '../../shared/dataService.js';

  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    Drawer,
    CloseButton,
    SidebarDropdownWrapper,
    Button,
    Dropdown,
    Checkbox,
    ButtonGroup,
    Range,
    Radio,
    Label,
    Tabs,
    TabItem,
    Spinner
  } from 'flowbite-svelte';
  import {
    FolderOutline,
    SwatchbookOutline,
    DollarOutline,
    UsersGroupOutline,
    CashOutline,
    LandmarkOutline,
    ChevronDownSolid,
    BuildingOutline,
    CheckPlusCircleOutline,
    CalendarMonthOutline,
    RectangleListOutline,
    UserOutline,
    UsersOutline,
    OrdoredListOutline
  } from 'flowbite-svelte-icons';
  import { sineIn } from 'svelte/easing';

  let transitionParams = {
    x: -320,
    duration: 100,
    easing: sineIn
  };
  let breakPoint: number = 1024;
  let width: number;
  let height: number;
  let component;
  let props;
  let backdrop: boolean = false;
  let drawerHidden = true;
  let activateClickOutside = true;

  let navbarHeight = 0;

  let sidebarWidth = 20;
  let marginRight = sidebarWidth; // Valeur initiale de la marge droite

  let dataArr: any[] = [];
  let communeData: never[] = [];
  let projetData: never[]=[];

  let icspData: any[] = [];

  let valeursProjet: any[] = [];
  let valeursTheme: any[] = [];
  let valeursInstitution: any[] = [];
  let valeursBailleur: any[] = [];
  let valeursBeneficiaire: any[] = [];
  let valeursRegion=[
    {
      key: "Adamaoua",
      id: "AD",
      checked:false,
      id_REGION: "AD"
    },
    {
      key: "Centre",
      checked:false,
      id: "CE",
      id_REGION: "CE"
    },
    {
      key: "Est",
      checked:false,
      id: "ES",
      id_REGION: "ES"
    },
    {
      key: "Extrême-Nord",
      checked:false,
      id: "EN",
      id_REGION: "EN"
    },
    {
      key: "Littoral",
      checked:false,
      id: "LI",
      id_REGION: "LI"
    },
    {
      key: "Nord",
      checked:false,
      id: "NO",
      id_REGION: "NO"
    },
    {
      key: "Nord-ouest",
      checked:false,
      id: "NW",
      id_REGION: "NW"
    },
    {
      key: "Ouest",
      checked:false,
      id: "OU",
      id_REGION: "OU"
    },
    {
      key: "Sud",
      checked:false,
      id: "SU",
      id_REGION: "SU"
    },
    {
      key: "Sud-ouest",
      checked:false,
      id: "SW",
      id_REGION: "SW"
    }
  ]


  let arrayAllIndicateurs: any[] = [];
  let loadingData = true;
  let activeUrl;
  let showFinancement = false;
  let showICSP = true;
  let minMaxYear: {
    max: 2022;
    min: 2023;
  };
  let minMaxYearAccord = {
    min: 2022,
    max: 2023
  };

  let valueSliderAccord = [minMaxYearAccord.min, minMaxYearAccord.max];

  let minMaxYearICSP = {
    min: 2022,
    max: 2023
  };

  let valueSlideICSP = [minMaxYearICSP.min, minMaxYearICSP.max];

  let valueSliderLanding = 0;

  let valueSliderAccord2 = 0;
  let update = true;

  let showProgressBar = true; // Définiir la variable pour afficher la barre de progression
  let progressValue = 0; // Initialiser la valeur de la progression
  let minSliderValue = minMaxYearAccord.min;
  let maxSliderValue = minMaxYearAccord.max;
  let minSliderICSP = minMaxYearICSP.min;
  let maxSliderICSP = minMaxYearICSP.max;

  let checkedOptions: { [key: string]: boolean } = {};
  
  let filterIndicators={
    theme: false,
    nom: false,
    region: false,
    bailleur: false,
    beneficiaire: false,
    institution: false
  };

  let filterCheckedAll={
    theme: false,
    nom: false,
    region: false,
    bailleur: false,
    beneficiaire: false,
    institution: false
  }
  

  let projetInputValue = '';
  let themeInputValue = '';
  let institutionInputValue = '';
  let bailleurInputValue = '';
  let beneficiaireInputValue = '';
  let regionInputValue ='';

  let projetSearchResult: any[] = [];
  let themeSearchResult: any[] = [];
  let institutionSearchResult: any[] = [];
  let bailleurSearchResult: any[] = [];
  let beneficiaireSearchResult: any[] = [];
  let regionSearchResult: any[] =[];

  let regionIndicateur = 'region';
  let projetIndicateur = 'nom';
  let themeIndicateur= 'theme';
  let institutionIndicateur= 'institution';
  let bailleurIndicateur= 'bailleur';
  let beneficiaireIndicateur= 'beneficiaire';

 
  let filteredItems: any[] = [];
  
  let dropdownSelectionRegionIndicateur = { indicateur: '', data: [] };
  let dropdownSelectionProjetIndicateur = { indicateur: '', data: [] };
  let dropdownSelectionThemeIndicateur = { indicateur: '', data: [] };
  let dropdownSelectionInstitutionIndicateur = { indicateur: '', data: [] };
  let dropdownSelectionBailleurIndicateur = { indicateur: '', data: [] };
  let dropdownSelectionBeneficiaireIndicateur = { indicateur: '', data: [] };

  
  let cardForSideBar =
    'bg-white dark:bg-#23409A-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md p-2 mb-2';

  let dropdownStyle = ' border border-red-500 overflow-y-auto py-1 h-48';
  let listItemStyle = 'rounded w-56 pl-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600';
  let filterIndicatorStyle='w-2.5 h-2.5 mb-2 rounded-[50%] bg-[#234099]'
  let closeBtnStyle = 'absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2';
  let selectedItemStyle="inline-flex relative px-5 py-2.5 m-1 text-sm font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg";
  let appuiBeneficiairesItems: any[] = [];
  let appuiInstitutionnelItems: any[] = [];
  let appuiBailleursItems: any[] = [];
  let projetsUnique:
  {
    nom: string,
    acronyme: string
  } []= [];
  

  let themesFromSheet=[
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

  

  onMount(async function () {
    
    try {
      const data = await fetchData();
      communeData=data.communeData;
      projetData=data.projetData;

      // Mettre à jour les propriétés individuelles du store
      dataStore.update((store) => {
        loadingData = false;
        store.communeData = communeData;
        store.projetData = projetData
        return store;
      });
      
      for (var i = 0; i < projetData.length; i++) {
          let row = projetData[i];
          // Récupérez la valeur de la colonne "Appui Beneficiaires" de chaque ligne
          let appuiBeneficiairesValue = row["id_COMMUNE"];
          
          if (appuiBeneficiairesValue !== null) {
              appuiBeneficiairesValue = appuiBeneficiairesValue.toString()
              var items = appuiBeneficiairesValue.split(',');
              items = items.map(item => item.trim());
              appuiBeneficiairesItems = appuiBeneficiairesItems.concat(items);
          }

          let appuiBailleursValue= row["Bailleur(s)"];
          if(appuiBailleursValue !== null ){
            appuiBailleursValue = appuiBailleursValue.toString();
            var items = appuiBailleursValue.split(',');
            items = items.map(item => item.trim());
            appuiBailleursItems = appuiBailleursItems.concat(items);
          }

          let appuiInstitutionnelValue = row["Appui institutionnel"];
          if (appuiInstitutionnelValue !== null) {
            appuiInstitutionnelValue = appuiInstitutionnelValue.toString()
            var items = appuiInstitutionnelValue.split(',');
            items = items.map(item => item.trim());
            appuiInstitutionnelItems = appuiInstitutionnelItems.concat(items);
          }

          let projet = row["Nom"];
          let acronyme = row["Acronyme"];
          if (projet) {
            projetsUnique.push({nom:projet,acronyme:acronyme});
          }
      }
      appuiBeneficiairesItems = [...new Set(appuiBeneficiairesItems)];
      appuiBailleursItems = [...new Set(appuiBailleursItems)];
      appuiInstitutionnelItems = [...new Set(appuiInstitutionnelItems)];

      getFiltersItems();
      // Mettre à jour les propriétés individuelles du store
      dataStore.update((store) => {
        store.keyCommuneID_Commune = appuiBeneficiairesItems;
        return store;
      });
      

      

      // Slider
      minMaxYearICSP = findMinMax(icspData, 'ANNEE');
      minMaxYearAccord = findMinMax(dataArr, 'Année financement');

      valueSliderAccord = [minMaxYearAccord.min, minMaxYearAccord.max];
      valueSlideICSP = [minMaxYearICSP.min, minMaxYearICSP.max];
      rangeValue.set(valueSlideICSP);
      rangeValueAccord.set(valueSliderAccord);

      // Sélectionner l'élément du drawer par son identifiant
      const drawer = document.getElementById('sidebar');
      const navbar = document.getElementById('myNavbar'); // Remplacer 'navbar' par l'ID réel de votre navbar

      if (navbar) {
        navbarHeight = navbar.clientHeight;
        heightNavBar.set(navbarHeight);
      }
    } catch (error) {
      console.error(error);
    }

    loadData();
  });

  function getFiltersItems(){
    valeursTheme= themesFromSheet
    .sort()
    .map((item)=>({
      key: item,
      checked: false,
      id: null
    }))

    valeursInstitution= appuiInstitutionnelItems
    .sort((a, b) => a.localeCompare(b))
    .map((item)=>({
      key: item,
      checked: false,
      id: null
    }));

    valeursBailleur = appuiBailleursItems
    .sort((a, b) => a.localeCompare(b))
    .map((item)=>({
      key: item,
      checked: false,
      id: null
    }));

    valeursProjet = projetsUnique
    .sort((a, b) => a.nom.localeCompare(b.nom))
    .map((item)=>({
      key: item.nom,
      acronyme: item.acronyme,
      checked: false,
      id: null
    }));

    valeursBeneficiaire =getCommuneInfo(appuiBeneficiairesItems)

    dropdownSelectionRegionIndicateur.indicateur = regionIndicateur;
    dropdownSelectionProjetIndicateur.indicateur = projetIndicateur;
    dropdownSelectionThemeIndicateur.indicateur = themeIndicateur;
    dropdownSelectionInstitutionIndicateur.indicateur = institutionIndicateur;
    dropdownSelectionBailleurIndicateur.indicateur = bailleurIndicateur;
    dropdownSelectionBeneficiaireIndicateur.indicateur = beneficiaireIndicateur;
  }
  
  function getCommuneInfo(ids){
    let beneficiaires=[];
    const data: any=communeData;
    for (const id of ids){
      const index=data.findIndex((commune: { id_COMMUNE: any; })=>commune.id_COMMUNE===id)
      let item={
        key:data[index].COMMUNE,
        checked:false,
        id:data[index].id_COMMUNE,
        id_COMMUNE:data[index].id_COMMUNE,
      }
      beneficiaires.push(item);
    }
    return beneficiaires.sort((a, b) => a.key.localeCompare(b.key));
  }
  

  onMount(() => {
    if (width >= breakPoint) {
      drawerHidden = false;
      activateClickOutside = false;
    } else {
      drawerHidden = true;
      activateClickOutside = false;
    }
  });

  const toggleDrawer = () => {
    drawerHidden = !drawerHidden;
    if (drawerHidden) {
      marginRight = 0;
    } else {
      marginRight = 20;
    }
  };

  $: if (width >= breakPoint) {
    drawerHidden = false;
    activateClickOutside = false;
  } else {
    drawerHidden = false;
    activateClickOutside = false;
  }

  function toggleCheckbox(
    checkedOptions: { checked: boolean },
    array: { indicateur: string; data: never[] },
    unique: any[],
  ) {
    checkedOptions.checked = !checkedOptions.checked;
    updateSelectedWords(array, unique); // Mettre à jour les mots sélectionnés
    setTimeout(() => {
      updateFilterIndicator(array.indicateur,unique)
    }, 12);
  }

  function toggleAllCheckbox(
   filter: string
  ){
    let checkedAllfilter=false;
    filterCheckedAll[filter] = !filterCheckedAll[filter];
    checkedAllfilter=filterCheckedAll[filter] ;
     /**
      * since the flow-bite checkbox component is wrapping the checkbox itself inside a label,
      * we have to target the input inside the checkbox before checking it and dispach the event
     */
     let checkboxes= document.querySelectorAll("."+filter+"-checkbox input");

     checkboxes.forEach(function(checkbox: any) {
      // this condition is to make sure that we check and trigger the event only if the item is not yet checked or we are unchecking
      if(checkbox.checked!== true || !checkedAllfilter){
        checkbox.checked = checkedAllfilter;
        checkbox.dispatchEvent(new Event('change'));
      }
    });
    setTimeout(() => {// this is to restore the value changed in the function updateFilterIndicator()
        filterCheckedAll[filter] =checkedAllfilter;
    }, 12);
  }

  function updateSelectedWords(
    array: { indicateur: string; data: never[] } | undefined,
    unique: any[],
    option = false
  ) {
    update = true;
    //@ts-ignore
    setTimeout(() => {
      array.data = unique.filter((unique) => unique.checked).map((unique) => unique.key);
      const existingIndicateurIndex = arrayAllIndicateurs.findIndex(
        (item) => item.indicateur === array.indicateur
      );
      if (existingIndicateurIndex !== -1) {
        arrayAllIndicateurs[existingIndicateurIndex].data = array.data;
      } else {
        arrayAllIndicateurs.push(array);
      }

      update = false;
    }, 10);

    return array;
  }

  function updateFilterIndicator(indicateur: string,unique){
    const indicateurIndex = arrayAllIndicateurs.findIndex((item:any)=>item.indicateur===indicateur)
    const arrayLength=arrayAllIndicateurs[indicateurIndex].data.length;
    let allCkeckboxes:any = document.querySelector("."+indicateur+"-all-checkbox");
    if (allCkeckboxes) {
      allCkeckboxes.checked = unique.length===arrayLength;
    }
    filterCheckedAll.region=unique.length===arrayLength;
    filterIndicators[indicateur]=arrayLength>0;
  }

  function closeDiv(
    wordToRemove: any,
    array: { indicateur: string; data: never[] } | undefined,
    unique,
  ) {
    // Trouver l'objet correspondant dans valeursSourcefinancement
    const word = unique.find((value) => value.key === wordToRemove);

    if (word) {
      word.checked = false;
    }

    updateSelectedWords(array, unique); // Mettre à jour les mots sélectionnés
    
    if(array!==undefined){
      setTimeout(() => {
        updateFilterIndicator(array.indicateur,unique)
      }, 12);
    }
  }

  $: {
    if (minSliderValue <= maxSliderValue) {
      minSliderValue = minSliderValue;
    } else {
      minSliderValue = maxSliderValue;
    }
    if (maxSliderValue >= minSliderValue) {
      maxSliderValue = maxSliderValue;
    } else {
      maxSliderValue = minSliderValue;
    }
    if (minSliderICSP <= maxSliderICSP) {
      minSliderICSP = minSliderICSP;
    } else {
      minSliderICSP = maxSliderICSP;
    }
    if (maxSliderICSP >= minSliderICSP) {
      maxSliderICSP = maxSliderICSP;
    } else {
      maxSliderICSP = minSliderICSP;
    }

    valueSliderAccord = [minSliderValue, maxSliderValue];
    valueSlideICSP = [minSliderICSP, maxSliderICSP];
    //@ts-ignore
    rangeValue.set(valueSlideICSP);
    //@ts-ignore
    rangeValueAccord.set(valueSliderAccord);

    activeUrl = $page.url.pathname;
    let spanClass = 'pl-2 self-center text-md text-gray-900 dark:text-white';
    let divClass = 'w-full md:block md:w-auto pr-8';
    let ulClass =
      'flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-lg md:font-medium';

    storeIndicateur.update((items) => {
      //@ts-ignore
      items = arrayAllIndicateurs;
      return items;
    });
   

    update = update;
  }
  async function loadData() {
    // Téléchargez votre data ici
    // Une fois la data téléchargée, masquez la barre de progression
    showProgressBar = false;
  }

  const handleInput = (event,data,filter) => {
    const value = event.target.value;
    const searchResult= data.filter((item) =>
      item.toLowerCase().match(value.toLowerCase())
    );
    switch(filter) {
      case regionIndicateur:
        regionSearchResult=searchResult
      break;
      case projetIndicateur:
        projetSearchResult=searchResult
      break;
      case institutionIndicateur:
        institutionSearchResult=searchResult
      break;
      case bailleurIndicateur:
        bailleurSearchResult=searchResult;
      break;
      case beneficiaireIndicateur:
        beneficiaireSearchResult=searchResult;
      break;
    } 
  };

   // filter the list and display only the element found during the search 
   function filterList(listItem, searchResult) {
    return searchResult.length === 0 || searchResult.includes(listItem.key);
  }

  // Fonction pour réinitialiser les filtres et vider les dropdowns
  function resetFilters() {
    arrayAllIndicateurs.forEach((item) => (item.checked = false));
    valeursProjet.forEach((item) => (item.checked = false));
    valeursTheme.forEach((item) => (item.checked = false));
    valeursInstitution.forEach((item) => (item.checked = false));
    valeursBailleur.forEach((item) => (item.checked = false));
    valeursBeneficiaire.forEach((item) => (item.checked = false));
    valeursRegion.forEach((item) => (item.checked = false));
    clearIndicator();
  }

  function clearIndicator(){
    filterIndicators.region=false;
    filterIndicators.nom=false;
    filterIndicators.beneficiaire=false;
    filterIndicators.theme=false;
    filterIndicators.bailleur=false;
    filterIndicators.institution=false;
  }

</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<Navbar id="myNavbar" let:hidden let:toggle class="navbar">
  <NavHamburger
    onClick={toggleDrawer}
    btnClass="ml-3"
    class="{drawerHidden == true ? 'rotate-90' : ''} mx-none  justify-none"
    style="display:block"
  />
  
</Navbar>

{#if !loadingData}
  <Drawer
    style="top: {navbarHeight}px !important; width:{sidebarWidth}rem !important;"
    transitionType="fly"
    {backdrop}
    {transitionParams}
    bind:hidden={drawerHidden}
    bind:activateClickOutside
    class="overflow-y-auto pb-32 !p-0 sidebar"
    id="sidebar"
  >
    <div class="h-full w-full bg-[#00862b14]">
      <Sidebar asideClass="w-54">
        <!-- Bouton Reset Filter -->
        <div class="w-full bg-white flex flex-col items-center gap-3 py-4 mb-3" >
          <img src="logo-plateforme.jpg" alt="Logo de la plateforme" class="w-40 h-40">
          <h1 class="font-bold text-lg">Plateforme Urbaine Cameroun</h1>
        </div>
        

        <SidebarWrapper divClass="overflow-y-auto" style=" overflow-x: hidden">

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper label="Selon une periode">
                <svelte:fragment slot="icon">
                  <CalendarMonthOutline
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  />
                </svelte:fragment>
                <div class="flex items-center">
                  <p>
                    Visualisation des projets pour la période : {minSliderICSP +
                      ' - ' +
                      maxSliderICSP}
                  </p>
                </div>

                <div class="flex items-center space-x-4">
                  <div class="flex-1">
                    <Range
                      class="!rounded-none"
                      id="range-max"
                      min={minMaxYearICSP.min}
                      max={minMaxYearICSP.max}
                      bind:value={minSliderICSP}
                      step="1"
                    />
                  </div>
                  <div class="flex-1">
                    <Range
                      class="!rounded-none"
                      id="range-min"
                      min={minMaxYearICSP.min}
                      max={minMaxYearICSP.max}
                      bind:value={maxSliderICSP}
                      step="1"
                    />
                  </div>
                </div>
              </SidebarDropdownWrapper>
            </SidebarGroup>

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper  label="Selon un projet">
                <svelte:fragment slot="icon">
                  <BuildingOutline class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
                  {#if filterIndicators.nom && !filterCheckedAll.nom}
                    <div class={filterIndicatorStyle} ></div>
                  {/if}
                </svelte:fragment>
                <div class="w-full flex justify-center">
                  {#if filterIndicators.nom && !filterCheckedAll.nom}
                    <div class={filterIndicatorStyle} ></div>
                  {/if}
                  <Button class="bg-[#234099] w-[260px] hover:bg-[#182D73]">
                    Sélectionner un projet
                    <ChevronDownSolid class="w-3 h-3 ms-2 text-white dark:text-white"/>
                  </Button>
                </div>

                <Dropdown class={dropdownStyle}>
                  <div slot="header" class="p-3">
                    <SearchBar
                      bind:inputValue={projetInputValue}
                      on:input={
                        (event)=>handleInput(event,jsonToItem({ valeursProjet },'valeursProjet'),projetIndicateur)
                      }
                    />
                  </div>
                  {#each valeursProjet as projet}
                    {#if filterList(projet,projetSearchResult)}
                      <li class={listItemStyle}>
                        <Checkbox class={projetIndicateur+"-checkbox"}
                          checked={projet.checked}
                          on:change={() =>
                            toggleCheckbox(
                              projet,
                              dropdownSelectionProjetIndicateur,
                              valeursProjet,
                            )}>{projet.key}</Checkbox
                        >
                      </li>
                    {/if}
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#each arrayAllIndicateurs as indicateur}
                    {#if indicateur.indicateur === dropdownSelectionProjetIndicateur.indicateur}
                      {#each indicateur.data as word (word)}
                        <div 
                          class={selectedItemStyle}
                        >
                          {word}
                          <CloseButton
                            on:click={() =>
                              closeDiv(
                                word,
                                dropdownSelectionProjetIndicateur,
                                valeursProjet,
                              )}
                            class={closeBtnStyle}
                          />
                        </div>
                      {/each}
                    {/if}
                  {/each}
                </div>
              </SidebarDropdownWrapper>
            </SidebarGroup>

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper  label="Selon un thème">
                <svelte:fragment slot="icon">
                  <UsersGroupOutline class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
                  {#if filterIndicators.theme && !filterCheckedAll.theme}
                    <div class={filterIndicatorStyle} ></div>
                  {/if}
                </svelte:fragment>
                <div class="w-full flex justify-center">
                  <Button class="bg-[#234099] w-[260px] hover:bg-[#182D73]"
                    >Sélection des thèmes<ChevronDownSolid
                      class="w-3 h-3 ms-2 text-white dark:text-white"
                    /></Button
                  >
                </div>
                
                <Dropdown class={dropdownStyle}>
                  <div slot="header" class="p-3">
                    <SearchBar
                      bind:inputValue={themeInputValue}
                      on:input={
                        (event)=>handleInput(event,jsonToItem({ valeursTheme },'valeursTheme'),themeIndicateur)
                      }
                    />
                  </div>
                  {#if themeInputValue.length===0}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        class={themeIndicateur+"-all-checkbox"}
                        checked={filterCheckedAll.theme}
                        on:change={() =>
                          toggleAllCheckbox(themeIndicateur)
                        }>Tout sélectionner</Checkbox
                      >
                    </li>
                  {/if}
                  {#each valeursTheme as theme}
                    {#if filterList(theme,themeSearchResult)}
                      <li class={listItemStyle}>
                        <Checkbox class={themeIndicateur+"-checkbox"}
                          checked={theme.checked}
                          on:change={() =>
                            toggleCheckbox(
                              theme,
                              dropdownSelectionBeneficiaireIndicateur,
                              valeursBeneficiaire,
                            )}>{theme.key}</Checkbox
                        >
                      </li>
                    {/if}
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#each arrayAllIndicateurs as indicateur}
                    {#if indicateur.indicateur === dropdownSelectionThemeIndicateur.indicateur}
                      {#each indicateur.data as word (word)}
                        <div 
                          class={selectedItemStyle}
                        >
                          {word}
                          <CloseButton
                            on:click={() =>
                              closeDiv(
                                word,
                                dropdownSelectionThemeIndicateur,
                                valeursTheme,
                              )}
                            class={closeBtnStyle}
                          />
                        </div>
                      {/each}
                    {/if}
                  {/each}
                </div>
              </SidebarDropdownWrapper>
            </SidebarGroup>

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper  label="Selon un bénéficiaire">
                <svelte:fragment slot="icon">
                  <UsersGroupOutline class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
                  {#if filterIndicators.beneficiaire && !filterCheckedAll.beneficiaire}
                    <div class={filterIndicatorStyle} ></div>
                  {/if}
                </svelte:fragment>
                <div class="w-full flex justify-center">
                  <Button class="bg-[#234099] w-[260px] hover:bg-[#182D73]"
                    >Sélection des bénéficiaires<ChevronDownSolid
                      class="w-3 h-3 ms-2 text-white dark:text-white"
                    /></Button
                  >
                </div>
                
                <Dropdown class={dropdownStyle}>
                  <div slot="header" class="p-3">
                    <SearchBar
                      bind:inputValue={beneficiaireInputValue}
                      on:input={
                        (event)=>handleInput(event,jsonToItem({ valeursBeneficiaire },'valeursBeneficiaire'),beneficiaireIndicateur)
                      }
                    />
                  </div>
                  {#if beneficiaireInputValue.length===0}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        class={beneficiaireIndicateur+"-all-checkbox"}
                        checked={filterCheckedAll.beneficiaire}
                        on:change={() =>
                          toggleAllCheckbox(beneficiaireIndicateur)
                        }>Tout sélectionner</Checkbox
                      >
                    </li>
                  {/if}
                  {#each valeursBeneficiaire as beneficiaire}
                    {#if filterList(beneficiaire,beneficiaireSearchResult)}
                      <li class={listItemStyle}>
                        <Checkbox class={beneficiaireIndicateur+"-checkbox"}
                          checked={beneficiaire.checked}
                          on:change={() =>
                            toggleCheckbox(
                              beneficiaire,
                              dropdownSelectionBeneficiaireIndicateur,
                              valeursBeneficiaire,
                            )}>{beneficiaire.key}</Checkbox
                        >
                      </li>
                    {/if}
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#each arrayAllIndicateurs as indicateur}
                    {#if indicateur.indicateur === dropdownSelectionBeneficiaireIndicateur.indicateur}
                      {#each indicateur.data as word (word)}
                        <div 
                          class={selectedItemStyle}
                        >
                          {word}
                          <CloseButton
                            on:click={() =>
                              closeDiv(
                                word,
                                dropdownSelectionBeneficiaireIndicateur,
                                valeursBeneficiaire,
                              )}
                            class={closeBtnStyle}
                          />
                        </div>
                      {/each}
                    {/if}
                  {/each}
                </div>
              </SidebarDropdownWrapper>
            </SidebarGroup>

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper  label="Selon une institution">
                <svelte:fragment slot="icon">
                  <LandmarkOutline class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
                  {#if filterIndicators.institution && !filterCheckedAll.institution}
                    <div class={filterIndicatorStyle} ></div>
                  {/if}
                </svelte:fragment>
                <div class="w-full flex justify-center">
                  <Button class="bg-[#234099] w-[260px] hover:bg-[#182D73]"
                    >Sélectionner des institutions<ChevronDownSolid
                      class="w-3 h-3 ms-2 text-white dark:text-white"
                    /></Button
                  >
                </div>
                <Dropdown class={dropdownStyle}>
                  <div slot="header" class="p-3">
                    <SearchBar
                      bind:inputValue={institutionInputValue}
                      on:input={
                        (event)=>handleInput(event,jsonToItem({ valeursInstitution },'valeursInstitution'),institutionIndicateur)
                      }
                    />
                  </div>
                  {#if institutionInputValue.length===0}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        class={institutionIndicateur+"-all-checkbox"}
                        checked={filterCheckedAll.theme}
                        on:change={() =>
                          toggleAllCheckbox(institutionIndicateur)
                        }>Tout sélectionner</Checkbox
                      >
                    </li>
                  {/if}
                  {#each valeursInstitution as institution}
                    {#if filterList(institution,institutionSearchResult)}
                      <li class={listItemStyle}>
                        <Checkbox class={institutionIndicateur+"-checkbox"}
                          checked={institution.checked}
                          on:change={() =>
                            toggleCheckbox(
                              institution,
                              dropdownSelectionInstitutionIndicateur,
                              valeursInstitution,
                            )}>{institution.key}</Checkbox
                        >
                      </li>
                    {/if}
                  {/each}
                  <div class="px-2 pt-1 pb-2">
                    {#each arrayAllIndicateurs as indicateur}
                      {#if indicateur.indicateur === dropdownSelectionInstitutionIndicateur.indicateur}
                        {#each indicateur.data as word (word)}
                          <div 
                            class={selectedItemStyle}
                          >
                            {word}
                            <CloseButton
                              on:click={() =>
                                closeDiv(
                                  word,
                                  dropdownSelectionInstitutionIndicateur,
                                  valeursInstitution,
                                )}
                              class={closeBtnStyle}
                            />
                          </div>
                        {/each}
                      {/if}
                    {/each}
                  </div>
                </Dropdown>
              </SidebarDropdownWrapper>
            </SidebarGroup>

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper  label="Selon un bailleur">
                <svelte:fragment slot="icon">
                  <CashOutline class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
                  {#if filterIndicators.bailleur && !filterCheckedAll.bailleur}
                    <div class={filterIndicatorStyle} ></div>
                  {/if}
                </svelte:fragment>
                <div class="w-full flex justify-center">
                  <Button class="bg-[#234099] w-[260px] hover:bg-[#182D73]"
                    >Sélectionner des bailleurs<ChevronDownSolid
                      class="w-3 h-3 ms-2 text-white dark:text-white"
                    /></Button
                  >
                </div>
                
                <Dropdown class={dropdownStyle}>
                  <div slot="header" class="p-3">
                    <SearchBar
                      bind:inputValue={bailleurInputValue}
                      on:input={
                        (event)=>handleInput(event,jsonToItem({ valeursBailleur },'valeursBailleur'),bailleurIndicateur)
                      }
                    />
                  </div>
                  {#if bailleurInputValue.length===0}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox
                        class={bailleurIndicateur+"-all-checkbox"}
                        checked={filterCheckedAll.bailleur}
                        on:change={() =>
                          toggleAllCheckbox(bailleurIndicateur)
                        }>Tout sélectionner</Checkbox
                      >
                    </li>
                  {/if}
                  {#each valeursBailleur as bailleur}
                    {#if filterList(bailleur,bailleurSearchResult)}
                      <li class={listItemStyle}>
                        <Checkbox class={bailleurIndicateur+"-checkbox"}
                          checked={bailleur.checked}
                          on:change={() =>
                            toggleCheckbox(
                              bailleur,
                              dropdownSelectionBailleurIndicateur,
                              valeursBailleur,
                            )}>{bailleur.key}</Checkbox
                        >
                      </li>
                    {/if}
                  {/each}
                </Dropdown>
                <div class="px-2 pt-1 pb-2">
                  {#each arrayAllIndicateurs as indicateur}
                    {#if indicateur.indicateur === dropdownSelectionBailleurIndicateur.indicateur}
                      {#each indicateur.data as word (word)}
                        <div 
                          class={selectedItemStyle}
                        >
                          {word}
                          <CloseButton
                            on:click={() =>
                              closeDiv(
                                word,
                                dropdownSelectionBailleurIndicateur,
                                valeursBailleur,
                              )}
                            class={closeBtnStyle}
                          />
                        </div>
                      {/each}
                    {/if}
                  {/each}
                </div>
              </SidebarDropdownWrapper>
            </SidebarGroup>
            
        </SidebarWrapper>

        {#if Object.values(arrayAllIndicateurs).some(value => value === true)}
        <div class="w-full flex justify-center">
          <button
            class="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-800 m-4"
            on:click={resetFilters}>Réinitialiser les filtres</button
          >
        </div> 
        
        {/if}
      </Sidebar>
    </div>
  </Drawer>
{:else}
  <div class="flex items-center justify-center h-screen">
    <Spinner color="green" size={12} />
  </div>
{/if}

<div
  class="flex mx-auto lg:p-0 md:p-4 sm:p-4"
  style="margin-left:{marginRight}rem;height: calc(100vh - {navbarHeight}px);"
>
  <main id="main" class=" maplibregl-map">
    {#if !loadingData}
      <slot {showFinancement} {showICSP} />
    {/if}
  </main>
</div>
