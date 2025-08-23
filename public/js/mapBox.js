// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', 
    center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

const marker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup()
        .setHTML('<p>Exact location provided after booking.</p>')) 
    .addTo(map);