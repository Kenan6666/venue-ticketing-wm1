

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
