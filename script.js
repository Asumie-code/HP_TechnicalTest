// global variables
let appData = {};
let currentDevice = null;

/**
 * Initializes the page by populating dropdown and serial list, then selects the default device.
 * @param {Object} data - The JSON data from data.json
 */
function renderData(data) {
  if (!data) return;

  populateDeviceDropdown(data.devices);
  renderSerialNumberList(data.devices);

  const defaultDevice = data.devices?.[0];
  if (defaultDevice) {
    selectDevice(defaultDevice.id);
  }
}

/**
 * Selects a device by ID or serial, updates the current device, renders it, and appends its offers.
 * @param {string} productValue - The device ID or serial number
 */
function selectDevice(productValue) {
  if (!productValue || !appData.devices) return;

  const selectedDevice = appData.devices.find(
    (device) => device.id === productValue || device.serial === productValue,
  );
  if (!selectedDevice) return;

  currentDevice = selectedDevice;
  renderDevice(selectedDevice);
  appendTemplate(appData, selectedDevice);

  const dropdown = document.getElementById("productDropdown");
  if (dropdown) dropdown.value = selectedDevice.id;
  slide();
}

/**
 * Renders the selected device's image, info properties, and highlights the serial in the list.
 * @param {Object} device - The device object from JSON
 */
function renderDevice(device) {
  if (!device) return;

  const image = document.querySelector(".deviceImage");
  if (image) {
    image.src = device.image || "";
    image.alt = device.name ? `${device.name} image` : "Device image";
  }

  const infoProperties = Array.from(
    document.querySelectorAll(".deviceInfoProperty"),
  );
  const values = [
    `Product name: ${device.name}` || "",
    `Warranty status: ${device.warranty}` || "",
    `Product Number: ${device.productNumber}` || "",
  ];
  infoProperties.forEach((prop, index) => {
    prop.textContent = values[index] || "";
  });

  const serialItems = document.querySelectorAll(".deviceSerialNumber");
  serialItems.forEach((item) => {
    item.classList.toggle(
      "deviceSerialNumberSelected",
      item.textContent.trim() === device.serial,
    );
  });
}

/**
 * Replaces placeholders in the template with offer data.
 * @param {Object} offer - The offer object
 * @returns {string} The rendered HTML string
 */
function updateTemplate(offer) {
  if (!offer || !offer.template || !appData.templates) return "";

  const templateKey = offer.template;
  const templateSource = appData.templates[templateKey];
  if (!templateSource) return "";

  return templateSource.replace(/{{\s*(\w+)\s*}}/g, (match, field) => {
    if (field in offer) return offer[field];
    return "";
  });
}

/**
 * Appends the offers for the selected device to their respective sections.
 * @param {Object} data - The JSON data
 * @param {Object} device - The selected device
 */
function appendTemplate(data, device) {
  if (!data || !device || !data.deviceOffers) return;

  emptyWrappers();

  const offerIds = data.deviceOffers[device.id] || [];
  offerIds.forEach((offerId) => {
    const offer = data.offers?.find((entry) => entry.id === offerId);
    if (!offer) return;

    const htmlString = updateTemplate(offer);
    const targetSection = document.getElementById(offer.wrapper);
    if (targetSection && htmlString) {
      targetSection.insertAdjacentHTML("beforeend", htmlString);
      handleEvent("display", offerId);
      Array.from(targetSection.children).forEach((child) => {
        child.addEventListener("click", () => handleEvent("click", offerId));
        child.addEventListener("focusin", () => handleEvent("focus", offerId));
      });
    }
  });
}

/**
 * Handles the product dropdown selection by calling selectDevice.
 * @param {string} productValue - The selected value
 */
function handleProductSelection(productValue) {
  selectDevice(productValue);
}

/**
 * Clears the HTML content of the wrapper sections.
 */
