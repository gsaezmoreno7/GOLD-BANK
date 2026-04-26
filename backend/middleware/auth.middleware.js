const { supabase } = require('../config/supabase');
const { ApiError } = require('../utils/errors');

/**
 * Middleware para proteger rutas privadas
 * Verifica el Bearer Token contra Supabase Auth
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No autorizado. Token faltante.');
        }

        const token = authHeader.split(' ')[1];

        // Verificar token con Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new ApiError(401, 'Sesión inválida o expirada');
        }

        // Adjuntar usuario al request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware para restringir acceso a administradores
 */
const isAdmin = async (req, res, next) => {
    // Aquí podrías consultar la tabla 'profiles' para ver el rol
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

    if (profile?.role !== 'admin') {
        return next(new ApiError(403, 'Acceso denegado. Se requieren privilegios de administrador.'));
    }
    next();
};

module.exports = { authenticate, isAdmin };
