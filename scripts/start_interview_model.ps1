# Compatibility entry point: prepare and start the complete local application.
& (Join-Path $PSScriptRoot 'start_local.ps1')
exit $LASTEXITCODE
