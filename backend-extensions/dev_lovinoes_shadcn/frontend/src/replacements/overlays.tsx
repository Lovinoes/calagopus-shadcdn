import type {
  DrawerProps,
  MenuDividerProps,
  MenuDropdownProps,
  MenuItemProps,
  MenuLabelProps,
  MenuProps,
  MenuTargetProps,
  ModalProps,
  PopoverDropdownProps,
  PopoverProps,
  PopoverTargetProps,
  TooltipProps,
} from '@mantine/core';
import { XIcon } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  createContext,
  type ReactNode,
  type Ref,
  useContext,
} from 'react';
import { Modal as ModalElement, ModalFooter as ModalFooterElement } from '@/elements/modals/Modal.tsx';
import ConditionalTooltipElement, {
  type TooltipProps as ConditionalTooltipProps,
} from '@/elements/overlays/ConditionalTooltip.tsx';
import DrawerElement from '@/elements/overlays/Drawer.tsx';
import MenuElement from '@/elements/overlays/Menu.tsx';
import PopoverElement from '@/elements/overlays/Popover.tsx';
import TooltipElement from '@/elements/overlays/Tooltip.tsx';
import { cn } from '../lib/cn.ts';
import { splitPosition } from '../lib/mantine/position.ts';
import { colorVars, radiusStyle } from '../lib/mantine/scales.ts';
import { useMantineSlots } from '../lib/mantine/slots.ts';
import { useStyleProps } from '../lib/mantine/splitProps.ts';
import { useResolvedStyle } from '../lib/mantine/style.ts';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.tsx';
import { Sheet, SheetContent } from '../ui/sheet.tsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip.tsx';

/**
 * Mantine's overlays are compound: `<Menu>` provides context and `<Menu.Target>` / `<Menu.Dropdown>`
 * consume it. Radix is shaped the same way, so the mapping is one-to-one — but only if *every* part is
 * replaced together. Replacing `Menu` alone would leave `Menu.Target` looking for a Mantine context that
 * is no longer there, so the subcomponents are swapped in the same `register…` call below.
 *
 * The root's floating options (`position`, `offset`, `shadow`, `width`, `radius`) arrive on the root but
 * are needed by the content, which a sibling component renders — hence the small contexts here.
 */

const MODAL_SIZES: Record<string, string> = {
  xs: 'sm:max-w-[20rem]',
  sm: 'sm:max-w-[23.75rem]',
  md: 'sm:max-w-[27.5rem]',
  lg: 'sm:max-w-[38.75rem]',
  xl: 'sm:max-w-[48.75rem]',
  auto: 'sm:max-w-fit',
  '100%': 'sm:max-w-full',
};

/** Mantine's drawer sizes are widths, and they match the modal scale. */
const DRAWER_SIZES: Record<string, string> = {
  xs: 'sm:max-w-[20rem]',
  sm: 'sm:max-w-[23.75rem]',
  md: 'sm:max-w-[27.5rem]',
  lg: 'sm:max-w-[38.75rem]',
  xl: 'sm:max-w-[48.75rem]',
  auto: 'sm:max-w-fit',
  '100%': 'sm:max-w-full',
};

function sizeStyle(size: string | number | undefined, property: 'maxWidth'): CSSProperties | undefined {
  if (size === undefined || size === null) {
    return undefined;
  }
  if (typeof size === 'number') {
    return { [property]: size };
  }
  if (size in MODAL_SIZES) {
    return undefined;
  }
  return { [property]: size };
}

function sizeClass(size: string | number | undefined, table: Record<string, string>): string | undefined {
  if (typeof size === 'string' && size in table) {
    return table[size];
  }
  return size === undefined ? table.md : undefined;
}

