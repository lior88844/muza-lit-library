const STORAGE_KEY = 'muza-recent-searches'
const MAX_RECENT_SEARCHES = 5

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string')
    }
    return []
  } catch (error) {
    console.error('Error reading recent searches from localStorage:', error)
    return []
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return
  }

  try {
    const recent = getRecentSearches()
    // Remove duplicates (case-insensitive)
    const filtered = recent.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase())
    // Add new search at the beginning
    const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving recent search to localStorage:', error)
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing recent searches from localStorage:', error)
  }
}
