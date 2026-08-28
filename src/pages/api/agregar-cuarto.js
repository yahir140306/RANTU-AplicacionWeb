import { CONSTANTS } from "../../utils/constants.js";
import { createClient } from "../../lib/supabase";

export async function POST({ request, cookies }) {
  console.log("🔥 Ejecutando agregar-cuarto endpoint");

  try {
    const supabase = createClient({ request, cookies });

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ Usuario no autenticado");
      return new Response(
        JSON.stringify({
          error: "Debes iniciar sesión para agregar un cuarto",
          success: false,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("👤 Usuario autenticado:", user.id);

    // Timeout para dispositivos móviles
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 45000);
    });

    const formDataPromise = request.formData();
    const formData = await Promise.race([formDataPromise, timeoutPromise]);

    // ✅ CORREGIDO: Usar 'titulo' consistentemente
    const titulo = formData.get("titulo")?.toString().trim();
    const descripcion = formData.get("descripcion")?.toString().trim();
    const precio = parseFloat(formData.get("precio"));
    const celular = formData.get("celular")?.toString().trim();
    const caracteristicas = formData.get("caracteristicas")?.toString().trim();
    const ubicacion = formData.get("ubicacion")?.toString().trim();
    const latitud = formData.get("latitud") ? parseFloat(formData.get("latitud")) : null;
    const longitud = formData.get("longitud") ? parseFloat(formData.get("longitud")) : null;

    // Imágenes
    const imagen_1 = formData.get("imagen_1");
    const imagen_2 = formData.get("imagen_2");
    const imagen_3 = formData.get("imagen_3");

    console.log("📝 Datos recibidos:", {
      titulo,
      descripcion: descripcion?.substring(0, 50) + "...", // Mostrar contenido real
      precio,
      celular: celular ? "✓" : "✗",
      caracteristicas: caracteristicas ? "✓" : "✗",
      ubicacion: ubicacion ? "✓" : "✗",
    });

    console.log("🖼️ Imágenes recibidas:", {
      imagen_1: imagen_1
        ? `${imagen_1.name} - ${imagen_1.size} bytes`
        : "No hay imagen",
      imagen_2: imagen_2
        ? `${imagen_2.name} - ${imagen_2.size} bytes`
        : "No hay imagen",
      imagen_3: imagen_3
        ? `${imagen_3.name} - ${imagen_3.size} bytes`
        : "No hay imagen",
    });

    // ✅ VALIDACIONES MEJORADAS
    if (
      !titulo ||
      !descripcion ||
      !precio ||
      isNaN(precio) ||
      !celular ||
      !caracteristicas ||
      !ubicacion
    ) {
      console.log("❌ Faltan campos obligatorios");
      return new Response(
        JSON.stringify({
          error:
            "Todos los campos son obligatorios (título, descripción, precio, celular, características, ubicación)",
          success: false,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar precio
    if (precio <= 0) {
      return new Response(
        JSON.stringify({
          error: "El precio debe ser mayor a 0",
          success: false,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar formato de celular
    const celularRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/;
    if (!celularRegex.test(celular)) {
      return new Response(
        JSON.stringify({
          error: "Formato de celular inválido. Ejemplo: +52 55 1234 5678",
          success: false,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar longitud de campos de texto
    if (caracteristicas.length < 20) {
      return new Response(
        JSON.stringify({
          error: "Las características deben tener al menos 20 caracteres",
          success: false,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (ubicacion.length < 10) {
      return new Response(
        JSON.stringify({
          error: "La ubicación debe tener al menos 10 caracteres",
          success: false,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar tamaño de imágenes (5MB max)
    const maxSize = CONSTANTS.SUPABASE.LIMITS.MAX_IMAGE_SIZE_BYTES; // 5MB
    const images = [imagen_1, imagen_2, imagen_3].filter(
      (img) => img && img.size > 0
    );

    for (const img of images) {
      if (img.size > maxSize) {
        return new Response(
          JSON.stringify({
            error: `La imagen ${img.name} es muy grande. Máximo 5MB.`,
            success: false,
          }),
          { status: 413, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // ✅ FUNCIÓN PARA SUBIR IMÁGENES
    async function subirImagen(imagen, nombreBase) {
      if (!imagen || imagen.size === 0) return null;

      console.log(
        `✅ Subiendo ${nombreBase}: ${imagen.name} | Tamaño: ${imagen.size} bytes`
      );

      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = imagen.name.split(".").pop();
      const fileName = `${nombreBase}_${timestamp}_${randomStr}.${extension}`;

      const BUCKET_NAME = CONSTANTS.SUPABASE.BUCKETS.CUARTOS_IMAGES;

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, imagen, {
            cacheControl: "3600",
            upsert: false,
            duplex: "half",
          });

        if (uploadError) {
          console.error(`💥 Error subiendo ${nombreBase}:`, uploadError);

          if (
            uploadError.message.includes("413") ||
            uploadError.message.includes("too large")
          ) {
            throw new Error(
              `La imagen ${nombreBase} es muy grande. Reduce el tamaño.`
            );
          } else if (uploadError.message.includes("timeout")) {
            throw new Error(
              `Timeout subiendo ${nombreBase}. Intenta de nuevo.`
            );
          } else {
            throw new Error(
              `Error subiendo ${nombreBase}: ${uploadError.message}`
            );
          }
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        console.log(
          `🎉 ${nombreBase} subida exitosamente:`,
          publicUrlData.publicUrl
        );
        return publicUrlData.publicUrl;
      } catch (error) {
        console.error(`💥 Error procesando ${nombreBase}:`, error);
        throw error;
      }
    }

    // Subir imágenes
    let imagen_1_url = null;
    let imagen_2_url = null;
    let imagen_3_url = null;

    try {
      if (imagen_1 && imagen_1.size > 0) {
        imagen_1_url = await subirImagen(imagen_1, "cuarto_1");
      }
      if (imagen_2 && imagen_2.size > 0) {
        imagen_2_url = await subirImagen(imagen_2, "cuarto_2");
      }
      if (imagen_3 && imagen_3.size > 0) {
        imagen_3_url = await subirImagen(imagen_3, "cuarto_3");
      }
    } catch (storageError) {
      console.error("💥 Error de almacenamiento:", storageError);
      return new Response(
        JSON.stringify({
          error: "Error procesando imágenes",
          details: storageError.message,
          success: false,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("💾 Guardando en base de datos...");

    // ✅ INSERTAR EN BASE DE DATOS CON TODOS LOS CAMPOS
    const { data: cuartoData, error: dbError } = await supabase
      .from("cuartos")
      .insert([
        {
          titulo, // ✅ Usar 'titulo' consistentemente
          descripcion,
          precio,
          celular, // ✅ Nuevo campo
          caracteristicas, // ✅ Nuevo campo
          ubicacion, // ✅ Nuevo campo
          latitud,
          longitud,
          imagen_principal: imagen_1_url,
          imagen_1: imagen_1_url,
          imagen_2: imagen_2_url,
          imagen_3: imagen_3_url,
          user_id: user.id,
          activo: true, // ✅ Campo activo
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("💥 Error insertando en BD:", dbError);
      return new Response(
        JSON.stringify({
          error: "Error guardando cuarto en la base de datos",
          details: dbError.message,
          success: false,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("🎉 Cuarto creado exitosamente:", cuartoData.id);

    return new Response(
      JSON.stringify({
        success: true,
        cuarto: cuartoData,
        message: "Cuarto agregado exitosamente",
        imagenesSubidas: {
          imagen_1: !!imagen_1_url,
          imagen_2: !!imagen_2_url,
          imagen_3: !!imagen_3_url,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("💥 Error general:", error);

    let errorMessage = "Error interno del servidor";
    let statusCode = 500;

    if (error.message === "Request timeout") {
      errorMessage = "La solicitud tardó demasiado. Intenta de nuevo.";
      statusCode = 408;
    } else if (error.message.includes("FormData")) {
      errorMessage = "Error procesando los datos del formulario.";
      statusCode = 400;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error.message,
        success: false,
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