function ShadcnModal({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  opened,
  onClose,
  title,
  size,
  centered,
  fullScreen,
  withCloseButton = true,
  closeButtonProps,
  closeOnClickOutside = true,
  closeOnEscape = true,
  withOverlay = true,
  overlayProps,
  trapFocus,
  returnFocus,
  lockScroll,
  removeScrollProps,
  zIndex,
  padding,
  radius,
  shadow,
  keepMounted,
  transitionProps,
  scrollAreaComponent,
  yOffset,
  xOffset,
  stackId,
  id,
  ...others
}: ModalProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { size });
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(
    {
      ...fromStyleProps,
      ...radiusStyle(radius),
      ...sizeStyle(size, 'maxWidth'),
      ...(zIndex !== undefined ? { zIndex: Number(zIndex) } : undefined),
      ...(padding !== undefined ? { padding: `var(--mantine-spacing-${padding}, ${padding})` } : undefined),
      ...slots.style('content'),
    },
    style,
  );

  return (
    <Dialog open={opened} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent
        ref={ref}
        showCloseButton={false}
        forceMount={keepMounted ? true : undefined}
        overlayClassName={cn(
          !withOverlay && 'hidden',
          'backdrop-blur-[3px]',
          slots.className('overlay'),
          overlayProps?.className,
        )}
        onEscapeKeyDown={(event) => {
          if (!closeOnEscape) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (!closeOnClickOutside) {
            event.preventDefault();
          }
        }}
        className={cn(
          sizeClass(size, MODAL_SIZES),
          fullScreen && 'h-full max-h-full w-full max-w-full rounded-none sm:max-w-full',
          !centered && 'top-[10%] translate-y-0',
          slots.className('content'),
          className,
        )}
        style={resolvedStyle}
        {...rest}
      >
        {title || withCloseButton ? (
          <DialogHeader
            className={cn('flex-row items-center justify-between gap-4 text-left', slots.className('header'))}
            style={slots.style('header')}
          >
            <DialogTitle className={cn('text-base', slots.className('title'))} style={slots.style('title')}>
              {title}
            </DialogTitle>
            {withCloseButton ? (
              <DialogClose
                aria-label='Close'
                className={cn(
                  'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-70 transition-opacity hover:bg-accent hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                  slots.className('close'),
                )}
                {...(closeButtonProps as ComponentPropsWithoutRef<'button'>)}
              >
                <XIcon className='size-4' />
              </DialogClose>
            ) : null}
          </DialogHeader>
        ) : (
          // Radix needs a labelled dialog; an untitled modal gets a hidden one rather than a warning.
          <DialogTitle className='sr-only'>Dialog</DialogTitle>
        )}
        <div className={cn('min-w-0', slots.className('body'))} style={slots.style('body')}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShadcnModalFooter({ children }: { children: ReactNode }) {
  return (
    <div data-slot='modal-footer' className='mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
      {children}
    </div>
  );
}

function ShadcnDrawer({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  opened,
  onClose,
  title,
  size,
  position = 'right',
  withCloseButton = true,
  closeButtonProps,
  closeOnClickOutside = true,
  closeOnEscape = true,
  withOverlay = true,
  overlayProps,
  trapFocus,
  returnFocus,
  lockScroll,
  removeScrollProps,
  zIndex,
  padding,
  radius,
  shadow,
  keepMounted,
  transitionProps,
  scrollAreaComponent,
  offset,
  id,
  ...others
}: DrawerProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { size, position });
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(
    {
      ...fromStyleProps,
      ...radiusStyle(radius),
      ...sizeStyle(size, 'maxWidth'),
      ...(zIndex !== undefined ? { zIndex: Number(zIndex) } : undefined),
      ...(offset !== undefined ? { inset: `${typeof offset === 'number' ? `${offset}px` : offset}` } : undefined),
      ...slots.style('content'),
    },
    style,
  );

  return (
    <Sheet open={opened} onOpenChange={(next) => (next ? undefined : onClose())}>
      <SheetContent
        ref={ref}
        side={position === 'top' || position === 'bottom' || position === 'left' ? position : 'right'}
        showCloseButton={false}
        forceMount={keepMounted ? true : undefined}
        overlayClassName={cn(!withOverlay && 'hidden', 'backdrop-blur-[3px]', slots.className('overlay'))}
        onEscapeKeyDown={(event) => {
          if (!closeOnEscape) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (!closeOnClickOutside) {
            event.preventDefault();
          }
        }}
        className={cn('w-full', sizeClass(size, DRAWER_SIZES), slots.className('content'), className)}
        style={resolvedStyle}
        {...rest}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3',
            slots.className('header'),
          )}
          style={slots.style('header')}
        >
          <DialogTitle className={cn('text-base font-semibold', slots.className('title'))}>{title}</DialogTitle>
          {withCloseButton ? (
            <DialogClose
              aria-label='Close'
              className={cn(
                'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-70 transition-opacity hover:bg-accent hover:opacity-100',
                slots.className('close'),
              )}
              {...(closeButtonProps as ComponentPropsWithoutRef<'button'>)}
            >
              <XIcon className='size-4' />
            </DialogClose>
          ) : null}
        </div>
        <div className={cn('min-h-0 flex-1 overflow-y-auto p-4', slots.className('body'))} style={slots.style('body')}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface FloatingContextValue {
  position?: string;
  offset?: number;
  width?: string | number;
  shadow?: string;
  radius?: string | number;
  className?: string;
  style?: CSSProperties;
  withArrow?: boolean;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
  trapFocus?: boolean;
}

