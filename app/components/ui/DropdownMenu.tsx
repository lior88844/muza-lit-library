import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import MuzaIcon from "~/icons/MuzaIcon";
import "./DropdownMenu.scss";

export interface DropdownMenuItem {
  id: string;
  title: string;
  icon?: string;
  onClick: () => void;
  destructive?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  title?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  title,
}) => {
  const renderItem = (item: DropdownMenuItem, index: number) => {
    // Check if this item should have a separator before it
    const shouldAddSeparator =
      item.destructive && index > 0 && !items[index - 1]?.destructive;

    return (
      <React.Fragment key={item.id}>
        {shouldAddSeparator && (
          <DropdownMenuPrimitive.Separator className="dropdown-menu__separator" />
        )}
        <DropdownMenuPrimitive.Item
          className={`dropdown-menu__item ${
            item.destructive ? "dropdown-menu__item--destructive" : ""
          }`}
          onClick={item.onClick}
        >
          {item.icon && (
            <MuzaIcon
              iconName={item.icon}
              className="dropdown-menu__item-icon"
            />
          )}
          <span className="dropdown-menu__item-text">{item.title}</span>
        </DropdownMenuPrimitive.Item>
      </React.Fragment>
    );
  };

  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className="dropdown-menu"
          sideOffset={4}
          align="end"
        >
          {title && (
            <>
              <DropdownMenuPrimitive.Label className="dropdown-menu__title">
                {title}
              </DropdownMenuPrimitive.Label>
              <DropdownMenuPrimitive.Separator className="dropdown-menu__separator" />
            </>
          )}
          {items.map((item, index) => renderItem(item, index))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

export default DropdownMenu;
