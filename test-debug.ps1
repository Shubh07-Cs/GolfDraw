Write-Host "=== Quick Score + Charity Test ===" -ForegroundColor Cyan

$email = "quick$(Get-Random -Maximum 99999)@test.com"
$password = "GolfDraw2026!"

# Register
$regBody = @{ email=$email; password=$password; full_name="Quick Tester" } | ConvertTo-Json
$reg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $regBody -ContentType "application/json" -TimeoutSec 10
Write-Host "Registered: $email" -ForegroundColor Green

# Login
$loginBody = @{ email=$email; password=$password } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
$token = $login.access_token
Write-Host "Logged in, got token" -ForegroundColor Green

$headers = @{ Authorization = "Bearer $token" }

# Add Score
Write-Host "`nAdding score..." -ForegroundColor Yellow
try {
    $scoreBody = @{ score=82; course_name="St Andrews"; played_at="2026-03-28" } | ConvertTo-Json
    $result = Invoke-WebRequest -Uri "http://localhost:5000/api/scores" -Method POST -Body $scoreBody -ContentType "application/json" -Headers $headers -TimeoutSec 10 -UseBasicParsing
    Write-Host "Score response: $($result.StatusCode) - $($result.Content.Substring(0, [Math]::Min(200, $result.Content.Length)))" -ForegroundColor Green
} catch {
    Write-Host "Score FAILED: Status $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error body: $errorBody" -ForegroundColor Red
}

# Select Charity
Write-Host "`nSelecting charity..." -ForegroundColor Yellow
try {
    $ch = Invoke-RestMethod -Uri "http://localhost:5000/api/charities" -TimeoutSec 5
    $charityId = $ch.charities[0].id
    $selBody = @{ charity_id=$charityId } | ConvertTo-Json
    $result2 = Invoke-WebRequest -Uri "http://localhost:5000/api/charities/select" -Method POST -Body $selBody -ContentType "application/json" -Headers $headers -TimeoutSec 10 -UseBasicParsing
    Write-Host "Charity response: $($result2.StatusCode) - $($result2.Content.Substring(0, [Math]::Min(200, $result2.Content.Length)))" -ForegroundColor Green
} catch {
    Write-Host "Charity FAILED: Status $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $stream2 = $_.Exception.Response.GetResponseStream()
    $reader2 = New-Object System.IO.StreamReader($stream2)
    $errorBody2 = $reader2.ReadToEnd()
    Write-Host "Error body: $errorBody2" -ForegroundColor Red
}
