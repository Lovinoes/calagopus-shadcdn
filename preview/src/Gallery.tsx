import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@ext/ui/alert.tsx';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from '@ext/ui/avatar.tsx';
import { Badge } from '@ext/ui/badge.tsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@ext/ui/breadcrumb.tsx';
import { Button } from '@ext/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@ext/ui/card.tsx';
import { Checkbox } from '@ext/ui/checkbox.tsx';
import { Collapse } from '@ext/ui/collapse.tsx';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@ext/ui/command.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ext/ui/dialog.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ext/ui/dropdown-menu.tsx';
import { Input } from '@ext/ui/input.tsx';
import { Kbd, KbdKey } from '@ext/ui/kbd.tsx';
import { Label } from '@ext/ui/label.tsx';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@ext/ui/popover.tsx';
import { Progress } from '@ext/ui/progress.tsx';
import { Spinner } from '@ext/ui/spinner.tsx';
import { Switch } from '@ext/ui/switch.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ext/ui/tabs.tsx';
import { Textarea } from '@ext/ui/textarea.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ext/ui/tooltip.tsx';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='flex flex-col gap-3'>
      <h2 className='text-xs font-medium tracking-wider text-muted-foreground uppercase'>{title}</h2>
      <div className='flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4'>{children}</div>
    </section>
  );
}

export function Gallery() {
  const [checked, setChecked] = useState(true);
  const [indeterminate, setIndeterminate] = useState(true);
  const [switched, setSwitched] = useState(true);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [egg, setEgg] = useState<string | null>('paper');
  const [search, setSearch] = useState('');

  const eggs = [
    { group: 'Minecraft', items: [{ value: 'paper', label: 'Paper' }, { value: 'vanilla', label: 'Vanilla' }] },
    { group: 'Source', items: [{ value: 'csgo', label: 'CS:GO' }, { value: 'gmod', label: 'Garry’s Mod' }] },
  ];
  const eggGroups = eggs
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())),
    }))
    .filter((group) => group.items.length > 0);
  const eggLabel = eggs.flatMap((group) => group.items).find((item) => item.value === egg)?.label;

  return (
    <div className='mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10'>
      <Section title='Buttons'>
        <Button>Default</Button>
        <Button variant='secondary'>Secondary</Button>
        <Button variant='outline'>Outline</Button>
        <Button variant='ghost'>Ghost</Button>
        <Button variant='link'>Link</Button>
        <Button variant='destructive'>
          <TrashIcon /> Destructive
        </Button>
        <Button disabled>Disabled</Button>
        <Button size='xs'>xs</Button>
        <Button size='sm'>sm</Button>
        <Button size='lg'>lg</Button>
        <Button size='xl'>xl</Button>
        <Button size='icon' variant='outline'>
          <SettingsIcon />
        </Button>
        <Button>
          <Spinner /> Loading
        </Button>
      </Section>

      <Section title='Inputs'>
        <div className='flex w-full max-w-sm flex-col gap-1.5'>
          <Label htmlFor='p-name'>
            Server name
            <span className='text-destructive'>*</span>
          </Label>
          <Input id='p-name' placeholder='Server name' defaultValue='survival-01' />
          <p className='text-xs text-muted-foreground'>Shown in the sidebar and the server list.</p>
        </div>
        <div className='flex w-full max-w-sm flex-col gap-1.5'>
          <Label htmlFor='p-invalid'>Port</Label>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center text-muted-foreground'>
              <SearchIcon className='size-4' />
            </div>
            <Input id='p-invalid' className='pl-9' aria-invalid defaultValue='not-a-port' />
          </div>
          <p className='text-xs text-destructive'>Must be a number between 1 and 65535.</p>
        </div>
        <div className='flex w-full max-w-sm flex-col gap-1.5'>
          <Label htmlFor='p-notes'>Startup command</Label>
          <Textarea id='p-notes' rows={3} defaultValue='java -Xms128M -Xmx2048M -jar server.jar nogui' />
        </div>
      </Section>

      <Section title='Toggles'>
        <label className='flex items-center gap-2 text-sm'>
          <Checkbox checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} />
          Checked
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <Checkbox indeterminate={indeterminate} onChange={() => setIndeterminate(false)} />
          Indeterminate
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <Checkbox disabled />
          Disabled
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <Checkbox size='xs' /> xs
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <Checkbox size='lg' /> lg
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <Switch checked={switched} onChange={(event) => setSwitched(event.currentTarget.checked)} />
          Switch
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <Switch size='sm' /> sm
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <Switch size='lg' /> lg
        </label>
      </Section>

      <Section title='Badges'>
        <Badge>Running</Badge>
        <Badge variant='secondary'>Queued</Badge>
        <Badge variant='destructive'>Offline</Badge>
        <Badge variant='outline'>Suspended</Badge>
        <Badge size='xs'>xs</Badge>
        <Badge size='lg'>
          <CheckIcon /> lg
        </Badge>
      </Section>

      <Section title='Feedback'>
        <Alert className='max-w-md'>
          <TriangleAlertIcon />
          <AlertTitle>Node is unreachable</AlertTitle>
          <AlertDescription>Wings has not checked in for 4 minutes.</AlertDescription>
        </Alert>
        <Alert variant='tinted' className='max-w-md'>
          <TriangleAlertIcon />
          <AlertTitle>Tinted</AlertTitle>
          <AlertDescription>Mantine colours a whole alert; this variant carries that through.</AlertDescription>
        </Alert>
        <Alert variant='destructive' className='max-w-md'>
          <TriangleAlertIcon />
          <AlertTitle>Backup failed</AlertTitle>
          <AlertDescription>The storage target rejected the upload.</AlertDescription>
        </Alert>
        <div className='flex w-full max-w-sm flex-col gap-3'>
          <Progress value={38} />
          <Progress value={82} className='h-5 rounded-full bg-muted' />
          <Progress indeterminate className='h-2' />
        </div>
        <Spinner className='size-6' />
      </Section>

      <Section title='Card'>
        <Card className='w-full max-w-sm'>
          <CardHeader>
            <CardTitle>survival-01</CardTitle>
            <CardDescription>Paper 1.21.4 · eu-west-1</CardDescription>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            2.1 GiB of 4 GiB memory in use, 18% CPU across 4 cores.
          </CardContent>
          <CardFooter className='gap-2'>
            <Button size='sm'>Console</Button>
            <Button size='sm' variant='outline'>
              Settings
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title='Overlays'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='outline'>Hover for a tooltip</Button>
            </TooltipTrigger>
            <TooltipContent>Restarts the server gracefully</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>Open a menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start'>
            <DropdownMenuLabel>Server</DropdownMenuLabel>
            <DropdownMenuItem>
              <PlusIcon /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive'>
              <TrashIcon /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline'>Open a popover</Button>
          </PopoverTrigger>
          <PopoverContent className='w-72'>
            <p className='text-sm font-medium'>Allocation</p>
            <p className='text-sm text-muted-foreground'>10.0.4.12:25565 is the primary allocation.</p>
          </PopoverContent>
        </Popover>

        <Button variant='outline' onClick={() => setDialogOpen(true)}>
          Open a dialog
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete server</DialogTitle>
              <DialogDescription>
                This removes the server and every backup attached to it. It cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant='destructive' onClick={() => setDialogOpen(false)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title='Tabs'>
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='console'>Console</TabsTrigger>
            <TabsTrigger value='files'>Files</TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='text-sm text-muted-foreground'>
            The segmented list variant.
          </TabsContent>
          <TabsContent value='console' className='text-sm text-muted-foreground'>
            Console panel.
          </TabsContent>
          <TabsContent value='files' className='text-sm text-muted-foreground'>
            Files panel.
          </TabsContent>
        </Tabs>
        <Tabs defaultValue='a' className='w-full'>
          <TabsList variant='line'>
            <TabsTrigger value='a'>Underlined</TabsTrigger>
            <TabsTrigger value='b'>Second</TabsTrigger>
          </TabsList>
          <TabsContent value='a' className='text-sm text-muted-foreground'>
            The `line` list variant, which Mantine calls `outline`.
          </TabsContent>
          <TabsContent value='b' />
        </Tabs>
      </Section>

      <Section title='Avatars, breadcrumbs, keys'>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback className='bg-primary/15 font-medium text-primary'>TS</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src='https://avatars.githubusercontent.com/u/9919?s=64' alt='' />
            <AvatarFallback>GH</AvatarFallback>
          </Avatar>
          <Avatar size='sm'>
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <Avatar size='lg'>
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
        </AvatarGroup>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              Servers
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              survival-01
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span className='text-foreground'>Files</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <span className='flex items-center gap-1 text-sm text-muted-foreground'>
          Press <Kbd>Ctrl</Kbd>
          <Kbd>Space</Kbd> for actions
        </span>
        <KbdKey>Esc</KbdKey>
      </Section>

      <Section title='Combobox — what Select renders'>
        <div className='flex w-full max-w-sm flex-col gap-1.5'>
          <Label>Egg</Label>
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverAnchor asChild>
              <div className='relative'>
                <button
                  type='button'
                  role='combobox'
                  aria-expanded={comboOpen}
                  onClick={() => setComboOpen((value) => !value)}
                  className='flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent px-3 pr-9 text-left text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30'
                >
                  <span className={eggLabel ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1 truncate text-muted-foreground'}>
                    {eggLabel ?? 'Pick an egg'}
                  </span>
                </button>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center'>
                  <ChevronDownIcon className='size-4 opacity-50' />
                </div>
              </div>
            </PopoverAnchor>
            <PopoverContent align='start' className='w-(--radix-popover-trigger-width) p-0'>
              <Command shouldFilter={false}>
                <CommandInput value={search} onValueChange={setSearch} placeholder='Search…' />
                <CommandList>
                  {eggGroups.length === 0 ? <CommandEmpty>No results</CommandEmpty> : null}
                  {eggGroups.map((group) => (
                    <CommandGroup key={group.group} heading={group.group}>
                      {group.items.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.value}
                          className='justify-between'
                          onSelect={() => {
                            setEgg(item.value);
                            setComboOpen(false);
                          }}
                        >
                          <span className='min-w-0 truncate'>{item.label}</span>
                          {egg === item.value ? <CheckIcon className='size-4 shrink-0' /> : null}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className='text-xs text-muted-foreground'>
            Radix Popover anchored to the field, with cmdk doing grouping and keyboard navigation.
          </p>
        </div>
      </Section>

      <Section title='Collapse'>
        <div className='w-full'>
          <Button variant='outline' size='sm' onClick={() => setOpen((value) => !value)}>
            {open ? 'Hide' : 'Show'} details
          </Button>
          <Collapse open={open} className='mt-2'>
            <div className='rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground'>
              A grid-rows transition rather than a keyframed height, so it works at any content size.
            </div>
          </Collapse>
        </div>
      </Section>
    </div>
  );
}
