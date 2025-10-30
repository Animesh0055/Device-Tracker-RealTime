const socket = io();

// Create map and set default view
const map = L.map("map").setView([0, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Store all user markers
const markers = {};

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => console.error(error),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}

// When receiving another user's location
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  // If marker doesn't exist for that user, create one
  if (!markers[id]) {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  } else {
    markers[id].setLatLng([latitude, longitude]);
  }

  // Auto center map to show all markers
  const group = L.featureGroup(Object.values(markers));
  map.fitBounds(group.getBounds().pad(0.3));
});

// When a user disconnects, remove their marker
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
