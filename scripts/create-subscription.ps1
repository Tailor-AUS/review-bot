# Create Graph Subscription for Review Bot
# This script creates a subscription to monitor calendar events for the review mailbox

param(
    [Parameter(Mandatory=$false)]
    [string]$FunctionAppUrl = "https://review-bot-dev-func.azurewebsites.net"
)

$TenantId = "cc8f25ed-7019-48b7-ba94-2b54a35a42aa"
$ClientId = "3e18cba3-f774-4557-bba8-c6633656fb12"
$ClientSecret = $env:BOT_APP_SECRET
if (-not $ClientSecret) {
    $ClientSecret = Read-Host "Enter Bot App Secret" -AsSecureString
    $ClientSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ClientSecret))
}
$ReviewUserId = "7842a177-7164-464e-9563-c1de1d3f985e"

Write-Host "🔐 Getting access token..." -ForegroundColor Cyan

# Get access token using app credentials
$tokenBody = @{
    grant_type = "client_credentials"
    client_id = $ClientId
    client_secret = $ClientSecret
    scope = "https://graph.microsoft.com/.default"
}

$tokenResponse = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" -Body $tokenBody
$accessToken = $tokenResponse.access_token

Write-Host "✅ Access token obtained" -ForegroundColor Green

# Create subscription
Write-Host "📧 Creating subscription..." -ForegroundColor Cyan

$expirationDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ssZ")

$subscriptionBody = @{
    changeType = "created,updated"
    notificationUrl = "$FunctionAppUrl/api/listener"
    resource = "/users/$ReviewUserId/events"
    expirationDateTime = $expirationDate
    clientState = "ReviewBotSecret123"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

try {
    $subscription = Invoke-RestMethod -Method Post -Uri "https://graph.microsoft.com/v1.0/subscriptions" -Headers $headers -Body $subscriptionBody
    
    Write-Host "✅ Subscription created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Subscription Details:" -ForegroundColor Yellow
    Write-Host "  ID: $($subscription.id)" -ForegroundColor White
    Write-Host "  Resource: $($subscription.resource)" -ForegroundColor White
    Write-Host "  Notification URL: $($subscription.notificationUrl)" -ForegroundColor White
    Write-Host "  Expires: $($subscription.expirationDateTime)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 The bot will now receive notifications when meetings are scheduled!" -ForegroundColor Green
    
    return $subscription
}
catch {
    Write-Host "❌ Failed to create subscription" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    
    exit 1
}

