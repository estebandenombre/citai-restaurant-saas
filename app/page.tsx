"use client"

import Link from "next/link"
import { Fraunces } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { VideoModal } from "@/components/video-modal"
import TawkToScript from "@/components/tawk-to-script"
import { ArrowUpRight, ArrowRight, Check, Plus } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
})

const navLinks = [
  { href: "#index", label: "Index" },
  { href: "#object", label: "Object" },
  { href: "#field", label: "Field notes" },
  { href: "#pricing", label: "Pricing" },
]
const navLinksEs = [
  { href: "#index", label: "Inicio" },
  { href: "#object", label: "Producto" },
  { href: "#field", label: "Notas de campo" },
  { href: "#pricing", label: "Precios" },
]

const heroPoints = [
  { num: "01", text: "Set up in an afternoon" },
  { num: "02", text: "0% commission on orders" },
  { num: "03", text: "Works when Wi-Fi doesn’t" },
  { num: "04", text: "Cancel anytime, keep your data" },
]
const heroPointsEs = [
  { num: "01", text: "Configúralo en una tarde" },
  { num: "02", text: "0% de comisión en pedidos" },
  { num: "03", text: "Funciona incluso sin Wi-Fi" },
  { num: "04", text: "Cancela cuando quieras, tus datos son tuyos" },
]

const marqueeWords = [
  "Bistro",
  "Trattoria",
  "Izakaya",
  "Taquería",
  "Brasserie",
  "Pizzería",
  "Cafetería",
  "Sushi-ya",
  "Wine bar",
  "Bakery",
  "Steakhouse",
  "Ramen-ya",
]
const marqueeWordsEs = [
  "Bistro",
  "Trattoria",
  "Izakaya",
  "Taqueria",
  "Brasserie",
  "Pizzeria",
  "Cafeteria",
  "Sushi-ya",
  "Bar de vinos",
  "Panaderia",
  "Steakhouse",
  "Ramen-ya",
]

const indexItems = [
  {
    num: "01",
    title: "Online ordering, your domain",
    body: "Branded ordering at your own URL. Cart, upsells, allergens, takeaway and delivery slots — without a 30% middleman.",
  },
  {
    num: "02",
    title: "Reservations & floor plan",
    body: "Drag-and-drop tables, deposits, no-show protection, walk-ins and waitlist. Reminders by SMS or WhatsApp.",
  },
  {
    num: "03",
    title: "Kitchen Display System",
    body: "Tickets routed by station. Course timing, expediter view and a panic button when the printer dies. Yes, that one.",
  },
  {
    num: "04",
    title: "Live menu & inventory",
    body: "Eighty-six a dish from anywhere. Track stock by ingredient, not just plate. Items pause themselves when something runs out.",
  },
  {
    num: "05",
    title: "Service AI",
    body: "Reads last night’s tickets and tells you what to prep, what to push and what to pull. In plain words, not dashboards.",
  },
  {
    num: "06",
    title: "Owner’s view",
    body: "Daily covers, average ticket, payroll vs. revenue, top-mover, dead-weight. One screen, before your espresso.",
  },
]
const indexItemsEs = [
  {
    num: "01",
    title: "Pedidos online en tu propio dominio",
    body: "Pedidos con tu marca y tu URL. Carrito, ventas adicionales, alérgenos, recogida y franjas de entrega — sin intermediarios del 30%.",
  },
  {
    num: "02",
    title: "Reservas y plano de sala",
    body: "Mesas con drag & drop, depósitos, protección ante no-shows, walk-ins y lista de espera. Recordatorios por SMS o WhatsApp.",
  },
  {
    num: "03",
    title: "Pantalla de cocina (KDS)",
    body: "Comandas por estación. Control de tiempos, vista de pase y botón de emergencia cuando la impresora falla. Sí, ese.",
  },
  {
    num: "04",
    title: "Menú en tiempo real e inventario",
    body: "Marca platos como no disponibles desde cualquier lugar. Controla stock por ingrediente, no solo por plato. Los ítems se desactivan automáticamente al agotarse.",
  },
  {
    num: "05",
    title: "IA de servicio",
    body: "Analiza el servicio anterior y te dice que preparar, que impulsar y que retirar. En lenguaje claro, sin dashboards.",
  },
  {
    num: "06",
    title: "Vista de propietario",
    body: "Cubrimientos diarios, ticket medio, personal vs. ingresos, productos estrella y los que no funcionan. Todo en una pantalla, antes del café.",
  },
]

