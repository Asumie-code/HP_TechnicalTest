// global variables
let appData = {};
let currentDevice = null;

/**
 * Entry point of the application.
 * Runs init() after the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", init);

/**
 * Initializes the application on DOM load.
 * - Fetches data.json
 * - Stores data in global state
 * - Renders initial UI
 * - Starts carousel
 * - Attaches dropdown change listener
 */
function init() {
  fetch("data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load data.json: ${response.status} ${response.statusText}`,
        );
      }
      return response.json();
    })
    .then((data) => {
      appData = data;
        renderDeviceDetails(data.devices);
        renderDeviceOffers();
    })
    .catch((error) => console.error("Error loading data:", error));

  const dropdown = document.getElementById("deviceDropdown");
  if (dropdown) {
    dropdown.addEventListener("change", (event) => {
      renderDeviceOffers(event.target.value);
    });
  }
}

/**
 * Populates the device dropdown with device options.
 * @param {Array} devices - Array of device objects
 */
function renderDeviceDetails(devices) {
  const wrapper = document.getElementById("deviceDropdown");
  const label = wrapper.querySelector(".dd-label");
  const list = wrapper.querySelector(".dd-list");

  list.innerHTML = "";

  devices.forEach((device, index) => {
    const item = document.createElement("div");
    item.className = "dd-item";
    item.dataset.value = device.serial;
    item.textContent = device.serial || device.name || device.serial;
    if (index === 0) {
      label.textContent = item.textContent;
      item.classList.add("selected");
    }
    list.appendChild(item);
  });

  // toggle open/close
  wrapper.querySelector(".dd-selected").addEventListener("click", () => {
    wrapper.classList.toggle("open");
  });

  // item click
  list.addEventListener("click", (e) => {
    const item = e.target.closest(".dd-item");
    if (!item) return;
    label.textContent = item.textContent;
    list.querySelectorAll(".dd-item").forEach(i => i.classList.remove("selected"));
    item.classList.add("selected");
    wrapper.classList.remove("open");
      renderDeviceOffers(item.dataset.value);

  });

  // close on outside click
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) wrapper.classList.remove("open");
  });
}

/**
 * Selects a device by ID, updates the current device, renders it, and appends its offers.
 * @param {string} chosenDeviceID - The device ID
 */
function renderDeviceOffers(chosenDeviceID = appData.devices[0].serial) {
  currentDevice = appData.devices.find(
    (device) => device.serial === chosenDeviceID
  );

  renderDevice(currentDevice);
  appendOffers(appData, currentDevice);

  const dropdown = document.getElementById("deviceDropdown");
  const items = dropdown.querySelectorAll(".dd-item");

  items.forEach(item => {
    item.classList.toggle("selected", item.dataset.value === currentDevice.serial);
  });
  const label = dropdown.querySelector(".dd-label");
  const active = dropdown.querySelector(".dd-item.selected");
  label.textContent = active.textContent;

}



/**
 * Renders the selected device's image, info properties, and highlights the serial in the list.
 * @param {Object} deviceObject: { image, name, warranty, productNumber } - The device object from JSON
 */
function renderDevice({ image, name, warranty, productNumber }) {
  document.querySelector(".deviceImage").src = image;

  document.querySelectorAll(".deviceInfoProperty").forEach((deviceInfo, index) => {
    deviceInfo.innerHTML = [
      `<span>Product name:</span> ${name}`,
      `<span>Warranty status:</span> ${warranty}`,
      `<span>Product Number:</span> ${productNumber}`
    ][index];
  });
}



/**
 * Replaces placeholders in the template with offer content.
 * @param {Object} offer - The offer object
 * @returns {string} The rendered HTML string
 */
function updateTemplate(offer) {
  if (!offer || !offer.template || !appData.templates) return "";
// render error page
  const templateKey = offer.template;
  const templateHTML = appData.templates[templateKey];
  if (!templateHTML) return "";

  return templateHTML.replace(/{{\s*(\w+)\s*}}/g, (match, field) => {
    if (field in offer) return offer[field];
    return "";
  });
}

/**
 * Appends the offers for the selected device to their respective sections.
 * @param {Object} data - The JSON data
 * @param {Object} device - The selected device
 */
