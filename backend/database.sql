-- =============================================
-- 🏦 GOLD BANK — Esquema Maestro de Base de Datos
-- =============================================

-- 1. EXTENSIONES (Si se requieren)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: profiles (Información del Usuario)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  rut TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: accounts (Cuentas Bancarias)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_number TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings')),
  balance NUMERIC(15, 2) DEFAULT 0 CHECK (balance >= 0),
  currency TEXT DEFAULT 'CLP',
  card_status TEXT DEFAULT 'active' CHECK (card_status IN ('active', 'blocked', 'requested')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: transactions (Movimientos)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(15, 2),
  description TEXT,
  destination_account TEXT, -- RUT o N° de cuenta destino
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  
  -- Seguridad y Geolocalización
  ip_address TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: audit_logs (Auditoría para el Administrador)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'login', 'transfer', 'change_password', etc.
  details JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles: El usuario solo puede ver su propio perfil
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para cuentas: El usuario solo puede ver sus propias cuentas
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);

-- Políticas para transacciones: El usuario solo puede ver sus propias transacciones
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT 
USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

-- Los administradores pueden ver todo (esto se puede configurar más fino, pero por ahora habilitamos acceso total al admin role)
-- Nota: En Supabase, el service_role ya ignora estas políticas, por lo que el backend podrá operar libremente.

-- 7. ÍNDICES PARA RENDIMIENTO
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- 8. AUTOMATIZACIÓN: Sincronización con Supabase Auth
-- Esta función se ejecuta cada vez que un usuario se registra en la plataforma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear el perfil en nuestra tabla pública usando la metadata del registro
  INSERT INTO public.profiles (id, full_name, email, rut, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario Gold'), 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'rut', 'PENDIENTE-' || floor(random() * 1000000)::text),
    'user'
  );

  -- Crear automáticamente la primera cuenta bancaria del usuario
  INSERT INTO public.accounts (user_id, account_number, balance, account_type)
  VALUES (
    NEW.id, 
    'GB-' || floor(random() * 900000 + 100000)::text, 
    100000, -- Bono de apertura: $100.000 CLP
    'checking'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que vincula el Auth de Supabase con nuestra función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
