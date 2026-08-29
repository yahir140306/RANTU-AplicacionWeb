import { defineMiddleware } from "astro:middleware";
import { createClient } from "./lib/supabase";

const protectedRoutes = [
  "/mis-cuartos",
  "/agregar-cuarto",
  "/editar-cuarto",
  "/protected"
];

const authRoutes = [
  "/iniciar",
  "/registrar"
];

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	const supabase = createClient({
		request: context.request,
		cookies: context.cookies,
	});

    // Check if the current route needs protection
    const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));

    if (isProtectedRoute || isAuthRoute) {
        const { data } = await supabase.auth.getUser();
        const user = data.user;

        // Si intenta entrar a ruta privada y no está logueado -> login
        if (isProtectedRoute && !user) {
            return context.redirect("/iniciar");
        }

        // Si intenta entrar a login/registro y ya está logueado -> mis-cuartos
        if (isAuthRoute && user) {
            return context.redirect("/mis-cuartos");
        }
    }

	return next();
});
