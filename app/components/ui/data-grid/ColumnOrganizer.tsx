import './ColumnOrganizer.css'

import type { ColDef } from 'ag-grid-community'
import { useEffect, useRef, useState } from 'react'

import MuzaIcon from '~/icons/MuzaIcon'

import { Button } from '../button'

interface ColumnOrganizerProps {
  columns: ColDef[]
  columnFieldsToShow: string[]
  onChange: (columns: string[]) => void
}
const ColumnOrganizer = ({ columns, columnFieldsToShow, onChange }: ColumnOrganizerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleToggleColumn = (field: string) => {
    const newColumns = columnFieldsToShow.includes(field)
      ? columnFieldsToShow.filter(col => col !== field)
      : [...columnFieldsToShow, field]
    onChange(newColumns)
  }

  const handleMoveColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columnFieldsToShow]
    const [movedColumn] = newColumns.splice(fromIndex, 1)
    newColumns.splice(toIndex, 0, movedColumn)
    onChange(newColumns)
  }

  // Organize columns: visible ones first (in their current order), then hidden ones
  const organizedColumns = columns
    .map(column => ({
      ...column,
      isVisible: columnFieldsToShow.includes(column.field as string),
      currentIndex: columnFieldsToShow.indexOf(column.field as string),
    }))
    .sort((a, b) => {
      // If both are visible, sort by their current order in the datagrid
      if (a.isVisible && b.isVisible) {
        return a.currentIndex - b.currentIndex
      }
      // If only one is visible, visible columns come first
      if (a.isVisible && !b.isVisible) return -1
      if (!a.isVisible && b.isVisible) return 1
      // If both are hidden, maintain original order
      return 0
    })

  return (
    <div className='column-organizer'>
      <Button size='sm' onClick={() => setIsOpen(!isOpen)}>
        <MuzaIcon iconName='column' />
      </Button>

      {isOpen && (
        <div className='column-organizer-dropdown' ref={dropdownRef}>
          <div className='column-organizer-list'>
            {organizedColumns.map(column => {
              return (
                <div key={column.field || column.colId} className='column-organizer-item'>
                  <label className='column-checkbox'>
                    <input
                      type='checkbox'
                      checked={column.isVisible}
                      onChange={() => handleToggleColumn(column.field as string)}
                    />
                    <span className='column-label'>{column.headerName}</span>
                  </label>

                  {column.isVisible && (
                    <div className='column-controls'>
                      <Button
                        size='sm'
                        className='btn btn-outline btn-small btn-icon'
                        onClick={() =>
                          column.currentIndex > 0 &&
                          handleMoveColumn(column.currentIndex, column.currentIndex - 1)
                        }
                        disabled={column.currentIndex <= 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size='sm'
                        className='btn btn-outline btn-small btn-icon'
                        onClick={() =>
                          column.currentIndex < columnFieldsToShow.length - 1 &&
                          handleMoveColumn(column.currentIndex, column.currentIndex + 1)
                        }
                        disabled={column.currentIndex >= columnFieldsToShow.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ColumnOrganizer
