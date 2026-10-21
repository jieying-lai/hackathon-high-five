$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $repo
$runtime = Join-Path $repo '.runtime'
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
$env:UV_UNMANAGED_INSTALL = Join-Path $runtime 'uv'
$env:UV_PYTHON_INSTALL_DIR = Join-Path $runtime 'python'
$env:UV_CACHE_DIR = Join-Path $runtime 'cache'
$env:UV_DATA_DIR = Join-Path $runtime 'data'
$env:UV_PYTHON_BIN_DIR = Join-Path $runtime 'bin'
$env:UV_NO_PROGRESS = '1'
$env:PYTHONUTF8 = '1'
$uv = Join-Path $env:UV_UNMANAGED_INSTALL 'uv.exe'
if (!(Test-Path -LiteralPath $uv)) {
    Write-Host 'Installing the project-local Python manager (no administrator access needed)...'
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $installer = Join-Path $runtime 'install-uv.ps1'
    Invoke-WebRequest 'https://astral.sh/uv/0.12.19/install.ps1' -UseBasicParsing -OutFile $installer
    & $installer
}
if (!(Test-Path -LiteralPath $uv)) { throw 'Python manager installation failed.' }
$architecture = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'aarch64' } else { 'x86_64' }
$python = Join-Path $env:UV_PYTHON_INSTALL_DIR "cpython-3.12.14-windows-$architecture-none\python.exe"
if (!(Test-Path -LiteralPath $python)) {
    & $uv python install 3.12.14 --no-registry --no-bin
    # Some restricted Windows environments reject uv's optional directory junction.
    # Use the installed interpreter directly, after checking it, without that link.
    if (!(Test-Path -LiteralPath $python)) { throw 'Could not install Python 3.12. Check the download error above.' }
}
& $python -c 'import ssl, venv, sys; assert sys.version_info[:2] == (3, 12)'
if ($LASTEXITCODE -ne 0) { throw 'The downloaded Python installation is incomplete.' }
& $python -u (Join-Path $PSScriptRoot 'bootstrap_local.py') --uv $uv
exit $LASTEXITCODE
