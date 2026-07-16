import { SignIn } from '@clerk/nextjs'
import { QrCode } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-indigo-950" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600">
            <QrCode className="size-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">QR Platform</span>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'shadow-2xl',
              card: 'bg-slate-900 border border-white/10',
              headerTitle: 'text-white',
              headerSubtitle: 'text-slate-400',
              formFieldLabel: 'text-slate-300',
              formFieldInput: 'bg-slate-800 border-slate-700 text-white',
              footerActionLink: 'text-violet-400 hover:text-violet-300',
              formButtonPrimary: 'bg-violet-600 hover:bg-violet-700',
            },
          }}
        />
      </div>
    </div>
  )
}