const MenuContext = createContext<FloatingContextValue>({});
const PopoverFloatingContext = createContext<FloatingContextValue>({});

function ShadcnMenu({
  children,
  opened,
  defaultOpened,
  onOpen,
  onClose,
  onChange,
  position,
  offset,
  width,
  shadow,
  radius,
  withArrow,
  closeOnEscape,
  closeOnClickOutside,
  trapFocus,
  disabled,
  loop,
  keepMounted,
  zIndex,
  transitionProps,
  closeOnItemClick,
  menuItemTabIndex,
  middlewares,
  classNames,
  styles,
  clickOutsideEvents,
  returnFocus,
  ...rest
}: MenuProps) {
  const handleOpenChange = (next: boolean) => {
    onChange?.(next);
    if (next) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  return (
    <MenuContext.Provider
      value={{
        position,
        offset: typeof offset === 'number' ? offset : undefined,
        width: width ?? undefined,
        shadow,
        radius,
        withArrow,
        closeOnEscape,
        closeOnClickOutside,
        trapFocus,
      }}
    >
      <DropdownMenu
        open={disabled ? false : opened}
        defaultOpen={defaultOpened}
        onOpenChange={handleOpenChange}
        modal={false}
        {...rest}
      >
        {children}
      </DropdownMenu>
    </MenuContext.Provider>
  );
}

function ShadcnMenuTarget({ children, refProp, ...rest }: MenuTargetProps) {
  return (
    <DropdownMenuTrigger asChild {...rest}>
      {children}
    </DropdownMenuTrigger>
  );
}

function ShadcnMenuDropdown({
  ref,
  children,
  className,
  style,
  ...others
}: MenuDropdownProps & { ref?: Ref<HTMLDivElement> }) {
  const floating = useContext(MenuContext);
  const { side, align } = splitPosition(floating.position);
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(
    {
      ...fromStyleProps,
      ...radiusStyle(floating.radius),
      ...(floating.width === 'target'
        ? { width: 'var(--radix-dropdown-menu-trigger-width)' }
        : floating.width !== undefined
          ? { width: floating.width }
          : undefined),
    },
    style,
  );

  return (
    <DropdownMenuContent
      ref={ref}
      side={side}
      align={align}
      sideOffset={floating.offset}
      onEscapeKeyDown={(event) => {
        if (floating.closeOnEscape === false) {
          event.preventDefault();
        }
      }}
      onPointerDownOutside={(event) => {
        if (floating.closeOnClickOutside === false) {
          event.preventDefault();
        }
      }}
      className={className}
      style={resolvedStyle}
      {...rest}
    >
      {children}
    </DropdownMenuContent>
  );
}

function ShadcnMenuItem({
  ref,
  children,
  className,
  color,
  leftSection,
  rightSection,
  disabled,
  closeMenuOnClick,
  style,
  styles,
  classNames,
  ...rest
}: MenuItemProps & ComponentPropsWithoutRef<'button'> & { ref?: Ref<HTMLButtonElement> }) {
  const resolvedStyle = useResolvedStyle(colorVars(color), style);

  return (
    <DropdownMenuItem
      asChild
      disabled={disabled}
      variant={color === 'red' ? 'destructive' : 'default'}
      onSelect={(event) => {
        if (closeMenuOnClick === false) {
          event.preventDefault();
        }
      }}
      className={className}
      style={resolvedStyle}
    >
      <button ref={ref} type='button' disabled={disabled} {...rest}>
        {leftSection ? <span className='shrink-0'>{leftSection}</span> : null}
        <span className='min-w-0 flex-1 text-left'>{children}</span>
        {rightSection ? <span className='shrink-0 text-muted-foreground'>{rightSection}</span> : null}
      </button>
    </DropdownMenuItem>
  );
}

function ShadcnMenuLabel({
  ref,
  children,
  className,
  style,
  ...others
}: MenuLabelProps & { ref?: Ref<HTMLDivElement> }) {
  // `MenuLabelProps` carries Mantine's `inset` style prop, which collides with shadcn's boolean `inset`.
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(fromStyleProps, style);

  return (
    <DropdownMenuLabel ref={ref} className={className} style={resolvedStyle} {...rest}>
      {children}
    </DropdownMenuLabel>
  );
}

function ShadcnMenuDivider({ ref, className, style, ...others }: MenuDividerProps & { ref?: Ref<HTMLDivElement> }) {
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(fromStyleProps, style);

  return <DropdownMenuSeparator ref={ref} className={className} style={resolvedStyle} {...rest} />;
}

function ShadcnPopover({
  children,
  opened,
  defaultOpened,
  onChange,
  onClose,
  onOpen,
  onDismiss,
  position,
  offset,
  width,
  shadow,
  radius,
  withArrow,
  arrowSize,
  arrowOffset,
  arrowRadius,
  arrowPosition,
  trapFocus,
  closeOnClickOutside,
  closeOnEscape,
  zIndex,
  withinPortal,
  portalProps,
  keepMounted,
  transitionProps,
  disabled,
  middlewares,
  clickOutsideEvents,
  returnFocus,
  classNames,
  styles,
  ...rest
}: PopoverProps) {
  const handleOpenChange = (next: boolean) => {
    onChange?.(next);
    if (next) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  return (
    <PopoverFloatingContext.Provider
      value={{
        position,
        offset: typeof offset === 'number' ? offset : undefined,
        width: width ?? undefined,
        shadow,
        radius,
        withArrow,
        closeOnEscape,
        closeOnClickOutside,
        trapFocus,
      }}
    >
      <Popover
        open={disabled ? false : opened}
        defaultOpen={defaultOpened}
        onOpenChange={handleOpenChange}
        modal={false}
        {...rest}
      >
        {children}
      </Popover>
    </PopoverFloatingContext.Provider>
  );
}

function ShadcnPopoverTarget({ children, refProp, popupType, ...rest }: PopoverTargetProps) {
  return (
    <PopoverTrigger asChild {...rest}>
      {children}
    </PopoverTrigger>
  );
}

function ShadcnPopoverDropdown({
  ref,
  children,
  className,
  style,
  ...others
}: PopoverDropdownProps & { ref?: Ref<HTMLDivElement> }) {
  const floating = useContext(PopoverFloatingContext);
  const { side, align } = splitPosition(floating.position);
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(
    {
      ...fromStyleProps,
      ...radiusStyle(floating.radius),
      ...(floating.width === 'target'
        ? { width: 'var(--radix-popover-trigger-width)' }
        : floating.width !== undefined
          ? { width: floating.width }
          : undefined),
    },
    style,
  );

  return (
    <PopoverContent
      ref={ref}
      side={side}
      align={align}
      sideOffset={floating.offset}
      withArrow={floating.withArrow}
      onEscapeKeyDown={(event) => {
        if (floating.closeOnEscape === false) {
          event.preventDefault();
        }
      }}
      onPointerDownOutside={(event) => {
        if (floating.closeOnClickOutside === false) {
          event.preventDefault();
        }
      }}
      className={cn(floating.width === undefined && 'w-auto', className)}
      style={resolvedStyle}
      {...rest}
    >
      {children}
    </PopoverContent>
  );
}

/**
 * The original wraps its child in an inline-block span so a tooltip can attach to text and to disabled
 * controls alike; that wrapper is kept and doubles as the Radix trigger.
 */
function ShadcnTooltip({
  ref,
  children,
  className,
  innerClassName,
  label,
  position,
  offset,
  withArrow = true,
  arrowSize,
  openDelay,
  closeDelay,
  opened,
  disabled,
  multiline,
  w,
  color,
  radius,
  zIndex,
  events,
  inline,
  withinPortal,
  keepMounted,
  transitionProps,
  refProp,
  styles,
  classNames,
  style,
  ...rest
}: TooltipProps & { innerClassName?: string; ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { color });
  const { side, align } = splitPosition(position, { side: 'top', align: 'center' });
  const contentStyle = useResolvedStyle({
    ...colorVars(color),
    ...radiusStyle(radius),
    ...(zIndex !== undefined ? { zIndex: Number(zIndex) } : undefined),
    ...(w !== undefined ? { maxWidth: w as string | number } : undefined),
    ...slots.style('tooltip'),
  });

  const trigger = (
    <span
      ref={ref as Ref<HTMLSpanElement>}
      className={cn('inline-block w-fit leading-none', innerClassName, className)}
    >
      {children}
    </span>
  );

  if (disabled || label === undefined || label === null || label === '') {
    return trigger;
  }

  return (
    <TooltipProvider delayDuration={openDelay ?? 0} skipDelayDuration={closeDelay}>
      <Tooltip open={opened}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={typeof offset === 'number' ? offset : 4}
          withArrow={withArrow}
          className={cn(
            color && 'bg-primary text-primary-foreground [&_svg]:fill-primary',
            multiline && 'whitespace-normal',
            slots.className('tooltip'),
          )}
          style={contentStyle}
          {...rest}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ShadcnConditionalTooltip({
  ref,
  children,
  className,
  innerClassName,
  enabled,
  ...rest
}: ConditionalTooltipProps & { ref?: Ref<HTMLDivElement> }) {
  if (!enabled) {
    return <span className={cn('inline-block', className, innerClassName)}>{children}</span>;
  }

  return (
    <ShadcnTooltip ref={ref} className={className} innerClassName={innerClassName} {...(rest as TooltipProps)}>
      {children}
    </ShadcnTooltip>
  );
}

export function registerOverlayReplacements(): void {
  ModalElement.replaceBaseComponent(ShadcnModal);
  ModalFooterElement.replaceBaseComponent(ShadcnModalFooter);
  DrawerElement.replaceBaseComponent(ShadcnDrawer);

  MenuElement.replaceBaseComponent(ShadcnMenu);
  MenuElement.Target.replaceBaseComponent(ShadcnMenuTarget);
  MenuElement.Dropdown.replaceBaseComponent(ShadcnMenuDropdown);
  MenuElement.Item.replaceBaseComponent(ShadcnMenuItem);
  MenuElement.Label.replaceBaseComponent(ShadcnMenuLabel);
  MenuElement.Divider.replaceBaseComponent(ShadcnMenuDivider);

  PopoverElement.replaceBaseComponent(ShadcnPopover);
  PopoverElement.Target.replaceBaseComponent(ShadcnPopoverTarget);
  PopoverElement.Dropdown.replaceBaseComponent(ShadcnPopoverDropdown);

  TooltipElement.replaceBaseComponent(ShadcnTooltip);
  ConditionalTooltipElement.replaceBaseComponent(ShadcnConditionalTooltip);
}
