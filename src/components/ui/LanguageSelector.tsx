'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useI18n, LOCALES, Locale } from '@/lib/i18n'
import { Globe, ChevronDown, Check } from 'lucide-react'

export default function LanguageSelector() {
  const { locale, setLocale } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find the currently active locale object
  const currentLocale = LOCALES.find((l) => l.value === locale) || LOCALES[0]

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="hidden sm:inline-block">{currentLocale.nativeLabel}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 origin-top-right focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu-button"
        >
          <div className="py-1" role="none">
            {LOCALES.map((loc) => (
              <button
                key={loc.value}
                onClick={() => {
                  setLocale(loc.value)
                  setIsOpen(false)
                }}
                className={`flex items-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-300 transition-colors ${
                  locale === loc.value ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 dark:text-gray-200'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{loc.flag}</span>
                  <span>{loc.nativeLabel}</span>
                </div>
                {locale === loc.value && <Check className="w-4 h-4 text-green-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
