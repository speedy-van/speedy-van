# Script to fix duplicate fields

$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $newLines = @()
    $inInterface = $false
    $seenFields = @{}
    
    foreach ($line in $lines) {
        if ($line -match '^\s*interface\s+\w+\s*\{') {
            $inInterface = $true
            $seenFields = @{}
            $newLines += $line
        }
        elseif ($inInterface -and $line -match '^\s*\}') {
            $inInterface = $false
            $seenFields = @{}
            $newLines += $line
        }
        elseif ($inInterface -and $line -match '^\s*(\w+):') {
            $fieldName = $matches[1]
            if (-not $seenFields.ContainsKey($fieldName)) {
                $seenFields[$fieldName] = $true
                $newLines += $line
            } else {
                Write-Host "Removing duplicate field '$fieldName' in $($file.Name)"
            }
        }
        else {
            $newLines += $line
        }
    }
    
    Set-Content -Path $file.FullName -Value $newLines
}

Write-Host "Duplicate removal completed!"
