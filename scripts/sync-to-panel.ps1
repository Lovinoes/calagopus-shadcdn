<#
.SYNOPSIS
  Mirrors this repo's extension into a Calagopus panel checkout so it can be built and type-checked.

.DESCRIPTION
  The extension's frontend half is copied to <panel>/frontend/extensions/dev_lovinoes_shadcn, which is
  the "legacy" of the two interchangeable extension paths (see the Extension File Structure docs: one of
  frontend/extensions/<id> and backend-extensions/<id>/frontend is the real directory and the other a
  symlink, and which is which depends on the container type).

  It has to be a real directory rather than a link: pnpm's workspace globs do resolve a junction, but it
  then installs none of the project's dependencies, so radix-ui and friends never land in node_modules.
  Only one of the two paths may be a real directory at a time, or pnpm sees two workspace projects with
  the same name and silently installs neither.

.PARAMETER Panel
  Path to the panel checkout. Defaults to $env:CALAGOPUS_PANEL.
#>
[CmdletBinding()]
param(
  [string]$Panel = $env:CALAGOPUS_PANEL
)

$ErrorActionPreference = 'Stop'

if (-not $Panel) {
  throw 'No panel path. Pass -Panel <path> or set $env:CALAGOPUS_PANEL.'
}
if (-not (Test-Path (Join-Path $Panel 'frontend/package.json'))) {
  throw "Does not look like a panel checkout (no frontend/package.json): $Panel"
}

$repo = Split-Path -Parent $PSScriptRoot
$identifier = 'dev_lovinoes_shadcn'
$source = Join-Path $repo "backend-extensions/$identifier/frontend"
$target = Join-Path $Panel "frontend/extensions/$identifier"

# node_modules lives in the target and must survive the mirror.
robocopy $source $target /MIR /XD node_modules /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

Write-Output "synced $source -> $target"
