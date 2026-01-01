const dscc = window.dscc;

dscc.subscribeToData(draw, {
  transform: dscc.objectTransform,
});

let map;
let circles = [];

function initMap(center) {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: center,
    mapTypeId: "roadmap",
  });
}

function draw(data) {
  if (!data || !data.tables || !data.tables.DEFAULT.length) return;

  const rows = data.tables.DEFAULT;

  const points = rows.map(row => ({
    lat: row[0],
    lng: row[1],
    category: row[2],
    weight: row[3]
  }));

  const center = { lat: points[0].lat, lng: points[0].lng };

  if (!map) initMap(center);

  clearCircles();
  renderPoints(points);
}

function groupByCategory(points) {
  const grouped = {};
  points.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });
  return grouped;
}

const palette = [
  "#e41a1c",
  "#377eb8",
  "#4daf4a",
  "#984ea3",
  "#ff7f00",
  "#ffff33"
];

function getCategoryColor(category, index) {
  return palette[index % palette.length];
}

function normalizeOpacity(weight, maxWeight) {
  const minOpacity = 0.05;
  const maxOpacity = 0.8;
  return Math.min(
    maxOpacity,
    Math.max(minOpacity, weight / maxWeight)
  );
}

function renderPoints(points) {
  const grouped = groupByCategory(points);
  const maxWeight = Math.max(...points.map(p => p.weight));

  Object.keys(grouped).forEach((category, index) => {
    const color = getCategoryColor(category, index);

    grouped[category].forEach(point => {
      const circle = new google.maps.Circle({
        map: map,
        center: { lat: point.lat, lng: point.lng },
        radius: 200,
        strokeOpacity: 0,
        fillColor: color,
        fillOpacity: normalizeOpacity(point.weight, maxWeight)
      });

      circles.push(circle);
    });
  });
}

function clearCircles() {
  circles.forEach(c => c.setMap(null));
  circles = [];
}