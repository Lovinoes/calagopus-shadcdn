# Calagopus shadcn/ui theme

A theme extension that puts **real shadcn/ui components** into the Calagopus panel — Radix primitives,
Tailwind classes, CVA variants — rather than restyling Mantine to look like them.

The panel runs on Mantine 9. Everything a page renders goes through `frontend/src/elements/**`, and 105
of those wrappers are *hookable*: `replaceBaseComponent()` swaps the implementation for every import site
at once. This extension swaps 51 of them, keeps the rest on Mantine with a full token bridge underneath,
and never forks the panel.

[calagopus/panel#140](https://github.com/calagopus/panel/pull/140), the existing draft, is the other
approach: a Mantine theme plus a 766-line stylesheet that makes Mantine *look* like shadcn, living inside
the panel tree and toggled by a `localStorage` flag. Its palette and scale work is good and is reused
here; the components are not.

```
backend-extensions/dev_lovinoes_shadcn/   the extension (this is what ships)
  Cargo.toml  Metadata.toml  src/lib.rs   the backend half the format requires; a no-op
  frontend/src/
    index.tsx            Extension subclass — the three theming entry points
    app.css              shadcn tokens, the Mantine bridge, and the CSS for what stays Mantine
    register.ts          every replaceBaseComponent() call, in one place
    theme/               Mantine palette, theme override, CSS variables resolver
    ui/                  shadcn/ui components, pure — no Mantine, used by the preview too
    replacements/        Mantine-props-compatible wrappers over ui/
    lib/mantine/         the adapters that translate between the two prop vocabularies
preview/                 a standalone Vite app for looking at ui/ without a running panel
scripts/                 sync into a panel checkout; run the panel's own checks
docs/COMPONENTS.md       what is replaced, what is restyled, and every deliberate departure
```

## Installing it

The extension is meant to live at `backend-extensions/dev_lovinoes_shadcn/` in a panel checkout. From
the panel repository root, with this repo cloned next to it:

```bash
cp -r ../calagopus-shadcdn/backend-extensions/dev_lovinoes_shadcn backend-extensions/
cd frontend && pnpm install && pnpm build:ci
```

Then export it the usual way — see
[Getting your Extension ready](https://calagopus.com/docs/panel/extensions/getting-your-extension-ready):

```bash
panel-rs extensions export dev.lovinoes.shadcn
```

Rename the package by replacing `dev_lovinoes_shadcn` / `dev.lovinoes.shadcn` throughout
(`Cargo.toml`, `Metadata.toml`, `src/lib.rs`, the directory name, and the paths in `scripts/`).

## How it works

Four layers, broadest first, which is the order the theming docs recommend:

1. **`initializeMantineTheme()`** (`theme/mantineTheme.ts`) — Tailwind's palette as Mantine colour
   tuples, blue as the primary, shadcn's radius ladder, Tailwind's shadow scale, `focusRing: 'never'`
   because shadcn draws focus with a ring utility instead. Type and spacing stay at Mantine's defaults,
   which is what the panel's ~900 page files were laid out against.
2. **`initializeMantineCssResolver()`** (`theme/cssVariablesResolver.ts`) — the chart colours, derived
   from the resolved palette so they follow a later extension that changes `primaryColor`. Only the
   *first* extension returning a non-null resolver is used, so `app.css` carries the same values as a
   fallback.
3. **`app.css`** — shadcn's tokens scoped to the panel's `data-mantine-color-scheme` attribute, then
   `--mantine-color-*` pointed at them, so every part of the panel this extension does *not* replace
   still matches. Then the CSS for the components that stay on Mantine.
4. **`replaceBaseComponent()`** (`register.ts`) — the components themselves, registered from
   `initialize()`, which runs before React renders anything.

### Two things worth knowing

**Tailwind runs twice.** The extension's `app.css` pulls in `tailwindcss/utilities.css` with
`source(".")`, so the classes used in `src/ui` compile into the extension's own CSS chunk — the one the
build already splits out so it can be switched off with the extension. They are emitted **unlayered**,
on purpose: Mantine's stylesheet is unlayered, and for normal declarations unlayered CSS beats anything
in a cascade layer regardless of specificity, so Mantine's global
`input, button, textarea, select { font: inherit }` would otherwise win over `text-sm` on every button.
The panel's own code works around the same collision with `!` utilities.

**Mantine still does the plumbing.** The replacements render through Mantine's `Box`, which parses all 54
style props (`mt`, `px`, `w`, `c`, responsive objects, theme spacing keys) so they keep working, and they
use Mantine's own `extractStyleProps` / `parseStyleProps` / `getStyleObject` so the split stays correct
if Mantine changes. `@mantine/form` is untouched — it is form state, not UI, and 95 files use it.

## Working on it

```bash
pnpm install                          # once, at the repo root
pnpm preview                          # the component gallery, light and dark, no panel needed

$env:CALAGOPUS_PANEL = "<path to a panel checkout>"
pwsh scripts/verify.ps1               # biome + tsc + a full production build of the panel
pwsh scripts/verify.ps1 -SkipBuild    # faster, while iterating
```

`verify.ps1` mirrors the extension into the panel checkout, formats and lints it with the panel's own
Biome config, copies the result back, then type-checks and builds the whole frontend with the extension
compiled in. That last step is the real gate: it proves every prop contract type-checks, every import
resolves, `package.json` is complete and the CSS compiles.

The sync is a copy rather than a symlink because pnpm resolves a junction for workspace discovery but
then installs none of that project's dependencies, so `radix-ui` and friends never land in
`node_modules`. Only one of `frontend/extensions/<id>` and `backend-extensions/<id>/frontend` may be a
real directory at a time, or pnpm sees two workspace projects with the same name and installs neither.

### Dependencies

`radix-ui`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge` and `tw-animate-css` are
declared in the extension's `frontend/package.json`. `@mantine/core`, React, FontAwesome and the rest
come from the panel — the docs are explicit that an extension inherits the base panel's dependencies.

### Swapping the font

`theme/mantineTheme.ts` ships the stock Tailwind system stack, which is what an unconfigured shadcn
project renders in and costs no download. For Geist or Inter, add the webfont to the extension's
`public/`, `@font-face` it in `app.css`, and put the family at the front of `FONT_FAMILY`.

## Status

Verified: `biome check` clean, `tsc` clean, and a full production build of the panel frontend with the
extension compiled in. The component gallery renders in both colour schemes.

Not verified: **the panel has never been run against this.** There is no Rust toolchain, Postgres or
Redis on the machine this was built on, so the backend half of the extension is authored but never
compiled, and no page has been clicked through. Install it on a real panel before trusting it.

The combobox family — `Select`, `MultiSelect`, `Autocomplete`, `TagsInput` — was in the agreed scope and
is **not** replaced; it is restyled instead. The reasoning is in
[docs/COMPONENTS.md](docs/COMPONENTS.md#restyled-still-rendered-by-mantine). It is the one place the
delivered scope is narrower than planned, and it is the obvious next piece of work.

## Elsewhere

`defineOverride` in `frontend/extensions/shared/src/overrides.ts`, wired up by the panel's
`vite-plugins/extension-overrides.ts`, swaps whole modules at build time and would reach the components
that are not hookable at all — `Table` above all. It is undocumented, so this extension does not use it.
