<script>
  import {
    Sidebar,
    SidebarWrapper,
    SidebarBrand,
    SidebarItem,
    SidebarGroup,
    SidebarDropdownWrapper,
    SidebarDropdownItem
  } from 'flowbite-svelte';
  import {
    ChartPieSolid,
    GridSolid,
    MailBoxSolid,
    UserSolid,
    ArrowRightToBracketSolid,
    FileEditSolid,
    ChevronDoubleUpOutline,
    FolderOutline,
    ShoppingCartSolid,
    SwatchbookOutline,
    LandmarkOutline,
    ChevronDoubleDownOutline,
    DollarOutline,
    UsersGroupOutline
  } from 'flowbite-svelte-icons';
  let spanClass = 'flex-1 ms-3 whitespace-nowrap';

  let site = {
    name: '',
    href: '/',
    img: '/logo-plateforme.jpg'
  };
  let enlargedImgClass = 'h-30; ps-0'; // Augmente la taille de l'image
</script>

<Sidebar class="absolute z-10">
  <SidebarWrapper>
    <SidebarGroup>
      <SidebarBrand {site} imgClass={enlargedImgClass} />

      <SidebarDropdownWrapper label="Recherche par projet">
        <svelte:fragment slot="icon">
          <FolderOutline
            class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <svelte:fragment slot="arrowup">
          <ChevronDoubleUpOutline class="w-3 h-3" />
        </svelte:fragment>
        <svelte:fragment slot="arrowdown">
          <ChevronDoubleDownOutline class="w-3 h-3" />
        </svelte:fragment>
        <!--         <SidebarDropdownItem label="Products" />
        <SidebarDropdownItem label="Billing" />
        <SidebarDropdownItem label="Invoice" /> -->
      </SidebarDropdownWrapper>

      <SidebarDropdownWrapper label="Recherche par thème">
        <svelte:fragment slot="icon">
          <SwatchbookOutline
            class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <svelte:fragment slot="arrowup">
          <ChevronDoubleUpOutline class="w-3 h-3" />
        </svelte:fragment>
        <svelte:fragment slot="arrowdown">
          <ChevronDoubleDownOutline class="w-3 h-3" />
        </svelte:fragment>
        <!--         <SidebarDropdownItem label="Products" />
        <SidebarDropdownItem label="Billing" />
        <SidebarDropdownItem label="Invoice" /> -->
      </SidebarDropdownWrapper>

      <SidebarDropdownWrapper label="Recherche par institution">
        <svelte:fragment slot="icon">
          <LandmarkOutline
            class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <svelte:fragment slot="arrowup">
          <ChevronDoubleUpOutline class="w-3 h-3" />
        </svelte:fragment>
        <svelte:fragment slot="arrowdown">
          <ChevronDoubleDownOutline class="w-3 h-3" />
        </svelte:fragment>
        <!--         <SidebarDropdownItem label="Products" />
        <SidebarDropdownItem label="Billing" />
        <SidebarDropdownItem label="Invoice" /> -->
      </SidebarDropdownWrapper>

      <SidebarDropdownWrapper label="Recherche par bailleur">
        <svelte:fragment slot="icon">
          <DollarOutline
            class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <svelte:fragment slot="arrowup">
          <ChevronDoubleUpOutline class="w-3 h-3" />
        </svelte:fragment>
        <svelte:fragment slot="arrowdown">
          <ChevronDoubleDownOutline class="w-3 h-3" />
        </svelte:fragment>
        <!--         <SidebarDropdownItem label="Products" />
        <SidebarDropdownItem label="Billing" />
        <SidebarDropdownItem label="Invoice" /> -->
      </SidebarDropdownWrapper>

      <SidebarDropdownWrapper label="Recherche par bénéficiaire">
        <svelte:fragment slot="icon">
          <UsersGroupOutline
            class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <svelte:fragment slot="arrowup">
          <ChevronDoubleUpOutline class="w-3 h-3" />
        </svelte:fragment>
        <svelte:fragment slot="arrowdown">
          <ChevronDoubleDownOutline class="w-3 h-3" />
        </svelte:fragment>
        <!--         <SidebarDropdownItem label="Products" />
        <SidebarDropdownItem label="Billing" />
        <SidebarDropdownItem label="Invoice" /> -->
      </SidebarDropdownWrapper>
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
