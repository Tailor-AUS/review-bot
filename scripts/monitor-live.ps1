# Live Monitoring Script for Review Bot
# Run this while testing to see notifications in real-time

Write-Host "🔍 Live Monitoring Review Bot" -ForegroundColor Cyan
Write-Host "Subscription: 892eb986-8546-4ed7-a8cf-9a4ca8c74025" -ForegroundColor Yellow
Write-Host ""
Write-Host "Monitoring for the next 5 minutes..." -ForegroundColor Gray
Write-Host "Create or update a meeting with review@NETORGFT18200403.onmicrosoft.com" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date
$lastCount = 0

while ((Get-Date) -lt $startTime.AddMinutes(5)) {
    # Check function executions
    $metrics = az monitor metrics list `
        --resource /subscriptions/5745cb5e-8c39-470f-ab6f-8a5897b7f9af/resourceGroups/rg-review-bot/providers/Microsoft.Web/sites/review-bot-dev-func `
        --metric "FunctionExecutionCount" `
        --start-time (Get-Date).AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:ssZ") `
        --interval PT1M `
        --aggregation Total `
        --query "value[0].timeseries[0].data[-1].total" `
        -o tsv 2>$null
    
    $currentCount = if ($metrics) { [int]$metrics } else { 0 }
    
    if ($currentCount -gt $lastCount) {
        $newCalls = $currentCount - $lastCount
        Write-Host ""
        Write-Host "🎉 NOTIFICATION RECEIVED! (+$newCalls executions)" -ForegroundColor Green
        Write-Host "Timestamp: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Checking recent function activity..." -ForegroundColor Cyan
        
        # Try to get execution history
        $invocations = az rest --method GET `
            --url "https://management.azure.com/subscriptions/5745cb5e-8c39-470f-ab6f-8a5897b7f9af/resourceGroups/rg-review-bot/providers/Microsoft.Web/sites/review-bot-dev-func/functions/listener/invocations?api-version=2023-01-01" `
            -o json 2>$null | ConvertFrom-Json
        
        if ($invocations.value) {
            Write-Host "Recent invocations:" -ForegroundColor Yellow
            $invocations.value | Select-Object -First 3 | ForEach-Object {
                Write-Host "  - $($_.properties.startTime): $($_.properties.status)" -ForegroundColor Gray
            }
        }
        
        $lastCount = $currentCount
    } else {
        Write-Host "." -NoNewline
    }
    
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host ""
Write-Host "Monitoring stopped after 5 minutes." -ForegroundColor Gray
Write-Host "Final execution count: $lastCount" -ForegroundColor Yellow

