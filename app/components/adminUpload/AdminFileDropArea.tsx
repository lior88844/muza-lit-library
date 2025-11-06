import React, { useCallback, useState } from 'react'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

interface AdminFileDropAreaProps {
  onFileUpload: (files: File[]) => void
}

const AdminFileDropArea: React.FC<AdminFileDropAreaProps> = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFolderDrop = useCallback(
    async (items: DataTransferItemList) => {
      const files: File[] = []

      const processItem = async (item: DataTransferItem, path = '') => {
        const entry = item.webkitGetAsEntry?.()
        if (!entry) return

        if (entry.isFile) {
          const file = await new Promise<File>(resolve => {
            ;(entry as FileSystemFileEntry).file(resolve)
          })

          const relativePath = path + entry.name
          Object.defineProperty(file, 'webkitRelativePath', {
            value: relativePath,
            writable: false,
            enumerable: true,
            configurable: true,
          })

          files.push(file)
        } else if (entry.isDirectory) {
          const dirReader = (entry as FileSystemDirectoryEntry).createReader()

          const readAllEntries = async (): Promise<FileSystemEntry[]> => {
            const allEntries: FileSystemEntry[] = []

            const readBatch = (): Promise<void> => {
              return new Promise((resolve, reject) => {
                dirReader.readEntries(entries => {
                  if (entries.length === 0) {
                    resolve()
                    return
                  }

                  allEntries.push(...entries)
                  readBatch().then(resolve).catch(reject)
                }, reject)
              })
            }

            await readBatch()
            return allEntries
          }

          const entries = await readAllEntries()

          for (const subEntry of entries) {
            await processItem(
              { webkitGetAsEntry: () => subEntry } as DataTransferItem,
              path + entry.name + '/'
            )
          }
        }
      }

      for (let i = 0; i < items.length; i++) {
        await processItem(items[i])
      }

      if (files.length > 0) {
        onFileUpload(files)
      }
    },
    [onFileUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const items = Array.from(e.dataTransfer.items)
        const hasWebkitSupport = items.some(item => item.webkitGetAsEntry)

        if (hasWebkitSupport) {
          handleFolderDrop(e.dataTransfer.items)
          return
        }
      }

      const files = Array.from(e.dataTransfer.files)
      const hasFolders = files.some(file => !file.type && file.size < 1000)

      if (hasFolders) {
        alert(
          'Please use the "browse folders" button to upload folders. Drag & drop only works for individual files in this browser.'
        )
        return
      }

      if (files.length > 0) {
        onFileUpload(files)
      }
    },
    [onFileUpload, handleFolderDrop]
  )

  const handleBrowseClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.flac,audio/flac'
    input.webkitdirectory = true
    input.onchange = e => {
      const target = e.target as HTMLInputElement
      const files = Array.from(target.files || [])
      if (files.length > 0) {
        onFileUpload(files)
      }
    }
    input.click()
  }, [onFileUpload])

  return (
    <div className='flex w-full items-center justify-center py-3'>
      <div
        className={cn(
          'border-border-light bg-background w-full cursor-pointer rounded-md border-2 border-dashed px-6 py-4 transition-all duration-200 ease-in-out',
          isDragOver && 'border-primary bg-muted'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='text-muted-foreground h-6 w-6 [&_i]:flex [&_i]:h-full [&_i]:w-full [&_i]:items-center [&_i]:justify-center [&_i_svg]:h-full [&_i_svg]:w-full'>
            <MuzaIcon iconName='upload' />
          </div>

          <div className='flex flex-wrap items-center justify-center gap-1'>
            <span className='text-background-dark font-sans text-base leading-none font-normal'>
              Drag FLAC files or folders here{' '}
            </span>
            <button
              type='button'
              className='text-primary cursor-pointer border-none bg-none p-0 font-sans text-base leading-none font-normal underline hover:text-(--colors_primary_dark)'
              onClick={handleBrowseClick}
            >
              or browse folders
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminFileDropArea
