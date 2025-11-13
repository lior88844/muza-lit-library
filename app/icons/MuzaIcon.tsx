import React from 'react'

// Lazy load SVGs as React components
const icons = import.meta.glob<React.FC<React.SVGProps<SVGSVGElement>>>('./icons/*.svg', {
  query: '?react',
  import: 'default',
})

interface MuzaIconProps {
  iconName: string // e.g., 'play', 'pause'
  svgStyle?: React.CSSProperties
  className?: string
}

const MuzaIcon: React.FC<MuzaIconProps> = ({ iconName, svgStyle, className }) => {
  const [IconComponent, setIconComponent] = React.useState<React.FC<
    React.SVGProps<SVGSVGElement>
  > | null>(null)

  React.useEffect(() => {
    const loadIcon = async () => {
      const iconLoader = icons[`./icons/${iconName}.svg`]
      if (iconLoader) {
        const Component = await iconLoader()
        setIconComponent(() => Component)
      }
    }

    loadIcon()
  }, [iconName])

  if (!IconComponent) {
    return null // Or show a placeholder/loading state
  }

  // Render the SVG as a proper React component
  return <IconComponent className={className} style={svgStyle} />
}

export default MuzaIcon
