# Apply the two tracked GitHub rulesets to this fork using your own GitHub CLI login.
# GitHub requires repository Administration permission to create rulesets.
param(
    [string]$Repository = "BlackShuck89/re6ai-personal"
)
$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI is not installed. Install it from https://cli.github.com/ first."
}
& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run: gh auth login"
}

$root = Split-Path -Parent $PSScriptRoot
$definitions = @(
    Join-Path $root ".github/rulesets/protect-master.json"
    Join-Path $root ".github/rulesets/protect-development.json"
)
$raw = & gh api "repos/$Repository/rulesets" 2>&1
if ($LASTEXITCODE -ne 0) {
    throw "Could not inspect GitHub rulesets. An admin-authenticated GitHub CLI session is required: $raw"
}
$existingRules = @(($raw -join "`n" | ConvertFrom-Json))

foreach ($definitionPath in $definitions) {
    if (-not (Test-Path $definitionPath)) { throw "Missing ruleset file: $definitionPath" }
    $definition = Get-Content -Path $definitionPath -Raw | ConvertFrom-Json
    $existing = @($existingRules | Where-Object { $_ -and $_.name -eq $definition.name }) | Select-Object -First 1

    if ($existing) {
        Write-Host "Updating: $($definition.name)"
        $result = & gh api -X PUT "repos/$Repository/rulesets/$($existing.id)" --input $definitionPath 2>&1
    } else {
        Write-Host "Creating: $($definition.name)"
        $result = & gh api -X POST "repos/$Repository/rulesets" --input $definitionPath 2>&1
    }
    if ($LASTEXITCODE -ne 0) { throw "Failed to apply $($definition.name): $result" }
    $applied = ($result -join "`n") | ConvertFrom-Json
    Write-Host "Active ruleset: $($applied.name) (ID $($applied.id))"
}

Write-Host "Both branch rulesets applied. Review them in your repository Settings > Rules > Rulesets."
