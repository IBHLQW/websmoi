# Manual deploy script for Windows PowerShell (Nuclear Version)

Write-Host "1. Building the project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Stopping deployment." -ForegroundColor Red
    exit
}

Write-Host "2. Deploying to GitHub..." -ForegroundColor Cyan

# Go into the built folder
cd dist

# Create a fresh, temporary git repository just for deployment
git init
git add .
git commit -m "Deploy to GitHub Pages"

# Force push this folder to your gh-pages branch
# (Replace 'ibhlqw' and 'websmoi' if they are different)
git push -f https://github.com/ibhlqw/websmoi.git master:gh-pages

# Go back to your project folder
cd ..

Write-Host "SUCCESS: Your site is published!" -ForegroundColor Green
Write-Host "URL: https://ibhlqw.github.io/websmoi/" -ForegroundColor Cyan
