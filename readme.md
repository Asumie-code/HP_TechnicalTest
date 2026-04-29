# HP Tech Test Project

A vanilla JavaScript UI for displaying device offers, a product selector, and a carousel-driven promotion area.

## Overview

This project renders a device selection interface and related offer content using data from `data.json`.
The page includes:

- a device preview section with image and information
- a product selector dropdown
- promotion and SKU offer sections
- a carousel with navigation controls and auto-rotation
- an event log showing recent user actions
- a sticky footer with a dynamically inserted close button

## Files

- `index.html` — main page structure and sections
- `style.css` — styles for layout, device card, carousel, footer, and interactions
- `script.js` — page logic, data loading, rendering, event handling, and carousel behavior
- `data.json` — device data, templates, and offer definitions
- `Templates/` — HTML template fragments used for rendering offers
- `wrappers/` — wrapper fragments for layout structure
- `readme.md` — project documentation

## How it works

1. `script.js` fetches `data.json` on page load.
2. The device dropdown is populated dynamically.
3. Selecting a device renders its image, warranty details, and product number.
4. Offers are inserted into wrapper sections based on template metadata.
5. The carousel rotates automatically every 5 seconds and can be manually controlled.
6. Interactions are logged in the event area.
7. The footer close button is created in JavaScript after templates load.

## Running locally

Open `index.html` in a browser or serve the project directory using a local server.

Example with Python:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- Uses vanilla JavaScript and CSS only.
- The carousel supports hover pause and infinite navigation.
- The footer close button is added dynamically after the page loads.
