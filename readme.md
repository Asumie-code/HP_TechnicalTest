# HP Offer Tiles Simulator — Technical Test

A vanilla JavaScript UI that renders device-specific offer tiles dynamically from a JSON data source, built to match the provided Figma design.

---

## Setup Instructions

No build tools or dependencies required.

### Run locally

Open `index.html` directly in a browser, or serve via a local HTTP server (required for `fetch()` to load `data.json`):

**Python:**
```bash
python -m http.server 8000
```

**Node.js (npx):**
```bash
npx serve .
```

Then open `http://localhost:8000` in your browser.

---

## Project Structure

```
├── index.html          — Page structure and section layout
├── style.css           — Styles for layout, device card, carousel, footer, and interactions
├── script.js           — Core logic: data loading, rendering, event handling, carousel
├── data.json           — Device data, offer definitions, template references, and container mappings
├── Templates/          — HTML template fragments injected per offer type
├── wrappers/           — Layout wrapper fragments for offer placement sections
├── Images/             — Local image assets used for devices and offer tiles
└── readme.md           — This file
```

---

## Rendering Approach

All UI is driven by `data.json`, which contains four main sections:

- **`devices`** — device name, serial number, warranty status, and image reference
- **`templates`** — named HTML fragments with `{{placeholder}}` tokens (e.g. `{{title}}`, `{{price}}`, `{{image}}`)
- **`offers`** — offer content (title, description, price, CTA, image) with a `template` reference and a `wrapper` (placement target)
- **`deviceOffers`** — maps each device ID to an array of offer IDs

**Rendering flow:**

1. On page load, `script.js` fetches `data.json`.
2. The device dropdown is populated dynamically from the `devices` array.
3. On device selection:
   - The device card renders image, name, serial number, and warranty status.
   - The relevant offer IDs are resolved from `deviceOffers`.
   - Each offer fetches its template, replaces `{{tokens}}` with offer content, and injects the result into the target wrapper section.
4. The carousel initialises on the promo section, auto-rotating every 5 seconds with manual navigation and hover-pause support.
5. The footer close button is created in JavaScript after templates load.

---

## Image Handling

- All images are stored locally in the `Images/` folder.
- Device and offer images are referenced by filename in `data.json` and resolved at render time.
- Images are sized and cropped via CSS (`object-fit: cover`) to match the Figma design.
- Offer tiles without a provided image fall back to a placeholder.
- Images are served as standard files — no external CDN or base64 encoding used.

---

## Event Tracking

User interactions are captured and both logged to the browser console and displayed in an on-page event log panel.

### Tracked Events

| Event | Trigger | Logged Data |
|---|---|---|
| `offer_impression` | Offer tile rendered into the DOM | Offer ID, title, device context |
| `offer_click` | User clicks CTA button on a tile | Offer ID, title, timestamp |
| `offer_focus` | Tile receives keyboard focus or enters viewport | Offer ID, focus type (keyboard / viewport) |

### Event Schema

```json
{
  "event": "offer_impression | offer_click | offer_focus",
  "offerId": "offer_1",
  "title": "Laptop Protection",
  "device": "device1",
  "timestamp": "2026-04-29T10:00:00.000Z",
  "focusType": "keyboard | viewport"
}
```

Viewport tracking uses the `IntersectionObserver` API. Keyboard focus tracking uses `focusin` event listeners attached to each tile.

---

## Potential Improvements

These are features not implemented in this exercise but identified as natural next steps for a real-world version of this simulator:

**Device management**
- Add, edit, and remove devices via an admin interface or API
- Update warranty status dynamically rather than from a static source
- Auto-clean offer mappings when a device is removed

**Offer management**
- Create and edit offers without touching the JSON directly
- Reassign offers to different templates or placement sections
- Deactivate offers without deleting them, to preserve history

**Device–Offer mapping**
- Assign or unassign offers per device through a management UI
- Control display order per device
- Support bulk assignment (e.g. push one offer to all devices at once)

**Templates & wrappers**
- Currently loaded as local HTML files from `Templates/` and `wrappers/` folders
- In production these would ideally be served remotely via an API or CDN, allowing templates to be updated or versioned independently without a code deployment

**Underlying architecture**
- Replace `data.json` with a REST API or CMS backend
- The current data structure — with devices, offers, templates, and mappings as separate objects — was intentionally designed to make this transition straightforward

---

## Assumptions & Trade-offs

- **Single JSON file:** Templates, offers, devices, and mappings are kept in one `data.json` for simplicity. In production, these would likely be separate API endpoints.
- **No framework:** Vanilla JS was chosen to keep the solution dependency-free and focused on fundamentals. A framework like React or Vue would be appropriate at scale.
- **Template injection via token replacement:** `{{placeholder}}` tokens are replaced using `String.replace()`. A real system might use a dedicated templating engine.
- **Carousel is promo-section only:** The carousel applies to the first offer section. Multiple independent carousels could be initialised if required.
- **Responsive layout:** CSS flexbox and media queries are used to adapt the layout between desktop and mobile breakpoints as per the Figma design.
