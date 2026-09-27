import {
  Box,
  type CollapseProps,
  type NavLinkProps,
  type SegmentedControlProps,
  type TabsListProps,
  type TabsPanelProps,
  type TabsProps,
  type TabsTabProps,
} from '@mantine/core';
import { ChevronRightIcon } from 'lucide-react';
import { createContext, type MouseEvent as ReactMouseEvent, type Ref, useContext, useId } from 'react';
import CollapseElement from '@/elements/layout/Collapse.tsx';
import SegmentedControlElement from '@/elements/layout/SegmentedControl.tsx';
import TabsElement from '@/elements/layout/Tabs.tsx';
import NavLinkElement from '@/elements/navigation/NavLink.tsx';
import { cn } from '../lib/cn.ts';
import { colorVars, radiusStyle, resolveSize } from '../lib/mantine/scales.ts';
import { useMantineSlots } from '../lib/mantine/slots.ts';
import { splitStyleProps, useStyleProps } from '../lib/mantine/splitProps.ts';
import { useResolvedStyle } from '../lib/mantine/style.ts';
import { Collapse } from '../ui/collapse.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';

/**
 * Mantine's Tabs and Radix's are shaped identically — root, list, trigger, panel, all keyed by `value` —
 * so the four parts map one to one. As with the menus they have to be replaced together: a Radix trigger
 * outside a Radix root has no context to attach to.
 *
 * Mantine's three list variants collapse onto shadcn's two: `default` and `pills` both read as the
 * segmented list, `outline` as the underlined one. The variant is set on the root but needed by the list,
 * hence the context.
 */
const TABS_LIST_VARIANTS: Record<string, 'default' | 'line'> = {
  default: 'default',
  pills: 'default',
  outline: 'line',
};

const TabsVariantContext = createContext<'default' | 'line'>('default');

function ShadcnTabs({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  value,
  defaultValue,
  onChange,
  orientation,
  variant,
  color,
  radius,
  placement,
  activateTabWithKeyboard,
  allowTabDeactivation,
  keepMounted,
  loop,
  inverted,
  autoContrast,
  id,
  dir,
  ...others
}: TabsProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { variant, color });
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(
    { ...fromStyleProps, ...colorVars(color), ...radiusStyle(radius), ...slots.style('root') },
    style,
  );

  return (
    <TabsVariantContext.Provider value={TABS_LIST_VARIANTS[variant ?? 'default'] ?? 'default'}>
      <Tabs
        ref={ref}
        value={value ?? undefined}
        defaultValue={defaultValue ?? undefined}
        onValueChange={(next) => onChange?.(next)}
        orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'}
        activationMode={activateTabWithKeyboard === false ? 'manual' : 'automatic'}
        dir={dir === 'rtl' ? 'rtl' : undefined}
        className={cn(slots.className('root'), className)}
        style={resolvedStyle}
        {...rest}
      >
        {children}
      </Tabs>
    </TabsVariantContext.Provider>
  );
}

function ShadcnTabsList({
  ref,
  children,
  className,
  style,
  grow,
  justify,
  variant: mantineVariant,
  ...others
}: TabsListProps & { ref?: Ref<HTMLDivElement> }) {
  const variant = useContext(TabsVariantContext);
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(fromStyleProps, style);

  return (
    <TabsList
      ref={ref}
      variant={variant}
      className={cn(grow && 'w-full', justify === 'space-between' && 'justify-between', className)}
      style={resolvedStyle}
      {...rest}
    >
      {children}
    </TabsList>
  );
}

function ShadcnTabsTab({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  value,
  leftSection,
  rightSection,
  color,
  disabled,
  ...others
}: TabsTabProps & { ref?: Ref<HTMLButtonElement> }) {
  const slots = useMantineSlots(classNames, styles, { color });
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle({ ...fromStyleProps, ...colorVars(color) }, style);

  return (
    <TabsTrigger
      ref={ref}
      value={value}
      disabled={disabled}
      className={cn(slots.className('tab'), className)}
      style={resolvedStyle}
      {...rest}
    >
      {leftSection ? <span className='shrink-0'>{leftSection}</span> : null}
      {children}
      {rightSection ? <span className='shrink-0'>{rightSection}</span> : null}
    </TabsTrigger>
  );
}

