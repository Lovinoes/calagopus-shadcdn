<#
.SYNOPSIS
  Runs the panel's own pre-export checks against this extension.

.DESCRIPTION
  Mirrors the extension into a panel checkout, formats and lints it with the panel's Biome config,
  copies the formatted result back into this repo, then type-checks and builds the whole frontend with
  the extension compiled in. That last step is what `/docs/panel/extensions/getting-your-extension-ready`
  calls for before exporting a .c7s.zip, and it is the check that actually proves the prop contracts
  hold and the CSS compiles.

  Biome runs against the panel copy rather than this repo because biome.json scopes itself to paths
  relative to the panel's frontend directory, so files outside it are skipped rather than checked.

.PARAMETER Panel
  Path to the panel checkout. Defaults to $env:CALAGOPUS_PANEL.

.PARAMETER SkipBuild
  Lint and type-check only. Useful while iterating.

.PARAMETER NoFormat
  Report formatting and lint problems instead of fixing them in place.
#>
[CmdletBinding()]
param(
  [string]$Panel = $env:CALAGOPUS_PANEL,
  [switch]$SkipBuild,
  [switch]$NoFormat
)

$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$identifier = 'dev_lovinoes_shadcn'

& (Join-Path $PSScriptRoot 'sync-to-panel.ps1') -Panel $Panel | Out-Null

$frontend = Join-Path $Panel 'frontend'
$relative = "extensions/$identifier/src"
$failures = @()

Push-Location $frontend
try {
  Write-Output '=== biome ==='
  $biomeArgs = @('exec', 'biome', 'check', '--css-parse-tailwind-directives=true')
  if (-not $NoFormat) { $biomeArgs += '--write' }
  $biomeArgs += $relative
  & pnpm @biomeArgs
  if ($LASTEXITCODE -ne 0) { $failures += 'biome' }

  if (-not $NoFormat) {
    # Bring Biome's in-place fixes back to the repo, which is the working copy.
    robocopy (Join-Path $frontend "extensions/$identifier/src") (Join-Path $repo "backend-extensions/$identifier/frontend/src") `
      /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "robocopy back to the repo failed with exit code $LASTEXITCODE" }
  }

  Write-Output '=== tsc ==='
  & pnpm exec tsc
  if ($LASTEXITCODE -ne 0) { $failures += 'tsc' } else { Write-Output 'no type errors' }

  if (-not $SkipBuild) {
    Write-Output '=== vite build ==='
    $buildLog = & pnpm exec vite build 2>&1
    if ($LASTEXITCODE -ne 0) {
      $buildLog | Select-Object -Last 40
      $failures += 'vite build'
    } else {
      $buildLog | Select-String -Pattern 'built in|extension-dev_lovinoes'
    }
  }
} finally {
  Pop-Location
}

if ($failures.Count -gt 0) {
  Write-Output ''
  Write-Output "FAILED: $($failures -join ', ')"
  exit 1
}

Write-Output ''
Write-Output 'OK'
