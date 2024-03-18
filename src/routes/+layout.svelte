<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { onMount, createEventDispatcher } from 'svelte';
  import Main from '../components/Map.svelte';
  // Autre fichier, par exemple, votre composant ou page
  import {
    uniqueValues,
    findMinMax,
    jsonToItem,
    removeDuplicatesByAttribute
  } from '../../shared/utilitaire';
  import SearchBar from '../components/SearchBar.svelte';
  import {
    dataStore,
    rangeValue,
    buttonICSP,
    rangeValueAccord,
    storeIndicateur5,
    storeIndicateur,
    heightNavBar,
    storeIndicateurICSP
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
  let mandatData: any[] = [];
  let communeData: any[] = [];
  let uniqueBeneficiaireForIDFetch: any[] = [];
  let icspData: any[] = [];
  let valeursAttribution: any[] = [];
  let valeursDomaine: any[] = [];
  let valeursSecteur: any[] = [];
  let valeursBeneficiaire: any[] = [];
  let valeursBeneficiaire2: any[] = [];
  let valeursSourcefinancement: any[] = [];
  let valeursDepartement: any[] = [];
  let valeursRegion: any[] = [];
  let valeursAvancement: any[] = [];
  let valeursPartenaires: any[] = [];
  let arrayAllIndicateurs = { accord: [], icsp: [] };
  let arrayAllIndicateursICSP: any[] = [];
  let loadingData = true;
  let isItCoop = '';
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
  //Liste déroulante et search bar
  //accord
  let inputValue = '';
  let indicateur5 = 'Source_financement';
  let indicateur1 = "Instance d'attribution";
  let indicateur2 = 'Secteurs';
  let indicateur3 = 'Domaines';
  let indicateur4 = 'Bénéficiaire';
  let indicateur8 = 'Département';
  let indicateur9 = 'Région';
  let indicateur6 = 'Partenaires';
  let indicateur10 = 'Niveau d’avancement';

  //ICSP
  let indicateur7 = 'COMMUNE';
  let filteredItems: any[] = [];
  //ICSP
  let dropdownSelectionIndicateur7 = { indicateur: '', data: [] };
  //Accord
  let dropdownSelectionIndicateur10 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur9 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur8 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur6 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur5 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur4 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur3 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur2 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur1 = { indicateur: '', data: [] };
  let dropdownSelectionsAll: any[] = [];

  let cardForSideBar =
    'bg-white dark:bg-#23409A-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md p-2 mb-2';

  let dropdownStyle = 'w-48 overflow-y-auto py-1 h-48';


  let appuiBeneficiairesItems: any[] = [];
  let appuiInstitutionnelItems: any[] = [];
  let appuiBailleursItems: any[] = [];
  let projetsUnique= new Set();

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
      const { mandatData, dataArr, icspData, communeData, projectData } = await fetchData();

      // Mettre à jour les propriétés individuelles du store
      dataStore.update((store) => {
        loadingData = false;
        store.icspData = icspData;
        store.dataArr = dataArr;
        store.mandatData = mandatData;
        store.communeData = communeData;
        store.projectData = projectData
        return store;
      });


      
      for (var i = 0; i < projectData.length; i++) {
          let row = projectData[i];
          // Récupérez la valeur de la colonne "Appui Beneficiaires" de chaque ligne
          let appuiBeneficiairesValue = row["Ville/Bénéficiaire(s)"];
          
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
          if (projet) {
            projetsUnique.add(projet);
          }
      }

      appuiBeneficiairesItems = [...new Set(appuiBeneficiairesItems)];
      appuiBailleursItems = [...new Set(appuiBailleursItems)];
      appuiInstitutionnelItems = [...new Set(appuiInstitutionnelItems)];
      //themesFromSheet=...
      //projetsUnique=...

    
      valeursAttribution = uniqueValues(dataArr, indicateur1);
      valeursSecteur = uniqueValues(dataArr, indicateur2);
      valeursDomaine = uniqueValues(dataArr, indicateur3);
      valeursBeneficiaire = uniqueValues(dataArr, indicateur4, true, 'id_COMMUNE');
      valeursBeneficiaire2 = uniqueValues(icspData, indicateur7, true, 'id_COMMUNE');
      valeursSourcefinancement = uniqueValues(dataArr, indicateur5);
      valeursPartenaires = uniqueValues(dataArr, indicateur6);
      valeursDepartement = uniqueValues(dataArr, indicateur8, true, 'id_DEPARTEMENT');
      valeursRegion = uniqueValues(dataArr, indicateur9, false, 'id_REGION');
      valeursAvancement = uniqueValues(dataArr, indicateur10);

      // Fusionner les deux tableaux en un seul
      const mergedArray = [...valeursBeneficiaire, ...valeursBeneficiaire2];

      let uniqueBeneficiaireForIDFetch = removeDuplicatesByAttribute(mergedArray, 'id_COMMUNE');
      // Mettre à jour les propriétés individuelles du store
      dataStore.update((store) => {
        store.keyCommuneID_Commune = uniqueBeneficiaireForIDFetch;
        return store;
      });
      //ICSP
      dropdownSelectionIndicateur7.indicateur = indicateur7;
      // ACCORD
      dropdownSelectionIndicateur9.indicateur = indicateur10;
      dropdownSelectionIndicateur9.indicateur = indicateur9;
      dropdownSelectionIndicateur8.indicateur = indicateur8;
      dropdownSelectionIndicateur6.indicateur = indicateur6;
      dropdownSelectionIndicateur5.indicateur = indicateur5;
      dropdownSelectionIndicateur4.indicateur = indicateur4;
      dropdownSelectionIndicateur3.indicateur = indicateur3;
      dropdownSelectionIndicateur2.indicateur = indicateur2;
      dropdownSelectionIndicateur1.indicateur = indicateur1;

      // Ajouter les objets à l'array dropdownSelections
      dropdownSelectionsAll.push(
        dropdownSelectionIndicateur10,
        dropdownSelectionIndicateur9,
        dropdownSelectionIndicateur8,
        dropdownSelectionIndicateur7,
        dropdownSelectionIndicateur6,
        dropdownSelectionIndicateur5,
        dropdownSelectionIndicateur4,
        dropdownSelectionIndicateur3,
        dropdownSelectionIndicateur2,
        dropdownSelectionIndicateur1
      );

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
    section: string
  ) {
    checkedOptions.checked = !checkedOptions.checked;

    updateSelectedWords(array, unique, section); // Mettre à jour les mots sélectionnés
  }

  function updateSelectedWords(
    array: { indicateur: string; data: never[] } | undefined,
    unique: any[],
    section: string,
    option = false
  ) {
    update = true;
    //@ts-ignore
    setTimeout(() => {
      //Todo Automatisation pour prendre toutes les données des listes déroulantes.
      array.data = unique.filter((unique) => unique.checked).map((unique) => unique.key);
      // Vérifiez si un objet avec le même indicateur existe déjà dans arrayAllIndicateurs
      const existingIndicateurIndex = arrayAllIndicateurs[section].findIndex(
        (item) => item.indicateur === array.indicateur
      );
      if (existingIndicateurIndex !== -1) {
        // Mettez à jour 'data' de l'objet existant
        arrayAllIndicateurs[section][existingIndicateurIndex].data = array.data;
      } else {
        // Ajoutez un nouvel objet à arrayAllIndicateurs
        arrayAllIndicateurs[section].push(array);
      }

      update = false;
    }, 10);

    return array;
  }

  function closeDiv(
    wordToRemove: any,
    array: { indicateur: string; data: never[] } | undefined,
    unique,
    section
  ) {
    // Trouver l'objet correspondant dans valeursSourcefinancement
    const word = unique.find((value) => value.key === wordToRemove);

    if (word) {
      word.checked = false;
    }

    updateSelectedWords(array, unique, section); // Mettre à jour les mots sélectionnés
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
    storeIndicateurICSP.update((items) => {
      //@ts-ignore
      items = arrayAllIndicateursICSP;
      return items;
    });

    update = update;
  }
  async function loadData() {
    // Téléchargez votre data ici
    // Une fois la data téléchargée, masquez la barre de progression
    showProgressBar = false;
  }

  const handleInput = (data) => {
    return (filteredItems = data.filter((item) =>
      item.toLowerCase().match(inputValue.toLowerCase())
    ));
  };

  function filterBeneficiaires(beneficiaires, filteredItems) {
    return filteredItems.length === 0 || filteredItems.includes(beneficiaires.key);
  }

  // Fonction pour réinitialiser les filtres et vider les dropdowns
  function resetFilters() {
    // Réinitialiser les filtres
    arrayAllIndicateurs = { accord: [], icsp: [] };
    // Vider les dropdowns en réinitialisant les valeurs
    valeursAttribution.forEach((attribution) => (attribution.checked = false));
    valeursSecteur.forEach((secteur) => (secteur.checked = false));
    valeursDomaine.forEach((domaine) => (domaine.checked = false));
    valeursBeneficiaire.forEach((beneficiaire) => (beneficiaire.checked = false));
    valeursBeneficiaire2.forEach((beneficiaire) => (beneficiaire.checked = false));
    valeursSourcefinancement.forEach((financement) => (financement.checked = false));
    valeursPartenaires.forEach((partenaire) => (partenaire.checked = false));
    valeursDepartement.forEach((departement) => (departement.checked = false));
    valeursRegion.forEach((region) => (region.checked = false));
    valeursAvancement.forEach((avancement) => (avancement.checked = false));
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
                </svelte:fragment>
                <div class="w-full flex justify-center">
                  <Button class="bg-[#234099] w-[260px] hover:bg-[#182D73]"
                    >Sélectionner un projet<ChevronDownSolid
                      class="w-3 h-3 ms-2 text-white dark:text-white"
                    /></Button
                  >
                </div>

                <Dropdown class="w-[250px] overflow-y-auto py-1 h-48">
                  <div slot="header" class="p-3">
                    <SearchBar
                      bind:inputValue
                      on:input={handleInput(
                        jsonToItem({ valeursBeneficiaire2 }, 'valeursBeneficiaire2')
                      )}
                    />
                  </div>
                  {#each projetsUnique as projet}
                    <li class="rounded p-2 mb-0.5 hover:bg-gray-100 dark:hover:bg-gray-600">
                      {projet}
                    </li>
                  {/each}
                </Dropdown>
              </SidebarDropdownWrapper>
            </SidebarGroup>

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper  label="Selon une institution">
                <svelte:fragment slot="icon">
                  <LandmarkOutline class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
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
                      bind:inputValue
                      on:input={handleInput(
                        jsonToItem({ valeursBeneficiaire2 }, 'valeursBeneficiaire2')
                      )}
                    />
                  </div>
                  {#each appuiInstitutionnelItems as institution}
                      <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <Checkbox class="beneficiaireIcsp-checkbox">
                          {institution}
                        </Checkbox>
                      </li>
                  {/each}
                </Dropdown>
              </SidebarDropdownWrapper>
            </SidebarGroup>

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper  label="Selon un bailleur">
                <svelte:fragment slot="icon">
                  <CashOutline class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
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
                      bind:inputValue
                      on:input={handleInput(
                        jsonToItem({ valeursBeneficiaire2 }, 'valeursBeneficiaire2')
                      )}
                    />
                  </div>
                  {#each appuiBailleursItems as bailleur}
                      <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <Checkbox class="beneficiaireIcsp-checkbox">
                          {bailleur}
                        </Checkbox>
                      </li>
                  {/each}
                </Dropdown>
              </SidebarDropdownWrapper>
            </SidebarGroup>

            <SidebarGroup class={cardForSideBar}>
              <SidebarDropdownWrapper  label="Selon un bénéficiaire">
                <svelte:fragment slot="icon">
                  <UsersGroupOutline class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
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
                      bind:inputValue
                      on:input={handleInput(
                        jsonToItem({ valeursBeneficiaire2 }, 'valeursBeneficiaire2')
                      )}
                    />
                  </div>
                  {#each appuiBeneficiairesItems as beneficiaire}
                    <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Checkbox class="beneficiaireIcsp-checkbox">
                        {beneficiaire}
                      </Checkbox>
                    </li>
                  {/each}
                </Dropdown>
              </SidebarDropdownWrapper>
            </SidebarGroup>
            
        </SidebarWrapper>

        {#if arrayAllIndicateurs.accord.length > 0 || arrayAllIndicateurs.icsp.length > 0}
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
