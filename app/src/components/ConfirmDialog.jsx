import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * سؤالٌ قبلَ فعلٍ لا رجعةَ فيه أو لا يُقصَدُ غالباً.
 *
 * ولا يُستعمَلُ `confirm()` الأصليّ: نافذةُ Chromium لا تُترجَمُ ولا تُلوَّنُ ولا
 * تتّبعُ اتّجاهَ الواجهة، وتُجمّدُ العمليّةَ كلَّها ما دامت مفتوحة.
 */
function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
         onClick={onCancel}>
      <div className="glass-panel p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-dark-300 whitespace-pre-wrap">{message}</p>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={onConfirm}>
            {confirmLabel || t('common.confirm')}
          </button>
          <button className="btn-secondary flex-1" onClick={onCancel}>
            {cancelLabel || t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
