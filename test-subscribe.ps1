Write-Host "=== Test Subscribe Mock ===" -ForegroundColor Cyan

$email = "sub$(Get-Random -Maximum 99999)@test.com"
$password = "GolfDraw2026!"

# Register
$regBody = @{ email=$email; password=$password; full_name="Sub Tester" } | ConvertTo-Json
$reg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $regBody -ContentType "application/json" -TimeoutSec 10
Write-Host "Registered: $email" -ForegroundColor Green

# Login
$loginBody = @{ email=$email; password=$password } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
$token = $login.access_token

$headers = @{ Authorization = "Bearer $token" }

Write-Host "Calling /api/subscriptions/subscribe..." -ForegroundColor Yellow
$sub = Invoke-RestMethod -Uri "http://localhost:5000/api/subscriptions/subscribe" -Method POST -ContentType "application/json" -Headers $headers -TimeoutSec 10
Write-Host "Checkout URL: $($sub.checkout_url)" -ForegroundColor Green

Write-Host "Calling /api/auth/me to check role/sub status..." -ForegroundColor Yellow
$me = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Headers $headers -TimeoutSec 5
Write-Host "Subscription Object: $($me.subscription | ConvertTo-Json -Depth 2)" -ForegroundColor Green
