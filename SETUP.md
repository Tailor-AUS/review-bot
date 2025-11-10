# Review Bot Setup Guide

## Prerequisites
- Azure CLI installed and logged in
- GitHub CLI installed and logged in
- Node.js LTS installed
- TeamsFx CLI installed

## Step 1: Create Azure AD App Registration

### Required Permissions (Microsoft Graph)

**Application Permissions (requires admin consent):**
- `Calendars.Read` - Read calendars in all mailboxes
- `Calendars.ReadWrite` - Read and write calendars in all mailboxes  
- `MailboxSettings.Read` - Read mailbox settings
- `OnlineMeetings.Read.All` - Read online meeting details
- `OnlineMeetingTranscript.Read.All` - Read meeting transcripts
- `Files.ReadWrite.All` - Read/write files (for document embedding)
- `Sites.ReadWrite.All` - Read/write SharePoint sites
- `Tasks.ReadWrite` - Read/write Planner tasks

**Delegated Permissions:**
- `User.Read` - Sign in and read user profile

### Create the App

```bash
# Create the app registration
az ad app create --display-name "Review Bot" \
  --required-resource-accesses @aad-manifest.json \
  --sign-in-audience AzureADMyOrg

# Get the app ID
$APP_ID = az ad app list --display-name "Review Bot" --query "[0].appId" -o tsv
echo "App ID: $APP_ID"

# Create a service principal
az ad sp create --id $APP_ID

# Create a client secret
$SECRET_RESULT = az ad app credential reset --id $APP_ID --append --query "password" -o tsv
echo "Client Secret: $SECRET_RESULT"
# IMPORTANT: Save this secret - it won't be shown again!

# Grant admin consent
az ad app permission admin-consent --id $APP_ID
```

### Update Configuration

Update `local.settings.json` with:
- `AZURE_CLIENT_ID` = The App ID from above
- `AZURE_CLIENT_SECRET` = The secret from above

Update `teamsApp/manifest.json`:
- Replace `{{APP_ID}}` with the App ID
- Replace `{{BOT_ID}}` with the App ID (same value)

## Step 2: Create Azure Bot Service

```bash
# Set variables
$RESOURCE_GROUP = "rg-review-bot"
$LOCATION = "australiaeast"
$BOT_NAME = "review-bot"
$APP_ID = "<your-app-id>"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Bot
az bot create \
  --resource-group $RESOURCE_GROUP \
  --name $BOT_NAME \
  --kind azurebot \
  --app-type MultiTenant \
  --appid $APP_ID \
  --location global \
  --sku F0
```

## Step 3: Deploy Azure Function App

```bash
# Create storage account
az storage account create \
  --name reviewbotstorage \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

# Create function app
az functionapp create \
  --resource-group $RESOURCE_GROUP \
  --name review-bot-func \
  --storage-account reviewbotstorage \
  --consumption-plan-location $LOCATION \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4

# Configure function app settings
az functionapp config appsettings set \
  --name review-bot-func \
  --resource-group $RESOURCE_GROUP \
  --settings \
    AZURE_TENANT_ID=cc8f25ed-7019-48b7-ba94-2b54a35a42aa \
    AZURE_CLIENT_ID=$APP_ID \
    AZURE_CLIENT_SECRET=$SECRET_RESULT \
    REVIEW_USER_ID=7842a177-7164-464e-9563-c1de1d3f985e \
    REVIEW_UPN=review@NETORGFT18200403.onmicrosoft.com

# Enable managed identity
az functionapp identity assign \
  --name review-bot-func \
  --resource-group $RESOURCE_GROUP
```

## Step 4: Build and Deploy

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to Azure Functions
func azure functionapp publish review-bot-func
```

## Step 5: Configure Graph Subscription

After deployment, create a subscription for calendar events:

```bash
# The notification URL will be your function app URL
$NOTIFICATION_URL = "https://review-bot-func.azurewebsites.net/api/listener"

# Create subscription via Graph API (use Graph Explorer or code)
```

## Step 6: Deploy Teams App

1. Open Teams Toolkit in VS Code
2. Update manifest with correct App ID
3. Deploy the Teams app package
4. Install the app in your Teams tenant

## Step 7: Test

1. Create a Teams meeting in Outlook or Teams
2. Add `review@NETORGFT18200403.onmicrosoft.com` to the attendees
3. The bot should receive a notification
4. After the meeting, the bot will process the transcript and embed outcomes

## Troubleshooting

### Check Function Logs
```bash
func azure functionapp logstream review-bot-func
```

### Check App Insights
```bash
az monitor app-insights query \
  --app review-bot-insights \
  --analytics-query "traces | order by timestamp desc | limit 20"
```

### Test Graph Connection
Use the Azure portal's "Graph Explorer" to test API calls with your app's credentials.

