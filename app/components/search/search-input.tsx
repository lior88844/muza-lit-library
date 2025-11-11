import { debounce } from 'lodash-es'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router'

import { Input, type InputProps } from '../ui/input'

interface Props extends InputProps {
  debounceMs?: number
}

export function SearchInput(props: Props) {
  const { debounceMs = 500, ...inputProps } = props
  const { t } = useTranslation()
  const navigate = useNavigate()

  const debouncedHandleSearch = useMemo(
    () =>
      debounce((searchText: string) => {
        const newValue = searchText.trim()
        const redirectTo = newValue ? `/search?q=${encodeURIComponent(newValue)}` : '/'
        navigate(redirectTo)
      }, debounceMs),
    [debounceMs, navigate]
  )

  return (
    <Input
      variant='ghost'
      placeholder={t('form.searchPlaceholder')}
      iconStart={<FaSearch className='text-muted-foreground' />}
      className='w-full'
      inputClassName='text-lg'
      containerClassName='grow py-3 px-6 border-b-1 border-transparent focus-within:border-secondary-foreground transition-[border-color] duration-300 ease-in-out'
      onChange={e => debouncedHandleSearch(e.target.value)}
      {...inputProps}
    />
  )
}
