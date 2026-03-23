# Manual deploy script for Windows PowerShell (Clean Version)

Write-Host "1. Building the project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Stopping deployment." -ForegroundColor Red
    exit
}

Write-Host "2. Deploying to GitHub..." -ForegroundColor Cyan

# This command takes the 'dist' folder and forces it onto the gh-pages branch
# It's much more reliable on Windows than the previous versions
git add dist -f
git commit -m "Force deploy dist folder"
$commitHash = git subtree split --prefix dist main
git push origin "${commitHash}:gh-pages" --force

Write-Host "SUCCESS: Your site is published!" -ForegroundColor Green
Write-Host "URL: https://ibhlqw.github.io/websmoi/" -ForegroundColor Cyan
