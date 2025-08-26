'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  Play,
  ChevronDown,
  Database,
  BarChart3,
  FileText,
  Settings,
  Globe,
  Lock,
  ArrowLeft,
  ArrowUp
} from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './promo.css'

// Registrar ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function PromoPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const slidesRef = useRef<(HTMLDivElement | null)[]>([])

  const slides = [
    {
      id: 'problema',
      title: '¿Tus reportes financieros toman horas o días?',
      subtitle: 'Copias manuales de datos, fórmulas rotas y pérdida de tiempo en cierres están afectando tu rentabilidad.',
      image: '/placeholder.jpg',
      color: 'from-red-500 to-orange-500',
      icon: <Clock className="w-16 h-16" />,
      badge: '⚠️ Problema Crítico'
    },
    {
      id: 'logo',
      title: 'Con Tably todo cambia',
      subtitle: 'La plataforma que conecta, modela y automatiza tus datos financieros',
      image: '/tably_logo_completo.png',
      color: 'from-purple-500 to-pink-500',
      icon: null,
      badge: '✨ La Solución'
    },
    {
      id: 'trusted',
      title: 'Equipos que confían en Tably',
      subtitle: 'Marcas y restaurantes que ya optimizan sus finanzas con nuestra plataforma',
      image: '/placeholder.jpg',
      color: 'from-slate-800 to-slate-900',
      icon: null,
      badge: '🤝 Trusted by'
    },
    {
      id: 'conecta',
      title: 'Conecta tus fuentes',
      subtitle: 'Integra todas tus bases de datos y APIs en minutos. Sin código, sin complicaciones.',
      image: '/placeholder.jpg',
      color: 'from-blue-500 to-cyan-500',
      icon: <Database className="w-16 h-16" />,
      badge: '🔗 Paso 1'
    },
    {
      id: 'modela',
      title: 'Modela sin errores',
      subtitle: 'Construye modelos complejos con validación automática. Visual, intuitivo y poderoso.',
      image: '/placeholder.jpg',
      color: 'from-green-500 to-emerald-500',
      icon: <BarChart3 className="w-16 h-16" />,
      badge: '📊 Paso 2'
    },
    {
      id: 'automatiza',
      title: 'Automatiza procesos',
      subtitle: 'Reduce el trabajo manual en un 80%. Dashboards que se actualizan automáticamente.',
      image: '/placeholder.jpg',
      color: 'from-indigo-500 to-purple-500',
      icon: <Settings className="w-16 h-16" />,
      badge: '⚡ Paso 3'
    },
    {
      id: 'testimonios',
      title: 'Lo que dicen nuestros clientes',
      subtitle: '+120 equipos financieros en 14 países confían en Tably',
      image: '/placeholder.jpg',
      color: 'from-yellow-500 to-orange-500',
      icon: <Star className="w-16 h-16" />,
      badge: '⭐ Testimonios'
    },
    {
      id: 'cta',
      title: 'Haz que tus datos trabajen por ti',
      subtitle: 'Únete a cientos de equipos financieros que ya optimizaron sus operaciones con Tably',
      image: '/placeholder.jpg',
      color: 'from-[#6C63FF] to-[#5A52FF]',
      icon: <ArrowRight className="w-16 h-16" />,
      badge: '🚀 Comienza Ahora'
    }
  ]

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Crear animaciones de carrusel para cada slide
      slides.forEach((slide, index) => {
        const slideElement = slidesRef.current[index]
        if (!slideElement) return

        // Animación de entrada del slide
        gsap.fromTo(slideElement,
          { 
            opacity: 0, 
            scale: 0.8,
            y: 100
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slideElement,
              start: "top center+=100",
              end: "bottom center",
              scrub: 1,
              onEnter: () => setCurrentSlide(index),
              onEnterBack: () => setCurrentSlide(index)
            }
          }
        )

        // Animación de salida del slide
        gsap.to(slideElement,
          {
            opacity: 0,
            scale: 0.9,
            y: -50,
            duration: 0.8,
            ease: "power2.in",
            scrollTrigger: {
              trigger: slideElement,
              start: "top top",
              end: "top center",
              scrub: 1
            }
          }
        )
      })

      // Animación de elementos internos
      slides.forEach((slide, index) => {
        const slideElement = slidesRef.current[index]
        if (!slideElement) return

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: slideElement,
            start: "top center+=100",
            end: "bottom center",
            scrub: 1
          }
        })

        tl.fromTo(`#slide-${index} .slide-title`, 
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8 }
        )
        .fromTo(`#slide-${index} .slide-subtitle`, 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(`#slide-${index} .slide-badge`, 
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(`#slide-${index} .slide-icon`, 
          { opacity: 0, rotation: -180, scale: 0.5 },
          { opacity: 1, rotation: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
          "-=0.4"
        )
      })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  const scrollToSlide = (index: number) => {
    const slideElement = slidesRef.current[index]
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Top Navigation inspired by Jitter */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="flex items-center gap-3 text-white">
            <img src="/tably_logo.png" alt="Tably" className="h-7 w-auto" />
            <span className="font-semibold hidden sm:inline">Tably</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="#slide-6" className="hidden sm:block">
              <Button className="pill-cta px-5 py-2 text-sm font-semibold">Solicitar demo</Button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Navigation Dots */}
      <div className="nav-dots fixed right-8 top-1/2 transform -translate-y-1/2 z-50 space-y-4">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => scrollToSlide(index)}
            className={`nav-dot w-4 h-4 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-white scale-125 shadow-lg active' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir a ${slide.title}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#6C63FF] to-[#5A52FF] transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Slides */}
      {slides.map((slide, index) => (
        <section
          key={slide.id}
          id={`slide-${index}`}
          ref={(el) => slidesRef.current[index] = el}
          className={`min-h-screen relative flex items-center justify-center overflow-hidden`}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-90`} />
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
            {/* Badge */}
            {slide.badge && (
              <Badge className="slide-badge mb-8 bg-white/20 text-white border-white/30 hover:bg-white/30">
                {slide.badge}
              </Badge>
            )}

            {/* Icon */}
            {slide.icon && (
              <div className="slide-icon mb-8 flex justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {slide.icon}
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="slide-title text-gradient text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="slide-subtitle text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              {slide.subtitle}
            </p>

            {/* Special content for specific slides */}
            {slide.id === 'problema' && (
              <div className="slide-content">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {[
                    { icon: <Clock className="w-8 h-8" />, text: "Copias manuales de datos" },
                    { icon: <FileText className="w-8 h-8" />, text: "Fórmulas rotas" },
                    { icon: <TrendingUp className="w-8 h-8" />, text: "Pérdida de tiempo en cierres" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        {item.icon}
                      </div>
                      <p className="text-lg font-medium">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {slide.id === 'logo' && (
              <div className="slide-content">
                <div className="mb-12">
                  <img 
                    src={slide.image} 
                    alt="Tably" 
                    className="h-24 w-auto mx-auto mb-8 filter brightness-0 invert"
                  />
                </div>
                {/* Awards strip */}
                <div className="awards-strip justify-center mx-auto max-w-3xl">
                  <div className="award-badge">99.9% uptime</div>
                  <div className="award-badge">Secure by design</div>
                  <div className="award-badge">Loved by finance teams</div>
                </div>
              </div>
            )}

            {slide.id === 'trusted' && (
              <div className="slide-content">
                <div className="trusted-by mx-auto max-w-5xl">
                  <div className="marquee">
                    {['La Casa del Sabor','Urban Eats','Nova Dine','Casa Latina','Green Spoon','El Bueno','Bistro Uno','Monte Verde'].map((brand, i) => (
                      <span key={`m1-${i}`} className="logo-pill">
                        <span className="w-5 h-5 rounded-full bg-white/30 inline-block" /> {brand}
                      </span>
                    ))}
                    {['La Casa del Sabor','Urban Eats','Nova Dine','Casa Latina','Green Spoon','El Bueno','Bistro Uno','Monte Verde'].map((brand, i) => (
                      <span key={`m2-${i}`} className="logo-pill">
                        <span className="w-5 h-5 rounded-full bg-white/30 inline-block" /> {brand}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shimmer-underline" />
              </div>
            )}

            {slide.id === 'testimonios' && (
              <div className="slide-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {[
                    {
                      name: "María González",
                      role: "CFO, TechCorp",
                      content: "Tably transformó completamente nuestros procesos financieros. Redujimos el tiempo de cierre de 5 días a 2 horas.",
                      rating: 5
                    },
                    {
                      name: "Carlos Mendoza",
                      role: "Director de Analytics, DataFlow",
                      content: "La integración fue increíblemente fácil. En una semana ya teníamos dashboards funcionando al 100%.",
                      rating: 5
                    }
                  ].map((testimonial, i) => (
                    <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          {[...Array(testimonial.rating)].map((_, j) => (
                            <Star key={j} className="w-5 h-5 text-yellow-300 fill-current" />
                          ))}
                        </div>
                        <p className="text-lg italic mb-4">"{testimonial.content}"</p>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm opacity-75">{testimonial.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {slide.id === 'cta' && (
              <div className="slide-content">
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
                  <Link href="/auth/register">
                    <Button size="lg" className="bg-white text-[#6C63FF] hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                      Probar Tably Gratis
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#6C63FF] px-8 py-3 text-lg font-semibold">
                      Solicitar Demo Personalizada
                    </Button>
                  </Link>
                </div>
                <p className="text-white/80 text-sm">
                  Sin compromisos • Configuración en 30 minutos • Soporte 24/7
                </p>
              </div>
            )}

            {/* Navigation Arrows */}
            <div className="flex justify-center space-x-4 mt-12">
              {index > 0 && (
                <button
                  onClick={() => scrollToSlide(index - 1)}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
              )}
              {index < slides.length - 1 && (
                <button
                  onClick={() => scrollToSlide(index + 1)}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          {index < slides.length - 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-8 h-8 text-white/60" />
            </div>
          )}
        </section>
      ))}

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img src="/tably_logo.png" alt="Tably" className="h-8 w-auto brightness-0 invert" />
          </div>
          <p className="text-slate-400">
            © 2024 Tably. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
