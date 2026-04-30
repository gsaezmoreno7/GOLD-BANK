const { supabase, supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');
const bcrypt = require('bcryptjs');

/**
 * Registro de Usuario Premium
 * 1. Crea usuario en Supabase Auth
 * 2. Crea perfil en tabla pública
 * 3. Crea cuenta bancaria con saldo inicial ($2.500.000)
 * 4. Registra auditoría
 */
exports.register = asyncHandler(async (req, res) => {
    const { email, password, full_name, rut } = req.body;

    // 1. Registro en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) throw new ApiError(400, `Error Auth: ${authError.message}`);

    const userId = authData.user.id;

    // 2. Crear Perfil (Usamos admin para saltar RLS en inserción inicial)
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{ id: userId, full_name, rut, email }]);

    if (profileError) {
        // Rollback manual de auth si falla el perfil
        await supabaseAdmin.auth.admin.deleteUser(userId);
        
        // Manejar error de RUT duplicado de forma amigable
        if (profileError.code === '23505' || profileError.message.includes('profiles_rut_key')) {
            throw new ApiError(400, 'Este RUT ya se encuentra registrado en el sistema. Por favor, inicie sesión.');
        }
        
        throw new ApiError(400, `Error Perfil: ${profileError.message}`);
    }

    // 3. Crear Cuenta Bancaria
    const accountNumber = 'GB-' + Math.floor(10000000 + Math.random() * 90000000);
    const { data: account, error: accountError } = await supabaseAdmin
        .from('accounts')
        .insert([{ 
            user_id: userId, 
            account_number: accountNumber, 
            balance: 2500000, 
            currency: 'CLP' 
        }])
        .select()
        .single();

    if (accountError) throw new ApiError(400, `Error Cuenta: ${accountError.message}`);

    // 4. Auditoría
    await supabaseAdmin.from('audit_logs').insert([{
        user_id: userId,
        action: 'REGISTER_SUCCESS',
        details: { message: 'Usuario registrado con bono de apertura' },
        ip_address: req.ip
    }]);

    res.status(201).json({
        status: 'success',
        message: 'Bienvenido a Gold Bank. Su cuenta ha sido activada.',
        data: {
            user: { id: userId, email, full_name, rut },
            account: { number: accountNumber, balance: 2500000 }
        }
    });
});

/**
 * Login de Usuario
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw new ApiError(401, 'Credenciales inválidas');

    // Registrar auditoría
    await supabaseAdmin.from('audit_logs').insert([{
        user_id: data.user.id,
        action: 'LOGIN_SUCCESS',
        ip_address: req.ip
    }]);

    res.json({
        status: 'success',
        message: 'Acceso concedido',
        data: {
            session: data.session,
            user: data.user
        }
    });
});
