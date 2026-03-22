# Manual deploy script for Windows PowerShell

Write-Host "Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Stopping deployment." -ForegroundColor Red
    exit
}

Write-Host "Deploying to GitHub Pages..." -ForegroundColor Cyan

# Check if gh-pages branch exists locally, if not create it
$branchExists = git branch --list gh-pages
if (-not $branchExists) {
    git branch gh-pages
}

# Use git subtree to push the dist folder
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages

Write-Host "SUCCESS: Your site is published!" -ForegroundColor Green
