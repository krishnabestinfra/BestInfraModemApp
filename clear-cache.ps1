# PowerShell script to clear all cache folders from the React Native/Expo project

Write-Host "Clearing cache folders..." -ForegroundColor Yellow

# Root level cache folders
$cacheFolders = @(
    ".expo",
    ".gradle",
    "app\build"
)

# Android cache folders
$androidCacheFolders = @(
    "android\.gradle",
    "android\app\build",
    "android\build"
)

# Node modules cache
$nodeCacheFolders = @(
    "node_modules\.cache"
)

# Log files
$logFiles = @(
    "hs_err_pid*.log",
    "replay_pid*.log"
)

# Remove root cache folders
foreach ($folder in $cacheFolders) {
    if (Test-Path $folder) {
        Write-Host "Removing: $folder" -ForegroundColor Cyan
        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed" -ForegroundColor Green
    } else {
        Write-Host "Skipping: $folder (not found)" -ForegroundColor Gray
    }
}

# Remove Android cache folders
foreach ($folder in $androidCacheFolders) {
    if (Test-Path $folder) {
        Write-Host "Removing: $folder" -ForegroundColor Cyan
        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed" -ForegroundColor Green
    } else {
        Write-Host "Skipping: $folder (not found)" -ForegroundColor Gray
    }
}

# Remove node_modules cache
foreach ($folder in $nodeCacheFolders) {
    if (Test-Path $folder) {
        Write-Host "Removing: $folder" -ForegroundColor Cyan
        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed" -ForegroundColor Green
    } else {
        Write-Host "Skipping: $folder (not found)" -ForegroundColor Gray
    }
}

# Remove log files
foreach ($pattern in $logFiles) {
    $files = Get-ChildItem -Path . -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Write-Host "Removing: $($file.Name)" -ForegroundColor Cyan
        Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed" -ForegroundColor Green
    }
}

Write-Host "`nCache cleanup completed!" -ForegroundColor Green
Write-Host "`nNote: The following folders are NOT cache and should NOT be deleted:" -ForegroundColor Yellow
Write-Host "  - android\gradle\ (Gradle wrapper - required for builds)" -ForegroundColor White
Write-Host "  - node_modules\ (Dependencies - reinstall with 'npm install' if deleted)" -ForegroundColor White