function ShadcnTabsPanel({
  ref,
  children,
  className,
  style,
  value,
  keepMounted,
  ...others
}: TabsPanelProps & { ref?: Ref<HTMLDivElement> }) {
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(fromStyleProps, style);

  return (
    <TabsContent
      ref={ref}
      value={value}
      forceMount={keepMounted ? true : undefined}
      className={className}
      style={resolvedStyle}
      {...rest}
    >
      {children}
    </TabsContent>
  );
}

/**
 * A navigation row. Mantine's NavLink also reveals nested links in a collapsible section, so that is kept
 * for callers that pass children. The `label` slot is honoured because both call sites in the panel style
 * it (`styles={{ label: { fontSize: … } }}`).
 */
function ShadcnNavLink({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  label,
  description,
  leftSection,
  rightSection,
  active,
  variant = 'light',
  color,
  disabled,
  noWrap,
  childrenOffset = 'lg',
  defaultOpened,
  opened,
  onChange,
  onClick,
  disableRightSectionRotation,
  autoContrast,
  ...others
}: NavLinkProps & {
  ref?: Ref<HTMLAnchorElement>;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}) {
  const slots = useMantineSlots(classNames, styles, { variant, color, active });
  const { styleProps, rest } = splitStyleProps(others);
  const hasChildren = Boolean(children);
  const isOpen = opened ?? defaultOpened ?? false;

  return (
    <>
      <Box
        ref={ref}
        component='a'
        data-slot='nav-link'
        data-active={active || undefined}
        aria-disabled={disabled || undefined}
        aria-expanded={hasChildren ? isOpen : undefined}
        onClick={(event: ReactMouseEvent<HTMLAnchorElement>) => {
          if (hasChildren) {
            onChange?.(!isOpen);
          }
          onClick?.(event);
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none',
          'focus-visible:ring-[3px] focus-visible:ring-ring/50',
          disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer',
          !active && 'hover:bg-accent hover:text-accent-foreground',
          active &&
            (variant === 'filled'
              ? 'bg-primary text-primary-foreground'
              : variant === 'subtle'
                ? 'bg-accent/60 text-foreground'
                : 'bg-accent text-accent-foreground'),
          noWrap && 'flex-nowrap',
          slots.className('root'),
          className,
        )}
        style={[{ ...colorVars(color), ...slots.style('root') }, style ?? {}]}
        {...styleProps}
        {...rest}
      >
        {leftSection ? (
          <span className={cn('flex shrink-0 items-center', slots.className('section'))}>{leftSection}</span>
        ) : null}
        <span className={cn('min-w-0 flex-1', slots.className('body'))}>
          <span className={cn('block truncate font-medium', slots.className('label'))} style={slots.style('label')}>
            {label}
          </span>
          {description ? (
            <span
              className={cn('block truncate text-xs text-muted-foreground', slots.className('description'))}
              style={slots.style('description')}
            >
              {description}
            </span>
          ) : null}
        </span>
        {rightSection ? (
          <span className={cn('flex shrink-0 items-center', slots.className('section'))}>{rightSection}</span>
        ) : null}
        {hasChildren ? (
          <ChevronRightIcon
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform',
              isOpen && !disableRightSectionRotation && 'rotate-90',
            )}
          />
        ) : null}
      </Box>
      {hasChildren ? (
        <Collapse
          open={isOpen}
          className={slots.className('children')}
          style={{ paddingLeft: `var(--mantine-spacing-${childrenOffset}, ${childrenOffset})` }}
        >
          {children}
        </Collapse>
      ) : null}
    </>
  );
}

