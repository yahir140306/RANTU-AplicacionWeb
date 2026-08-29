export function validateRoomData(data) {
  const { titulo, descripcion, precio, celular, caracteristicas, ubicacion } = data;
  
  if (!titulo || !descripcion || precio === undefined || isNaN(precio) || !celular || !caracteristicas || !ubicacion) {
    return "Todos los campos son obligatorios (título, descripción, precio, celular, características, ubicación)";
  }

  if (precio <= 0) {
    return "El precio debe ser mayor a 0";
  }

  if (titulo.length > 100) {
    return "El título no puede exceder los 100 caracteres";
  }

  if (descripcion.length < 10) {
    return "La descripción debe tener al menos 10 caracteres";
  }

  // Si no hay errores, retornamos null
  return null;
}

export function validateCommentData(calificacion, comentario) {
  if (!calificacion || calificacion < 1 || calificacion > 5) {
    return "La calificación debe ser entre 1 y 5 estrellas";
  }
  
  if (!comentario || comentario.trim().length < 10) {
    return "El comentario debe tener al menos 10 caracteres";
  }
  
  return null;
}
