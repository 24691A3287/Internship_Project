'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import QRCodeLib from 'qrcode'
import { Globe, User, Wifi, FileText, Mail, Phone, MessageSquare, MapPin, Calendar, ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateQRCode } from '@/hooks/useQRCodes'
import { useAuthToken } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { PRESET_COLORS } from '@/lib/constants'

const QR_TYPE_OPTIONS = [
  { value: 'URL', label: 'Website URL', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { value: 'VCARD', label: 'Contact Card', icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { value: 'WIFI', label: 'WiFi Network', icon: Wifi, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { value: 'TEXT', label: 'Plain Text', icon: FileText, color: 'text-gray-500', bg: 'bg-gray-500/10' },
  { value: 'EMAIL', label: 'Email', icon: Mail, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { value: 'PHONE', label: 'Phone', icon: Phone, color: 'text-green-500', bg: 'bg-green-500/10' },
  { value: 'SMS', label: 'SMS', icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { value: 'LOCATION', label: 'Location', icon: MapPin, color: 'text-red-500', bg: 'bg-red-500/10' },
  { value: 'EVENT', label: 'Calendar Event', icon: Calendar, color: 'text-pink-500', bg: 'bg-pink-500/10' },
]

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().default('URL'),
  content: z.string().min(1, 'Content is required'),
  fgColor: z.string().default('#000000'),
  bgColor: z.string().default('#ffffff'),
  size: z.number().default(300),
  margin: z.number().default(4),
  isDynamic: z.boolean().default(false),
})

type FormValues = z.infer<typeof schema>

const STEPS = ['Type', 'Content', 'Style', 'Preview']

export function QRCreatorWizard() {
  useAuthToken()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedType, setSelectedType] = useState('URL')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const createMutation = useCreateQRCode()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'URL', content: '', fgColor: '#000000', bgColor: '#ffffff', size: 300, margin: 4, isDynamic: false },
  })

  const watchedValues = form.watch()

  useEffect(() => {
    const content = watchedValues.content
    if (!content) { setPreviewUrl(null); return }
    const timer = setTimeout(async () => {
      try {
        const url = await QRCodeLib.toDataURL(content, {
          errorCorrectionLevel: 'M',
          width: 200,
          margin: watchedValues.margin,
          color: { dark: watchedValues.fgColor, light: watchedValues.bgColor },
        })
        setPreviewUrl(url)
      } catch { setPreviewUrl(null) }
    }, 300)
    return () => clearTimeout(timer)
  }, [watchedValues.content, watchedValues.fgColor, watchedValues.bgColor, watchedValues.margin])

  const handleSubmit = form.handleSubmit(async (data) => {
    await createMutation.mutateAsync({ ...data, type: selectedType })
    router.push('/dashboard/qrcodes')
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex items-center justify-center size-7 rounded-full text-xs font-semibold transition-all',
                  i < step ? 'bg-emerald-500 text-white cursor-pointer' :
                  i === step ? 'bg-violet-600 text-white' :
                  'bg-muted text-muted-foreground cursor-default'
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </button>
              <span className={cn('ml-2 text-sm font-medium hidden sm:block', i === step ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
              {i < STEPS.length - 1 && <div className={cn('mx-2 h-px w-8 sm:w-12 flex-shrink-0', i < step ? 'bg-emerald-500' : 'bg-border')} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <CardHeader><CardTitle>Choose QR Code Type</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QR_TYPE_OPTIONS.map(({ value, label, icon: Icon, color, bg }) => (
                  <button
                    key={value}
                    onClick={() => { setSelectedType(value); form.setValue('type', value) }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md',
                      selectedType === value ? 'border-violet-500 bg-violet-500/10' : 'border-border hover:border-violet-300'
                    )}
                  >
                    <div className={`p-2.5 rounded-lg ${bg}`}><Icon className={`size-5 ${color}`} /></div>
                    <span className="text-xs font-medium text-center">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Enter Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">QR Code Name</Label>
                <Input id="name" {...form.register('name')} placeholder="e.g. Company Website" />
                {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">{selectedType === 'URL' ? 'Website URL' : selectedType === 'EMAIL' ? 'Email Address' : 'Content'}</Label>
                <Input
                  id="content"
                  {...form.register('content')}
                  placeholder={selectedType === 'URL' ? 'https://example.com' : selectedType === 'EMAIL' ? 'hello@example.com' : 'Enter content...'}
                />
                {form.formState.errors.content && <p className="text-destructive text-xs">{form.formState.errors.content.message}</p>}
              </div>
              {selectedType === 'URL' && (
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg">
                  <input type="checkbox" id="dynamic" {...form.register('isDynamic')} className="rounded" />
                  <Label htmlFor="dynamic" className="text-sm cursor-pointer">
                    <span className="font-semibold">Dynamic QR Code</span>
                    <span className="text-muted-foreground ml-1">(change URL later without reprinting)</span>
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Customize Style</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Foreground Color</Label>
                  <div className="flex gap-2">
                    <input type="color" {...form.register('fgColor')} className="w-10 h-9 rounded cursor-pointer border border-input" />
                    <Input {...form.register('fgColor')} className="font-mono text-sm" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.slice(0, 8).map((c) => (
                      <button key={c} onClick={() => form.setValue('fgColor', c)} className="size-6 rounded-full border-2 border-border hover:border-ring transition-colors" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <input type="color" {...form.register('bgColor')} className="w-10 h-9 rounded cursor-pointer border border-input" />
                    <Input {...form.register('bgColor')} className="font-mono text-sm" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.slice(0, 8).map((c) => (
                      <button key={c} onClick={() => form.setValue('bgColor', c)} className="size-6 rounded-full border-2 border-border hover:border-ring transition-colors" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Size: {watchedValues.size}px</Label>
                  <input type="range" min="100" max="1000" step="50" {...form.register('size', { valueAsNumber: true })} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Margin: {watchedValues.margin}px</Label>
                  <input type="range" min="0" max="20" step="1" {...form.register('margin', { valueAsNumber: true })} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>Review & Save</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted rounded-lg"><span className="text-muted-foreground">Name:</span><p className="font-medium mt-0.5">{watchedValues.name || 'Untitled'}</p></div>
                <div className="p-3 bg-muted rounded-lg"><span className="text-muted-foreground">Type:</span><p className="font-medium mt-0.5">{selectedType}</p></div>
                <div className="p-3 bg-muted rounded-lg col-span-2"><span className="text-muted-foreground">Content:</span><p className="font-medium mt-0.5 truncate">{watchedValues.content}</p></div>
              </div>
              <Button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <Sparkles className="size-4" />
                {createMutation.isPending ? 'Creating...' : 'Create QR Code'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
          {step < STEPS.length - 1 && (
            <Button onClick={() => setStep(step + 1)} className="bg-violet-600 hover:bg-violet-700 text-white">
              Next <ArrowRight className="size-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Live Preview</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full aspect-square bg-white rounded-xl border border-border flex items-center justify-center p-4">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="QR Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="size-16 border-2 border-dashed border-muted-foreground/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">□</span>
                  </div>
                  <p className="text-xs">Enter content to preview</p>
                </div>
              )}
            </div>
            {watchedValues.name && <p className="text-sm font-medium text-center">{watchedValues.name}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
