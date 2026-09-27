import type { AutocompleteProps, ComboboxItem, MultiSelectProps, SelectProps } from '@mantine/core';
import { Box } from '@mantine/core';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import { type ComponentProps, type ReactNode, type Ref, useMemo, useState } from 'react';
import AutocompleteElement from '@/elements/input/Autocomplete.tsx';
import MultiSelectElement from '@/elements/input/MultiSelect.tsx';
import SelectElement from '@/elements/input/Select.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { cn } from '../lib/cn.ts';
import { resolveComboboxData } from '../lib/mantine/comboboxData.ts';
import {
  hasError,
  InputChrome,
  InputSection,
  inputSizeClasses,
  sectionPaddingClasses,
  useInputId,
} from '../lib/mantine/InputChrome.tsx';
import { radiusStyle, resolveSize, type ShadcnSize } from '../lib/mantine/scales.ts';
import { useMantineSlots } from '../lib/mantine/slots.ts';
import { splitStyleProps } from '../lib/mantine/splitProps.ts';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command.tsx';
import { Input } from '../ui/input.tsx';
import { Popover, PopoverAnchor, PopoverContent } from '../ui/popover.tsx';

/**
 * Mantine's combobox family on shadcn's Popover + Command.
 *
 * Three things make this worth doing carefully rather than quickly:
 *
 *   - `data` arrives in three shapes (`string[]`, `ComboboxItem[]`, groups of either) across 132 call
 *     sites. `lib/mantine/comboboxData.ts` hands that to Mantine's own parser rather than guessing.
 *   - `filter` and `searchValue` / `onSearchChange` are load-bearing: `elements/input/ServerSelect.tsx`
 *     and `ServerMultiSelect.tsx` pass `filter={({ options }) => options}` and drive `searchValue`
 *     themselves so the *server* does the filtering. cmdk therefore runs with `shouldFilter={false}` and
 *     the filtering happens here, through the caller's filter when there is one.
 *   - `renderOption` is used in six files, so options are not assumed to be plain text.
 *
 * `TagsInput` is not here: `elements/input/TagsInput.tsx` is already a bespoke component built out of
 * `TextInput`, `Button`, `ActionIcon`, `Card` and `Menu`, all of which are replaced, so it inherits the
 * new look without being touched.
 */

/** Mantine's `ref` for all three is an `HTMLInputElement`, and its own Select renders a hidden input for
 * form submission. Keeping that input is what lets the ref stay honest while the visible trigger is a
 * button, which is what the keyboard and screen-reader behaviour actually wants. */
function HiddenValueInput({
  ref,
  name,
  value,
  form,
  required,
  disabled,
}: {
  ref?: Ref<HTMLInputElement>;
  name?: string;
  value: string;
  form?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <input ref={ref} type='hidden' name={name} value={value} form={form} required={required} disabled={disabled} />
  );
}

const TRIGGER_TEXT_SIZES: Record<ShadcnSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  default: 'text-sm',
  lg: 'text-base',
  xl: 'text-base',
};