function emptyWrappers() {
  document.getElementById("carousel_wrapper").innerHTML = "";
  document.getElementById("right_tile_1").innerHTML = "";
  document.getElementById("right_tile_2").innerHTML = "";
  document.getElementById("position_2").innerHTML = "";
  document.getElementById("sticky-footer").innerHTML = "";
}

/**
 * Populates the product dropdown with device options.
 * @param {Array} devices - Array of device objects
 */
function populateDeviceDropdown(devices = []) {
  const dropdown = document.getElementById("productDropdown");

  dropdown.innerHTML = "";
  devices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = device.id;
    option.id = device.id;
    option.textContent = device.serial || device.name || device.id;
    if (index === 0) option.selected = true;
    dropdown.appendChild(option);
  });
}

/**
 * Renders the list of device serial numbers with click handlers.
 * @param {Array} devices - Array of device objects
 */
function renderSerialNumberList(devices = []) {
  const selector = document.querySelector(".deviceSerialNumberSelector");
  if (!selector) return;

  selector.innerHTML = "";
  devices.forEach((device) => {
    const item = document.createElement("div");
    item.className = "deviceSerialNumber";
    item.dataset.deviceId = device.id;
    item.textContent = device.serial || device.id;
    item.addEventListener("click", () => selectDevice(device.id));
    selector.appendChild(item);
  });
}

function handleEvent(type = "display", offerId) {
  const event = {
    type,
    id: offerId || null,
    timestamp: new Date().toISOString(),
  };

  const log = document.getElementById("event-log");
  const li = document.createElement("li");
  li.className = "event-item";
  li.textContent = `event : ${event.type}, event_element: ${event.id} time: ${event.timestamp}`;
  log.prepend(li);

  // Remove oldest item if exceeds 4 elements
  const eventItems = log.querySelectorAll(".event-item");
  if (eventItems.length > 4) {
    eventItems[eventItems.length - 1].remove();
  }

  console.log(event);
}

document.addEventListener("DOMContentLoaded", () => {
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
      renderData(appData);
      slide();
      clean();
      addCloseButton();
    })
    .catch((error) => console.error("Error loading data:", error));

  const dropdown = document.getElementById("productDropdown");
  if (dropdown) {
    dropdown.addEventListener("change", (event) => {
      handleProductSelection(event.target.value);
    });
  }
});

function addCloseButton() {
  const footer = document.getElementById("sticky-footer");
  if (!footer) return;

  const closeBtn = document.createElement("button");
  closeBtn.id = "close-footer";
  closeBtn.className = "footer-close-btn";
  closeBtn.setAttribute("aria-label", "Close footer");
  closeBtn.textContent = "×";

  closeBtn.addEventListener("click", () => {
    footer.style.display = "none";
  });

  footer.appendChild(closeBtn);
}

function slide() {
  document.querySelectorAll(".carousel-container").forEach((container) => {
    const slides = Array.from(container.querySelectorAll(".carousel"));
    const nextBtn = container.querySelector(".carousel-next");
    const prevBtn = container.querySelector(".carousel-prev");

    let index = 0;
    let timer = null;
    let paused = false;

    const update = () => {
      slides.forEach((s, i) => {
        s.classList.toggle("active", i === index);
      });
    };

    const schedule = () => {
      timer = setTimeout(() => {
        if (!paused) next();
        schedule();
      }, 5000);
    };

    const next = () => {
      index = (index + 1) % slides.length;
      update();
    };

    const prev = () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
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

    nextBtn.onclick = () => {
      next();
      start(); // resets cycle cleanly
    };

    prevBtn.onclick = () => {
      prev();
      start();
    };

    container.addEventListener("mouseenter", stop);
    container.addEventListener("mouseleave", start);

    update();
    start();
  });
}

function clean() {
  document.querySelectorAll("*").forEach((el) => {
    el.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        node.nodeValue = node.nodeValue.replace(/\u00A0/g, " ");
      }
    });
  });
}
