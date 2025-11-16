import { debounce } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaClock, FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router'

import { cn } from '~/lib/utils'
import { addRecentSearch, getRecentSearches } from '~/lib/utils/recentSearches'

import type { AutocompleteResult } from '../../../server/api/search/search.service'
import { Image } from '../ui/image'
import { Input } from '../ui/input'
import { Typography } from '../ui/typography'

interface SearchAutocompleteProps {
  debounceMs?: number
  className?: string
}

export function SearchAutocomplete({ debounceMs = 300, className }: SearchAutocompleteProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AutocompleteResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches())

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
          setResults([])
          setIsLoading(false)
          return
        }

        setIsLoading(true)
        try {
          const response = await fetch(
            `/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`
          )
          if (response.ok) {
            const data = await response.json()
            setResults(data.results || [])
          } else {
            setResults([])
          }
        } catch (error) {
          console.error('Autocomplete search error:', error)
          setResults([])
        } finally {
          setIsLoading(false)
        }
      }, debounceMs),
    [debounceMs]
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)

    if (value.trim()) {
      setIsLoading(true)
      debouncedSearch(value)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true)
  }

  // Handle input blur (with delay to allow clicks)
  const handleInputBlur = () => {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 200)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = query.trim() ? results.length : recentSearches.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev))
      setIsOpen(true)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        if (query.trim()) {
          handleResultClick(results[selectedIndex])
        } else {
          handleRecentSearchClick(recentSearches[selectedIndex])
        }
      } else if (query.trim()) {
        handleSearchSubmit(query.trim())
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
      ;(e.target as HTMLInputElement)?.blur()
    }
  }

  // Navigate to search page
  const handleSearchSubmit = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery)
      setRecentSearches(getRecentSearches())
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  // Handle recent search click
  const handleRecentSearchClick = (recentQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(recentQuery)}`)
    setIsOpen(false)
    setQuery('')
  }

  // Handle result click - navigate to item page
  const handleResultClick = (result: AutocompleteResult) => {
    const firstDashIndex = result.id.indexOf('-')
    if (firstDashIndex === -1) {
      // Fallback to search if ID format is unexpected
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      return
    }

    const type = result.id.substring(0, firstDashIndex)
    const id = result.id.substring(firstDashIndex + 1)
    addRecentSearch(query.trim())
    setRecentSearches(getRecentSearches())

    switch (type) {
      case 'album':
        navigate(`/albums/${id}`)
        break
      case 'artist':
        navigate(`/artists/${id}`)
        break
      case 'track':
        // Tracks don't have individual pages, navigate to songs page
        navigate(`/songs`)
        break
      case 'playlist':
        navigate(`/playlists/${id}`)
        break
      default:
        navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }

    setIsOpen(false)
    setQuery('')
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const showRecentSearches = !query.trim() && recentSearches.length > 0
  const showResults = query.trim() && (results.length > 0 || isLoading)
  const showDropdown = isOpen && (showRecentSearches || showResults)

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <Input
        variant='ghost'
        placeholder={t('form.searchPlaceholder')}
        iconStart={<FaSearch className='text-muted-foreground' />}
        className='w-full'
        inputClassName='text-lg'
        containerClassName='grow py-3 px-6 border-b-1 border-transparent focus-within:border-secondary-foreground transition-[border-color] duration-300 ease-in-out'
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
      />

      {showDropdown && (
        <div className='absolute top-full right-0 left-0 z-50 mt-1 max-h-[400px] overflow-y-auto rounded-md border border-(--muza-light-border-color) bg-white shadow-lg'>
          {showRecentSearches && (
            <div className='p-2'>
              <Typography
                variant='h3'
                className='text-muted-foreground mb-2 px-3 text-sm font-medium'
              >
                {t('search.recentSearches')}
              </Typography>
              <div className='flex flex-col'>
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    type='button'
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                      'hover:bg-(--muza-hover-background,#eeeeee)',
                      selectedIndex === index && 'bg-(--muza-hover-background,#eeeeee)'
                    )}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                  >
                    <FaClock className='text-muted-foreground h-4 w-4 shrink-0' />
                    <Typography className='flex-1 truncate text-base'>{recentQuery}</Typography>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showResults && (
            <div className='p-2'>
              {isLoading ? (
                <div className='flex items-center justify-center py-4'>
                  <Typography className='text-muted-foreground'>{t('general.loading')}</Typography>
                </div>
              ) : results.length > 0 ? (
                <div className='flex flex-col'>
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      type='button'
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                        'hover:bg-(--muza-hover-background,#eeeeee)',
                        selectedIndex === index && 'bg-(--muza-hover-background,#eeeeee)'
                      )}
                      onClick={() => handleResultClick(result)}
                    >
                      {result.imageUrl && (
                        <Image
                          src={result.imageUrl}
                          alt={result.title}
                          className='h-10 w-10 shrink-0 rounded object-cover'
                        />
                      )}
                      <div className='min-w-0 flex-1'>
                        <Typography className='truncate text-base font-medium'>
                          {result.title}
                        </Typography>
                        {result.subtitle && (
                          <Typography className='text-muted-foreground truncate text-sm'>
                            {result.subtitle}
                          </Typography>
                        )}
                      </div>
                      <Typography className='bg-accent-foregroundtext-muted-foreground shrink-0 text-xs uppercase'>
                        {result.type}
                      </Typography>
                    </button>
                  ))}
                </div>
              ) : (
                <div className='flex items-center justify-center py-4'>
                  <Typography className='text-muted-foreground'>
                    {t('search.noAutocompleteResults')}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
