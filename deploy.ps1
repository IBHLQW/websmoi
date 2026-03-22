# Manual deploy script for Windows PowerShell (Robust Version)

Write-Host "1. Saving your latest changes..." -ForegroundColor Cyan
git add .
git commit -m "Update base path for deployment"

Write-Host "2. Building the project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Stopping deployment." -ForegroundColor Red
    exit
}

Write-Host "3. Pushing build folder to GitHub..." -ForegroundColor Cyan

# This command takes the 'dist' folder and forces it onto the gh-pages branch
# It uses a more reliable method for Windows PowerShell
git add dist -f
git commit -m "Force deploy dist folder"
$commitHash = git subtree split --prefix dist main
git push origin "${commitHash}:gh-pages" --force

Write-Host "SUCCESS: Your site is published!" -ForegroundColor Green
Write-Host "Wait 60 seconds, then refresh your browser." -ForegroundColor Yellow
Write-Host "URL: https://ibhlqw.github.io/websmoi/" -ForegroundColor Cyan