const sidebarItems: Array<{ label: string; active?: boolean }> = [
  { label: "Tonight", active: true },
  { label: "Floor plan" },
  { label: "Reservations" },
  { label: "Tickets" },
  { label: "Menú 86" },
  { label: "Inventory" },
  { label: "Closeout" },
]
const sidebarItemsEs: Array<{ label: string; active?: boolean }> = [
  { label: "Hoy", active: true },
  { label: "Plano" },
  { label: "Reservas" },
  { label: "Comandas" },
  { label: "Platos no disponibles" },
  { label: "Inventario" },
  { label: "Cierre" },
]

const dashboardStats = [
  { k: "Covers", v: "47", sub: "of 52 booked" },
  { k: "Revenue", v: "€2,847", sub: "+12% vs last Sat" },
  { k: "Avg ticket", v: "€60.6", sub: "Wines & sides up" },
  { k: "Wait", v: "8 min", sub: "Bar holding 3" },
]
const dashboardStatsEs = [
  { k: "Servicios", v: "47", sub: "de 52 reservas" },
  { k: "Ingresos", v: "€2.847", sub: "+12% vs sabado pasado" },
  { k: "Ticket medio", v: "€60,6", sub: "Vinos y extras en alza" },
  { k: "Espera", v: "8 min", sub: "Bar con 3 en espera" },
]

const tickets = [
  { id: "T-12", table: "T6 · 4 pax", items: "2 × Pasta · 1 × Lubina · Tarta", time: "00:08", status: "Plating" },
  { id: "T-13", table: "Bar · 2", items: "1 × Tartar · 1 × Pulpo · Vino", time: "00:14", status: "Cooking" },
  { id: "T-14", table: "T2 · 3", items: "Menú degustación", time: "00:21", status: "Course 4 of 7" },
]
const ticketsEs = [
  { id: "T-12", table: "M6 · 4 pax", items: "2 × Pasta · 1 × Lubina · Tarta", time: "00:08", status: "Emplatado" },
  { id: "T-13", table: "Barra · 2", items: "1 × Tartar · 1 × Pulpo · Vino", time: "00:14", status: "Cocina" },
  { id: "T-14", table: "M2 · 3", items: "Menú degustación", time: "00:21", status: "Plato 4 de 7" },
]

const caseStats = [
  { v: "+38%", sub: "Online orders\nafter 60 days" },
  { v: "−6h", sub: "Admin time\nper week" },
  { v: "4.9", sub: "Avg. team rating\nafter first month" },
  { v: "17min", sub: "From signup to\nfirst paid order" },
]
const caseStatsEs = [
  { v: "+38%", sub: "Pedidos online\ntras 60 días" },
  { v: "−6h", sub: "Tiempo administrativo\nsemanal" },
  { v: "4.9", sub: "Valoracion media del equipo\ntras el primer mes" },
  { v: "17min", sub: "Desde registro hasta\nprimer pedido" },
]

