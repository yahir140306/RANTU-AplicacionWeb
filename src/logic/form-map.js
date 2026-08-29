// form-map.js
document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
  
    // Leer valores iniciales de los inputs ocultos
    const latInput = document.getElementById('latitud');
    const lngInput = document.getElementById('longitud');
    
    // Coordenadas por defecto (Centro de México) si no hay valores
    let defaultLat = latInput && latInput.value ? parseFloat(latInput.value) : 23.6345;
    let defaultLng = lngInput && lngInput.value ? parseFloat(lngInput.value) : -102.5528;
    let zoom = (latInput && latInput.value) ? 14 : 5;
  
    // Forzar el estilo de altura y z-index del contenedor del mapa
    mapContainer.style.height = "300px";
    mapContainer.style.width = "100%";
    mapContainer.style.zIndex = "10";
  
    // Inicializar mapa de Leaflet
    const map = L.map('map-container').setView([defaultLat, defaultLng], zoom);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
  
    let marker = null;
  
    // Si ya teníamos coordenadas, poner el marcador inicial
    if (latInput && latInput.value && lngInput && lngInput.value) {
        marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
        setupMarkerDrag(marker);
    } 
    // Intentar obtener la ubicación del usuario si es agregar cuarto
    else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        map.setView([userLat, userLng], 14);
        
        marker = L.marker([userLat, userLng], { draggable: true }).addTo(map);
        if(latInput) latInput.value = userLat;
        if(lngInput) lngInput.value = userLng;
        setupMarkerDrag(marker);
      });
    }
  
    // Función para manejar el evento drag del marcador
    function setupMarkerDrag(m) {
        m.on('dragend', function(event) {
            const position = m.getLatLng();
            if(latInput) latInput.value = position.lat;
            if(lngInput) lngInput.value = position.lng;
        });
    }
  
    // Permitir hacer clic en el mapa para colocar el marcador
    map.on('click', function(e) {
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { draggable: true }).addTo(map);
        setupMarkerDrag(marker);
      }
      if(latInput) latInput.value = e.latlng.lat;
      if(lngInput) lngInput.value = e.latlng.lng;
    });
  
    // Botón "Usar mi ubicación"
    const btnUbicacion = document.getElementById("btn-mi-ubicacion");
    if (btnUbicacion) {
        btnUbicacion.addEventListener("click", () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              map.setView([userLat, userLng], 14);
              if (marker) {
                marker.setLatLng([userLat, userLng]);
              } else {
                marker = L.marker([userLat, userLng], { draggable: true }).addTo(map);
                setupMarkerDrag(marker);
              }
              if(latInput) latInput.value = userLat;
              if(lngInput) lngInput.value = userLng;
            }, (error) => {
              alert("No se pudo obtener la ubicación. Por favor revisa los permisos del navegador.");
            });
          }
        });
    }
  });
