import React from 'react'
import { useTranslation } from 'react-i18next'

import MuzaIcon from '~/icons/MuzaIcon'

import type { AlbumResponse } from '../../../server/api/album/types/AlbumResponse'
import { Typography } from '../ui/typography'

interface AlbumInfoProps {
  isOpen: boolean
  album: AlbumResponse
  onClose: () => void
}

const AlbumInfoModal: React.FC<AlbumInfoProps> = ({ isOpen, album, onClose }) => {
  const { t } = useTranslation()
  
  if (!isOpen) return null

  const formatDate = (date: Date | null) => {
    if (!date) return t('common.unknown')
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Filter artists by role
  const instruments = album.otherArtists.filter(artist => 
    artist.role && !['Composer', 'Lyricist', 'Producer', 'Recording Engineer', 'Engineer'].includes(artist.role)
  )
  
  const composers = album.otherArtists.filter(artist => artist.role === 'Composer')
  const lyricists = album.otherArtists.filter(artist => 
    artist.role?.toLowerCase().includes('lyric')
  )
  
  const recordingEngineers = album.otherArtists.filter(artist => 
    artist.role === 'Recording Engineer' || artist.role === 'Engineer'
  )
  const producers = album.otherArtists.filter(artist => artist.role === 'Producer')

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1001] p-4"
      onClick={onClose}
    >
      <div 
        className="w-[478px] max-w-[90vw] bg-white rounded-lg overflow-hidden shadow-[0_8px_12px_6px_rgba(0,0,0,0.15),0_4px_4px_0_rgba(0,0,0,0.3)] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative h-[162px] bg-cover bg-center flex items-end p-4 px-6 rounded-t-lg overflow-hidden"
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.98) 100%),
      url(${album.coverArt}) no-repeat center center / contain`,
          }}
        >
          <div className="flex-1 text-white">
            <Typography variant='h1' as='h2' className={'text-primary-foreground'}>
              {album.title}
            </Typography>
            <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-2xl font-normal leading-none text-white mt-1">
              {album.artist.name}
            </p>
          </div>
          <button 
            className="absolute top-4 right-4 flex items-center justify-center bg-white border-none text-[#5f5f5f] text-[22px] leading-none rounded-full w-[22px] h-[22px] cursor-pointer transition-transform hover:scale-110"
            onClick={onClose}
          >
            <MuzaIcon iconName='Close' />
          </button>
        </div>

        {/* Content */}
        <div className="bg-white p-10 flex-1 overflow-y-auto">
          <div className="flex gap-[65px]">
            {/* Left Column - Labels */}
            <div className="flex flex-col gap-[38px] shrink-0 min-w-[145px]">
              {/* Instruments Section */}
              {instruments.length > 0 && (
                <div className="flex flex-col gap-2">
                  {instruments.map(artist => (
                    <p 
                      key={artist.id}
                      className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#6b7280]"
                    >
                      {artist.role}
                    </p>
                  ))}
                </div>
              )}

              {/* Composer and Lyrics Section */}
              {(composers.length > 0 || lyricists.length > 0) && (
                <div className="flex flex-col gap-2">
                  {composers.length > 0 && (
                    <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#6b7280]">
                      {t('albumInfo.composer')}
                    </p>
                  )}
                  {lyricists.length > 0 && (
                    <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#6b7280]">
                      {t('albumInfo.lyrics')}
                    </p>
                  )}
                </div>
              )}

              {/* Production Section */}
              <div className="flex flex-col gap-2">
                <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#6b7280]">
                  {t('albumInfo.recordedOn')}
                </p>
                {recordingEngineers.length > 0 && (
                  <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#6b7280]">
                    {t('albumInfo.recordedBy')}
                  </p>
                )}
                {producers.length > 0 && (
                  <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#6b7280]">
                    {t('albumInfo.producedBy')}
                  </p>
                )}
                {album.labels && album.labels.length > 0 && (
                  <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#6b7280]">
                    {t('albumInfo.label')}
                  </p>
                )}
                    </div>
                  </div>

            {/* Right Column - Values */}
            <div className="flex flex-col gap-[38px] flex-1 min-w-0">
              {/* Instruments Values */}
              {instruments.length > 0 && (
                <div className="flex flex-col gap-2">
                  {instruments.map(artist => (
                    <p 
                      key={artist.id}
                      className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#030712]"
                    >
                      {artist.name}
                    </p>
                  ))}
                </div>
              )}

              {/* Composer and Lyrics Values */}
              {(composers.length > 0 || lyricists.length > 0) && (
                <div className="flex flex-col gap-2">
                  {composers.length > 0 && (
                    <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#030712]">
                      {composers.map(c => c.name).join(', ')}
                    </p>
                  )}
                  {lyricists.length > 0 && (
                    <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#030712]">
                      {lyricists.map(l => l.name).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Production Values */}
              <div className="flex flex-col gap-2">
                <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#030712]">
                  {formatDate(album.releaseDate)}
                </p>
                {recordingEngineers.length > 0 && (
                  <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#030712]">
                    {recordingEngineers.map(e => e.name).join(', ')}
                  </p>
                )}
                {producers.length > 0 && (
                  <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#030712]">
                    {producers.map(p => p.name).join(', ')}
                  </p>
                )}
                {album.labels && album.labels.length > 0 && (
                  <p className="m-0 font-[family-name:var(--typography_font_family_font_sans,'Founders_Grotesk'),sans-serif] text-base font-normal leading-5 tracking-[0.25px] text-[#030712]">
                    {album.labels[0].name}
                  </p>
                )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlbumInfoModal
