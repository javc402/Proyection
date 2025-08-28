# Script para corregir las referencias de logger a Logger
$file = "controllers\management\bankAccountController.js"
$content = Get-Content $file -Raw
$content = $content -replace 'logger\.info', 'Logger.info'
$content = $content -replace 'logger\.error', 'Logger.error'
Set-Content $file $content
Write-Host "Logger references fixed in $file"
