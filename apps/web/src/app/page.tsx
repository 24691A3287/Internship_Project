import Link from 'next/link'
import {
  QrCode, BarChart3, Shield, Zap, Globe, Users,
  ArrowRight, Check, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Platform – Enterprise QR Management System',
  description: 'Create, manage, and analyze QR codes at enterprise scale. Dynamic QR codes, real-time analytics, and team collaboration.',
}

const features = [
  { icon: QrCode, title: '10 QR Types', description: 'URL, vCard, WiFi, Email, Phone, SMS, Location, Event, Crypto, and plain text' },
  { icon: BarChart3, title: 'Deep Analytics', description: 'Real-time scan tracking with geographic, device, and browser breakdowns' },
  { icon: Zap, title: 'Dynamic QR Codes', description: 'Update the destination URL anytime without reprinting the QR code' },
  { icon: Shield, title: 'Enterprise Security', description: 'Role-based access control, API key management, and audit logs' },
  { icon: Globe, title: 'Global CDN', description: 'Sub-100ms redirects worldwide with our edge network infrastructure' },
  { icon: Users, title: 'Team Collaboration', description: 'Multi-organization support with granular role management' },
]

const plans = [
  { name: 'Free', price: '$0', period: '/forever', description: 'Perfect for individuals', features: ['5 QR codes', '500 scans/month', '1 user', 'Basic analytics'], cta: 'Get Started Free', popular: false },
  { name: 'Pro', price: '$29', period: '/month', description: 'For growing teams', features: ['500 QR codes', '100K scans/month', '10 users', 'Dynamic QR codes', 'API access', 'Custom domain'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', description: 'For large organizations', features: ['Unlimited QR codes', 'Unlimited scans', 'Unlimited users', 'White label', 'SLA guarantee', 'Dedicated support'], cta: 'Contact Sales', popular: false },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-violet-600"><QrCode className="size-5 text-white" /></div>
            <span className="font-bold text-lg">QR Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in"><Button variant="ghost" className="text-slate-300 hover:text-white">Sign In</Button></Link>
            <Link href="/sign-up"><Button className="bg-violet-600 hover:bg-violet-700">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-transparent to-indigo-950/40" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm mb-6">
            <Star className="size-3.5" /> Enterprise QR Management Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            The smartest way to
            <span className="block bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              manage QR codes
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Create dynamic QR codes, track every scan in real-time, and manage your team — all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8 gap-2">
                Start for Free <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8">View Demo</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">No credit card required · Free forever plan available</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need, nothing you don&apos;t</h2>
          <p className="text-slate-400 text-lg">Built for teams who take QR management seriously</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 w-fit mb-4 group-hover:bg-violet-600/30 transition-colors">
                <Icon className="size-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-400">Start free, scale as you grow</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(({ name, price, period, description, features, cta, popular }) => (
            <div
              key={name}
              className={`relative p-6 rounded-2xl border ${popular ? 'border-violet-500 bg-violet-600/10 shadow-xl shadow-violet-500/20' : 'border-white/10 bg-white/5'}`}
            >
              {popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-xs font-semibold">Most Popular</div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-1">{name}</h3>
                <p className="text-slate-400 text-sm mb-4">{description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{price}</span>
                  <span className="text-slate-400">{period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="size-4 text-emerald-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <Button className={`w-full ${popular ? 'bg-violet-600 hover:bg-violet-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}>{cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-violet-600"><QrCode className="size-4 text-white" /></div>
            <span className="font-semibold">QR Platform</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 QR Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
