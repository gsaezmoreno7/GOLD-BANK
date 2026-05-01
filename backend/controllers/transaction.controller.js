const { supabaseAdmin } = require('../config/supabase');
const { asyncHandler, ApiError } = require('../utils/errors');

/**
 * Transferencia entre cuentas
 */
exports.transfer = asyncHandler(async (req, res) => {
    const { amount, destination, description, destination_bank_url, receiver_name, receiver_rut, receiver_email } = req.body;
    const userId = req.user.id;

    if (amount <= 0) throw new ApiError(400, 'El monto debe ser superior a 0');

    // 1. Obtener cuenta origen
    const { data: senderAcc, error: senderErr } = await supabaseAdmin
        .from('accounts')
        .select('*, profiles(full_name)')
        .eq('user_id', userId)
        .single();

    if (senderErr || senderAcc.balance < amount) throw new ApiError(400, 'Saldo insuficiente');

    // --- FLUJO TRANSFERENCIA EXTERNA ---
    if (destination_bank_url) {
        // Descontar del emisor
        const { error: updSenderErr } = await supabaseAdmin
            .from('accounts')
            .update({ balance: senderAcc.balance - amount })
            .eq('id', senderAcc.id);

        if (updSenderErr) throw new ApiError(500, 'Error procesando débito para transferencia externa');

        try {
            // Llamar a la API del banco externo
            const response = await fetch(destination_bank_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination,
                    amount,
                    origin_bank: 'Gold Bank',
                    description: description || `Transferencia de ${senderAcc.profiles.full_name}`,
                    receiver_name,
                    receiver_rut,
                    receiver_email
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`El banco destino rechazó la transacción: ${errorData}`);
            }

            // Registrar Transacción Exitosa
            await supabaseAdmin.from('transactions').insert([{
                account_id: senderAcc.id,
                type: 'transfer_out',
                amount,
                balance_after: senderAcc.balance - amount,
                description: `Transferencia Externa a ${destination}: ${description}`,
                destination_account: destination,
                ip_address: req.ip
            }]);

            return res.json({
                status: 'success',
                message: 'Transferencia externa realizada con éxito',
                data: { amount, receiver: destination, bank: destination_bank_url }
            });

        } catch (err) {
            // Rollback en caso de falla de la API externa
            await supabaseAdmin.from('accounts').update({ balance: senderAcc.balance }).eq('id', senderAcc.id);
            throw new ApiError(500, `Fallo en transferencia externa: ${err.message}`);
        }
    }

    // --- FLUJO TRANSFERENCIA INTERNA ---
    // 2. Buscar cuenta destino (puede ser por RUT o Número de cuenta)
    const { data: receiverAcc, error: receiverErr } = await supabaseAdmin
        .from('accounts')
        .select('*, profiles(full_name)')
        .or(`account_number.eq.${destination}, user_id.in.(SELECT id FROM profiles WHERE rut='${destination}')`)
        .single();

    if (receiverErr) throw new ApiError(404, 'Cuenta de destino no válida o no encontrada');
    if (receiverAcc.id === senderAcc.id) throw new ApiError(400, 'No puede transferirse a sí mismo');

    // 3. Ejecutar Movimientos
    const { error: updSenderErr } = await supabaseAdmin
        .from('accounts')
        .update({ balance: senderAcc.balance - amount })
        .eq('id', senderAcc.id);

    if (updSenderErr) throw new ApiError(500, 'Error procesando débito');

    const { error: updReceiverErr } = await supabaseAdmin
        .from('accounts')
        .update({ balance: parseFloat(receiverAcc.balance) + parseFloat(amount) })
        .eq('id', receiverAcc.id);

    if (updReceiverErr) {
        await supabaseAdmin.from('accounts').update({ balance: senderAcc.balance }).eq('id', senderAcc.id);
        throw new ApiError(500, 'Error procesando abono');
    }

    // 4. Registrar Transacciones
    const tOut = {
        account_id: senderAcc.id,
        type: 'transfer_out',
        amount,
        balance_after: senderAcc.balance - amount,
        description: `Transferencia a ${receiverAcc.profiles.full_name}: ${description}`,
        destination_account: destination,
        ip_address: req.ip
    };

    const tIn = {
        account_id: receiverAcc.id,
        type: 'transfer_in',
        amount,
        balance_after: parseFloat(receiverAcc.balance) + parseFloat(amount),
        description: `Transferencia recibida de ${senderAcc.profiles.full_name}: ${description}`,
        ip_address: req.ip
    };

    await supabaseAdmin.from('transactions').insert([tOut, tIn]);

    res.json({
        status: 'success',
        message: 'Transferencia realizada con éxito',
        data: { amount, receiver: receiverAcc.profiles.full_name }
    });
});

/**
 * Obtener historial de transacciones
 */
exports.getHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Obtener ID de cuenta
    const { data: account } = await supabaseAdmin.from('accounts').select('id').eq('user_id', userId).single();

    if (!account) throw new ApiError(404, 'Cuenta no encontrada');

    const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('account_id', account.id)
        .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, 'Error al obtener historial');

    res.json({
        status: 'success',
        data: transactions
    });
});

/**
 * Abonar dinero (Depósito propio)
 */
exports.deposit = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id;

    if (amount <= 0) throw new ApiError(400, 'Monto inválido');

    const { data: account } = await supabaseAdmin.from('accounts').select('*').eq('user_id', userId).single();
    
    const newBalance = parseFloat(account.balance) + parseFloat(amount);

    await supabaseAdmin.from('accounts').update({ balance: newBalance }).eq('id', account.id);

    await supabaseAdmin.from('transactions').insert([{
        account_id: account.id,
        type: 'deposit',
        amount,
        balance_after: newBalance,
        description: 'Abono realizado por el usuario',
        ip_address: req.ip
    }]);

    res.json({
        status: 'success',
        message: 'Abono exitoso',
        data: { newBalance }
    });
});

/**
 * Abono externo (Transferencia desde banco del profesor u otro banco)
 */
exports.externalDeposit = asyncHandler(async (req, res) => {
    const { amount, destination, origin_bank = 'Banco Externo', description = 'Transferencia interbancaria' } = req.body;

    if (!amount || amount <= 0) throw new ApiError(400, 'Monto inválido');
    if (!destination) throw new ApiError(400, 'Destino (RUT o N° de Cuenta) es requerido');

    // Buscar cuenta destino por RUT o Número de cuenta
    const { data: receiverAcc, error: receiverErr } = await supabaseAdmin
        .from('accounts')
        .select('*, profiles(full_name)')
        .or(`account_number.eq.${destination}, user_id.in.(SELECT id FROM profiles WHERE rut='${destination}')`)
        .single();

    if (receiverErr) throw new ApiError(404, 'Cuenta de destino no encontrada en Gold Bank');

    // Abonar al receptor
    const newBalance = parseFloat(receiverAcc.balance) + parseFloat(amount);
    const { error: updReceiverErr } = await supabaseAdmin
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', receiverAcc.id);

    if (updReceiverErr) throw new ApiError(500, 'Error procesando abono externo');

    // Registrar Transacción
    await supabaseAdmin.from('transactions').insert([{
        account_id: receiverAcc.id,
        type: 'transfer_in',
        amount,
        balance_after: newBalance,
        description: `Recibido desde ${origin_bank}: ${description}`,
        ip_address: req.ip
    }]);

    res.json({
        status: 'success',
        message: 'Transferencia externa recibida y acreditada con éxito',
        data: { 
            amount, 
            receiver: receiverAcc.profiles.full_name,
            account: receiverAcc.account_number 
        }
    });
});
