# Sistema de Solicitudes de Upgrade

Este sistema permite a los usuarios solicitar cambios de plan que requieren aprobación del administrador antes de ser procesados.

## 🚀 Características

### **Para Usuarios:**
- **Solicitudes de Upgrade**: Los usuarios pueden solicitar cambios de plan con justificación
- **Seguimiento de Estado**: Los usuarios pueden ver el estado de sus solicitudes
- **Cancelación**: Los usuarios pueden cancelar solicitudes pendientes
- **Información Clara**: Proceso de revisión explicado detalladamente

### **Para Administradores:**
- **Panel de Administración Completo**: Dashboard interactivo con múltiples pestañas
- **Gestión Detallada de Usuarios**: Información completa de todos los usuarios del SaaS
- **Gestión Directa de Suscripciones**: Cambiar planes, extender períodos de prueba, cancelar suscripciones
- **Estadísticas en Tiempo Real**: Métricas de usuarios, suscripciones, ingresos y solicitudes
- **Revisión de Solicitudes**: Interfaz intuitiva para aprobar/rechazar solicitudes
- **Historial de Suscripciones**: Ver el historial completo de cambios de plan de cada usuario
- **Notas de Administrador**: Agregar comentarios al aprobar/rechazar o gestionar suscripciones
- **Información de Usuarios**: Detalles de pedidos, ingresos, estado de onboarding
- **Autenticación Segura**: Sistema de login dedicado para administradores

## 📋 Instalación

### 1. Ejecutar Scripts SQL

Ejecuta los siguientes scripts en orden:

```sql
-- Crear tablas y configurar el sistema (ejecutar primero)
\i scripts/51-check-upgrade-tables.sql

-- Verificar que todo funciona
\i scripts/52-test-upgrade-system.sql

-- Probar el dashboard completo
\i scripts/54-test-admin-dashboard.sql
```

**Nota**: Si tienes problemas con el login de admin, el sistema ahora usa credenciales hardcodeadas para simplificar:
- **Email**: admin@tably.com
- **Contraseña**: admin123

### 2. Credenciales de Administrador

- **Email**: admin@tably.com
- **Contraseña**: admin123
- **URL de Login**: `/admin/login`
- **URL del Dashboard**: `/admin`

## 🔧 Funcionamiento

### Para Usuarios

1. **Solicitar Upgrade**:
   - Ir a `/pricing`
   - Hacer clic en "Request Upgrade" en el plan deseado
   - Completar el formulario con razón (opcional)
   - Enviar solicitud

2. **Seguir Estado**:
   - En `/pricing` aparecerá una sección "Your Upgrade Requests"
   - Ver estado: Pending, Approved, Rejected, Cancelled
   - Cancelar solicitudes pendientes si es necesario

### Para Administradores

1. **Acceder al Panel**:
   - Ir a `/admin/login`
   - Iniciar sesión con credenciales de admin
   - Serás redirigido a `/admin`

2. **Dashboard Completo**:
   - **Overview**: Estadísticas generales y usuarios/solicitudes recientes
   - **Users**: Lista completa de usuarios con información detallada
   - **Requests**: Gestión de solicitudes de upgrade

3. **Gestionar Solicitudes**:
   - Ver todas las solicitudes en el dashboard
   - Estadísticas en tiempo real
   - Hacer clic en "Review" para solicitudes pendientes
   - Aprobar o rechazar con notas opcionales

 4. **Información de Usuarios**:
    - Ver detalles completos de cada usuario
    - Estadísticas de pedidos e ingresos
    - Estado de suscripción y onboarding
    - Información del restaurante
    - **Gestionar Planes**: Cambiar el plan de suscripción del usuario
    - **Extender Prueba**: Añadir días adicionales al período de prueba
    - **Cancelar Suscripción**: Cancelar la suscripción activa del usuario
    - **Historial de Cambios**: Ver todos los cambios de plan realizados

## 📊 Estados de Solicitud

- **Pending**: Esperando revisión del administrador
- **Approved**: Aprobada por el administrador
- **Rejected**: Rechazada por el administrador
- **Cancelled**: Cancelada por el usuario

## 🗄️ Estructura de Base de Datos

### Tabla `upgrade_requests`
```sql
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- current_plan_id (UUID, FK -> subscription_plans.id)
- requested_plan_id (UUID, FK -> subscription_plans.id)
- status (VARCHAR: pending/approved/rejected/cancelled)
- reason (TEXT, opcional)
- admin_notes (TEXT, opcional)
- admin_user_id (UUID, FK -> admin_users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- processed_at (TIMESTAMP, opcional)
```

### Tabla `admin_users`
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- role (VARCHAR: admin/super_admin)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔒 Seguridad

- **RLS (Row Level Security)**: Los usuarios solo ven sus propias solicitudes
- **Autenticación de Admin**: Sistema separado de autenticación para administradores
- **Validación**: Verificación de permisos en todas las operaciones

## 🎯 Flujo de Trabajo

1. **Usuario solicita upgrade** → Estado: Pending
2. **Admin revisa solicitud** → Lee razón y detalles del usuario
3. **Admin aprueba/rechaza** → Estado: Approved/Rejected
4. **Usuario ve resultado** → En su dashboard de solicitudes

## 📱 URLs Importantes

- **Página de Planes**: `/pricing`
- **Login de Admin**: `/admin/login`
- **Dashboard de Admin**: `/admin`

## 🛠️ Personalización

### Cambiar Credenciales de Admin

1. Ejecutar script SQL para actualizar contraseña:
```sql
UPDATE admin_users 
SET password_hash = 'nuevo_hash_bcrypt'
WHERE email = 'admin@tably.com';
```

### Agregar Más Admins

```sql
INSERT INTO admin_users (email, password_hash, first_name, last_name, role) 
VALUES (
  'nuevo@admin.com', 
  'hash_bcrypt_aqui',
  'Nombre', 
  'Apellido', 
  'admin'
);
```

## 🐛 Solución de Problemas

### Error: "User not found"
- Verificar que el usuario existe en `public.users`
- Verificar que el email coincide con `auth.users`

### Error: "Invalid credentials"
- Verificar credenciales de admin
- Verificar que el admin está activo (`is_active = true`)

### No aparecen solicitudes
- Verificar RLS policies
- Verificar que el usuario está autenticado
- Verificar foreign keys

## 🔄 Próximos Pasos

1. **Implementar notificaciones por email** cuando se apruebe/rechace una solicitud o se cambie un plan
2. **Agregar más métricas** al dashboard de admin
3. **Implementar sistema de pagos** para upgrades aprobados
4. **Agregar filtros y búsqueda** en el panel de admin
5. **Implementar auditoría** de cambios de plan
6. **Agregar exportación de datos** para reportes
7. **Implementar notificaciones push** para cambios de suscripción
