import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  activeOrganizationId: string | null
  setActiveOrganizationId: (id: string | null) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  qrViewMode: 'grid' | 'table'
  setQRViewMode: (mode: 'grid' | 'table') => void
  selectedQRIds: string[]
  setSelectedQRIds: (ids: string[]) => void
  toggleQRSelection: (id: string) => void
  clearSelection: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeOrganizationId: null,
      setActiveOrganizationId: (id) => set({ activeOrganizationId: id }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      qrViewMode: 'grid',
      setQRViewMode: (mode) => set({ qrViewMode: mode }),
      selectedQRIds: [],
      setSelectedQRIds: (ids) => set({ selectedQRIds: ids }),
      toggleQRSelection: (id) => {
        const current = get().selectedQRIds
        set({ selectedQRIds: current.includes(id) ? current.filter((i) => i !== id) : [...current, id] })
      },
      clearSelection: () => set({ selectedQRIds: [] }),
    }),
    { name: 'qr-platform-app' }
  )
)
