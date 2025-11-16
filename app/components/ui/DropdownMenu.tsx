import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import React from 'react'

import MuzaIcon from '~/icons/MuzaIcon'

import styles from './DropdownMenu.module.css'

export interface DropdownMenuItem {
  id: string
  title: string
  icon?: string
  onClick: () => void
  destructive?: boolean
}

export interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownMenuItem[]
  title?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  title,
  open,
  onOpenChange,
}) => {
  const renderItem = (item: DropdownMenuItem, index: number) => {
    // Check if this item should have a separator before it
    const shouldAddSeparator = item.destructive && index > 0 && !items[index - 1]?.destructive

    return (
      <React.Fragment key={item.id}>
        {shouldAddSeparator && (
          <DropdownMenuPrimitive.Separator className={styles['dropdown-menu__separator']} />
        )}
        <DropdownMenuPrimitive.Item
          className={`${styles['dropdown-menu__item']} ${item.destructive ? styles['dropdown-menu__item--destructive'] : ''}`}
          onClick={item.onClick}
        >
          {item.icon && (
            <MuzaIcon iconName={item.icon} className={styles['dropdown-menu__item-icon']} />
          )}
          <span className={styles['dropdown-menu__item-text']}>{item.title}</span>
        </DropdownMenuPrimitive.Item>
      </React.Fragment>
    )
  }

  return (
    <DropdownMenuPrimitive.Root modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={styles['dropdown-menu']}
          sideOffset={4}
          align='end'
        >
          {title && (
            <>
              <DropdownMenuPrimitive.Label className={styles['dropdown-menu__title']}>
                {title}
              </DropdownMenuPrimitive.Label>
              <DropdownMenuPrimitive.Separator className={styles['dropdown-menu__separator']} />
            </>
          )}
          {items.map((item, index) => renderItem(item, index))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

export default DropdownMenu
