
export function cumpleFiltros(precio, disponible, precioMin, precioMax, soloDisponibles) {
    const cumplePrecio = precio >= precioMin && precio <= precioMax;
    const cumpleDisponibilidad = !soloDisponibles || disponible;
    return cumplePrecio && cumpleDisponibilidad;
}
