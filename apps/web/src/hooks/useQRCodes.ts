'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { qrApi } from '@/lib/api'
import { toast } from 'sonner'

interface QRFilters {
  [key: string]: any
  search?: string
  type?: string
  folderId?: string
  isActive?: boolean
  organizationId?: string
  page?: number
  limit?: number
}

export function useQRCodes(filters?: QRFilters) {
  return useQuery({
    queryKey: ['qrcodes', filters],
    queryFn: () => qrApi.list(filters).then((r) => r.data),
    staleTime: 30 * 1000,
  })
}

export function useQRCode(id: string) {
  return useQuery({
    queryKey: ['qrcodes', id],
    queryFn: () => qrApi.get(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateQRCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => qrApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qrcodes'] })
      toast.success('QR code created successfully!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateQRCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => qrApi.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['qrcodes'] })
      qc.invalidateQueries({ queryKey: ['qrcodes', id] })
      toast.success('QR code updated!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteQRCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => qrApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qrcodes'] })
      toast.success('QR code deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDuplicateQRCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => qrApi.duplicate(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qrcodes'] })
      toast.success('QR code duplicated!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
