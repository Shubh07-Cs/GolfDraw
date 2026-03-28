Write-Host "`n=== GolfDraw Full Integration Test ===" -ForegroundColor Cyan

$email = "golfer$(Get-Random -Maximum 99999)@test.com"
$password = "GolfDraw2026!"

# Test 1: Register
Write-Host "`n[1] Register ($email)..." -ForegroundColor Yellow
try {
    $regBody = @{ email=$email; password=$password; full_name="Test Golfer" } | ConvertTo-Json
    $reg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $regBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "  PASS: $($reg.message)" -ForegroundColor Green
    Write-Host "  Needs confirmation: $($reg.needs_confirmation)" -ForegroundColor $(if($reg.needs_confirmation){"Red"}else{"Green"})
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "  FAIL: $($reader.ReadToEnd())" -ForegroundColor Red
    return
}

# Test 2: Login
Write-Host "`n[2] Login..." -ForegroundColor Yellow
try {
    $loginBody = @{ email=$email; password=$password } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "  PASS: Token received" -ForegroundColor Green
    Write-Host "  Name: $($login.user.profile.full_name) | Role: $($login.user.profile.role)" -ForegroundColor Green
    $token = $login.access_token
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "  FAIL: $($reader.ReadToEnd())" -ForegroundColor Red
    return
}

$headers = @{ Authorization = "Bearer $token" }

# Test 3: Get Me
Write-Host "`n[3] Auth guard (GET /auth/me)..." -ForegroundColor Yellow
try {
    $me = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Headers $headers -TimeoutSec 5
    Write-Host "  PASS: Authenticated as $($me.user.email)" -ForegroundColor Green
} catch { Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red }

# Test 4: Add Score
Write-Host "`n[4] Add golf score..." -ForegroundColor Yellow
try {
    $scoreBody = @{ score=82; course_name="St Andrews"; played_at="2026-03-28" } | ConvertTo-Json
    $sc = Invoke-RestMethod -Uri "http://localhost:5000/api/scores" -Method POST -Body $scoreBody -ContentType "application/json" -Headers $headers -TimeoutSec 10
    Write-Host "  PASS: Score 82 added. Total scores: $($sc.scores.Count)" -ForegroundColor Green
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "  FAIL: $($reader.ReadToEnd())" -ForegroundColor Red
}

# Test 5: Get Scores
Write-Host "`n[5] Get my scores..." -ForegroundColor Yellow
try {
    $scores = Invoke-RestMethod -Uri "http://localhost:5000/api/scores" -Headers $headers -TimeoutSec 5
    Write-Host "  PASS: $($scores.scores.Count) scores, avg=$($scores.stats.average)" -ForegroundColor Green
} catch { Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red }

# Test 6: Charities
Write-Host "`n[6] Get charities..." -ForegroundColor Yellow
try {
    $ch = Invoke-RestMethod -Uri "http://localhost:5000/api/charities" -TimeoutSec 5
    Write-Host "  PASS: $($ch.charities.Count) charities available" -ForegroundColor Green
} catch { Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red }

# Test 7: Select Charity
Write-Host "`n[7] Select a charity..." -ForegroundColor Yellow
try {
    $ch = Invoke-RestMethod -Uri "http://localhost:5000/api/charities" -TimeoutSec 5
    $charityId = $ch.charities[0].id
    $selBody = @{ charity_id=$charityId } | ConvertTo-Json
    $sel = Invoke-RestMethod -Uri "http://localhost:5000/api/charities/select" -Method POST -Body $selBody -ContentType "application/json" -Headers $headers -TimeoutSec 10
    Write-Host "  PASS: Selected '$($ch.charities[0].name)'" -ForegroundColor Green
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "  FAIL: $($reader.ReadToEnd())" -ForegroundColor Red
}

# Test 8: Draw Results
Write-Host "`n[8] Get draw results..." -ForegroundColor Yellow
try {
    $draws = Invoke-RestMethod -Uri "http://localhost:5000/api/draw-results" -Headers $headers -TimeoutSec 5
    Write-Host "  PASS: $($draws.draws.Count) draws found" -ForegroundColor Green
} catch { Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red }

# Test 9: Frontend
Write-Host "`n[9] Frontend page load..." -ForegroundColor Yellow
try {
    $f = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  PASS: Status $($f.StatusCode)" -ForegroundColor Green
} catch { Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red }

Write-Host "`n=== All Tests Complete ===" -ForegroundColor Cyan
Write-Host "Test account: $email / $password`n" -ForegroundColor Gray
