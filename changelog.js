/* ──────────────────────────────────────────────────────────
   DispatchTrack DS — Changelog renderer
   Renderiza changelog.json dentro de #changelog-list con:
   - Filtros (componente, tipo, búsqueda)
   - Reactividad al switch de idioma (DTi18n)
   - Permalinks por versión
   ────────────────────────────────────────────────────────── */
(function () {
  const TYPE_BADGE = {
    added: 'bg',       // green
    changed: 'bb',     // blue
    deprecated: 'bo',  // orange
    removed: 'br',     // red
    fixed: 'bt',       // teal
    tokens: 'bp',      // purple
  };

  const state = {
    data: null,
    filters: { component: '', type: '', search: '' },
  };

  /* ── Helpers ── */
  const t = (k, fb) => (window.DTi18n ? window.DTi18n.t(k, fb) : fb || k);
  const lang = () => (window.DTi18n ? window.DTi18n.getLang() : 'es');

  function localizedDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(lang() === 'es' ? 'es-CL' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  /* ── Carga ── */
  async function load() {
    try {
      const res = await fetch('changelog.json');
      state.data = await res.json();
    } catch (e) {
      console.error('[changelog] No se pudo cargar changelog.json', e);
      state.data = { entries: [] };
    }
  }

  /* ── Filtros ── */
  function applyFilters(entries) {
    const { component, type, search } = state.filters;
    const q = search.trim().toLowerCase();

    return entries
      .map((entry) => {
        const filteredChanges = entry.changes.filter((c) => {
          if (component && c.component !== component) return false;
          if (type && c.type !== type) return false;
          if (q) {
            const text = (c.description[lang()] || '').toLowerCase();
            const comp = (c.component || '').toLowerCase();
            if (!text.includes(q) && !comp.includes(q)) return false;
          }
          return true;
        });
        return { ...entry, changes: filteredChanges };
      })
      .filter((e) => e.changes.length > 0);
  }

  /* ── Render ── */
  function render() {
    const list = document.getElementById('changelog-list');
    if (!list || !state.data) return;

    const filtered = applyFilters(state.data.entries);

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="cl-empty">
          <div class="cl-empty-ttl">${t('changelog.empty.title')}</div>
          <div class="cl-empty-sub">${t('changelog.empty.description')}</div>
        </div>`;
      return;
    }

    list.innerHTML = filtered.map(renderVersion).join('');
    bindCopyButtons();
  }

  function renderVersion(entry) {
    const versionBadgeClass = entry.breaking ? 'br' : 'bb';
    return `
      <article class="cl-version" id="v${entry.version}">
        <header class="cl-version-hdr">
          <span class="badge ${versionBadgeClass}">v${entry.version}</span>
          <span class="cl-date">${localizedDate(entry.date)}</span>
          ${entry.author ? `<span class="cl-author">${t('changelog.by')} ${entry.author}</span>` : ''}
          ${entry.breaking ? `<span class="cl-breaking-flag">${t('changelog.breaking')}</span>` : ''}
          <button class="cl-copy" data-version="${entry.version}" title="${t('changelog.copyLink')}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
        </header>
        <ul class="cl-changes">
          ${entry.changes.map(renderChange).join('')}
        </ul>
      </article>`;
  }

  function renderChange(change) {
    const badgeClass = TYPE_BADGE[change.type] || 'bn';
    const desc = (change.description && change.description[lang()]) || change.description?.es || '';
    return `
      <li class="cl-change">
        <span class="badge ${badgeClass} cl-type-badge">${t('type.' + change.type)}</span>
        <div class="cl-change-body">
          <span class="cl-component">${change.component}</span>
          <span class="cl-desc">${desc}</span>
        </div>
      </li>`;
  }

  /* ── Copy link ── */
  function bindCopyButtons() {
    document.querySelectorAll('.cl-copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = btn.getAttribute('data-version');
        const url = `${location.origin}${location.pathname}#v${v}`;
        navigator.clipboard.writeText(url).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = `<span style="font:600 11px var(--font-sans)">${t('changelog.copied')}</span>`;
          setTimeout(() => { btn.innerHTML = original; }, 1500);
        });
      });
    });
  }

  /* ── Filtros UI ── */
  function populateFilters() {
    if (!state.data) return;

    // Componentes únicos
    const components = [...new Set(
      state.data.entries.flatMap((e) => e.changes.map((c) => c.component))
    )].sort();

    const compSelect = document.getElementById('cl-filter-component');
    if (compSelect) {
      compSelect.innerHTML = `<option value="">${t('changelog.filter.allComponents')}</option>` +
        components.map((c) => `<option value="${c}">${c}</option>`).join('');
    }

    // Tipos (con labels traducidas)
    const types = ['added', 'changed', 'deprecated', 'removed', 'fixed', 'tokens'];
    const typeSelect = document.getElementById('cl-filter-type');
    if (typeSelect) {
      typeSelect.innerHTML = `<option value="">${t('changelog.filter.allTypes')}</option>` +
        types.map((tp) => `<option value="${tp}">${t('type.' + tp)}</option>`).join('');
    }
  }

  function bindFilters() {
    const compSelect = document.getElementById('cl-filter-component');
    const typeSelect = document.getElementById('cl-filter-type');
    const searchInput = document.getElementById('cl-filter-search');

    if (compSelect) compSelect.addEventListener('change', (e) => {
      state.filters.component = e.target.value;
      render();
    });
    if (typeSelect) typeSelect.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      render();
    });
    if (searchInput) searchInput.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      render();
    });
  }

  /* ── Init ── */
  async function init() {
    await load();

    // Esperar a que i18n esté listo si existe
    const start = () => {
      populateFilters();
      bindFilters();
      render();

      if (window.DTi18n) {
        window.DTi18n.onChange(() => {
          populateFilters();
          render();
        });
      }
    };

    if (window.DTi18n && window.DTi18n.t) {
      start();
    } else {
      setTimeout(start, 150);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
