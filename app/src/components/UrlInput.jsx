import React from 'react'
import { Clipboard, X } from 'lucide-react'

/**
 * URL/text input with paste and clear buttons.
 * Always rendered LTR (dir="ltr") because URLs are LTR regardless of page direction.
 * - Icon is on the LEFT  (start in LTR)
 * - Paste/Clear buttons are on the RIGHT (end in LTR)
 */
function UrlInput({ value, onChange, placeholder, icon: Icon, className = '' }) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) onChange(text.trim())
    } catch (e) {}
  }

  const handleClear = () => onChange('')

  return (
    // Force LTR so icon=left, buttons=right regardless of page direction
    <div dir="ltr" className="relative flex items-center">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none z-10" />
      )}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-field ${Icon ? 'pl-12' : 'pl-4'} pr-[4.5rem] ${className}`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            title="مسح | Clear"
            className="p-1.5 rounded-lg text-dark-500 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handlePaste}
          title="لصق | Paste"
          className="p-1.5 rounded-lg text-dark-500 hover:text-gmd-400 hover:bg-dark-700 transition-colors"
        >
          <Clipboard className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default UrlInput
