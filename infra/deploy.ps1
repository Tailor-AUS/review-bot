# Review Bot Infrastructure Deployment Script
# This script deploys the Azure infrastructure for the Review Bot

param(
    [Parameter(Mandatory=$false)]
    [string]$EnvironmentName = "dev",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "australiaeast",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-review-bot"
)

Write-Host "🚀 Deploying Review Bot Infrastructure" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentName" -ForegroundColor Yellow
Write-Host "Location: $Location" -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Yellow
Write-Host ""

# Check if logged in to Azure
$context = az account show 2>$null
if (-not $context) {
    Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in to Azure" -ForegroundColor Green

# Create resource group if it doesn't exist
Write-Host "📦 Creating resource group..." -ForegroundColor Cyan
az group create --name $ResourceGroupName --location $Location --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create resource group" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Resource group ready" -ForegroundColor Green

# Get the bot app secret from user (don't store in parameters file)
$BotAppSecret = Read-Host "Enter the Bot App Client Secret" -AsSecureString
$BotAppSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($BotAppSecret)
)

# Deploy the infrastructure
Write-Host "🏗️  Deploying infrastructure (this may take 3-5 minutes)..." -ForegroundColor Cyan

$deploymentName = "review-bot-$EnvironmentName-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

az deployment group create `
    --name $deploymentName `
    --resource-group $ResourceGroupName `
    --template-file main.bicep `
    --parameters environmentName=$EnvironmentName `
    --parameters location=$Location `
    --parameters botAppId="3e18cba3-f774-4557-bba8-c6633656fb12" `
    --parameters botAppSecret=$BotAppSecretPlain `
    --parameters reviewUserId="7842a177-7164-464e-9563-c1de1d3f985e" `
    --parameters reviewUpn="review@NETORGFT18200403.onmicrosoft.com" `
    --parameters tenantId="cc8f25ed-7019-48b7-ba94-2b54a35a42aa" `
    --output json | ConvertFrom-Json | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
Write-Host ""

# Get deployment outputs
Write-Host "📊 Deployment outputs:" -ForegroundColor Cyan
$outputs = az deployment group show `
    --name $deploymentName `
    --resource-group $ResourceGroupName `
    --query properties.outputs `
    --output json | ConvertFrom-Json

Write-Host "Function App Name: $($outputs.functionAppName.value)" -ForegroundColor Yellow
Write-Host "Function App URL: https://$($outputs.functionAppHostName.value)" -ForegroundColor Yellow
Write-Host "Bot Service Name: $($outputs.botServiceName.value)" -ForegroundColor Yellow
Write-Host ""

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Grant admin consent for API permissions in Azure Portal" -ForegroundColor White
Write-Host "2. Deploy the bot code: npm run build && func azure functionapp publish $($outputs.functionAppName.value)" -ForegroundColor White
Write-Host "3. Configure Graph subscription for calendar events" -ForegroundColor White
Write-Host "4. Install the Teams app from teamsApp manifest" -ForegroundColor White

