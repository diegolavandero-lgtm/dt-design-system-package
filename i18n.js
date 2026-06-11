/* ──────────────────────────────────────────────────────────
   DispatchTrack DS — i18n engine
   Maneja el switch ES/EN y persiste la preferencia en localStorage.
   Uso en HTML: agregar data-i18n="key" en cualquier elemento.
   ────────────────────────────────────────────────────────── */
(function () {
  const STORAGE_KEY = 'dt-ds-lang';
  const DEFAULT_LANG = 'es';

  const state = {
    lang: DEFAULT_LANG,
    dict: null,
    listeners: [],
  };

  /* ── Diccionario embebido (evita fetch para compatibilidad con file://) ── */
  const DICT = {
    /* ── Idioma ── */
    "lang.switch.es":    { "es": "ES", "en": "ES" },
    "lang.switch.en":    { "es": "EN", "en": "EN" },
    "lang.switch.label": { "es": "Cambiar idioma", "en": "Switch language" },

    /* ── Búsqueda ── */
    "search.placeholder": { "es": "Buscar tokens, componentes…", "en": "Search tokens, components…" },

    /* ── Pestañas del DS (Escritorio / App móvil) ── */
    "tabs.desktop": { "es": "Escritorio", "en": "Desktop" },
    "tabs.mobile":  { "es": "App móvil", "en": "Mobile app" },
    "nav.mobile":   { "es": "App móvil — Drivers", "en": "Mobile app — Drivers" },
    "nav.mobile.overview": { "es": "Introducción", "en": "Overview" },
    "nav.mobile.components": { "es": "Componentes móviles", "en": "Mobile components" },
    "nav.mobile.topbar": { "es": "Top app bar", "en": "Top app bar" },
    "section.mobile.topbar.desc": { "es": "Barra superior de la app móvil de conductores. Contiene el acceso al menú lateral, el logo del producto y la acción de sincronización. Bajo la barra pueden anclarse el navegador de fecha y el selector de punto de retiro.", "en": "Top bar of the drivers mobile app. It holds the side menu trigger, the product logo and the sync action. The date navigator and pickup point selector can be anchored below it." },
    "nav.mobile.nav": { "es": "Menú lateral", "en": "Nav drawer" },
    "section.mobile.nav.desc": { "es": "Drawer de navegación de la app de conductores. Se abre desde el menú hamburguesa del top app bar. Su contenido cambia según el estado de la ruta: sin ruta iniciada ofrece acciones de ruta; con ruta activa ofrece acciones de operación y el cierre de ruta.", "en": "Navigation drawer of the drivers app. It opens from the hamburger menu in the top app bar. Its content changes with route state: with no route started it offers route actions; with an active route it offers operation actions and route closing." },
    "nav.mobile.buttons": { "es": "Botones", "en": "Buttons" },
    "section.mobile.buttons.desc": { "es": "Botones de la app móvil de conductores. Conservan la forma pill del DS de escritorio pero crecen a 40dp de alto para cumplir el target táctil. Cuatro variantes (primario, secundario, ghost y danger) más botones de icono circulares y chips de acción rápida.", "en": "Buttons for the drivers mobile app. They keep the desktop DS pill shape but grow to 40dp height to meet touch targets. Four variants (primary, secondary, ghost and danger) plus circular icon buttons and quick action chips." },
    "nav.mobile.inputs": { "es": "Inputs", "en": "Inputs" },
    "section.mobile.inputs.desc": { "es": "Campos de entrada de la app móvil. Heredan los tokens del input de escritorio (radio 6px, focus azul con fondo claro) con alto 44dp para uso táctil. Incluyen la barra de búsqueda con escáner, el PIN de verificación, los steppers de cantidad y el dropdown móvil.", "en": "Input fields of the mobile app. They inherit the desktop input tokens (6px radius, blue focus with light fill) at 44dp height for touch use. They include the search bar with scanner, the verification PIN, quantity steppers and the mobile dropdown." },
    "nav.mobile.cards": { "es": "Cards", "en": "Cards" },
    "section.mobile.cards.desc": { "es": "Tarjetas de la app móvil. Son la unidad base de la operación: cada orden, ruta, ítem y agrupación se representa con una card. Comparten fondo blanco, radio 8px, borde var(--n3) y la pastilla de pin numerado. Sus estados comunican el resultado de la gestión mediante color.", "en": "Mobile app cards. They are the base unit of operation: every order, route, item and group is rendered as a card. They share a white background, 8px radius, var(--n3) border and the numbered pin pill. Their states communicate management results through color." },
    "nav.mobile.lists": { "es": "Listas y filtros", "en": "Lists & filters" },
    "section.mobile.lists.desc": { "es": "Estructura de las listas de órdenes dentro del bottom sheet de ruta. Define las pestañas En ruta / Terminadas, los chips de grupo y de filtro de estado, los separadores de sección, los estados vacíos y las etiquetas de sincronización por orden.", "en": "Structure of the order lists inside the route bottom sheet. It defines the En route / Done tabs, group and status filter chips, section dividers, empty states and per-order sync labels." },
    "section.mobile.overview.desc": { "es": "Design system de la app móvil de conductores DispatchTrack (iOS y Android). Reutiliza los tokens del DS de escritorio — colores, tipografía DM Sans, radios y sombras — y define los componentes nativos propios de la app: navegación, gestión de órdenes, pruebas de entrega, mapas y recaudo.", "en": "Design system for the DispatchTrack drivers mobile app (iOS and Android). It reuses the desktop DS tokens — colors, DM Sans typography, radii and shadows — and defines the app's native components: navigation, order management, proof of delivery, maps and cash collection." },

    /* ── Changelog ── */
    "changelog.title":                  { "es": "Cambios",                                              "en": "Changelog" },
    "changelog.description":            { "es": "Versiones publicadas. Los cambios incompatibles se marcan en rojo.", "en": "Versioned releases. Breaking changes flagged in red." },
    "changelog.search.placeholder":     { "es": "Buscar en el changelog…",                              "en": "Search the changelog…" },
    "changelog.filter.allComponents":   { "es": "Todos los componentes",                                "en": "All components" },
    "changelog.filter.allTypes":        { "es": "Todos los tipos",                                      "en": "All types" },
    "changelog.empty.title":            { "es": "Sin coincidencias",                                    "en": "No matches" },
    "changelog.empty.description":      { "es": "Ningún cambio coincide con los filtros actuales.",     "en": "No changes match the current filters." },
    "changelog.by":                     { "es": "por",                                                  "en": "by" },
    "changelog.breaking":               { "es": "Cambio incompatible",                                  "en": "Breaking change" },
    "changelog.copyLink":               { "es": "Copiar enlace",                                        "en": "Copy link" },
    "changelog.copied":                 { "es": "¡Copiado!",                                            "en": "Copied!" },

    /* ── Tipos de cambio ── */
    "type.added":      { "es": "Agregado",   "en": "Added" },
    "type.changed":    { "es": "Cambiado",   "en": "Changed" },
    "type.deprecated": { "es": "Obsoleto",   "en": "Deprecated" },
    "type.removed":    { "es": "Removido",   "en": "Removed" },
    "type.fixed":      { "es": "Corregido",  "en": "Fixed" },
    "type.tokens":     { "es": "Tokens",     "en": "Tokens" },

    /* ── UI general ── */
    "ui.copy":              { "es": "Copiar",                 "en": "Copy" },
    "ui.copied":            { "es": "¡Copiado!",              "en": "Copied!" },
    "ui.loading":           { "es": "Cargando…",              "en": "Loading…" },
    "ui.cancel":            { "es": "Cancelar",               "en": "Cancel" },
    "ui.save":              { "es": "Guardar",                 "en": "Save" },
    "ui.chooseFile":        { "es": "Elegir archivo",          "en": "Choose File" },
    "ui.noFileChosen":      { "es": "Sin archivo seleccionado","en": "No file chosen" },
    "ui.download":          { "es": "Descargar",               "en": "Download" },
    "ui.downloadAll":       { "es": "Descargar todos como ZIP","en": "Download all as ZIP" },
    "ui.error.loading":     { "es": "Error al cargar la sección", "en": "Error loading section" },
    "ui.nav.empty":         { "es": "Sin coincidencias",       "en": "No matches" },
    "ui.search.empty":      { "es": "Sin resultados para",     "en": "No results for" },
    "ui.blocks.group":      { "es": "Bloques",                 "en": "Blocks" },
    "ui.confirm.approval":  { "es": "Confirmar aprobación",    "en": "Confirm approval" },
    "ui.howToCall":         { "es": "Cómo llamar en páginas",  "en": "How to call in pages" },
    "ui.standardSidebar":   { "es": "Sidebar estándar",        "en": "Standard sidebar" },
    "ui.settingsSidebar":   { "es": "Sidebar de ajustes",      "en": "Settings sidebar" },
    "ui.settingsSidebarDesc":{ "es": "Misma tabla — panel de ajustes empuja el contenido a la derecha.", "en": "Same table — settings panel pushes content to the right." },
    "ui.pageShell":         { "es": "Estructura de página",    "en": "Page shell" },
    "ui.pageShellDesc":     { "es": "Cada página de formulario usa la misma estructura: <strong>Topbar</strong> → <strong>Sidebar</strong> → área de contenido con breadcrumb, ← atrás + título + botones <em>Cancelar/Guardar</em>, nota de campo requerido y bloques apilados.", "en": "Every form page uses the same shell: <strong>Topbar</strong> → <strong>Sidebar</strong> → content area with breadcrumb, ← back + title + <em>Cancel/Save</em> buttons, required field note, and a vertical stack of blocks." },
    "ui.blockCatalog":      { "es": "Catálogo de bloques",     "en": "Block catalog" },
    "ui.blockCatalogDesc":  { "es": "Compone cualquier formulario apilando bloques. Cada bloque es una tarjeta blanca.", "en": "Compose any form by stacking blocks. Every block is a white card." },
    "ui.drafts.empty.title":{ "es": "Sin borradores",          "en": "No draft components" },
    "ui.drafts.empty.desc": { "es": "Cuando se proponga un nuevo componente, aparecerá aquí para revisión.", "en": "When a new component is proposed, it will appear here for review." },
    "ui.settings.mode":     { "es": "Modo ajustes — el panel empuja el contenido a la derecha", "en": "Settings mode — panel pushes content right" },

    /* ── Estado de badges en nav ── */
    "status.live":  { "es": "En producción", "en": "Live" },
    "status.ready": { "es": "Listo para dev","en": "Dev ready" },
    "status.wip":   { "es": "En progreso",   "en": "WIP" },

    /* ── Nav grupos ── */
    "nav.gettingStarted": { "es": "Comenzar",            "en": "Getting started" },
    "nav.foundations":    { "es": "Fundamentos",          "en": "Foundations" },
    "nav.components":     { "es": "Componentes",          "en": "Components" },
    "nav.pages":          { "es": "Páginas",              "en": "Pages" },
    "nav.patterns":       { "es": "Patrones",             "en": "Patterns" },
    "nav.data":           { "es": "Datos",                "en": "Data" },
    "nav.assets":         { "es": "Recursos",             "en": "Assets" },
    "nav.resources":      { "es": "Referencias",          "en": "Resources" },
    "nav.backlog":        { "es": "Pendientes",           "en": "Backlog" },
    "nav.drafts":         { "es": "Borradores",           "en": "Drafts" },

    /* ── Nav ítems ── */
    "nav.readme":          { "es": "Home",                     "en": "Home" },
    "nav.changelog":       { "es": "Cambios",                  "en": "Changelog" },
    "nav.brand":           { "es": "Marca y productos",        "en": "Brand & products" },
    "nav.voice":           { "es": "Voz y contenido",          "en": "Voice & content" },
    "nav.colors":          { "es": "Colores",                  "en": "Colors" },
    "nav.typography":      { "es": "Tipografía",               "en": "Typography" },
    "nav.spacing":         { "es": "Espaciado",                "en": "Spacing" },
    "nav.radii":           { "es": "Radios",                   "en": "Radii" },
    "nav.shadows":         { "es": "Sombras",                  "en": "Shadows" },
    "nav.iconography":     { "es": "Iconografía",              "en": "Iconography" },
    "nav.buttons":         { "es": "Botones",                  "en": "Buttons" },
    "nav.inputs":          { "es": "Inputs y formularios",     "en": "Inputs & forms" },
    "nav.tooltip":         { "es": "Tooltip",                  "en": "Tooltip" },
    "nav.selection":       { "es": "Controles de selección",   "en": "Selection controls" },
    "nav.imageUploader":   { "es": "Cargador de imágenes",     "en": "Image uploader" },
    "nav.chips":           { "es": "Pills / Tags",             "en": "Pills / Tags" },
    "nav.alerts":          { "es": "Alertas / Toasts",         "en": "Alerts / Toasts" },
    "nav.modal":           { "es": "Modal",                    "en": "Modal" },
    "nav.table":           { "es": "Tablas",                   "en": "Tables" },
    "nav.sidebar":         { "es": "Sidebar",                  "en": "Sidebar" },
    "nav.topbar":          { "es": "Topbar",                   "en": "Topbar" },
    "nav.filters":         { "es": "Filtros",                  "en": "Filters" },
    "nav.mappins":         { "es": "Pins de mapa",             "en": "Map pins" },
    "nav.badges":          { "es": "Badges y etiquetas",       "en": "Badges & tags" },
    "nav.dropdowns":       { "es": "Dropdowns",                "en": "Dropdowns" },
    "nav.dataviz":         { "es": "Paleta data viz",          "en": "Data viz palette" },
    "nav.serviceunits":    { "es": "Unidades de servicio",     "en": "Service units" },
    "nav.logos":           { "es": "Logos",                    "en": "Logos" },
    "nav.figma":           { "es": "Figma source",             "en": "Figma source" },
    "nav.pages.table":     { "es": "Página de tabla",          "en": "Table page" },
    "nav.pages.form":      { "es": "Página de formulario",     "en": "Form page" },
    "nav.screenExamples":  { "es": "Ejemplos de pantalla",     "en": "Screen examples" },
    "nav.backlog.items":   { "es": "Componentes planificados", "en": "Planned components" },
    "nav.drafts.components":{ "es": "Componentes en borrador", "en": "Draft components" },

    /* ── Descripciones de sección ── */
    "section.overview.desc":     { "es": "El design system principal de DispatchTrack — la plataforma logística usada globalmente y en LATAM para entrega de última milla, planificación de rutas y despacho de comercio on-demand. Todas las decisiones visuales, tipográficas, de color y de componentes viven aquí.", "en": "The master design system for DispatchTrack — the logistics platform used globally and in LATAM for last-mile delivery, route-planning, and on-demand commerce dispatch. All visual, typographic, color, and component decisions live here." },
    "section.brand.desc":        { "es": "Cuatro productos comparten la misma estructura — topbar Indigo, primario cobalto — diferenciados solo por el logotipo del producto y los tratamientos de acento.", "en": "Four products share the same shell — Indigo topbar, cobalt primary — distinguished only by the product wordmark and product-accent treatments." },
    "section.voice.desc":        { "es": "Operacional, directo, bilingüe (ES/EN), producto primero. Para despachadores, gestores de flota y conductores — no para consumidores.", "en": "Operational, direct, bilingual (ES/EN), product-first. For dispatchers, fleet managers, and drivers — not consumers." },
    "section.colors.desc":       { "es": "Una superficie oscura (Indigo, solo topbar). Dos superficies apiladas (página N2 · tarjeta blanca). Primario cobalto. Cuatro intenciones semánticas. El color nunca es decoración — cada tono tiene un rol.", "en": "One dark surface (Indigo, topbar only). Two surfaces stacked under it (N2 page · white card). Cobalt primary. Four semantic intents. Color is never decoration — every hue carries a role." },
    "section.typography.desc":   { "es": "DM Sans para el 100% de la UI del producto. Roboto Medium está reservado solo para títulos de display internos del DS — nunca se usa en producción.", "en": "DM Sans for 100% of the product UI. Roboto Medium is reserved for DS-internal display titles only — never ships in production." },
    "section.spacing.desc":      { "es": "Grilla de 4px. 10 pasos de 4px a 64px. Separación entre secciones 48px, grupos de producto 56px, segmentos de topbar 64px.", "en": "4px grid. 10 steps from 4px to 64px. Section gaps 48px, product groups 56px, topbar segments 64px." },
    "section.radii.desc":        { "es": "5 valores. Botones 6px, inputs/tarjetas 8px, pills 999px. Uno especial: el slot del logo de empresa en el topbar es 20px solo en la esquina superior izquierda.", "en": "5 stops. Buttons 6px, inputs/cards 8px, pills 999px. One special: the topbar company-logo slot is 20px on top-left only." },
    "section.shadows.desc":      { "es": "Restringidas — la app usa principalmente bordes, no elevación. Sin sombras interiores, sin neumorfismo.", "en": "Restrained — the app is mostly borders, not elevation. No inner shadows, no neumorphism." },
    "section.iconography.desc":  { "es": "Set de iconos de trazo 24×24. ~1.5px de trazo, extremos redondeados, monocromático, recoloreado via currentColor. Lucide se usa como la alternativa open-source más cercana al set propietario de DT.", "en": "Single 24×24 stroke icon set. ~1.5px stroke, rounded caps, monochrome, recolored via currentColor. Lucide is used here as the closest open-source match for the proprietary DT icon set." },
    "section.buttons.desc":      { "es": "Forma de píldora (999px), Bold 14px. Un primario por vista. Las acciones destructivas siempre usan intent=danger.", "en": "Pill-shaped (999px), Bold 14px. One primary per view. Destructive actions always use intent=danger." },
    "section.inputs.desc":       { "es": "Usar siempre inputs con etiqueta en formularios; input sin borde solo en tablas. La validación es semántica — sin colores de error personalizados.", "en": "Always use labeled inputs in forms; borderless input only in tables. Validation is semantic — no custom error colors." },
    "section.tooltip.desc":      { "es": "Tooltip de texto simple. Se activa al pasar el cursor. Máximo 2 líneas — para instrucciones largas usar un modal.", "en": "Plain text tooltip. Triggers on hover. Max 2 lines — use a modal for longer instructions." },
    "section.selection.desc":    { "es": "Checkbox, radio y switch. Cada uno tiene un estado activado claro en azul primario. Actívalo haciendo clic en el switch de abajo.", "en": "Checkbox, radio, and switch. Each has a clear on state in primary blue. Toggle by clicking the switch below." },
    "section.imageUploader.desc":{ "es": "Cargador de archivos con toggle opcional, etiqueta y selector de archivo.", "en": "File uploader with optional toggle, label and file picker." },
    "section.chips.desc":        { "es": "Forma de píldora, 11px semibold. Los badges de estado llevan un punto cuando el estado es activo.", "en": "Pill-shaped, 11px semibold. Status badges carry a dot when the state is live." },
    "section.alerts.desc":       { "es": "Borde izquierdo de 3px + fondo con tinte. Cuatro intenciones mapeadas 1:1 a colores semánticos.", "en": "3px left border + tinted background. Four intents map 1:1 to semantic colors." },
    "section.modal.desc":        { "es": "Título 22/28 Bold, X de cierre arriba a la derecha, banner de advertencia opcional, pie con secundario + primario. Overlay rgba(19,32,69,.45).", "en": "Title 22/28 Bold, close X top-right, optional warning banner, footer with secondary + primary. Overlay rgba(19,32,69,.45)." },
    "section.table.desc":        { "es": "Encabezado con fondo N2, filas blancas. Hover → N2, seleccionada → B1 con franja de color de Unidad de Servicio a la izquierda.", "en": "Header N2 bg, rows white. Hover → N2, selected → B1 with a Service Unit color stripe on the left." },
    "section.sidebar.desc":      { "es": "Colapsado 56px / expandido 232px. Color de texto+ícono del ítem es B7 (#0052CC). Seleccionado: fondo B1 + marcador izquierdo B5 de 3px. El sidebar de Ajustes permanece abierto en Ajustes.", "en": "Collapsed 56px / expanded 232px. Item text+icon color is B7 (#0052CC). Selected: B1 bg + 3px B5 left marker. Settings sidebar stays open when in Settings." },
    "section.topbar.desc":       { "es": "Siempre 52px, siempre Indigo #132045. Logo del producto a la izquierda · iconos de acción a la derecha · slot blanco de empresa al extremo derecho.", "en": "Always 52px, always Indigo #132045. Product logo left · action icons right · company white slot far-right." },
    "section.filters.desc":      { "es": "Barra de filtros estándar. Inputs DS sin etiqueta, botón secundario Filtrar, y dos botones de ícono.", "en": "Standard filter bar. DS inputs without labels, secondary Filter button, and two icon buttons." },
    "section.mappins.desc":      { "es": "Forma de lágrima con viewBox 100×130. Asignado vs sin asignar. Seleccionado cambia la sombra difusa por una elipse oscura.", "en": "Teardrop shape with 100×130 viewBox. Assigned vs unassigned. Selected swaps soft shadow for a hard dark ellipse." },
    "section.badges.desc":       { "es": "Forma de píldora, 11px semibold. Los chips con avatares hacen referencia a usuarios o productos.", "en": "Pill-shaped, 11px semibold. Chips with avatars reference users or products." },
    "section.dataviz.desc":      { "es": "11 colores ordenados para gráficos. Asignar estrictamente de 1→11. Nunca saltar ni reutilizar fuera de orden.", "en": "11 ordered colors for charts. Assign strictly 1→11. Never skip or reuse out of sequence." },
    "section.serviceunits.desc": { "es": "10 colores de identificación ordenados para Unidades de Servicio de flota. Ciclar cuando el conteo supera 10.", "en": "10 ordered identification colors for fleet Service Units. Cycle when count exceeds 10." },
    "section.logos.desc":        { "es": "Cada producto tiene versiones de escritorio y móvil, en color y blanca. Haz clic en Descargar para copiar el SVG.", "en": "Each product has desktop and mobile lockups, in color and white. Click Download to copy the SVG." },
    "section.figma.desc":        { "es": "La fuente de diseño canónica mantenida por el equipo UX de DispatchTrack. Todas las decisiones anteriores a este repositorio se originan aquí.", "en": "The canonical design source maintained by the DispatchTrack UX team. All decisions upstream of this repo originate here." },
    "section.pages.table.desc":  { "es": "Plantilla de página completa para vistas de lista. Construida con Topbar LM, Sidebar colapsado de 52px, barra de filtros, tabla de datos y paginación. Solo usa componentes y tokens del DS.", "en": "Full-page template for list views. Built with LM Topbar, collapsed 52px Sidebar, filter bar, data table, and pagination. Use only DS components and tokens." },
    "section.pages.form.desc":   { "es": "Plantilla para formularios de creación y edición. Compuesta por bloques reutilizables apilados verticalmente dentro del shell de página.", "en": "Template for create and edit forms. Composed from reusable blocks arranged vertically inside the page shell." },
    "section.serviceunits.title":{ "es": "Paleta de unidades de servicio", "en": "Service units palette" }
  };

  /* ── Lookup ── */
  function t(key, fallback) {
    if (!state.dict || !state.dict[key]) return fallback || key;
    return state.dict[key][state.lang] || state.dict[key][DEFAULT_LANG] || fallback || key;
  }

  /* ── Aplicar al DOM ── */
  function apply(root = document) {
    if (!state.dict) return;

    // Texto: data-i18n="key"
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

    // Atributos: data-i18n-attr="placeholder:key,title:key2"
    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const map = el.getAttribute('data-i18n-attr');
      map.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    document.documentElement.lang = state.lang;
  }

  /* ── Switch ── */
  function setLang(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    state.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    apply();
    syncSwitch();
    state.listeners.forEach((fn) => fn(lang));
  }

  function getLang() {
    return state.lang;
  }

  function onChange(fn) {
    state.listeners.push(fn);
  }

  /* ── UI del switch ── */
  function syncSwitch() {
    document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
      const isActive = btn.getAttribute('data-lang') === state.lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function bindSwitch() {
    document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
    });
    syncSwitch();
  }

  /* ── Init ── */
  function init() {
    // Idioma inicial: localStorage > default ES
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'es' || saved === 'en') state.lang = saved;
    } catch (e) {}

    state.dict = DICT;
    apply();
    bindSwitch();
  }

  // Expose
  window.DTi18n = { init, setLang, getLang, t, apply, onChange };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