const SEGMENT_SIZES: Record<string, string> = {
  xs: 'h-7 text-xs',
  sm: 'h-8 text-sm',
  default: 'h-9 text-sm',
  lg: 'h-10 text-base',
  xl: 'h-11 text-base',
};

/**
 * Mantine's SegmentedControl with the look of shadcn's tab list. Radio inputs rather than buttons,
 * matching both Mantine's own markup and what assistive tech expects of a one-of-many choice.
 */
function ShadcnSegmentedControl({
  ref,
  className,
  style,
  styles,
  classNames,
  data,
  value,
  defaultValue,
  onChange,
  name,
  size,
  radius,
  color,
  fullWidth,
  orientation,
  disabled,
  readOnly,
  withItemsBorders,
  transitionDuration,
  transitionTimingFunction,
  autoContrast,
  ...others
}: SegmentedControlProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { size, color });
  const { token } = resolveSize(size);
  const { styleProps, rest } = splitStyleProps(others);
  const generatedName = useId();
  const groupName = name ?? generatedName;

  const items = (data ?? []).map((item) =>
    typeof item === 'string' ? { value: item, label: item, disabled: false } : item,
  );

  return (
    <Box
      ref={ref}
      role='radiogroup'
      data-slot='segmented-control'
      className={cn(
        'inline-flex w-fit items-center justify-center gap-0.5 rounded-lg bg-muted p-[3px] text-muted-foreground',
        SEGMENT_SIZES[token],
        orientation === 'vertical' && 'h-fit flex-col',
        fullWidth && 'w-full',
        disabled && 'pointer-events-none opacity-50',
        slots.className('root'),
        className,
      )}
      style={[{ ...colorVars(color), ...radiusStyle(radius), ...slots.style('root') }, style ?? {}]}
      {...styleProps}
      {...rest}
    >
      {items.map((item) => {
        const checked = (value ?? defaultValue) === item.value;

        return (
          <label
            key={item.value}
            className={cn(
              'relative inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 font-medium whitespace-nowrap transition-all',
              'has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
              checked
                ? 'bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30'
                : 'hover:text-foreground',
              (item.disabled || readOnly) && 'pointer-events-none opacity-50',
              slots.className('label'),
            )}
            style={slots.style('label')}
          >
            <input
              type='radio'
              name={groupName}
              value={item.value}
              checked={checked}
              disabled={item.disabled || disabled || readOnly}
              onChange={() => onChange?.(item.value)}
              className='sr-only'
            />
            {item.label}
          </label>
        );
      })}
    </Box>
  );
}

function ShadcnCollapse({
  ref,
  children,
  className,
  style,
  expanded,
  transitionDuration,
  transitionTimingFunction,
  animateOpacity,
  keepMounted,
  keepMountedMode,
  orientation,
  onTransitionEnd,
  onTransitionStart,
  ...others
}: CollapseProps & { ref?: Ref<HTMLDivElement> }) {
  const { style: fromStyleProps, rest } = useStyleProps(others);
  const resolvedStyle = useResolvedStyle(fromStyleProps, style);

  return (
    <Collapse
      ref={ref}
      open={expanded}
      duration={transitionDuration}
      easing={transitionTimingFunction}
      animateOpacity={animateOpacity}
      onTransitionEnd={onTransitionEnd}
      className={className}
      style={resolvedStyle}
      {...rest}
    >
      {children}
    </Collapse>
  );
}

export function registerNavigationReplacements(): void {
  TabsElement.replaceBaseComponent(ShadcnTabs);
  TabsElement.List.replaceBaseComponent(ShadcnTabsList);
  TabsElement.Tab.replaceBaseComponent(ShadcnTabsTab);
  TabsElement.Panel.replaceBaseComponent(ShadcnTabsPanel);

  NavLinkElement.replaceBaseComponent(ShadcnNavLink);
  SegmentedControlElement.replaceBaseComponent(ShadcnSegmentedControl);
  CollapseElement.replaceBaseComponent(ShadcnCollapse);
}
