# ISI — serve repo root for engine testing (port 8080)
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root
Write-Host "Serving: $Root"
Write-Host "Open: http://localhost:8080/engine-testing/index.html"
Write-Host "Press Ctrl+C to stop."
$npx = Get-Command npx -ErrorAction SilentlyContinue
if ($npx) {
  npx --yes http-server -p 8080 -c-1
  exit $LASTEXITCODE
}
$py = Get-Command py -ErrorAction SilentlyContinue
if ($py) {
  py -3 -m http.server 8080
  exit $LASTEXITCODE
}
Write-Host "ERROR: Install Node.js (npx) or Python 3, then run this script again."
exit 1
