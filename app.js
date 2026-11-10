const venue = {
  name: 'Theatre',
  currency: 'AZN',

  // Each section is a zone with its own price and seat layout
  sections: [
    {
      id: 'stalls',
      name: 'Stalls',
      price: 60,
      rows: 10,
      seatsPerRow: 14,
    },
    {
      id: 'side-left',
      name: 'Left Side Boxes',
      price: 35,
      rows: 6,
      seatsPerRow: 3,
    },
    {
      id: 'side-right',
      name: 'Right Side Boxes',
      price: 35,
      rows: 6,
      seatsPerRow: 3,
    },
    {
      id: 'balcony',
      name: 'Balcony',
      price: 25,
      rows: 4,
      seatsPerRow: 12,
    },
  ],

  unavailable: ['stalls-3-7', 'stalls-3-8', 'balcony-2-5'],
};

console.log('Venue loaded:', venue.name);



const seatsContainer = document.getElementById('seats');
const seatInfo = document.getElementById('seat-info');
const addToCartButton = document.getElementById('add-to-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');

const BASE_STATES = ['available', 'unavailable', 'in-cart'];

// Key used to store the cart in localStorage
const CART_STORAGE_KEY = 'venue-ticketing-cart';

// Stores every seat button so we can find it by ID later
const seatButtons = new Map();

// The seat currently being inspected (null if none)
let inspectedSeatId = null;

// Seat IDs currently in the cart, in the order they were added
const cart = [];

// Change the base state of a seat and update its CSS class
function setSeatState(seatId, state) {
  const seatData = seatButtons.get(seatId);
  if (!seatData) return;

  seatData.state = state;
  seatData.button.classList.remove(...BASE_STATES);
  seatData.button.classList.add(state);
}
// Build all seat buttons from the venue data
function renderVenue() {
  seatsContainer.innerHTML = '';
  seatButtons.clear();
  inspectedSeatId = null;
  venue.sections.forEach((section) => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'section';

    const title = document.createElement('h3');
    title.textContent = `${section.name} - ${section.price} ${venue.currency}`;
    sectionEl.appendChild(title);

    for (let row = 1; row <= section.rows; row++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';

      for (let seat = 1; seat <= section.seatsPerRow; seat++) {
        const seatId = `${section.id}-${row}-${seat}`;
        const isUnavailable = venue.unavailable.includes(seatId);

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = seat;
        button.className = 'seat';
        button.dataset.seatId = seatId;

        // Save the seat so inspectSeat() can find it
        seatButtons.set(seatId, {
          id: seatId,
          sectionName: section.name,
          row,
          seat,
          price: section.price,
          state: 'available',
          button,
        });
        // Apply the starting state from the venue data
        const startState = venue.unavailable.includes(seatId) ? 'unavailable' : 'available';
        setSeatState(seatId, startState);
       
        button.addEventListener('click', () => inspectSeat(seatId));

        rowEl.appendChild(button);
      }

      sectionEl.appendChild(rowEl);
    }

    seatsContainer.appendChild(sectionEl);
  });
}

// Show details of a seat in the side panel
function inspectSeat(seatId) {
  const seatData = seatButtons.get(seatId);
  if (!seatData) return;

  
  
  // Remove the "inspected" state from the previously inspected seat
  if (inspectedSeatId && inspectedSeatId !== seatId) {
    const previous = seatButtons.get(inspectedSeatId);
    if (previous) previous.button.classList.remove('inspected');
  }

  inspectedSeatId = seatId;
  seatData.button.classList.add('inspected');

  const location = `${seatData.sectionName}, row ${seatData.row}, seat ${seatData.seat}.`;

  if (seatData.state === 'unavailable') {
    seatInfo.textContent = `${location} This seat is not available.`;
    addToCartButton.disabled = true;
  } else if (seatData.state === 'in-cart') {
    seatInfo.textContent = `${location} This seat is already in the cart.`;
    addToCartButton.disabled = true;
  } else {
    seatInfo.textContent = `${location} Price: ${seatData.price} ${venue.currency}`;
    addToCartButton.disabled = false;
  }
}

// Save the current cart to localStorage
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('Could not save cart:', error);
  }
}

