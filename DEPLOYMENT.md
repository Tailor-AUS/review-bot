# Deployment Guide

This guide walks through deploying the Review Bot from scratch.

## Prerequisites Checklist

- [x] Azure CLI installed and logged in (`az login`)
- [x] GitHub CLI installed and logged in (`gh auth login`)
- [x] Node.js 18+ installed
- [x] Azure subscription with Owner or Contributor role
- [ ] Admin access to Microsoft 365 tenant (for granting consent)

## Step 1: Configure GitHub Secrets

Follow [GITHUB_SECRETS.md](./GITHUB_SECRETS.md) to set up all required secrets.

**Quick command:**
```bash
# From the review-bot directory
gh secret set AZURE_SUBSCRIPTION_ID --body "5745cb5e-8c39-470f-ab6f-8a5897b7f9af"
gh secret set AZURE_TENANT_ID --body "cc8f25ed-7019-48b7-ba94-2b54a35a42aa"
gh secret set BOT_APP_ID --body "3e18cba3-f774-4557-bba8-c6633656fb12"
gh secret set REVIEW_USER_ID --body "7842a177-7164-464e-9563-c1de1d3f985e"
gh secret set REVIEW_UPN --body "review@NETORGFT18200403.onmicrosoft.com"

# Enter the bot app secret when prompted
gh secret set BOT_APP_SECRET

# Create service principal and set credentials
az ad sp create-for-rbac --name "github-review-bot" \
  --role contributor \
  --scopes /subscriptions/5745cb5e-8c39-470f-ab6f-8a5897b7f9af \
  --sdk-auth | gh secret set AZURE_CREDENTIALS
```

## Step 2: Grant Admin Consent for API Permissions

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **Azure Active Directory** → **App registrations** → **Review Bot**
3. Select **API permissions**
4. Click **Grant admin consent for tailorco.au**
5. Confirm the consent dialog

**Required permissions:**
- Calendars.Read
- Calendars.ReadWrite
- MailboxSettings.Read
- OnlineMeetings.Read.All
- OnlineMeetingTranscript.Read.All
- Files.ReadWrite.All
- Sites.ReadWrite.All
- Tasks.ReadWrite
- User.Read (Delegated)

## Step 3: Deploy Infrastructure

### Option A: Via GitHub Actions (Recommended)

1. Go to your GitHub repository
2. Click **Actions** → **Deploy Infrastructure**
3. Click **Run workflow**
4. Select environment (dev/staging/prod)
5. Click **Run workflow**

### Option B: Via Local Script

```powershell
# From the review-bot/infra directory
.\deploy.ps1 -EnvironmentName dev -Location australiaeast

# Enter the bot app secret when prompted
```

### Option C: Via Azure CLI

```bash
cd infra

az group create --name rg-review-bot --location australiaeast

az deployment group create \
  --name review-bot-deployment \
  --resource-group rg-review-bot \
  --template-file main.bicep \
  --parameters environmentName=dev \
  --parameters location=australiaeast \
  --parameters botAppId="3e18cba3-f774-4557-bba8-c6633656fb12" \
  --parameters botAppSecret="<your-secret>" \
  --parameters reviewUserId="7842a177-7164-464e-9563-c1de1d3f985e" \
  --parameters reviewUpn="review@NETORGFT18200403.onmicrosoft.com" \
  --parameters tenantId="cc8f25ed-7019-48b7-ba94-2b54a35a42aa"
```

## Step 4: Deploy Bot Code

### Option A: Via GitHub Actions (Automatic)

The code automatically deploys when you push to the `master` branch.

### Option B: Via Azure Functions Core Tools

```bash
# Install dependencies and build
npm install
npm run build

# Get the function app name from deployment outputs
FUNCTION_APP_NAME="review-bot-dev-func"

# Deploy
func azure functionapp publish $FUNCTION_APP_NAME
```

## Step 5: Configure Graph Subscription

After deployment, create a subscription for calendar events:

```bash
# Get the function app URL
FUNCTION_URL=$(az functionapp show \
  --name review-bot-dev-func \
  --resource-group rg-review-bot \
  --query defaultHostName -o tsv)

NOTIFICATION_URL="https://${FUNCTION_URL}/api/listener"

echo "Notification URL: $NOTIFICATION_URL"
```

Then use Microsoft Graph Explorer or code to create a subscription:

**Graph API Request:**
```
POST https://graph.microsoft.com/v1.0/subscriptions
Content-Type: application/json

{
  "changeType": "created,updated",
  "notificationUrl": "<NOTIFICATION_URL>",
  "resource": "/users/7842a177-7164-464e-9563-c1de1d3f985e/events",
  "expirationDateTime": "<future-timestamp>",
  "clientState": "ReviewBotSecret123"
}
```

## Step 6: Deploy Teams App

1. Update `teamsApp/manifest.json` with the Bot App ID
2. Zip the `teamsApp` folder contents (manifest.json, color.png, outline.png)
3. Go to [Teams Admin Center](https://admin.teams.microsoft.com)
4. Navigate to **Teams apps** → **Manage apps** → **Upload**
5. Upload the zip file
6. Approve and publish to your organization

## Step 7: Test the Bot

1. Create a new Teams meeting in Outlook or Teams Calendar
2. Add `review@NETORGFT18200403.onmicrosoft.com` to the attendees
3. Check the function app logs to verify the notification was received:

```bash
func azure functionapp logstream review-bot-dev-func
```

4. After the meeting ends, verify the transcript is processed

## Monitoring and Troubleshooting

### View Function Logs
```bash
az monitor app-insights query \
  --app review-bot-dev-insights \
  --analytics-query "traces | order by timestamp desc | limit 50"
```

### Test Endpoint Manually
```bash
curl https://review-bot-dev-func.azurewebsites.net/api/listener?validationToken=test
```

### Check Bot Service
```bash
az bot show --name review-bot-dev-bot --resource-group rg-review-bot
```

## Updating the Deployment

### Code Changes
Just push to master - GitHub Actions will auto-deploy.

### Infrastructure Changes
Edit `infra/main.bicep` and re-run the deployment.

### Configuration Changes
Update function app settings:
```bash
az functionapp config appsettings set \
  --name review-bot-dev-func \
  --resource-group rg-review-bot \
  --settings KEY=VALUE
```

## Cleanup

To remove all resources:
```bash
az group delete --name rg-review-bot --yes --no-wait
az ad app delete --id 3e18cba3-f774-4557-bba8-c6633656fb12
```