const plans = [
  {
    name: "Counter",
    price: "€29",
    blurb: "For independents and food trucks finding their groove.",
    features: ["1 location", "Online menu & ordering", "Up to 5 staff seats", "Reservations", "Email support"],
    cta: "Start free trial",
    href: "/auth/register",
    feature: false,
  },
  {
    name: "Service",
    price: "€79",
    blurb: "Full house — front, back and the office.",
    features: [
      "Everything in Counter",
      "KDS on every station",
      "Inventory by ingredient",
      "Service AI insights",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/auth/register",
    feature: true,
  },
  {
    name: "Group",
    price: "€199",
    blurb: "Multi-location, central kitchens and chain operators.",
    features: [
      "Unlimited locations",
      "Central menu & inventory",
      "Group analytics",
      "API & integrations",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
    href: "/auth/register",
    feature: false,
  },
]
const plansEs = [
  {
    name: "Counter",
    price: "€29",
    blurb: "Para independientes y food trucks en crecimiento.",
    features: ["1 local", "Menú y pedidos online", "Hasta 5 usuarios", "Reservas", "Soporte por email"],
    cta: "Empezar prueba gratis",
    href: "/auth/register",
    feature: false,
  },
  {
    name: "Service",
    price: "€79",
    blurb: "Todo el restaurante — sala, cocina y gestión.",
    features: ["Todo lo de Counter", "KDS en cada estación", "Inventario por ingrediente", "Insights con IA", "Soporte prioritario"],
    cta: "Empezar prueba gratis",
    href: "/auth/register",
    feature: true,
  },
  {
    name: "Group",
    price: "€199",
    blurb: "Multi-local, cocinas centrales y cadenas.",
    features: ["Locales ilimitados", "Menú e inventario centralizados", "Analítica global", "API e integraciones", "Manager dedicado"],
    cta: "Hablar con ventas",
    href: "/auth/register",
    feature: false,
  },
]

const faq = [
  {
    q: "Do you take a cut of my orders?",
    a: "Never. Tably charges a flat monthly fee. Every euro a guest pays goes to you (minus payment processor fees, which we don’t touch).",
  },
  {
    q: "What hardware do I need?",
    a: "Whatever you already have. A phone for the host, a tablet on the pass, an old laptop in the office. Bring your own printers — we speak ESC/POS.",
  },
  {
    q: "What happens if my Wi-Fi dies?",
    a: "Service keeps running. Tably caches the active session locally and syncs the moment you’re back online. The till never closes.",
  },
  {
    q: "Can I import my current menu?",
    a: "Yes. Send us a PDF, a photo, even a hand-written list. Our team formats it for free during onboarding.",
  },
  {
    q: "Where is my data stored?",
    a: "Inside the EU on AWS Frankfurt. You can export everything as CSV any day, no questions asked, no fee.",
  },
]
const faqEs = [
  {
    q: "¿Os quedáis comisión por pedido?",
    a: "Nunca. Tably cobra una cuota mensual fija. Cada euro que paga el cliente es tuyo (menos comisiones de pasarela, que no tocamos).",
  },
  {
    q: "Que hardware necesito?",
    a: "Lo que ya tengas. Un móvil para recepción, una tablet en pase y un portátil en oficina. Trae tus impresoras: soportamos ESC/POS.",
  },
  {
    q: "Que pasa si se cae el Wi-Fi?",
    a: "El servicio sigue. Tably cachea la sesión activa en local y sincroniza en cuanto vuelve la conexión.",
  },
  {
    q: "¿Puedo importar mi menú actual?",
    a: "Si. Envia un PDF, una foto o una lista y lo dejamos preparado durante el onboarding.",
  },
  {
    q: "¿Dónde se guarda mi información?",
    a: "Dentro de la UE en AWS Frankfurt. Puedes exportar todo en CSV cuando quieras.",
  },
]

export default function HomePage() {
  const { locale } = useI18n()
  const isEs = locale === "es-ES"
  const nav = isEs ? navLinksEs : navLinks
  const hero = isEs ? heroPointsEs : heroPoints
  const featureIndex = isEs ? indexItemsEs : indexItems
  const sidebar = isEs ? sidebarItemsEs : sidebarItems
  const stats = isEs ? dashboardStatsEs : dashboardStats
  const ticketsData = isEs ? ticketsEs : tickets
  const caseStatsData = isEs ? caseStatsEs : caseStats
  const plansData = isEs ? plansEs : plans
  const faqData = isEs ? faqEs : faq

  return (
    <div
      className={`${display.variable} min-h-screen bg-[#F5F1E8] text-zinc-950 antialiased selection:bg-zinc-950 selection:text-[#F5F1E8]`}
    >
      {/* === Header ============================================================ */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F5F1E8]/80 border-b border-zinc-900/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size="sm" showText={false} />
            <span className={`${display.className} text-xl font-medium tracking-tight`}>
              Tably<span className="text-zinc-400">.</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-full text-zinc-700 hover:text-zinc-950 hover:bg-zinc-900/5 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LocaleSwitcher inline className="hidden md:block" />
            <Link
              href="/auth/login"
              className="inline-flex text-sm text-zinc-700 hover:text-zinc-950 px-2 md:px-3 py-1.5 transition-colors"
            >
              {isEs ? "Iniciar sesión" : "Sign in"}
            </Link>
            <Link href="/auth/register">
              <Button className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-[#F5F1E8] h-9 px-4 text-sm font-medium shadow-none">
                {isEs ? "Crear cuenta" : "Open an account"}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* === Hero ============================================================== */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-20 md:pb-28">
          {/* Top meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-16 md:mb-20">
            <span className="font-mono">— Index, Vol. 03</span>
            <span className="hidden md:inline">{isEs ? "Creado en Barcelona, usado en todo el mundo" : "Made in Barcelona, served worldwide"}</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono">v3.2 — {isEs ? "Ya disponible" : "Now shipping"}</span>
            </span>
          </div>

          {/* Display title */}
          <h1
            className={`${display.className} font-light tracking-[-0.035em] leading-[0.92] text-zinc-950 text-[3.25rem] sm:text-[4.5rem] md:text-[6.5rem] lg:text-[8.25rem] xl:text-[9.75rem]`}
          >
            {isEs ? (
              <>
                El sistema operativo
                <br />
                para restaurantes de <span className="italic font-normal text-[#7C3AED]">hoy</span>.
              </>
            ) : (
              <>
                The operating
                <br />
                system for <span className="italic font-normal text-[#7C3AED]">modern</span>
                <br />
                restaurants.
              </>
            )}
          </h1>

          {/* Sub bar — asymmetric */}
          <div className="mt-12 md:mt-16 grid md:grid-cols-12 gap-8 md:gap-10 items-start">
            <div className="md:col-span-3 md:pt-3 hidden md:block">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                {isEs ? "Un estudio de software para restaurantes" : "A studio for restaurant software"}
              </div>
              <div className={`${display.className} mt-3 italic text-zinc-700 text-lg leading-snug`}>
                {isEs ? "Desde 2024 — Barcelona y Madrid." : "est. 2024 — Barcelona & Madrid."}
              </div>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-lg md:text-xl text-zinc-700 max-w-xl leading-snug">
                {isEs
                  ? "Diseñado para quienes están en el servicio real. Pedidos online, reservas, gestión de sala e insights con IA — sin hojas de cálculo, sin caos."
                  : "Built for the people who actually work the line. Online ordering, reservations, floor management and AI insights — without the spreadsheets, without the chaos."}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/auth/register">
                  <Button className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-[#F5F1E8] h-12 px-6 text-base font-medium shadow-none">
                    {isEs ? "Empieza gratis, sin tarjeta" : "Start free, no card"}
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <VideoModal videoId="623Cw28jD8o" title={isEs ? "Tably — Tour de 90 segundos" : "Tably — 90 second tour"}>
                  <Button
                    variant="ghost"
                    className="rounded-full h-12 px-5 text-base text-zinc-800 hover:bg-zinc-900/5 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-700"
                  >
                    {isEs ? "Ver demo de 90 segundos" : "Watch a 90-second tour"}
                  </Button>
                </VideoModal>
              </div>
            </div>
          </div>
        </div>

        {/* Hero footer rule */}
        <div className="border-t border-zinc-900/10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
            {hero.map((p) => (
              <div key={p.num} className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  {p.num}
                </span>
                <span className="text-zinc-900">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Marquee =========================================================== */}
      <section className="border-t border-b border-white/5 bg-zinc-950 text-[#F5F1E8] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400 flex items-center justify-between">
          <span className="font-mono">{isEs ? "Ya en funcionamiento en —" : "Already running tables at —"}</span>
          <span className="hidden md:inline font-mono tabular-nums">{isEs ? "12 países · 4 zonas horarias" : "12 countries · 4 time zones"}</span>
        </div>
        <div className="relative flex overflow-hidden border-t border-white/5 py-8">
          {[0, 1].map((dup) => (
            <div
              key={dup}
              className="flex shrink-0 items-center animate-marquee"
              aria-hidden={dup === 1 ? "true" : undefined}
            >
              {(isEs ? marqueeWordsEs : marqueeWords).map((label, i) => (
                <div key={`${dup}-${i}`} className="flex items-center gap-10 pr-10">
                  <span className={`${display.className} text-5xl md:text-7xl font-light italic whitespace-nowrap`}>
                    {label}
                  </span>
                  <span className="text-2xl text-zinc-700">✦</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* === Index / Features ================================================== */}
      <section id="index" className="relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5 md:sticky md:top-28 self-start">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-8 flex items-center gap-3">
              <span className="h-px w-8 bg-zinc-900/30"></span>
              <span>{isEs ? "Sección 01 — Inicio" : "Section 01 — Index"}</span>
            </div>
            <h2
              className={`${display.className} text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-[-0.02em] font-light`}
            >
              {isEs ? "Diseñado alrededor de tu " : "Built around your "}<span className="italic">{isEs ? "servicio" : "service"}</span>{isEs ? ", no del software." : ", not around your software."}
            </h2>
            <p className="mt-6 text-zinc-700 max-w-md leading-relaxed">
              {isEs
                ? "Cada funcionalidad existe porque un chef, encargado o propietario la pidio. Primero entendemos tu sala, luego escribimos codigo."
                : "Every feature ships because a real chef, host or owner asked for it. We sit in your dining room before we sit at the keyboard."}
            </p>
            <Link
              href="/auth/register"
              className="mt-10 inline-flex items-center gap-2 text-sm text-zinc-900 group"
            >
              <span className="underline underline-offset-4 decoration-zinc-400 group-hover:decoration-zinc-900">
                {isEs ? "Crear cuenta" : "Open an account"}
              </span>
              <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <ol className="md:col-span-7 border-t border-b border-zinc-900/10">
            {featureIndex.map((item) => (
              <li
                key={item.num}
                className="grid grid-cols-12 gap-4 py-7 md:py-8 group border-b border-zinc-900/10 last:border-b-0"
              >
                <div className="col-span-2 md:col-span-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 pt-2">
                  {item.num}
                </div>
                <div className="col-span-10 md:col-span-11 flex items-start justify-between gap-6">
                  <div>
                    <h3 className={`${display.className} text-2xl md:text-[1.75rem] font-normal tracking-tight leading-tight`}>
                      {item.title}
                    </h3>
                    <p className="mt-2 text-zinc-700 max-w-lg leading-relaxed">{item.body}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-950 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* === Object / Product ================================================== */}
      <section id="object" className="border-t border-zinc-900/10 bg-[#EFEBE0]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-32">
          <div className="grid md:grid-cols-12 gap-8 mb-14 md:mb-16">
            <div className="md:col-span-7">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-zinc-900/30"></span>
                <span>{isEs ? "Sección 02 — Producto" : "Section 02 — Object"}</span>
              </div>
              <h2
                className={`${display.className} text-4xl md:text-5xl lg:text-6xl leading-[1.04] tracking-[-0.02em] font-light`}
              >
                {isEs ? "La " : "The "}<span className="italic">{isEs ? "unica" : "single"}</span>{isEs ? " pantalla detras de 4.000 servicios semanales." : " screen behind 4,000 covers a week."}
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:pt-8 text-zinc-700 leading-relaxed">
              {isEs
                ? "Diseñado mobile-first porque nadie en sala está sentado. Usa Tably en móvil, tablet o portátil — mismo entorno, mismos datos, en tiempo real."
                : "Built mobile-first because hosts and managers don’t sit. Open Tably on a phone, a tablet on the pass, a Mac in the office — same workspace, same numbers, same second."}
            </div>
          </div>

          <figure>
            <div className="rounded-2xl bg-white border border-zinc-900/10 shadow-[0_40px_80px_-30px_rgba(10,10,10,0.25)] overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 border-b border-zinc-900/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"></span>
                </div>
                <div className="text-xs text-zinc-500 font-mono">tably.app/service</div>
                <div className="w-12"></div>
              </div>

              {/* App body */}
              <div className="grid grid-cols-12 min-h-[480px]">
                {/* Sidebar */}
                <aside className="col-span-4 lg:col-span-3 border-r border-zinc-900/10 p-5 lg:p-6 flex flex-col">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-5">
                    {isEs ? "Servicio" : "Service"}
                  </div>
                  <nav className="space-y-1 text-sm">
                    {sidebar.map((it, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                          it.active
                            ? "bg-zinc-950 text-[#F5F1E8]"
                            : "text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        <span>{it.label}</span>
                        {it.active && <span className="text-[10px] opacity-70">⌘1</span>}
                      </div>
                    ))}
                  </nav>
                  <div className="mt-auto pt-10 text-xs text-zinc-500 leading-relaxed">
                    <div className="font-medium text-zinc-700">Bella Vista — Madrid</div>
                    <div className="mt-1 font-mono tabular-nums">{isEs ? "Sab · 21:14 · 47/52 servicios" : "Sat · 21:14 · 47/52 covers"}</div>
                  </div>
                </aside>

                {/* Main */}
                <main className="col-span-8 lg:col-span-9 p-6 lg:p-8 bg-zinc-50/40">
                  <div className="flex items-end justify-between border-b border-zinc-900/10 pb-5 mb-6 gap-4">
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                        {isEs ? "Hoy — Sab 12 Abr" : "Tonight — Sat 12 Apr"}
                      </div>
                      <h3 className={`${display.className} text-2xl md:text-3xl mt-1 tracking-tight font-normal`}>
                        {isEs ? "La cocina esta bajo control." : <>The line is <span className="italic">calm</span>.</>}
                      </h3>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full border border-zinc-900/15 text-zinc-700">
                        {isEs ? "Modo servicio" : "Service mode"}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="font-mono">{isEs ? "Sincronizado en vivo" : "Sync · live"}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900/10 border border-zinc-900/10 rounded-xl overflow-hidden mb-6">
                    {stats.map((s, i) => (
                      <div key={i} className="bg-white p-4" data-slot="metric">
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                          {s.k}
                        </div>
                        <div className="font-mono text-2xl md:text-[1.75rem] mt-1 font-medium tracking-tight tabular-nums text-zinc-950">
                          {s.v}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-zinc-900/10 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900/10">
                      <div className="text-sm font-medium text-zinc-900">{isEs ? "Tickets abiertos" : "Open tickets"}</div>
                      <div className="font-mono tabular-nums text-xs text-zinc-500">{isEs ? "5 en preparación · 2 en pase" : "5 fired · 2 plating"}</div>
                    </div>
                    <div className="divide-y divide-zinc-900/10 text-sm">
                      {ticketsData.map((t, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-12 items-center px-4 py-3 gap-3"
                        >
                          <div className="col-span-2 text-zinc-500 text-[11px] uppercase tracking-[0.15em] font-mono">
                            {t.id}
                          </div>
                          <div className="col-span-3 font-medium text-zinc-900 font-mono tabular-nums">
                            {t.table}
                          </div>
                          <div className="col-span-4 text-zinc-700 truncate hidden sm:block">{t.items}</div>
                          <div className="col-span-1 text-zinc-500 text-right hidden sm:block font-mono tabular-nums">
                            {t.time}
                          </div>
                          <div className="col-span-7 sm:col-span-2 text-right">
                            <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </main>
              </div>
            </div>

            <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 flex items-center gap-3">
              <span>Fig. 01</span>
              <span className="h-px flex-1 bg-zinc-900/15"></span>
              <span className="text-right">{isEs ? "Panel de servicio en hora punta — Bella Vista, Madrid" : "Service dashboard, dinner rush — Bella Vista, Madrid"}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* === Field note / Quote ================================================ */}
      <section id="field" className="border-t border-zinc-900/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-7">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-8 flex items-center gap-3">
              <span className="h-px w-8 bg-zinc-900/30"></span>
              <span>{isEs ? "Nota de campo 03 — Bella Vista, Madrid" : "Field note 03 — Bella Vista, Madrid"}</span>
            </div>
            <blockquote
              className={`${display.className} text-3xl md:text-4xl lg:text-5xl leading-[1.12] tracking-[-0.01em] font-light text-zinc-950`}
            >
              <span className="text-zinc-300">“</span>
              {isEs
                ? "Cambiamos tres apps y montones de papel por una sola pantalla. El servicio se siente "
                : "We swapped three apps and a pile of paper for one screen. Service feels "}
              <span className="italic">{isEs ? "más calmado" : "calmer"}</span>
              {isEs ? ". Los viernes pasaron de incendio controlado a turno normal." : ". Friday night went from a controlled fire to a normal shift."}
              <span className="text-zinc-300">”</span>
            </blockquote>
            <div className="mt-10 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-zinc-950 text-[#F5F1E8] flex items-center justify-center text-sm font-medium">
                EO
              </div>
              <div className="text-sm">
                <div className="font-medium">Esteban Ortiz</div>
                <div className="text-zinc-600">{isEs ? "Propietario — Bella Vista, Madrid" : "Owner — Bella Vista, Madrid"}</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 md:col-start-9 grid grid-cols-2 gap-x-6 gap-y-8 text-sm">
            {caseStatsData.map((s, i) => (
              <div key={i}>
                <div
                  className={`${display.className} tabular text-4xl md:text-5xl font-light tracking-[-0.02em] leading-none`}
                >
                  {s.v}
                </div>
                <div className="mt-3 text-zinc-600 leading-snug whitespace-pre-line">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Pricing =========================================================== */}
      <section id="pricing" className="border-t border-zinc-900/10 bg-zinc-950 text-[#F5F1E8]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-32">
          <div className="grid md:grid-cols-12 gap-8 mb-14 md:mb-16">
            <div className="md:col-span-7">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400 mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-white/30"></span>
                <span>{isEs ? "Sección 04 — Precios" : "Section 04 — Tariff"}</span>
              </div>
              <h2
                className={`${display.className} text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.02em] leading-[1.02]`}
              >
                {isEs ? "Precios claros." : "Honest pricing."}
                <br />
                <span className="italic text-[#D6BCFF]">{isEs ? "Sin comisiones." : "No commission."}</span>
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:pt-8 text-zinc-300 leading-relaxed">
              {isEs
                ? "Todo es mensual y transparente. Te quedas el 100% de cada pedido. Cancela cuando quieras y llévate tus datos."
                : "Everything is monthly, in plain numbers. You keep 100% of every order. Cancel any month and walk out with your data."}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
            {plansData.map((p) => (
              <div
                key={p.name}
                className={`relative p-8 md:p-10 flex flex-col ${
                  p.feature ? "bg-[#F5F1E8] text-zinc-950" : "bg-zinc-950 text-[#F5F1E8]"
                }`}
              >
                {p.feature && (
                  <div className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {isEs ? "Más elegido" : "Most chosen"}
                  </div>
                )}
                <div
                  className={`text-[11px] uppercase tracking-[0.22em] ${
                    p.feature ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {p.name}
                </div>
                <div className={`${display.className} tabular text-5xl md:text-6xl mt-3 font-light tracking-[-0.02em]`}>
                  {p.price}
                  <span className={`text-base ml-1 font-sans tabular ${p.feature ? "text-zinc-500" : "text-zinc-400"}`}>
                    {isEs ? "/mes" : "/mo"}
                  </span>
                </div>
                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    p.feature ? "text-zinc-700" : "text-zinc-400"
                  }`}
                >
                  {p.blurb}
                </p>

                <ul
                  className={`mt-8 space-y-3 text-sm flex-1 ${p.feature ? "" : "text-zinc-200"}`}
                >
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          p.feature ? "text-zinc-950" : "text-zinc-500"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={p.href} className="mt-10">
                  <Button
                    className={`w-full rounded-full h-12 text-sm font-medium shadow-none ${
                      p.feature
                        ? "bg-zinc-950 hover:bg-zinc-800 text-[#F5F1E8]"
                        : "bg-transparent hover:bg-white/10 text-white border border-white/30"
                    }`}
                  >
                    {p.cta}
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 text-xs text-zinc-500 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{isEs ? "* Todos los precios en EUR, sin IVA." : "* All prices in EUR, exc. VAT."}</span>
            <span>{isEs ? "Prueba gratuita de 14 días en todos los planes." : "14-day free trial on every plan."}</span>
            <span>{isEs ? "Pago anual −20%." : "Annual billing − 20%."}</span>
          </div>
        </div>
      </section>

      {/* === FAQ =============================================================== */}
      <section className="border-t border-zinc-900/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-zinc-900/30"></span>
              <span>{isEs ? "Sección 05 — FAQ" : "Section 05 — Asked"}</span>
            </div>
            <h2
              className={`${display.className} text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.02em] leading-[1.02]`}
            >
              {isEs ? "Lo más probable es que te preguntes esto." : <>You’ll probably <span className="italic">ask</span>.</>}
            </h2>
            <p className="mt-6 text-zinc-700 max-w-md leading-relaxed">
              {isEs ? "¿No encuentras tu respuesta? Escríbenos a " : "Couldn’t find your question? Write to a real person at "}
              <a
                href="mailto:hello@tably.digital"
                className="underline underline-offset-4 decoration-zinc-400 hover:decoration-zinc-900"
              >
                hello@tably.digital
              </a>
              .
            </p>
          </div>

          <div className="md:col-span-8 border-t border-b border-zinc-900/10">
            {faqData.map((item, i) => (
              <details key={i} className="group py-6 border-b border-zinc-900/10 last:border-b-0">
                <summary className="flex items-center justify-between cursor-pointer list-none gap-6">
                  <span
                    className={`${display.className} text-xl md:text-2xl font-normal pr-6 leading-tight`}
                  >
                    {item.q}
                  </span>
                  <Plus className="w-5 h-5 shrink-0 transition-transform group-open:rotate-45 text-zinc-500" />
                </summary>
                <p className="mt-4 text-zinc-700 max-w-2xl leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* === Closing CTA ======================================================= */}
      <section className="border-t border-zinc-900/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-32">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-8 flex items-center gap-3">
            <span className="h-px w-8 bg-zinc-900/30"></span>
            <span>{isEs ? "Última nota —" : "Last note —"}</span>
          </div>
          <h2
            className={`${display.className} font-light tracking-[-0.035em] leading-[0.95] text-zinc-950 text-[3.5rem] sm:text-[5rem] md:text-[7.5rem] lg:text-[9.5rem] xl:text-[11rem]`}
          >
            {isEs ? "Prueba tu próximo" : "Try the next"}
            <br />
            <span className="italic">{isEs ? "servicio" : "shift"}</span> {isEs ? "por nuestra cuenta." : "on us."}
          </h2>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link href="/auth/register">
              <Button className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-[#F5F1E8] h-14 px-8 text-base md:text-lg font-medium shadow-none">
                {isEs ? "Crear cuenta" : "Open an account"}
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a
              href="mailto:hello@tably.digital"
              className="text-base text-zinc-800 underline underline-offset-4 decoration-zinc-400 hover:decoration-zinc-900"
            >
              {isEs ? "o escribe a una persona →" : "or email a human →"}
            </a>
          </div>
        </div>
      </section>

      {/* === Footer ============================================================ */}
      <footer className="bg-zinc-950 text-[#F5F1E8]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-8">
          <div className="grid md:grid-cols-12 gap-10 pb-16 border-b border-white/10">
            <div className="md:col-span-5">
              <div className={`${display.className} text-xl italic`}>
                {isEs ? "Tably — Un estudio de software para restaurantes." : "Tably — A studio for restaurant software."}
              </div>
              <p className="mt-4 text-sm text-zinc-400 max-w-sm leading-relaxed">
                {isEs ? "Creado en Barcelona por gente que estuvo en cocina antes que en codigo." : "Built in Barcelona by people who washed dishes before they wrote code."}
              </p>
              <a
                href="mailto:hello@tably.digital"
                className="mt-6 inline-flex items-center gap-2 text-sm hover:text-[#D6BCFF] transition-colors"
              >
                hello@tably.digital
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            <div className="md:col-span-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-4">{isEs ? "Producto" : "Product"}</div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>
                  <Link href="#index" className="hover:text-white transition-colors">
                    {isEs ? "Inicio" : "Index"}
                  </Link>
                </li>
                <li>
                  <Link href="#object" className="hover:text-white transition-colors">
                    {isEs ? "Producto" : "Object"}
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    {isEs ? "Precios" : "Pricing"}
                  </Link>
                </li>
                <li>
                  <Link href="/software-gestion-restaurantes" className="hover:text-white transition-colors">
                    {isEs ? "Gestión restaurante" : "Restaurant OS"}
                  </Link>
                </li>
                <li>
                  <Link href="/pedidos-online-restaurante" className="hover:text-white transition-colors">
                    {isEs ? "Pedidos online" : "Online orders"}
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    {isEs ? "Iniciar sesión" : "Sign in"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-4">{isEs ? "Estudio" : "Studio"}</div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>
                  <Link href="/sobre-tably" className="hover:text-white transition-colors">
                    {isEs ? "Nosotros" : "About"}
                  </Link>
                </li>
                <li>
                  <Link href="#field" className="hover:text-white transition-colors">
                    {isEs ? "Notas de campo" : "Field notes"}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {isEs ? "Clientes" : "Customers"}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {isEs ? "Empleo" : "Careers"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 mb-4">Legal</div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>
                  <Link href="/legal/privacy" className="hover:text-white transition-colors">
                    {isEs ? "Privacidad" : "Privacy"}
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-white transition-colors">
                    {isEs ? "Términos" : "Terms"}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {isEs ? "Estado" : "Status"}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {isEs ? "Seguridad" : "Security"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Big wordmark */}
          <div className="py-12 overflow-hidden">
            <div
              className={`${display.className} font-light tracking-[-0.05em] leading-[0.85] text-white text-[24vw] md:text-[18vw] lg:text-[15vw]`}
            >
              Tably<span className="italic text-[#D6BCFF]">.</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 pt-6 border-t border-white/10">
            <div className="font-mono">© 2026 Tably Studio S.L. — {isEs ? "Un sistema operativo para restaurantes." : "A restaurant operating system."}</div>
            <div className="flex items-center gap-6">
              <span className="hidden md:inline font-mono">Barcelona · 41.3851° N, 2.1734° E</span>
              <Link href="#" className="hover:text-white transition-colors">
                Twitter
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <TawkToScript />
    </div>
  )
}