// Read the saved cart and restore it together with the seat states
function loadCart() {
  let saved = [];

  try {
    saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (error) {
    console.warn('Could not read saved cart:', error);
  }

  if (!Array.isArray(saved)) saved = [];

  cart.length = 0;

  saved.forEach((seatId) => {
    const seatData = seatButtons.get(seatId);

    // Skip seats that no longer exist, are unavailable, or are already restored
    if (!seatData) return;
    if (seatData.state !== 'available') return;

    cart.push(seatId);
    setSeatState(seatId, 'in-cart');
  });

  // Store only the valid entries, so the saved data stays clean
  saveCart();
}

// Add the inspected seat to the cart
function addToCart() {
  if (!inspectedSeatId) return;

  const seatData = seatButtons.get(inspectedSeatId);
  if (!seatData) return;

  // Block unavailable seats and seats that are already in the cart
  if (seatData.state !== 'available') return;
  if (cart.includes(seatData.id)) return;

  cart.push(seatData.id);
  setSeatState(seatData.id, 'in-cart');
  saveCart();
  renderCart();
  // Refresh the side panel so it shows the "already in the cart" message
  inspectSeat(seatData.id);
}

// Remove a seat from the cart and make it available again
function removeFromCart(seatId) {
  const index = cart.indexOf(seatId);
  if (index === -1) return;

  cart.splice(index, 1);
  setSeatState(seatId, 'available');
  saveCart();
  renderCart();

  // If this seat is open in the side panel, refresh its message and button
  if (inspectedSeatId === seatId) {
    inspectSeat(seatId);
  }
}

// Show the cart items and the total price
function renderCart() {
  cartItemsEl.innerHTML = '';
  
  if (cart.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Your cart is empty';
    cartItemsEl.appendChild(emptyItem);
  }
  
  let total = 0;

  cart.forEach((seatId) => {
    const seatData = seatButtons.get(seatId);
    total += seatData.price;

    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent =
      `${seatData.sectionName}, row ${seatData.row}, seat ${seatData.seat} - ` +
      `${seatData.price} ${venue.currency}`;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeFromCart(seatId));

    item.appendChild(label);
    item.appendChild(removeButton);
    cartItemsEl.appendChild(item);
  });

  // The HTML already shows "AZN" after this number
  cartTotalEl.textContent = total;
}




// Navigation: zoom, move and reset the venue map using CSS transform
const venueEl = document.getElementById('venue');
const viewportEl = document.querySelector('.viewport');

// Current camera state: position in pixels and zoom level
const view = { x: 0, y: 0, scale: 1 };

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.1;
const MOVE_STEP = 40; // pixels per click

// Apply the current state to the map element
function applyView() {
  venueEl.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
}

// Keep the map inside the viewport edges when it is larger than the viewport.
// If the map is smaller, it stays at position 0.
function clampView() {
  const contentWidth = venueEl.offsetWidth * view.scale;
  const contentHeight = venueEl.offsetHeight * view.scale;

  view.x = Math.min(0, Math.max(viewportEl.clientWidth - contentWidth, view.x));
  view.y = Math.min(0, Math.max(viewportEl.clientHeight - contentHeight, view.y));
}

function zoom(delta) {
  const next = view.scale + delta;
  view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(next * 100) / 100));
  clampView();
  applyView();
}

function move(dx, dy) {
  view.x += dx;
  view.y += dy;
  clampView();
  applyView();
}

function resetView() {
  view.x = 0;
  view.y = 0;
  view.scale = 1;
  applyView();
}

// Connect the visible buttons to their actions
addToCartButton.addEventListener('click', addToCart);
document.getElementById('zoom-in').addEventListener('click', () => zoom(SCALE_STEP));
document.getElementById('zoom-out').addEventListener('click', () => zoom(-SCALE_STEP));
document.getElementById('move-up').addEventListener('click', () => move(0, MOVE_STEP));
document.getElementById('move-down').addEventListener('click', () => move(0, -MOVE_STEP));
document.getElementById('move-left').addEventListener('click', () => move(MOVE_STEP, 0));
document.getElementById('move-right').addEventListener('click', () => move(-MOVE_STEP, 0));
document.getElementById('reset').addEventListener('click', resetView);

// Start the app
renderVenue();
loadCart();
renderCart();
applyView();

// ---- Bonus: 
const DRAG_THRESHOLD = 4; 
let dragStart = null;     // stores the mouse position when the button is pressed
let wasDragged = false;   


viewportEl.addEventListener('wheel', (event) => {
  event.preventDefault();

  const rect = viewportEl.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const oldScale = view.scale;
  const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, oldScale * factor));
  if (newScale === oldScale) return;

  
  view.x = mouseX - (mouseX - view.x) * (newScale / oldScale);
  view.y = mouseY - (mouseY - view.y) * (newScale / oldScale);
  view.scale = newScale;

  clampView();
  applyView();
}, { passive: false });

viewportEl.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;

  wasDragged = false;
  dragStart = {
    x: event.clientX,
    y: event.clientY,
    viewX: view.x,
    viewY: view.y,
    moved: false,
  };
});


window.addEventListener('pointermove', (event) => {
  if (!dragStart) return;

  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;

  // Ignore tiny movements, so a normal click still selects a seat
  if (!dragStart.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

  dragStart.moved = true;
  viewportEl.classList.add('dragging');

  view.x = dragStart.viewX + dx;
  view.y = dragStart.viewY + dy;
  clampView();
  applyView();
});


window.addEventListener('pointerup', () => {
  if (!dragStart) return;

  wasDragged = dragStart.moved;
  dragStart = null;
  viewportEl.classList.remove('dragging');
});

viewportEl.addEventListener('click', (event) => {
  if (!wasDragged) return;

  event.stopPropagation();
  event.preventDefault();
  wasDragged = false;
}, true);
