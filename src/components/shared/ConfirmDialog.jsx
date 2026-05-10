'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ConfirmDialog({ 
  open, 
  onOpenChange,
  onClose,
  onConfirm, 
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  confirmText,
  variant = 'danger' // 'danger' | 'warning'
}) {
  const [loading, setLoading] = useState(false)

  const handleOpenChange = (nextOpen) => {
    if (onOpenChange) {
      onOpenChange(nextOpen)
      return
    }
    if (!nextOpen && onClose) {
      onClose()
    }
  }
  
  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      handleOpenChange(false)
    } catch (error) {
      console.error('Confirm action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const label = confirmText || confirmLabel || 'Confirm'
  
  const confirmButtonClass = variant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-amber-500 hover:bg-amber-600 text-white'
  
  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-white border border-[#E8DFD4]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-neutral-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="btn-ghost"
            disabled={loading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md ${confirmButtonClass}`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
