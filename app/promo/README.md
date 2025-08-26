# Página de Promoción - Tably

## Descripción

Página de promoción optimizada para Tably, diseñada específicamente para grabación en resolución 1920×1080. La página sigue una estructura narrativa clara: problema → logo → solución → prueba social → CTA.

## Características

### 🎯 Optimización para Grabación
- **Resolución**: Optimizada para 1920×1080
- **Duración**: Preparada para captura fluida en ~60 segundos
- **Contenedor de video**: Aspecto 16:9 con poster placeholder

### 📖 Estructura Narrativa
1. **Problema**: Sección hero que identifica el dolor del restaurante
2. **Logo**: Presentación de la marca Tably
3. **Solución**: Grid de 6 beneficios + 3 pasos de implementación
4. **Prueba Social**: Testimonios de clientes
5. **CTA**: Llamadas a la acción claras

### ✨ Animaciones y UX
- **Animaciones suaves**: Fade-up, stagger, parallax ligero
- **Reduced Motion**: Respeta `prefers-reduced-motion`
- **Accesibilidad**: Alto contraste, AA compliance
- **Performance**: Peso <1.5 MB

### 🎨 Diseño
- **Tipografía**: Inter + Manrope
- **Paleta**: Moderna con alto contraste
- **Responsive**: Optimizada para móvil y desktop

## Archivos

```
app/promo/
├── page.tsx          # Página principal
├── layout.tsx        # Layout específico con SEO
├── loading.tsx       # Estado de carga
├── not-found.tsx     # Página 404
├── promo.css         # Estilos personalizados
└── README.md         # Esta documentación
```

## Uso

### Acceso
La página está disponible en: `http://localhost:3000/promo`

### Navegación
- **Anclas**: `#problema`, `#solucion`, `#testimonios`, `#demo`
- **Botones CTA**: "Probar Tably" y "Solicitar demo"

### Personalización

#### Colores
```css
/* Paleta principal */
--blue-600: #2563eb
--indigo-700: #4338ca
--slate-900: #0f172a
--red-600: #dc2626
```

#### Contenido
Edita los arrays en `page.tsx`:
- `benefits`: 6 beneficios principales
- `steps`: 3 pasos de implementación
- `testimonials`: Testimonios de clientes

#### Imágenes
- Logo principal: `/tably_logo.png`
- Logo completo: `/tably_logo_completo.png`
- Video placeholder: Contenedor 16:9 con poster

## Optimizaciones

### Performance
- **Lazy loading**: Imágenes y componentes
- **CSS optimizado**: Animaciones con `will-change`
- **Font loading**: `display: swap` para tipografías

### SEO
- **Meta tags**: Título, descripción, Open Graph
- **Estructura**: Headings semánticos
- **Accesibilidad**: ARIA labels, focus states

### Accesibilidad
- **Contraste**: AA compliance
- **Navegación**: Keyboard accessible
- **Screen readers**: Textos alternativos

## Captura de Video

### Configuración Recomendada
- **Resolución**: 1920×1080
- **FPS**: 30 o 60
- **Duración**: 60-90 segundos
- **Scroll**: Suave y pausado

### Puntos Clave
1. **Hero**: 10-15 segundos
2. **Logo**: 5 segundos
3. **Beneficios**: 20-25 segundos
4. **Testimonios**: 10-15 segundos
5. **CTA**: 10-15 segundos

## Mantenimiento

### Actualizaciones
- **Contenido**: Editar arrays en `page.tsx`
- **Estilos**: Modificar `promo.css`
- **SEO**: Actualizar `layout.tsx`

### Testing
- **Responsive**: Probar en diferentes dispositivos
- **Performance**: Lighthouse audit
- **Accesibilidad**: WAVE evaluation

## Dependencias

- Next.js 15
- React 19
- Tailwind CSS
- Lucide React (iconos)
- Radix UI (componentes)

## Licencia

© 2024 Tably. Todos los derechos reservados.