function appendOffers(data, device) {
  if (!data || !device || !data.deviceOffers) return;

  emptyContainers();

  const offerIds = data.deviceOffers[device.id];

  offerIds.forEach((offerId) => {
    const offer = data.offers?.find((entry) => entry.id === offerId);
    if (!offer) return;

    const htmlString = updateTemplate(offer);
    const targetSection = document.getElementById(offer.wrapper);

    if (!targetSection || !htmlString) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlString;

    Array.from(wrapper.children).forEach((offerEl) => {
      offerEl.addEventListener("click", () => handleEvent("click", offerId));
      offerEl.addEventListener("focusin", () => handleEvent("focus", offerId));

      targetSection.appendChild(offerEl);
    });

    handleEvent("impression", offerId);
  });
  
  slide();
}

/**
 * Clears offers from the page.
 */
function emptyContainers() {
  ["carousel_wrapper", "right_tile_1", "right_tile_2", "position_2"]
    .forEach(id => (document.getElementById(id).innerHTML = ""));
  document.getElementById("sticky-footer").querySelectorAll(".footer, style")
    .forEach(el => el.remove());
}



/**
 * Logs a user or system event into an on-screen event log and console.
 * Keeps only the 4 most recent events visible in the UI.
 *
 * @param {string} eventType - Type of event ("impression", "click", "focus", etc.)
 * @param {string|number} offerId - offer ID interacted with
 */
function handleEvent(eventType = "display", offerId) {
  const event = {
    eventType,
    id: offerId || null,
    timestamp: new Date().toLocaleString("en-GB").replace(",", ""),
    device: document.getElementById("deviceDropdown").querySelector(".dd-item.selected")?.dataset.value || ""
  };
  const selectedOption = appData.devices.find(d => d.serial === document.querySelector(".dd-item.selected")?.dataset.value)?.id || "";

  const log = document.getElementById("event-log");
  const li = document.createElement("li");
  li.className = `event-item ${event.eventType}`;
  li.innerHTML = `<span class="logItem"><span style="font-weight: bold;">event:</span> ${event.eventType}</span><span class="logItem"><span style="font-weight: bold;">offer:</span> ${event.id}</span><span class="logItem"><span style="font-weight: bold;">for:</span> ${selectedOption}</span><span class="logItem"><span style="font-weight: bold;">at:</span> ${event.timestamp}</span>`;
  log.prepend(li);

  // Remove oldest item if exceeds 4 elements
  const eventItems = log.querySelectorAll(".event-item");
  if (eventItems.length > 4) {
    eventItems[eventItems.length - 1].remove();
  }

  console.log(event);
}

/**
 * Initializes the carousel behavior (auto-slide, navigation, pause on hover, swipe support).
 * Handles:
 * - slide switching (next/prev)
 * - auto rotation loop
 * - mouse interactions (hover pause)
 * - touch interactions (swipe)
 * - UI controls (buttons + visibility)
 */
function slide() {
  const container = document.querySelector(".carousel-container");
  const slides = Array.from(container.querySelectorAll(".carousel"));
  const nextBtn = container.querySelector(".carousel-next");
  const prevBtn = container.querySelector(".carousel-prev");

  // state
  let index = 0;
  let timer = null;
  let paused = false;
  let startX = 0;

  // core logic
  const update = () => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  };

  const next = () => {
    index = (index + 1) % slides.length;
    update();
  };

  const prev = () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  };

  // autoplay
  const schedule = () => {
    timer = setTimeout(() => {
      if (!paused) next();
      schedule();
    }, 5000);
  };

  const start = () => {
    paused = false;
    clearTimeout(timer);
    schedule();
  };

  const stop = () => {
    paused = true;
    clearTimeout(timer);
  };

  // controls
  nextBtn.onclick = () => {
    next();
    start();
  };

  prevBtn.onclick = () => {
    prev();
    start();
  };

  // mouse interactions
  container.addEventListener("mouseenter", stop);
  container.addEventListener("mouseleave", start);

  // touch interactions (swipe)
  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  container.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    const threshold = 50;
    if (Math.abs(diff) < threshold) return;

    if (diff < 0) next();
    else prev();

    start();
  });

  // init
  update();
  start();
  toggleCarouselControls();
}

/**
 * Shows or hides carousel navigation controls depending on
 * how many slides exist in the carousel.
 */
function toggleCarouselControls() {
  const carousel = document.getElementById("carousel_wrapper");
  const controls = document.querySelector(".carousel-controls");

  if (carousel.children.length <= 1) {
    controls.style.display = "none";
  } else {
    controls.style.display = "flex";
  }
}
