      document.addEventListener("DOMContentLoaded", function () {
        // Elementos del DOM
        const filtroToggle = document.getElementById("filtro-toggle");
        const filtroPanel = document.getElementById("filtro-panel");
        const filtroArrow = document.getElementById("filtro-arrow");
        const filtroStatus = document.getElementById("filtro-status");
        const precioMinInput = document.getElementById("precio-min");
        const precioMaxInput = document.getElementById("precio-max");
        const soloDisponiblesCheckbox =
          document.getElementById("solo-disponibles");
        const filtrarBtn = document.getElementById("filtrar-btn");
        const limpiarBtn = document.getElementById("limpiar-btn");

        let panelAbierto = false;

        // Toggle del panel desplegable
        filtroToggle.addEventListener("click", function (e) {
          e.stopPropagation();
          togglePanel();
        });

        // Cerrar panel al hacer clic fuera
        document.addEventListener("click", function (e) {
          if (
            !filtroPanel.contains(e.target) &&
            !filtroToggle.contains(e.target)
          ) {
            cerrarPanel();
          }
        });

        // Prevenir que clicks dentro del panel lo cierren
        filtroPanel.addEventListener("click", function (e) {
          e.stopPropagation();
        });

        function togglePanel() {
          if (panelAbierto) {
            cerrarPanel();
          } else {
            abrirPanel();
          }
        }

        function abrirPanel() {
          panelAbierto = true;
          filtroPanel.classList.add("show");
          filtroArrow.style.transform = "rotate(180deg)";
          filtroToggle.classList.add(
            "ring-2",
            "ring-blue-500",
            "border-blue-500"
          );
        }

        function cerrarPanel() {
          panelAbierto = false;
          filtroPanel.classList.remove("show");
          filtroArrow.style.transform = "rotate(0deg)";
          filtroToggle.classList.remove(
            "ring-2",
            "ring-blue-500",
            "border-blue-500"
          );
        }

        // Funciones de filtrado
        function filtrarCuartos() {
          const precioMin = parseInt(precioMinInput.value) || 0;
          const precioMax = parseInt(precioMaxInput.value) || Infinity;
          const soloDisponibles = soloDisponiblesCheckbox.checked;

          const cuartoCards = document.querySelectorAll(".cuarto-card");
          let cuartosMostrados = 0;

          cuartoCards.forEach(function (card) {
            const precio = parseInt(card.getAttribute("data-precio"));
            const disponible = card.getAttribute("data-disponible") === "true";

            const cumplePrecio = precio >= precioMin && precio <= precioMax;
            const cumpleDisponibilidad = !soloDisponibles || disponible;

            if (cumplePrecio && cumpleDisponibilidad) {
              card.style.display = "block";
              cuartosMostrados++;
            } else {
              card.style.display = "none";
            }
          });

          // Mostrar status del filtro
          if (
            precioMinInput.value ||
            precioMaxInput.value ||
            !soloDisponibles
          ) {
            filtroStatus.classList.remove("hidden");
            filtroToggle.classList.add("bg-blue-50", "border-blue-300");
          }

          mostrarMensajeResultados(
            cuartosMostrados,
            precioMin,
            precioMax,
            cuartoCards.length,
            soloDisponibles
          );

          // Cerrar panel después de filtrar
          cerrarPanel();
        }

        function limpiarFiltros() {
          precioMinInput.value = "";
          precioMaxInput.value = "";
          soloDisponiblesCheckbox.checked = true;

          const cuartoCards = document.querySelectorAll(".cuarto-card");
          cuartoCards.forEach(function (card) {
            card.style.display = "block";
          });

          // Ocultar status del filtro
          filtroStatus.classList.add("hidden");
          filtroToggle.classList.remove("bg-blue-50", "border-blue-300");

          const mensajeExistente =
            document.getElementById("mensaje-resultados");
          if (mensajeExistente) {
            mensajeExistente.remove();
          }

          // Cerrar panel después de limpiar
          cerrarPanel();
        }

        function mostrarMensajeResultados(
          cantidad,
          min,
          max,
          total,
          soloDisponibles
        ) {
          const cuartosContainer = document.getElementById("cuartos-container");
          const mensajeExistente =
            document.getElementById("mensaje-resultados");

          if (mensajeExistente) {
            mensajeExistente.remove();
          }

          if (cantidad === 0) {
            const mensaje = document.createElement("div");
            mensaje.id = "mensaje-resultados";
            mensaje.className = "col-span-full text-center py-12";
            mensaje.innerHTML = `
              <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md mx-auto">
                <div class="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-yellow-800 mb-2">No se encontraron cuartos</h3>
                <p class="text-yellow-700 mb-4">
                  No hay cuartos disponibles en el rango de precios de 
                  <strong>$${min.toLocaleString()}</strong> 
                  ${max === Infinity ? "en adelante" : `a <strong>$${max.toLocaleString()}</strong>`}.
                </p>
                <button onclick="limpiarFiltros()" class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md">
                  Ver todos los cuartos
                </button>
              </div>
            `;
            if (cuartosContainer.firstChild) {
              cuartosContainer.insertBefore(
                mensaje,
                cuartosContainer.firstChild
              );
            } else {
              cuartosContainer.appendChild(mensaje);
            }
          } else if (cantidad < total) {
            const mensaje = document.createElement("div");
            mensaje.id = "mensaje-resultados";
            mensaje.className = "col-span-full text-center py-6";
            mensaje.innerHTML = `
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                <div class="flex items-center justify-center space-x-2 text-blue-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p>
                    Mostrando <strong>${cantidad}</strong> de <strong>${total}</strong> cuartos disponibles 
                    en el rango de <strong>$${min.toLocaleString()}</strong> 
                    ${max === Infinity ? "en adelante" : `a <strong>$${max.toLocaleString()}</strong>`}.
                  </p>
                </div>
              </div>
            `;
            if (cuartosContainer.firstChild) {
              cuartosContainer.insertBefore(
                mensaje,
                cuartosContainer.firstChild
              );
            }
          }
        }

        // Hacer funciones globales para onclick
        window.limpiarFiltros = limpiarFiltros;
        window.filtrarCuartos = filtrarCuartos;

        // Event listeners
        filtrarBtn.addEventListener("click", filtrarCuartos);
        limpiarBtn.addEventListener("click", limpiarFiltros);

        // Filtrar con Enter
        precioMinInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            filtrarCuartos();
          }
        });

        precioMaxInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            filtrarCuartos();
          }
        });

        // Cerrar panel con Escape
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && panelAbierto) {
            cerrarPanel();
          }
        });

        // ================= MAPA GLOBAL LOGIC =================
        const mapToggleBtn = document.getElementById("map-toggle-btn");
        const mapToggleText = document.getElementById("map-toggle-text");
        const mapWrapper = document.getElementById("global-map-wrapper");
        const cuartosContainer = document.getElementById("cuartos-container");
        
        let mapInitialized = false;
        let globalLeafletMap = null;
        let markersGroup = null;

        function updateMapMarkers() {
          if (!globalLeafletMap) return;
          
          if (markersGroup) {
            markersGroup.clearLayers();
          }
          markersGroup = L.featureGroup().addTo(globalLeafletMap);

          const cuartoCards = document.querySelectorAll(".cuarto-card");
          let bounds = [];

          cuartoCards.forEach(card => {
            // Only add markers for visible cards (filtered)
            if (card.style.display !== "none") {
              const lat = parseFloat(card.getAttribute("data-lat"));
              const lng = parseFloat(card.getAttribute("data-lng"));
              
              if (!isNaN(lat) && !isNaN(lng)) {
                const titulo = card.getAttribute("data-titulo");
                const precio = card.getAttribute("data-precio");
                const id = card.getAttribute("data-id");
                const img = card.getAttribute("data-img");
                
                const popupContent = `
                  <div class="text-center w-48">
                    <img src="${img}" class="w-full h-24 object-cover rounded-md mb-2">
                    <h4 class="font-bold text-sm mb-1 line-clamp-1">${titulo}</h4>
                    <p class="text-indigo-600 font-bold mb-2">$${precio}/mes</p>
                    <a href="/cuarto/${id}" class="inline-block bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors">Ver Detalles</a>
                  </div>
                `;
                
                const marker = L.marker([lat, lng]).bindPopup(popupContent);
                markersGroup.addLayer(marker);
                bounds.push([lat, lng]);
              }
            }
          });

          if (bounds.length > 0) {
            globalLeafletMap.fitBounds(bounds, { padding: [50, 50] });
          } else {
            // Default center if no valid coordinates
            globalLeafletMap.setView([23.6345, -102.5528], 5);
          }
        }

        mapToggleBtn.addEventListener("click", () => {
          const isMapHidden = mapWrapper.classList.contains("hidden");
          
          if (isMapHidden) {
            // Show map
            mapWrapper.classList.remove("hidden");
            cuartosContainer.classList.add("hidden");
            mapToggleText.textContent = "Ver en Lista";
            mapToggleBtn.innerHTML = `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              <span id="map-toggle-text">Ver en Lista</span>
            `;
            
            if (!mapInitialized) {
              globalLeafletMap = L.map('global-map');
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(globalLeafletMap);
              mapInitialized = true;
            }
            
            // Need a slight delay for Leaflet to detect container size properly after un-hiding
            setTimeout(() => {
              globalLeafletMap.invalidateSize();
              updateMapMarkers();
            }, 100);
            
          } else {
            // Show list
            mapWrapper.classList.add("hidden");
            cuartosContainer.classList.remove("hidden");
            mapToggleBtn.innerHTML = `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              <span id="map-toggle-text">Ver en Mapa</span>
            `;
          }
        });

        // Also update markers when filtering if map is visible
        const originalFiltrarCuartos = filtrarCuartos;
        filtrarCuartos = function() {
          originalFiltrarCuartos();
          if (!mapWrapper.classList.contains("hidden")) {
            updateMapMarkers();
          }
        };
        const originalLimpiarFiltros = limpiarFiltros;
        limpiarFiltros = function() {
          originalLimpiarFiltros();
          if (!mapWrapper.classList.contains("hidden")) {
            updateMapMarkers();
          }
        };

      });
