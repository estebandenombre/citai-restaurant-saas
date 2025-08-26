-- Script para crear la tabla staff
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla staff
CREATE TABLE IF NOT EXISTS public.staff (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    restaurant_id uuid NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    role character varying DEFAULT 'staff',
    position character varying,
    hourly_rate decimal(10,2),
    hire_date date,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT staff_pkey PRIMARY KEY (id),
    CONSTRAINT staff_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT staff_role_check CHECK (role IN ('owner', 'manager', 'staff', 'waiter', 'chef', 'host', 'bartender')),
    CONSTRAINT staff_email_unique UNIQUE (email)
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_staff_restaurant_id ON staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);

-- 3. Habilitar RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS
-- Política para que los usuarios vean solo el personal de su restaurante
CREATE POLICY "Users can view own restaurant staff" ON staff
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid()
        )
    );

-- Política para que los propietarios y managers puedan insertar personal
CREATE POLICY "Owners and managers can insert staff" ON staff
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
        )
    );

-- Política para que los propietarios y managers puedan actualizar personal
CREATE POLICY "Owners and managers can update staff" ON staff
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
        )
    );

-- Política para que los propietarios y managers puedan eliminar personal
CREATE POLICY "Owners and managers can delete staff" ON staff
    FOR DELETE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
        )
    );

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para actualizar updated_at
CREATE TRIGGER update_staff_updated_at_trigger
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_staff_updated_at();

-- 7. Verificar que la tabla se creó correctamente
SELECT 
    'Tabla staff creada exitosamente' as status,
    COUNT(*) as total_staff
FROM staff;

-- 8. Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'staff' 
ORDER BY ordinal_position;

