# DispatchTrack Design System — Paquete completo

Versión integrada del Design System con sistema de changelog bilingüe (ES/EN).

## Contenido

| Archivo | Rol |
|---|---|
| `dt-design-system.html` | Design System maestro, ya integrado con changelog dinámico y switch ES/EN |
| `colors_and_type.css` | Tokens de color y tipografía (importado por el HTML) |
| `changelog.json` | Fuente de verdad del log de cambios. Editar acá para agregar entradas. |
| `i18n.json` | Diccionario de traducciones (chrome del DS + labels del changelog) |
| `i18n.js` | Motor de internacionalización (switch ES/EN + persistencia) |
| `changelog.js` | Render del changelog con filtros, búsqueda y permalinks |

## Cómo usar

1. **Descomprimí el zip** manteniendo todos los archivos en la **misma carpeta**.
2. **Servilo con un server local** — `fetch()` no funciona con `file://`. Opciones:
   - `npx serve` (Node.js)
   - `python3 -m http.server` (Python)
   - Live Server (extensión de VS Code)
3. **Abrí `dt-design-system.html`** en el navegador.
4. **Probá el switch ES/EN** en el topbar (arriba derecha, antes del botón Star).
5. **Navegá al Changelog** desde el sidebar lateral izquierdo → sección "Resources" → "Changelog/Cambios".

## Features integradas

- **Switch ES/EN** en el topbar — persistencia en localStorage, default ES
- **Changelog dinámico** alimentado por `changelog.json`
- **Filtros**: búsqueda libre, filtro por componente, filtro por tipo
- **Permalinks por versión** — botón copiar enlace en cada release
- **Badge "Breaking change"** automático cuando una versión tiene `"breaking": true`
- **Empty state** cuando los filtros no matchean nada
- **Reactividad al idioma** — al cambiar ES/EN, el changelog se re-renderiza al toque

## Agregar una entrada al changelog

Editá `changelog.json` y agregá un objeto al array `changes` de la versión correspondiente, o creá un objeto de versión nuevo:

```json
{
  "version": "2.5.0",
  "date": "2026-06-01",
  "author": "Adolfo",
  "changes": [
    {
      "type": "added",
      "component": "Buttons",
      "description": {
        "es": "Nueva variante 'ghost' para acciones terciarias.",
        "en": "New 'ghost' variant for tertiary actions."
      }
    }
  ]
}
```

## Tipos disponibles

| Tipo | Cuándo usar | Color de badge |
|---|---|---|
| `added` | Componente o variante nueva | Verde |
| `changed` | Modificación de comportamiento o estilo existente | Azul |
| `deprecated` | Marcado para remoción futura, todavía funciona | Naranja |
| `removed` | Eliminado del sistema | Rojo |
| `fixed` | Bug fix | Teal |
| `tokens` | Cambio en design tokens (colores, espaciados, type) | Púrpura |

## Versionado (semver liviano)

- **Major (3.0.0):** breaking changes que rompen implementaciones existentes
- **Minor (2.5.0):** componentes o variantes nuevas, no breaking
- **Patch (2.4.1):** fixes, ajustes menores

Para marcar una versión completa como breaking: `"breaking": true` a nivel del objeto de versión.

## Internacionalizar el resto del DS

El switch ya funciona. Para que aplique a más elementos del DS, agregá `data-i18n="key"` en cualquier elemento HTML:

```html
<!-- Texto -->
<h2 data-i18n="nav.buttons">Botones</h2>

<!-- Atributos (placeholder, title, aria-label) -->
<input data-i18n-attr="placeholder:search.placeholder" placeholder="Buscar…">
```

Las keys disponibles están en `i18n.json`. Si necesitás una key nueva, agregala al diccionario con las dos traducciones.

## Workflow con Claude

Cuando trabajemos cambios al DS juntos, te entrego al final de la respuesta el bloque JSON listo para pegar en `changelog.json`. Decime "cerremos como X.Y.Z" y te armo el objeto de versión completo.
