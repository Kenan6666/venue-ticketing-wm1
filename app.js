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

const BASE_STATES = ['available', 'unavailable', 'in-cart'];

// Stores every seat button so we can find it by ID later
const seatButtons = new Map();

// The seat currently being inspected (null if none)
let inspectedSeatId = null;

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
          state: 'available',
          price: section.price,
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


renderVenue();
