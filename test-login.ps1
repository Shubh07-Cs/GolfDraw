Write-Host "`n=== GolfDraw Login Test ===" -ForegroundColor Cyan

# Test login with existing user
Write-Host "`n[1] Login with existing user..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "skr19053481@gmail.com"
        password = "Test1234"
    } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "  PASS: Login successful! Token received" -ForegroundColor Green
    $token = $login.access_token
    Write-Host "  User: $($login.user.email)" -ForegroundColor Green
    Write-Host "  Name: $($login.user.profile.full_name)" -ForegroundColor Green
    Write-Host "  Role: $($login.user.profile.role)" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "  API Response: $body" -ForegroundColor Yellow
    }
    Write-Host "`nNote: If login fails, check:" -ForegroundColor Yellow
    Write-Host "  1. Did you disable 'Confirm email' in Supabase Auth settings?" -ForegroundColor Yellow
    Write-Host "  2. Is the password correct? (I used 'Test1234' as a guess)" -ForegroundColor Yellow
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