/** The field itself: shadcn's input surface, rendered as a button so it can open the list. */
function ComboboxTrigger({
  size,
  hasLeftSection,
  hasRightSection,
  invalid,
  disabled,
  opened,
  className,
  children,
  onTriggerToggle,
  ...rest
}: {
  size: ShadcnSize;
  hasLeftSection: boolean;
  hasRightSection: boolean;
  invalid: boolean;
  disabled?: boolean;
  opened: boolean;
  className?: string;
  children: ReactNode;
  onTriggerToggle: () => void;
} & Omit<ComponentProps<'button'>, 'children' | 'className'>) {
  return (
    <button
      type='button'
      role='combobox'
      aria-expanded={opened}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      onClick={onTriggerToggle}
      className={cn(
        'flex w-full min-w-0 items-center rounded-md border border-input bg-transparent text-left shadow-xs transition-[color,box-shadow] outline-none',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'dark:bg-input/30',
        inputSizeClasses[size],
        TRIGGER_TEXT_SIZES[size],
        hasLeftSection && sectionPaddingClasses[size].left,
        hasRightSection && sectionPaddingClasses[size].right,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** The dropdown body, shared by all three. */
function ComboboxList({
  groups,
  isEmpty,
  searchable,
  search,
  onSearchChange,
  nothingFound,
  maxDropdownHeight,
  renderOption,
  isChecked,
  onSelect,
  withCheckIcon,
  slotClassName,
}: {
  groups: ReturnType<typeof resolveComboboxData>['groups'];
  isEmpty: boolean;
  searchable: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  nothingFound: ReactNode;
  maxDropdownHeight: number | string | undefined;
  renderOption?: (input: { option: ComboboxItem; checked?: boolean }) => ReactNode;
  isChecked: (option: ComboboxItem) => boolean;
  onSelect: (option: ComboboxItem) => void;
  withCheckIcon: boolean;
  slotClassName: (slot: string) => string | undefined;
}) {
  return (
    <Command shouldFilter={false} className={slotClassName('dropdown')}>
      {searchable ? <CommandInput value={search} onValueChange={onSearchChange} placeholder='Search…' /> : null}
      <CommandList
        className={slotClassName('options')}
        style={maxDropdownHeight === undefined ? undefined : { maxHeight: maxDropdownHeight }}
      >
        {isEmpty ? <CommandEmpty>{nothingFound}</CommandEmpty> : null}
        {groups.map((group, index) => (
          <CommandGroup
            // Ungrouped options have no name; there is at most one such group and it always comes first.
            key={`group-${index}`}
            heading={group.group}
            className={slotClassName('group')}
          >
            {group.items.map((option) => {
              const checked = isChecked(option);

              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={() => onSelect(option)}
                  className={cn('justify-between', slotClassName('option'))}
                >
                  {renderOption ? (
                    renderOption({ option, checked })
                  ) : (
                    <span className='min-w-0 truncate'>{option.label}</span>
                  )}
                  {withCheckIcon && checked ? <CheckIcon className='size-4 shrink-0 opacity-100' /> : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}

function ShadcnSelect({
  ref,
  className,
  style,
  styles,
  classNames,
  label,
  description,
  error,
  placeholder,
  required,
  withAsterisk,
  size,
  radius,
  variant,
  leftSection,
  rightSection,
  leftSectionPointerEvents,
  rightSectionPointerEvents,
  leftSectionWidth,
  rightSectionWidth,
  leftSectionProps,
  rightSectionProps,
  wrapperProps,
  labelProps,
  descriptionProps,
  errorProps,
  inputWrapperOrder,
  withErrorStyles,
  pointer,
  inputSize,
  inputContainer,
  data,
  value,
  defaultValue,
  onChange,
  // The original wrapper pinned this to false, so picking the selected option again keeps it selected.
  allowDeselect = false,
  searchable,
  searchValue,
  defaultSearchValue,
  onSearchChange,
  nothingFoundMessage,
  clearable,
  clearButtonProps,
  hiddenInputProps,
  renderOption,
  filter,
  limit,
  maxDropdownHeight,
  withCheckIcon = true,
  checkIconPosition,
  withScrollArea,
  comboboxProps,
  selectFirstOptionOnChange,
  onOptionSubmit,
  dropdownOpened,
  defaultDropdownOpened,
  onDropdownOpen,
  onDropdownClose,
  disabled,
  readOnly,
  name,
  form,
  id,
  ...others
}: SelectProps & { ref?: Ref<HTMLInputElement> }) {
  const { t } = useTranslations();
  const slots = useMantineSlots(classNames, styles, { size, variant });
  const { token } = resolveSize(size);
  const inputId = useInputId(id);
  const invalid = hasError(error);
  const { styleProps, rest } = splitStyleProps(others);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultDropdownOpened ?? false);
  const opened = dropdownOpened ?? uncontrolledOpen;
  const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearchValue ?? '');
  const search = searchValue ?? uncontrolledSearch;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue ?? null);
  const selectedValue = value !== undefined ? value : uncontrolledValue;

  const resolved = useMemo(
    () => resolveComboboxData({ data, search, filter, limit, searchable: Boolean(searchable) }),
    [data, search, filter, limit, searchable],
  );

  const setOpened = (next: boolean) => {
    if (dropdownOpened === undefined) {
      setUncontrolledOpen(next);
    }
    if (next) {
      onDropdownOpen?.();
    } else {
      onDropdownClose?.();
      // Mantine clears the search when the dropdown closes, so the field shows the label again.
      if (searchValue === undefined) {
        setUncontrolledSearch('');
      }
    }
  };

  const handleSearch = (next: string) => {
    if (searchValue === undefined) {
      setUncontrolledSearch(next);
    }
    onSearchChange?.(next);
  };

  const commit = (next: string | null, option: ComboboxItem) => {
    if (value === undefined) {
      setUncontrolledValue(next);
    }
    onChange?.(next, option);
    onOptionSubmit?.(option.value);
    setOpened(false);
  };

  const selectedOption = selectedValue === null ? undefined : resolved.lockup[selectedValue];
  const displayLabel = selectedOption?.label ?? (selectedValue || undefined);
  const resolvedPlaceholder = placeholder ?? (typeof label === 'string' ? label : undefined);
  const showClear = Boolean(clearable) && selectedValue !== null && selectedValue !== '' && !disabled && !readOnly;

  return (
    <Box
      className={cn('flex w-full flex-col gap-1.5', slots.className('root'), className)}
      style={[slots.style('root') ?? {}, style ?? {}]}
      data-slot='select-field'
      {...styleProps}
      {...wrapperProps}
    >
      <InputChrome
        id={inputId}
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={withAsterisk}
        slots={slots}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        errorProps={errorProps}
      >
        <Popover open={opened} onOpenChange={(next) => !readOnly && setOpened(next)}>
          <PopoverAnchor asChild>
            <div className={cn('relative', slots.className('wrapper'))} style={slots.style('wrapper')}>
              {leftSection ? (
                <InputSection side='left' size={token} pointerEvents={leftSectionPointerEvents} {...leftSectionProps}>
                  {leftSection}
                </InputSection>
              ) : null}
              <ComboboxTrigger
                id={inputId}
                size={token}
                opened={opened}
                invalid={invalid && withErrorStyles !== false}
                disabled={disabled}
                hasLeftSection={Boolean(leftSection)}
                hasRightSection
                onTriggerToggle={() => !readOnly && setOpened(!opened)}
                className={slots.className('input')}
                style={{ ...radiusStyle(radius), ...slots.style('input') }}
                {...(rest as ComponentProps<'button'>)}
              >
                <span className={cn('min-w-0 flex-1 truncate', displayLabel ? undefined : 'text-muted-foreground')}>
                  {displayLabel ?? resolvedPlaceholder}
                </span>
              </ComboboxTrigger>
              <InputSection side='right' size={token} pointerEvents='auto' {...rightSectionProps}>
                {rightSection ?? (
                  <>
                    {showClear ? (
                      <button
                        type='button'
                        tabIndex={-1}
                        aria-label='Clear'
                        onClick={() => commit(null, { value: '', label: '' })}
                        className='mr-1 inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground'
                        {...(clearButtonProps as ComponentProps<'button'>)}
                      >
                        <XIcon className='size-3.5' />
                      </button>
                    ) : null}
                    <ChevronDownIcon className='size-4 shrink-0 opacity-50' />
                  </>
                )}
              </InputSection>
              <HiddenValueInput
                ref={ref}
                name={name}
                value={selectedValue ?? ''}
                form={form}
                required={required}
                disabled={disabled}
                {...hiddenInputProps}
              />
            </div>
          </PopoverAnchor>
          <PopoverContent
            align='start'
            className='w-(--radix-popover-trigger-width) p-0'
            onOpenAutoFocus={(event) => {
              // A non-searchable list has nothing to type into; keep focus on the trigger so Escape and
              // Tab behave, and let the arrow keys bubble into cmdk from there.
              if (!searchable) {
                event.preventDefault();
              }
            }}
          >
            <ComboboxList
              groups={resolved.groups}
              isEmpty={resolved.isEmpty}
              searchable={Boolean(searchable)}
              search={search}
              onSearchChange={handleSearch}
              nothingFound={nothingFoundMessage ?? t('elements.selectInput.noResults', {})}
              maxDropdownHeight={maxDropdownHeight}
              renderOption={renderOption}
              isChecked={(option) => option.value === selectedValue}
              onSelect={(option) => {
                if (option.value === selectedValue && allowDeselect) {
                  commit(null, option);
                } else {
                  commit(option.value, option);
                }
              }}
              withCheckIcon={withCheckIcon}
              slotClassName={slots.className}
            />
          </PopoverContent>
        </Popover>
      </InputChrome>
    </Box>
  );
}

function ShadcnMultiSelect({
  ref,
  className,
  style,
  styles,
  classNames,
  label,
  description,
  error,
  placeholder,
  required,
  withAsterisk,
  size,
  radius,
  variant,
  leftSection,
  rightSection,
  leftSectionPointerEvents,
  rightSectionPointerEvents,
  leftSectionWidth,
  rightSectionWidth,
  leftSectionProps,
  rightSectionProps,
  wrapperProps,
  labelProps,
  descriptionProps,
  errorProps,
  inputWrapperOrder,
  withErrorStyles,
  pointer,
  inputSize,
  inputContainer,
  data,
  value,
  defaultValue,
  onChange,
  searchable,
  searchValue,
  defaultSearchValue,
  onSearchChange,
  nothingFoundMessage,
  clearable,
  clearButtonProps,
  hiddenInputProps,
  hiddenInputValuesDivider,
  renderOption,
  filter,
  limit,
  maxDropdownHeight,
  withCheckIcon = true,
  checkIconPosition,
  withScrollArea,
  comboboxProps,
  maxValues,
  hidePickedOptions,
  onOptionSubmit,
  onRemove,
  onClear,
  dropdownOpened,
  defaultDropdownOpened,
  onDropdownOpen,
  onDropdownClose,
  disabled,
  readOnly,
  name,
  form,
  id,
  ...others
}: MultiSelectProps & { ref?: Ref<HTMLInputElement> }) {
  const { t } = useTranslations();
  const slots = useMantineSlots(classNames, styles, { size, variant });
  const { token } = resolveSize(size);
  const inputId = useInputId(id);
  const invalid = hasError(error);
  const { styleProps, rest } = splitStyleProps(others);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultDropdownOpened ?? false);
  const opened = dropdownOpened ?? uncontrolledOpen;
  const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearchValue ?? '');
  const search = searchValue ?? uncontrolledSearch;
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue ?? []);
  const selected = value ?? uncontrolledValue;

  const resolved = useMemo(
    () => resolveComboboxData({ data, search, filter, limit, searchable: Boolean(searchable) }),
    [data, search, filter, limit, searchable],
  );

  const setOpened = (next: boolean) => {
    if (dropdownOpened === undefined) {
      setUncontrolledOpen(next);
    }
    if (next) {
      onDropdownOpen?.();
    } else {
      onDropdownClose?.();
      if (searchValue === undefined) {
        setUncontrolledSearch('');
      }
    }
  };

  const handleSearch = (next: string) => {
    if (searchValue === undefined) {
      setUncontrolledSearch(next);
    }
    onSearchChange?.(next);
  };

  const commit = (next: string[]) => {
    if (value === undefined) {
      setUncontrolledValue(next);
    }
    onChange?.(next);
  };

  const toggle = (option: ComboboxItem) => {
    if (selected.includes(option.value)) {
      commit(selected.filter((entry) => entry !== option.value));
      onRemove?.(option.value);
      return;
    }
    if (maxValues !== undefined && selected.length >= maxValues) {
      return;
    }
    commit([...selected, option.value]);
    onOptionSubmit?.(option.value);
  };

  const resolvedPlaceholder = placeholder ?? (typeof label === 'string' ? label : undefined);
  const showClear = Boolean(clearable) && selected.length > 0 && !disabled && !readOnly;

  const groups = hidePickedOptions
    ? resolved.groups
        .map((group) => ({ ...group, items: group.items.filter((item) => !selected.includes(item.value)) }))
        .filter((group) => group.items.length > 0)
    : resolved.groups;

  return (
    <Box
      className={cn('flex w-full flex-col gap-1.5', slots.className('root'), className)}
      style={[slots.style('root') ?? {}, style ?? {}]}
      data-slot='multi-select-field'
      {...styleProps}
      {...wrapperProps}
    >
      <InputChrome
        id={inputId}
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={withAsterisk}
        slots={slots}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        errorProps={errorProps}
      >
        <Popover open={opened} onOpenChange={(next) => !readOnly && setOpened(next)}>
          <PopoverAnchor asChild>
            <div className={cn('relative', slots.className('wrapper'))} style={slots.style('wrapper')}>
              {leftSection ? (
                <InputSection side='left' size={token} pointerEvents={leftSectionPointerEvents} {...leftSectionProps}>
                  {leftSection}
                </InputSection>
              ) : null}
              <ComboboxTrigger
                id={inputId}
                size={token}
                opened={opened}
                invalid={invalid && withErrorStyles !== false}
                disabled={disabled}
                hasLeftSection={Boolean(leftSection)}
                hasRightSection
                onTriggerToggle={() => !readOnly && setOpened(!opened)}
                // Pills need room to wrap, so the fixed control height becomes a minimum.
                className={cn('h-auto min-h-9 flex-wrap gap-1 py-1', slots.className('input'))}
                style={{ ...radiusStyle(radius), ...slots.style('input') }}
                {...(rest as ComponentProps<'button'>)}
              >
                {selected.length === 0 ? (
                  <span className='truncate text-muted-foreground'>{resolvedPlaceholder}</span>
                ) : (
                  selected.map((entry) => (
                    <span
                      key={entry}
                      data-slot='pill'
                      className={cn(
                        'inline-flex max-w-full items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground',
                        slots.className('pill'),
                      )}
                    >
                      <span className='truncate'>{resolved.lockup[entry]?.label ?? entry}</span>
                      {readOnly || disabled ? null : (
                        <span
                          role='button'
                          tabIndex={-1}
                          aria-label='Remove'
                          onPointerDown={(event) => {
                            // Stops the trigger from toggling the dropdown as well.
                            event.stopPropagation();
                            event.preventDefault();
                            commit(selected.filter((current) => current !== entry));
                            onRemove?.(entry);
                          }}
                          className='cursor-pointer opacity-60 transition-opacity hover:opacity-100'
                        >
                          <XIcon className='size-3' />
                        </span>
                      )}
                    </span>
                  ))
                )}
              </ComboboxTrigger>
              <InputSection side='right' size={token} pointerEvents='auto' {...rightSectionProps}>
                {rightSection ?? (
                  <>
                    {showClear ? (
                      <button
                        type='button'
                        tabIndex={-1}
                        aria-label='Clear'
                        onClick={() => {
                          commit([]);
                          onClear?.();
                        }}
                        className='mr-1 inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground'
                        {...(clearButtonProps as ComponentProps<'button'>)}
                      >
                        <XIcon className='size-3.5' />
                      </button>
                    ) : null}
                    <ChevronDownIcon className='size-4 shrink-0 opacity-50' />
                  </>
                )}
              </InputSection>
              <HiddenValueInput
                ref={ref}
                name={name}
                value={selected.join(hiddenInputValuesDivider ?? ',')}
                form={form}
                required={required}
                disabled={disabled}
                {...hiddenInputProps}
              />
            </div>
          </PopoverAnchor>
          <PopoverContent
            align='start'
            className='w-(--radix-popover-trigger-width) p-0'
            onOpenAutoFocus={(event) => {
              if (!searchable) {
                event.preventDefault();
              }
            }}
          >
            <ComboboxList
              groups={groups}
              isEmpty={groups.length === 0}
              searchable={Boolean(searchable)}
              search={search}
              onSearchChange={handleSearch}
              nothingFound={nothingFoundMessage ?? t('elements.selectInput.noResults', {})}
              maxDropdownHeight={maxDropdownHeight}
              renderOption={renderOption}
              isChecked={(option) => selected.includes(option.value)}
              onSelect={toggle}
              withCheckIcon={withCheckIcon}
              slotClassName={slots.className}
            />
          </PopoverContent>
        </Popover>
      </InputChrome>
    </Box>
  );
}

/**
 * Autocomplete is text-first: the field *is* the value, and the list only suggests. So the trigger here
 * is a real `Input` rather than a button, the ref goes straight to it, and the dropdown opens on typing.
 */
function ShadcnAutocomplete({
  ref,
  className,
  style,
  styles,
  classNames,
  label,
  description,
  error,
  placeholder,
  required,
  withAsterisk,
  size,
  radius,
  variant,
  leftSection,
  rightSection,
  leftSectionPointerEvents,
  rightSectionPointerEvents,
  leftSectionWidth,
  rightSectionWidth,
  leftSectionProps,
  rightSectionProps,
  wrapperProps,
  labelProps,
  descriptionProps,
  errorProps,
  inputWrapperOrder,
  withErrorStyles,

  inputSize,
  inputContainer,
  data,
  value,
  defaultValue,
  onChange,
  renderOption,
  filter,
  limit,
  maxDropdownHeight,
  withScrollArea,
  comboboxProps,
  onOptionSubmit,
  dropdownOpened,
  defaultDropdownOpened,
  onDropdownOpen,
  onDropdownClose,
  clearable,
  clearButtonProps,
  selectFirstOptionOnChange,
  disabled,
  readOnly,
  id,
  ...others
}: AutocompleteProps & { ref?: Ref<HTMLInputElement> }) {
  const slots = useMantineSlots(classNames, styles, { size, variant });
  const { token } = resolveSize(size);
  const inputId = useInputId(id);
  const invalid = hasError(error);
  const { styleProps, rest } = splitStyleProps(others);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultDropdownOpened ?? false);
  const opened = dropdownOpened ?? uncontrolledOpen;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  // The original wrapper coerced a null value to an empty string.
  const text = value ?? uncontrolledValue ?? '';

  const resolved = useMemo(
    () => resolveComboboxData({ data, search: text, filter, limit, searchable: true }),
    [data, text, filter, limit],
  );

  const setOpened = (next: boolean) => {
    if (dropdownOpened === undefined) {
      setUncontrolledOpen(next);
    }
    if (next) {
      onDropdownOpen?.();
    } else {
      onDropdownClose?.();
    }
  };

  const commit = (next: string) => {
    if (value === undefined) {
      setUncontrolledValue(next);
    }
    onChange?.(next);
  };

  const resolvedPlaceholder = placeholder ?? (typeof label === 'string' ? label : undefined);

  return (
    <Box
      className={cn('flex w-full flex-col gap-1.5', slots.className('root'), className)}
      style={[slots.style('root') ?? {}, style ?? {}]}
      data-slot='autocomplete-field'
      {...styleProps}
      {...wrapperProps}
    >
      <InputChrome
        id={inputId}
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={withAsterisk}
        slots={slots}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        errorProps={errorProps}
      >
        <Popover open={opened && !resolved.isEmpty} onOpenChange={setOpened}>
          <PopoverAnchor asChild>
            <div className={cn('relative', slots.className('wrapper'))} style={slots.style('wrapper')}>
              {leftSection ? (
                <InputSection side='left' size={token} pointerEvents={leftSectionPointerEvents} {...leftSectionProps}>
                  {leftSection}
                </InputSection>
              ) : null}
              <Input
                ref={ref}
                id={inputId}
                value={text}
                placeholder={resolvedPlaceholder}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                autoComplete='off'
                aria-invalid={(invalid && withErrorStyles !== false) || undefined}
                onChange={(event) => {
                  commit(event.currentTarget.value);
                  setOpened(true);
                }}
                onFocus={() => setOpened(true)}
                className={cn(
                  inputSizeClasses[token],
                  leftSection && sectionPaddingClasses[token].left,
                  rightSection && sectionPaddingClasses[token].right,
                  slots.className('input'),
                )}
                style={{ ...radiusStyle(radius), ...slots.style('input') }}
                {...rest}
              />
              {rightSection ? (
                <InputSection
                  side='right'
                  size={token}
                  pointerEvents={rightSectionPointerEvents ?? 'auto'}
                  {...rightSectionProps}
                >
                  {rightSection}
                </InputSection>
              ) : null}
            </div>
          </PopoverAnchor>
          <PopoverContent
            align='start'
            className='w-(--radix-popover-trigger-width) p-0'
            // Focus has to stay in the field: this is a text input with suggestions, not a picker.
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <ComboboxList
              groups={resolved.groups}
              isEmpty={resolved.isEmpty}
              searchable={false}
              search={text}
              onSearchChange={commit}
              nothingFound={null}
              maxDropdownHeight={maxDropdownHeight}
              renderOption={renderOption}
              isChecked={(option) => option.value === text}
              onSelect={(option) => {
                commit(option.value);
                onOptionSubmit?.(option.value);
                setOpened(false);
              }}
              withCheckIcon={false}
              slotClassName={slots.className}
            />
          </PopoverContent>
        </Popover>
      </InputChrome>
    </Box>
  );
}

export function registerComboboxReplacements(): void {
  SelectElement.replaceBaseComponent(ShadcnSelect);
  MultiSelectElement.replaceBaseComponent(ShadcnMultiSelect);
  AutocompleteElement.replaceBaseComponent(ShadcnAutocomplete);
}
