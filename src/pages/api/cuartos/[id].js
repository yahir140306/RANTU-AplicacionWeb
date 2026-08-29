import { validateRoomData } from '../../../utils/validators.js';
import { CONSTANTS } from "../../../utils/constants.js";
import { createClient } from "../../../lib/supabase";

export async function DELETE({ params, request, cookies }) {
  console.log("🗑️ DELETE cuarto:", params.id);

  try {
    const supabase = createClient({ request, cookies });

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Debes iniciar sesión para eliminar un cuarto",
          success: false,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const cuartoId = parseInt(params.id);

    console.log("🔍 Buscando cuarto ID:", cuartoId, "para usuario:", user.id);

    // Verificar que el cuarto pertenece al usuario
    const { data: cuarto, error: fetchError } = await supabase
      .from("cuartos")
      .select("*")
      .eq("id", cuartoId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !cuarto) {
      console.error("❌ Error o cuarto no encontrado:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Cuarto no encontrado o no tienes permisos para eliminarlo",
          debug: {
            cuartoId: cuartoId,
            userId: user.id,
            fetchError: fetchError,
          },
          success: false,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Cuarto encontrado:", cuarto.id, "- Título:", cuarto.titulo);

    // Marcar el cuarto como inactivo (eliminación lógica)
    console.log("🔄 Marcando cuarto como inactivo (eliminación lógica)...");
    console.log("📊 Datos de eliminación:", {
      cuartoId: cuartoId,
      userId: user.id,
      cuartoTitulo: cuarto.titulo,
    });

    // Intentar actualización
    const { data: updatedData, error: updateError } = await supabase
      .from("cuartos")
      .update({ activo: false })
      .eq("id", cuartoId)
      .eq("user_id", user.id)
      .select();

    console.log("🔍 Resultado de eliminación lógica:", {
      updatedData: updatedData,
      updateError: updateError,
      updatedCount: updatedData?.length || 0,
    });

    if (updateError) {
      console.error("💥 Error marcando cuarto como inactivo:", updateError);
      return new Response(
        JSON.stringify({
          error: "Error eliminando cuarto",
          details: updateError.message,
          debug: {
            cuartoId: cuartoId,
            userId: user.id,
          },
          success: false,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar si se actualizó algo
    if (!updatedData || updatedData.length === 0) {
      console.warn(
        "⚠️ No se pudo marcar el cuarto como inactivo - RLS bloqueando"
      );
      return new Response(
        JSON.stringify({
          error:
            "No se pudo eliminar el cuarto debido a políticas de seguridad",
          details:
            "Las políticas de Row Level Security (RLS) en Supabase están bloqueando la operación de UPDATE",
          solution: "Configura las políticas RLS en el Dashboard de Supabase",
          debug: {
            cuartoId: cuartoId,
            userId: user.id,
            rlsBlocking: true,
          },
          success: false,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Cuarto eliminado exitosamente:", cuartoId);

    return new Response(
      JSON.stringify({
        success: true,
        mensaje: "Cuarto eliminado exitosamente",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error general eliminando cuarto:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST({ params, request, cookies }) {
  console.log("✏️ UPDATE cuarto:", params.id);

  try {
    const supabase = createClient({ request, cookies });

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Debes iniciar sesión para editar un cuarto",
          success: false,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const cuartoId = parseInt(params.id);
    const formData = await request.formData();

    // Verificar que el cuarto pertenece al usuario
    const { data: cuartoExistente, error: fetchError } = await supabase
      .from("cuartos")
      .select("*")
      .eq("id", cuartoId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !cuartoExistente) {
      return new Response(
        JSON.stringify({
          error: "Cuarto no encontrado o no tienes permisos para editarlo",
          success: false,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extraer datos del formulario
    
    const titulo = formData.get("titulo")?.toString()?.trim();
    const precio = formData.get("precio");
    const descripcion = formData.get("descripcion")?.toString()?.trim();
    const ubicacion = formData.get("ubicacion")?.toString()?.trim();
    const caracteristicas = formData.get("caracteristicas")?.toString()?.trim();
    const celular = formData.get("celular")?.toString()?.trim();
    const latitud = formData.get("latitud");
    const longitud = formData.get("longitud");
    const disponible = formData.get("disponible") === "on";

    const errorValidation = validateRoomData({ titulo, descripcion, precio, celular, caracteristicas, ubicacion });
    if (errorValidation) {
      return new Response(JSON.stringify({ error: errorValidation, success: false }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const updateData = {
        titulo,
        precio: parseFloat(precio),
        descripcion,
        ubicacion,
        caracteristicas,
        celular,
        latitud: latitud ? parseFloat(latitud) : null,
        longitud: longitud ? parseFloat(longitud) : null,
        disponible
    };

    // ✅ PROCESAR IMÁGENES
    console.log("📸 Procesando imágenes...");

    // Procesar imagen_1 (principal)
    const imagen1File = formData.get("imagen_1");
    if (imagen1File && imagen1File.size > 0) {
      console.log("🖼️ Nueva imagen_1 detectada:", imagen1File.name);

      // Crear nombre único para evitar conflictos
      const timestamp = Date.now();
      const extension = imagen1File.name.split(".").pop();
      const fileName = `cuarto_${cuartoId}_1_${timestamp}.${extension}`;

      // Subir a Supabase Storage
      const { data: uploadData1, error: uploadError1 } = await supabase.storage
        .from(CONSTANTS.SUPABASE.BUCKETS.CUARTOS_IMAGES)
        .upload(fileName, imagen1File, {
          contentType: imagen1File.type,
          upsert: true,
        });

      if (uploadError1) {
        console.error("❌ Error subiendo imagen_1:", uploadError1);
      } else {
        // Obtener URL pública
        const { data: publicUrl1 } = supabase.storage
          .from(CONSTANTS.SUPABASE.BUCKETS.CUARTOS_IMAGES)
          .getPublicUrl(fileName);

        updateData.imagen_1 = publicUrl1.publicUrl;
        console.log("✅ Imagen_1 actualizada:", publicUrl1.publicUrl);
      }
    }

    // Procesar imagen_2
    const imagen2File = formData.get("imagen_2");
    if (imagen2File && imagen2File.size > 0) {
      console.log("�️ Nueva imagen_2 detectada:", imagen2File.name);

      const timestamp = Date.now();
      const extension = imagen2File.name.split(".").pop();
      const fileName = `cuarto_${cuartoId}_2_${timestamp}.${extension}`;

      const { data: uploadData2, error: uploadError2 } = await supabase.storage
        .from(CONSTANTS.SUPABASE.BUCKETS.CUARTOS_IMAGES)
        .upload(fileName, imagen2File, {
          contentType: imagen2File.type,
          upsert: true,
        });

      if (uploadError2) {
        console.error("❌ Error subiendo imagen_2:", uploadError2);
      } else {
        const { data: publicUrl2 } = supabase.storage
          .from(CONSTANTS.SUPABASE.BUCKETS.CUARTOS_IMAGES)
          .getPublicUrl(fileName);

        updateData.imagen_2 = publicUrl2.publicUrl;
        console.log("✅ Imagen_2 actualizada:", publicUrl2.publicUrl);
      }
    }

    // Procesar imagen_3
    const imagen3File = formData.get("imagen_3");
    if (imagen3File && imagen3File.size > 0) {
      console.log("🖼️ Nueva imagen_3 detectada:", imagen3File.name);

      const timestamp = Date.now();
      const extension = imagen3File.name.split(".").pop();
      const fileName = `cuarto_${cuartoId}_3_${timestamp}.${extension}`;

      const { data: uploadData3, error: uploadError3 } = await supabase.storage
        .from(CONSTANTS.SUPABASE.BUCKETS.CUARTOS_IMAGES)
        .upload(fileName, imagen3File, {
          contentType: imagen3File.type,
          upsert: true,
        });

      if (uploadError3) {
        console.error("❌ Error subiendo imagen_3:", uploadError3);
      } else {
        const { data: publicUrl3 } = supabase.storage
          .from(CONSTANTS.SUPABASE.BUCKETS.CUARTOS_IMAGES)
          .getPublicUrl(fileName);

        updateData.imagen_3 = publicUrl3.publicUrl;
        console.log("✅ Imagen_3 actualizada:", publicUrl3.publicUrl);
      }
    }

    console.log("�📝 Datos finales a actualizar:", updateData);

    // Actualizar el cuarto
    const { data: cuartoActualizado, error: updateError } = await supabase
      .from("cuartos")
      .update(updateData)
      .eq("id", cuartoId)
      .eq("user_id", user.id)
      .select("*");

    if (updateError) {
      console.error("Error actualizando cuarto:", updateError);
      return new Response(
        JSON.stringify({
          error: "Error actualizando cuarto",
          details: updateError.message,
          success: false,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!cuartoActualizado || cuartoActualizado.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No se pudo actualizar el cuarto - posible problema con RLS",
          debug: {
            cuartoId: cuartoId,
            userId: user.id,
            rlsIssue: true,
          },
          success: false,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("🎉 Cuarto actualizado exitosamente:", cuartoActualizado);

    // Tomar el primer resultado si hay múltiples
    const cuarto = Array.isArray(cuartoActualizado)
      ? cuartoActualizado[0]
      : cuartoActualizado;

    return new Response(
      JSON.stringify({
        success: true,
        cuarto: cuarto,
        mensaje: "Cuarto actualizado exitosamente",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error general actualizando cuarto:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
