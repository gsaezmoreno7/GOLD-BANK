const { supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');

/**
 * Obtener información de la cuenta del usuario autenticado
 */
exports.getMe = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Obtener perfil
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) throw new ApiError(404, 'Perfil no encontrado');

    // Obtener cuenta principal
    const { data: account, error: accountError } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (accountError) throw new ApiError(404, 'Cuenta bancaria no encontrada');

    res.json({
        status: 'success',
        data: {
            profile,
            account
        }
    });
});
