import './AdminPortal.css'

import { useState } from 'react'
import { useNavigate } from 'react-router'

import AdminPortalTableBody from '~/components/adminPortal/AdminPortalTableBody'
import { Typography } from '~/components/ui/typography'
import MuzaIcon from '~/icons/MuzaIcon'

import styles from './AdminPortal.module.css'

interface SectionData {
  id: number
  name: string
  type: string
  content: string
  trackNumber: number
}

export default function AdminPortal() {
  const navigate = useNavigate()
  const [sections, setSections] = useState<SectionData[]>([
    {
      id: 1,
      name: 'Daily Muze',
      type: 'Playlists',
      content: 'Edit',
      trackNumber: 6,
    },
    {
      id: 2,
      name: 'Fallen Leafs for Fallen Angels',
      type: 'Songs',
      content: 'Edit',
      trackNumber: 0,
    },
    {
      id: 3,
      name: 'Daily Muze',
      type: 'Albums',
      content: 'Edit',
      trackNumber: 12,
    },
    {
      id: 4,
      name: 'Daily Muze',
      type: 'Artists',
      content: 'Edit',
      trackNumber: 18,
    },
    {
      id: 5,
      name: 'Daily Muze',
      type: 'Playlists',
      content: 'Edit',
      trackNumber: 6,
    },
    {
      id: 6,
      name: 'Daily Muze',
      type: 'Albums',
      content: 'Edit',
      trackNumber: 6,
    },
    {
      id: 7,
      name: 'Daily Muze',
      type: 'Playlists',
      content: 'Edit',
      trackNumber: 6,
    },
    {
      id: 8,
      name: 'Daily Muze',
      type: 'Songs',
      content: 'Edit',
      trackNumber: 9,
    },
    {
      id: 9,
      name: 'Daily Muze',
      type: 'Albums',
      content: 'Edit',
      trackNumber: 18,
    },
    {
      id: 10,
      name: 'Daily Muze',
      type: 'Artists',
      content: 'Edit',
      trackNumber: 9,
    },
  ])

  const [selectedPage, setSelectedPage] = useState('Home')

  const handleSectionNameChange = (id: number, newName: string) => {
    setSections(prev =>
      prev.map(section => (section.id === id ? { ...section, name: newName } : section))
    )
  }

  const handleSectionTypeChange = (id: number, newType: string) => {
    setSections(prev =>
      prev.map(section => (section.id === id ? { ...section, type: newType } : section))
    )
  }

  const handleSave = () => {
    console.log('Saving sections:', sections)
    // Implement save logic here
  }

  const handleCancelAll = () => {
    console.log('Canceling all changes')
    // Implement cancel logic here
  }

  return (
    <div className={styles.adminPortal}>
      <div className={styles.adminPortalInner}>
        {/* Header */}
        <div className={styles.adminPortalHeader}>
          <div className={styles.adminPortalHeaderContent}>
            <Typography variant='h3' as='h2'>
              Muza Admin Portal – Page Editor
            </Typography>
            <button className={styles.adminPortalCancelBtn} onClick={handleCancelAll}>
              Cancel all
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.adminPortalControls}>
          <div className={styles.adminPortalControlsContent}>
            <div className={styles.adminPortalDropdown}>
              <button className={styles.adminPortalDropdownBtn}>
                <span>{selectedPage}</span>
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                  <path
                    d='M4 6L8 10L12 6'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </div>
            <button
              className={styles.adminPortalUploadBtn}
              onClick={() => navigate('/admin-upload')}
            >
              <span>Upload Music</span>
              <MuzaIcon iconName='upload' />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className={styles.adminPortalTableContainer}>
          <div className={styles.adminPortalTable}>
            {/* Table Header */}
            <div className={styles.adminPortalTableHeader}>
              <div className={styles.adminPortalTableColumnNumber}>
                <div className={styles.adminPortalTableHeaderCell}>
                  <span></span>
                </div>
              </div>
              <div className={styles.adminPortalTableColumnSection}>
                <div className={styles.adminPortalTableHeaderCell}>
                  <span>Section Name</span>
                </div>
              </div>
              <div className={styles.adminPortalTableColumnType}>
                <div className={styles.adminPortalTableHeaderCell}>
                  <span>Type</span>
                </div>
              </div>
              <div className={styles.adminPortalTableColumnContent}>
                <div className={styles.adminPortalTableHeaderCell}>
                  <span>Content</span>
                </div>
              </div>
              <div className={styles.adminPortalTableColumnTrack}>
                <div
                  className={styles.adminPortalTableHeaderCell}
                  style={{ alignItems: 'flex-end' }}
                >
                  <span>Track Number</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <AdminPortalTableBody
              sections={sections}
              handleSectionNameChange={handleSectionNameChange}
              handleSectionTypeChange={handleSectionTypeChange}
            />
          </div>

          {/* Table Footer */}
          <div className={styles.adminPortalTableFooter}>
            <div className={styles.adminPortalTableFooterContent}>
              <button className={styles.adminPortalSaveBtn} onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
