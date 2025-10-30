import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/state/store'
import { selectEntityById, setCountryAndLinkDial } from '@/state/entitiesSlice'
import { PencilIcon, CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { COUNTRIES, getCountryDisplayName } from '@/config/countries'

interface CountrySelectProps {
  clientId: string
}

export function CountrySelect({ clientId }: CountrySelectProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(clientId))
  const currentIso = (entity?.country ?? '').toUpperCase()
  const [isEditing, setIsEditing] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const getCurrentDisplayValue = () => {
    if (currentIso) {
      return getCountryDisplayName(currentIso)
    }
    return 'Not Set'
  }

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES
    const query = searchQuery.toLowerCase()
    return COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(query) || 
      country.iso2.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const handleOptionSelect = (countryIso2: string) => {
    dispatch(setCountryAndLinkDial({ id: clientId, countryIsoOrName: countryIso2 }))
    setIsEditing(false)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between w-full group">
        <span 
          className="text-sm text-gray-600 truncate flex-1"
          style={{ 
            fontWeight: 400,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {getCurrentDisplayValue()}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 hover:bg-gray-100 rounded-md"
        >
          <PencilIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <div 
          className="flex items-center justify-between w-full cursor-pointer bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition-colors shadow-sm"
          onClick={() => {
            if (!isDropdownOpen) {
              setIsDropdownOpen(true)
            }
          }}
        >
          <input
            type="text"
            value={searchQuery || (!isDropdownOpen ? getCurrentDisplayValue() : '')}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (!isDropdownOpen) {
                setIsDropdownOpen(true)
              }
            }}
            onFocus={() => {
              setSearchQuery('')
              setIsDropdownOpen(true)
            }}
            onBlur={(e) => {
              // Don't close if clicking on dropdown options
              setTimeout(() => {
                if (!e.currentTarget.contains(document.activeElement)) {
                  setSearchQuery('')
                  setIsDropdownOpen(false)
                }
              }, 150)
            }}
            placeholder={isDropdownOpen ? "Search countries..." : getCurrentDisplayValue()}
            className="flex-1 text-sm text-gray-600 bg-transparent border-none outline-none"
            style={{ 
              fontWeight: 400,
              fontFamily: 'Poppins, sans-serif'
            }}
          />
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ml-2 flex-shrink-0 cursor-pointer ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation()
              setIsDropdownOpen(!isDropdownOpen)
              if (!isDropdownOpen) {
                setSearchQuery('')
              }
            }}
          />
        </div>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-auto">
            {filteredCountries.length > 10 && (
              <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-100">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-gray-400"
                  style={{ 
                    fontWeight: 400,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  autoFocus
                />
              </div>
            )}
            <div className="py-1">
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No countries found</div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.iso2}
                    onClick={() => handleOptionSelect(country.iso2)}
                    className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 transition-colors text-gray-600 ${
                      currentIso === country.iso2 ? 'bg-blue-50' : ''
                    }`}
                    style={{ 
                      fontWeight: 400,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '13px'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{country.name}</span>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">{country.iso2}</span>
                        {currentIso === country.iso2 && (
                          <CheckIcon className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          title="Cancel"
        >
          <XMarkIcon className="h-3 w-3 text-gray-600" />
        </button>
      </div>
    </div>
  )
}