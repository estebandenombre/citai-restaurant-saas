# CitAI Restaurant SaaS

Una aplicación SaaS para restaurantes construida con Next.js, Supabase y Stripe.

## 🚀 Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Pagos**: Stripe
- **Deploy**: Vercel

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd citai-restaurant-saas
```

2. Instala las dependencias:
```bash
npm install
# o
pnpm install
```

3. Configura las variables de entorno:
```bash
cp env.example .env.local
```

4. Edita `.env.local` con tus credenciales:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Ejecuta el servidor de desarrollo:
```bash
npm run dev
# o
pnpm dev
```

## 🌐 Deploy a Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push a main

## 📝 Variables de Entorno Requeridas

- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase
- `NEXT_PUBLIC_APP_URL`: URL de tu aplicación

## 📧 Contacto

Para soporte técnico, preguntas comerciales o cualquier consulta, contáctanos en: **info@tably.digital**

## 🔧 Scripts Disponibles

- `npm run dev`: Servidor de desarrollo
- `npm run build`: Build de producción
- `npm run start`: Servidor de producción
- `npm run lint`: Linting del código
