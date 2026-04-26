const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY son requeridos en el .env');
}

// Cliente público (respeta RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente administrador (salta RLS) - SOLO para operaciones internas del servidor
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = { supabase, supabaseAdmin };
