import { useCallback, useEffect, useRef } from 'react'
import { type FetcherSubmitOptions, useFetcher } from 'react-router'

/**
 * Custom hook that wraps useFetcher to provide an awaitable submit function.
 * This allows you to await the completion of form submissions.
 *
 * @template TData - The type of data returned by the fetcher
 * @returns An object containing all fetcher properties plus an awaitable submit function
 */
export function useFetcherAsync<TData = unknown>() {
  const fetcher = useFetcher<TData>()
  const resolveRef = useRef<((data: TData) => void) | null>(null)
  const rejectRef = useRef<((error: Error) => void) | null>(null)

  // Monitor fetcher state changes to resolve/reject promises
  useEffect(() => {
    if (fetcher.state === 'idle' && resolveRef.current) {
      // Check if there was an error
      if (fetcher.data && typeof fetcher.data === 'object' && 'error' in fetcher.data) {
        const error = fetcher.data.error
        if (rejectRef.current) {
          rejectRef.current(new Error(typeof error === 'string' ? error : 'Submission failed'))
        }
      } else {
        // Success case
        if (resolveRef.current) {
          resolveRef.current(fetcher.data as TData)
        }
      }

      // Clean up refs
      resolveRef.current = null
      rejectRef.current = null
    }
  }, [fetcher.state, fetcher.data])

  /**
   * Submit data and return a promise that resolves when the submission is complete.
   *
   * @param data - The data to submit (FormData, URLSearchParams, or object)
   * @param options - Submission options (method, action, etc.)
   * @returns Promise that resolves with the fetcher data or rejects with an error
   */
  const submit = useCallback(
    (data: FormData | URLSearchParams | Record<string, string>, options?: FetcherSubmitOptions): Promise<TData> => {
      return new Promise((resolve, reject) => {
        // Store resolve/reject functions
        resolveRef.current = (data: TData) => {
          return resolve(data as TData)
        }
        rejectRef.current = (error: Error) => reject(error)

        // Submit the data
        fetcher.submit(data, options)
      })
    },
    [fetcher]
  )

  /**
   * Load data and return a promise that resolves when the loading is complete.
   *
   * @param href - The URL to load
   * @param options - Load options
   * @returns Promise that resolves with the fetcher data or rejects with an error
   */
  const load = useCallback(
    (href: string, options?: { flushSync?: boolean }): Promise<TData> => {
      return new Promise((resolve, reject) => {
        // Store resolve/reject functions
        resolveRef.current = (data: TData) => resolve(data)
        rejectRef.current = (error: Error) => reject(error)

        // Load the data
        fetcher.load(href, options)
      })
    },
    [fetcher]
  )

  return {
    ...fetcher,
    submit,
    load,
  }
}

export default useFetcherAsync
