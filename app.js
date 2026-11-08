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


// Stores every seat button so we can find it by ID later
const seatButtons = new Map();

// The seat currently being inspected (null if none)
let inspectedSeatId = null;
// Build all seat buttons from the venue data
function renderVenue() {
  seatsContainer.innerHTML = '';
  seatButtons.clear();

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
        button.className = isUnavailable ? 'seat unavailable' : 'seat available';
        button.dataset.seatId = seatId;

        // Save the seat so inspectSeat() can find it
        seatButtons.set(seatId, {
          id: seatId,
          sectionName: section.name,
          row,
          seat,
          price: section.price,
          unavailable: isUnavailable,
          button,
        });

       
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

  if (seatData.unavailable) {
    seatInfo.textContent =
      `${seatData.sectionName}, row ${seatData.row}, seat ${seatData.seat}. ` +
      'This seat is not available.';
    addToCartButton.disabled = true;
  } else {
    seatInfo.textContent =
      `${seatData.sectionName}, row ${seatData.row}, seat ${seatData.seat}. ` +
      `Price: ${seatData.price} ${venue.currency}`;
    addToCartButton.disabled = false;
  }
}


renderVenue();

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
document.getElementById('zoom-in').addEventListener('click', () => zoom(SCALE_STEP));
document.getElementById('zoom-out').addEventListener('click', () => zoom(-SCALE_STEP));
document.getElementById('move-up').addEventListener('click', () => move(0, -MOVE_STEP));
document.getElementById('move-down').addEventListener('click', () => move(0, MOVE_STEP));
document.getElementById('move-left').addEventListener('click', () => move(-MOVE_STEP, 0));
document.getElementById('move-right').addEventListener('click', () => move(MOVE_STEP, 0));
document.getElementById('reset').addEventListener('click', resetView);

applyView();
