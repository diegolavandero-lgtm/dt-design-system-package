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
    "lang.switch.es": { "es": "ES", "en": "ES" },
    "lang.switch.en": { "es": "EN", "en": "EN" },
    "lang.switch.label": { "es": "Cambiar idioma", "en": "Switch language" },

    "search.placeholder": { "es": "Buscar tokens, componentes…", "en": "Search tokens, components…" },

    "changelog.title": { "es": "Cambios", "en": "Changelog" },
    "changelog.description": { "es": "Versiones publicadas. Los cambios incompatibles se marcan en rojo.", "en": "Versioned releases. Breaking changes flagged in red." },
    "changelog.search.placeholder": { "es": "Buscar en el changelog…", "en": "Search the changelog…" },
    "changelog.filter.allComponents": { "es": "Todos los componentes", "en": "All components" },
    "changelog.filter.allTypes": { "es": "Todos los tipos", "en": "All types" },
    "changelog.empty.title": { "es": "Sin coincidencias", "en": "No matches" },
    "changelog.empty.description": { "es": "Ningún cambio coincide con los filtros actuales.", "en": "No changes match the current filters." },
    "changelog.by": { "es": "por", "en": "by" },
    "changelog.breaking": { "es": "Cambio incompatible", "en": "Breaking change" },
    "changelog.copyLink": { "es": "Copiar enlace", "en": "Copy link" },
    "changelog.copied": { "es": "¡Copiado!", "en": "Copied!" },

    "type.added": { "es": "Agregado", "en": "Added" },
    "type.changed": { "es": "Cambiado", "en": "Changed" },
    "type.deprecated": { "es": "Obsoleto", "en": "Deprecated" },
    "type.removed": { "es": "Removido", "en": "Removed" },
    "type.fixed": { "es": "Corregido", "en": "Fixed" },
    "type.tokens": { "es": "Tokens", "en": "Tokens" },

    "nav.gettingStarted": { "es": "Comenzar", "en": "Getting started" },
    "nav.readme": { "es": "Home", "en": "Home" },
    "nav.brand": { "es": "Marca y productos", "en": "Brand & products" },
    "nav.voice": { "es": "Voz y contenido", "en": "Voice & content" },
    "nav.foundations": { "es": "Fundamentos", "en": "Foundations" },
    "nav.colors": { "es": "Colores", "en": "Colors" },
    "nav.typography": { "es": "Tipografía", "en": "Typography" },
    "nav.spacing": { "es": "Espaciado", "en": "Spacing" },
    "nav.radii": { "es": "Radios", "en": "Radii" },
    "nav.shadows": { "es": "Sombras", "en": "Shadows" },
    "nav.icons": { "es": "Íconos", "en": "Icons" },
    "nav.components": { "es": "Componentes", "en": "Components" },
    "nav.buttons": { "es": "Botones", "en": "Buttons" },
    "nav.inputs": { "es": "Inputs", "en": "Inputs" },
    "nav.badges": { "es": "Badges", "en": "Badges" },
    "nav.alerts": { "es": "Alertas / Toasts", "en": "Alerts / Toasts" },
    "nav.modal": { "es": "Modal", "en": "Modal" },
    "nav.table": { "es": "Tabla", "en": "Table" },
    "nav.sidebar": { "es": "Sidebar", "en": "Sidebar" },
    "nav.topbar": { "es": "Topbar", "en": "Topbar" },
    "nav.calendar": { "es": "Calendario", "en": "Calendar" },
    "nav.mappins": { "es": "Pins de mapa", "en": "Map pins" },
    "nav.data": { "es": "Datos", "en": "Data" },
    "nav.dataviz": { "es": "Paleta data viz", "en": "Data viz palette" },
    "nav.serviceunits": { "es": "Unidades de servicio", "en": "Service units" },
    "nav.assets": { "es": "Recursos", "en": "Assets" },
    "nav.logos": { "es": "Logos", "en": "Logos" },
    "nav.resources": { "es": "Referencias", "en": "Resources" },
    "nav.figma": { "es": "Figma source", "en": "Figma source" },
    "nav.changelog": { "es": "Cambios", "en": "Changelog" },
    "nav.selection": { "es": "Controles de selección", "en": "Selection controls" },
    "nav.iconography": { "es": "Iconografía", "en": "Iconography" },
    "nav.inputs": { "es": "Inputs y formularios", "en": "Inputs & forms" },
    "nav.badges": { "es": "Badges y etiquetas", "en": "Badges & tags" },
    "nav.table": { "es": "Tablas", "en": "Tables" },
    "nav.pages": { "es": "Páginas", "en": "Pages" },
    "nav.pages.table": { "es": "Página de tabla", "en": "Table page" },

    "subnav.code": { "es": "Código", "en": "Code" },
    "subnav.issues": { "es": "Incidencias", "en": "Issues" },
    "subnav.pullRequests": { "es": "Pull requests", "en": "Pull requests" },
    "subnav.actions": { "es": "Acciones", "en": "Actions" },
    "subnav.releases": { "es": "Versiones", "en": "Releases" },

    "section.serviceunits.title": { "es": "Paleta de unidades de servicio", "en": "Service units palette" },

    "section.overview.desc": { "es": "El design system principal de DispatchTrack — la plataforma logística usada globalmente y en LATAM para entrega de última milla, planificación de rutas y despacho de comercio on-demand. Todas las decisiones visuales, tipográficas, de color y de componentes viven aquí.", "en": "The master design system for DispatchTrack — the logistics platform used globally and in LATAM for last-mile delivery, route-planning, and on-demand commerce dispatch. All visual, typographic, color, and component decisions live here." },
    "section.brand.desc": { "es": "Cuatro productos comparten la misma estructura — topbar Indigo, primario cobalto — diferenciados solo por el logotipo del producto y los tratamientos de acento.", "en": "Four products share the same shell — Indigo topbar, cobalt primary — distinguished only by the product wordmark and product-accent treatments." },
    "section.voice.desc": { "es": "Operacional, directo, bilingüe (ES/EN), producto primero. Para despachadores, gestores de flota y conductores — no para consumidores.", "en": "Operational, direct, bilingual (ES/EN), product-first. For dispatchers, fleet managers, and drivers — not consumers." },
    "section.colors.desc": { "es": "Una superficie oscura (Indigo, solo topbar). Dos superficies apiladas (página N2 · tarjeta blanca). Primario cobalto. Cuatro intenciones semánticas. El color nunca es decoración — cada tono tiene un rol.", "en": "One dark surface (Indigo, topbar only). Two surfaces stacked under it (N2 page · white card). Cobalt primary. Four semantic intents. Color is never decoration — every hue carries a role." },
    "section.typography.desc": { "es": "DM Sans para el 100% de la UI del producto. Roboto Medium está reservado solo para títulos de display internos del DS — nunca se usa en producción.", "en": "DM Sans for 100% of the product UI. Roboto Medium is reserved for DS-internal display titles only — never ships in production." },
    "section.spacing.desc": { "es": "Grilla de 4px. 10 pasos de 4px a 64px. Separación entre secciones 48px, grupos de producto 56px, segmentos de topbar 64px.", "en": "4px grid. 10 steps from 4px to 64px. Section gaps 48px, product groups 56px, topbar segments 64px." },
    "section.radii.desc": { "es": "5 valores. Botones 6px, inputs/tarjetas 8px, pills 999px. Uno especial: el slot del logo de empresa en el topbar es 20px solo en la esquina superior izquierda.", "en": "5 stops. Buttons 6px, inputs/cards 8px, pills 999px. One special: the topbar company-logo slot is 20px on top-left only." },
    "section.shadows.desc": { "es": "Restringidas — la app usa principalmente bordes, no elevación. Sin sombras interiores, sin neumorfismo.", "en": "Restrained — the app is mostly borders, not elevation. No inner shadows, no neumorphism." },
    "section.iconography.desc": { "es": "Set de iconos de trazo 24×24. ~1.5px de trazo, extremos redondeados, monocromático, recoloreado via currentColor. Lucide se usa como la alternativa open-source más cercana al set propietario de DT.", "en": "Single 24×24 stroke icon set. ~1.5px stroke, rounded caps, monochrome, recolored via currentColor. Lucide is used here as the closest open-source match for the proprietary DT icon set." },
    "section.buttons.desc": { "es": "Forma de píldora (999px), Bold 14px. Un primario por vista. Las acciones destructivas siempre usan intent=danger.", "en": "Pill-shaped (999px), Bold 14px. One primary per view. Destructive actions always use intent=danger." },
    "section.inputs.desc": { "es": "Usar siempre inputs con etiqueta en formularios; input sin borde solo en tablas. La validación es semántica — sin colores de error personalizados.", "en": "Always use labeled inputs in forms; borderless input only in tables. Validation is semantic — no custom error colors." },
    "section.selection.desc": { "es": "Checkbox, radio y switch. Cada uno tiene un estado activado claro en azul primario. Actívalo haciendo clic en el switch de abajo.", "en": "Checkbox, radio, and switch. Each has a clear \"on\" filled state in primary blue. Toggle by clicking the switch below." },
    "section.badges.desc": { "es": "Forma de píldora, 11px semibold. Los badges de estado llevan un punto cuando el estado es activo. Los chips con avatares hacen referencia a usuarios o productos.", "en": "Pill-shaped, 11px semibold. Status badges carry a dot when the state is live. Chips with avatars reference users or products." },
    "section.banners.desc": { "es": "Borde izquierdo de 3px + fondo con tinte. Cuatro intenciones mapeadas 1:1 a colores semánticos.", "en": "3px left border + tinted background. Four intents map 1:1 to semantic colors." },
    "section.calendar.desc": { "es": "Fecha única o rango. Seleccionado = relleno primario; rango medio = fondo B1; los extremos permanecen sólidos.", "en": "Single date or range. Selected = primary fill; range middle = B1 background; endpoints remain solid." },
    "section.modal.desc": { "es": "Título 22/28 Bold, X de cierre arriba a la derecha, banner de advertencia opcional, pie con secundario + primario. Overlay rgba(19,32,69,.45).", "en": "Title 22/28 Bold, close X top-right, optional warning banner, footer with secondary + primary. Overlay rgba(19,32,69,.45)." },
    "section.table.desc": { "es": "Encabezado con fondo N2, filas blancas. Hover → N2, seleccionada → B1 con franja de color de Unidad de Servicio a la izquierda.", "en": "Header N2 bg, rows white. Hover → N2, selected → B1 with a Service Unit color stripe on the left." },
    "section.sidebar.desc": { "es": "Colapsado 56px / expandido 232px. Color de texto+ícono del ítem es B7 (#0052CC). Seleccionado: fondo B1 + marcador izquierdo B5 de 3px. El sidebar de Ajustes permanece abierto en Ajustes.", "en": "Collapsed 56px / expanded 232px. Item text+icon color is B7 (#0052CC). Selected: B1 bg + 3px B5 left marker. Settings sidebar stays open when in Settings." },
    "section.topbar.desc": { "es": "Siempre 52px, siempre Indigo #132045. Logo del producto a la izquierda · iconos de acción a la derecha (separación 28px escritorio / 12px móvil) · slot blanco de empresa al extremo derecho (border-radius 20px 0 0 0).", "en": "Always 52px, always Indigo #132045. Product logo left · action icons right (gap 28px desktop / 12px mobile) · company white slot far-right (border-radius 20px 0 0 0)." },
    "section.mappins.desc": { "es": "Forma de lágrima con viewBox 100×130. Asignado (#0C47C7) vs sin asignar (#8FA0BA). Seleccionado cambia la sombra difusa por una elipse oscura. Badge = círculo B5 arriba a la derecha con borde blanco.", "en": "Teardrop shape with 100×130 viewBox. Assigned (#0C47C7) vs unassigned (#8FA0BA). Selected swaps soft blur shadow for a hard dark ellipse. Badge = B5 circle top-right with white border." },
    "section.dataviz.desc": { "es": "11 colores ordenados para gráficos. Asignar estrictamente de 1→11. Nunca saltar ni reutilizar fuera de orden.", "en": "11 ordered colors for charts. Assign strictly 1→11. Never skip or reuse out of sequence." },
    "section.serviceunits.desc": { "es": "10 colores de identificación ordenados para Unidades de Servicio de flota. Ciclar cuando el conteo supera 10.", "en": "10 ordered identification colors for fleet Service Units. Cycle when count exceeds 10." },
    "section.logos.desc": { "es": "Cada producto tiene versiones de escritorio y móvil, en color (sobre claro) y blanca (sobre Indigo oscuro). Haz clic en Descargar para copiar el SVG.", "en": "Each product has desktop and mobile lockups, in color (on light) and white (on dark Indigo). Click Download to copy the SVG." },
    "section.figma.desc": { "es": "La fuente de diseño canónica mantenida por el equipo UX de DispatchTrack. Todas las decisiones anteriores a este repositorio se originan aquí.", "en": "The canonical design source maintained by the DispatchTrack UX team. All decisions upstream of this repo originate here." }
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
