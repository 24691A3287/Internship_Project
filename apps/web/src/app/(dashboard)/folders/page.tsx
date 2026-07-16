import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Folders' }

export default function FoldersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Folders</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Organize your QR codes into folders</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="p-5 rounded-full bg-muted">
          <span className="text-4xl">📁</span>
        </div>
        <div>
          <h3 className="font-semibold">No folders yet</h3>
          <p className="text-muted-foreground text-sm">Create folders to organize your QR codes</p>
        </div>
      </div>
    </div>
  )
}
