import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { t } from "@/i18n"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "default" | "destructive"
    onConfirm: () => void
    loading?: boolean
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = "destructive",
    onConfirm,
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelLabel || t.common.cancel}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={() => {
                            onConfirm()
                            if (!loading) onOpenChange(false)
                        }}
                        disabled={loading}
                    >
                        {loading ? t.common.loading : (confirmLabel || t.common.confirm)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Hook for simpler usage pattern — replaces window.confirm() calls.
 *
 * Usage:
 *   const { confirm, ConfirmDialogElement } = useConfirmDialog()
 *
 *   const handleDelete = async () => {
 *     if (!await confirm({ title: "Delete item?" })) return
 *     // proceed with delete
 *   }
 *
 *   return <>{ConfirmDialogElement}</>
 */
export function useConfirmDialog() {
    const [state, setState] = React.useState<{
        open: boolean
        title: string
        description?: string
        confirmLabel?: string
        cancelLabel?: string
        variant?: "default" | "destructive"
        resolve?: (value: boolean) => void
    }>({ open: false, title: "" })

    const confirm = React.useCallback(
        (opts: {
            title: string
            description?: string
            confirmLabel?: string
            cancelLabel?: string
            variant?: "default" | "destructive"
        }): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({ ...opts, open: true, resolve })
            })
        },
        []
    )

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            state.resolve?.(false)
            setState((prev) => ({ ...prev, open: false }))
        }
    }

    const handleConfirm = () => {
        state.resolve?.(true)
        setState((prev) => ({ ...prev, open: false }))
    }

    const ConfirmDialogElement = (
        <ConfirmDialog
            open={state.open}
            onOpenChange={handleOpenChange}
            title={state.title}
            description={state.description}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            variant={state.variant}
            onConfirm={handleConfirm}
        />
    )

    return { confirm, ConfirmDialogElement }
}
