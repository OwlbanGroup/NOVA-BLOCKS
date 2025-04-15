<#
.SYNOPSIS
Verifies NOVA BLOCKS license compliance across all source files
#>

Write-Host "`n=== NOVA BLOCKS LICENSE COMPLIANCE VERIFICATION ===`n" -ForegroundColor Magenta

# JavaScript/TypeScript check
Write-Host "Running JavaScript/TypeScript license scan..." -ForegroundColor Cyan
node ./scripts/license-enforcer.js scan
if ($LASTEXITCODE -ne 0) {
    Write-Host "License violations detected in JavaScript/TypeScript files" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Python check
Write-Host "`nRunning Python license verification..." -ForegroundColor Cyan
python ./scripts/license_check.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "License violations detected in Python files" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Success message
Write-Host "`nAll files compliant with NOVA license requirements" -ForegroundColor Green
Write-Host "=== VERIFICATION COMPLETE ===`n" -ForegroundColor Magenta
