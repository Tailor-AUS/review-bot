# GitHub Secrets Configuration

The following secrets need to be configured in your GitHub repository for the CI/CD pipelines to work.

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

## Required Secrets

### `AZURE_CREDENTIALS`

Azure Service Principal credentials in JSON format for GitHub Actions to authenticate with Azure.

**To create:**

```bash
az ad sp create-for-rbac --name "github-review-bot" \
  --role contributor \
  --scopes /subscriptions/5745cb5e-8c39-470f-ab6f-8a5897b7f9af/resourceGroups/rg-review-bot \
  --sdk-auth
```

Copy the entire JSON output and paste it as the secret value.

**Example format:**
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "5745cb5e-8c39-470f-ab6f-8a5897b7f9af",
  "tenantId": "cc8f25ed-7019-48b7-ba94-2b54a35a42aa",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### `AZURE_SUBSCRIPTION_ID`
```
5745cb5e-8c39-470f-ab6f-8a5897b7f9af
```

### `AZURE_TENANT_ID`
```
cc8f25ed-7019-48b7-ba94-2b54a35a42aa
```

### `BOT_APP_ID`
```
3e18cba3-f774-4557-bba8-c6633656fb12
```

### `BOT_APP_SECRET`

The client secret created for the Review Bot app registration.  
This was generated earlier - retrieve it from your secure storage or create a new one:

```bash
az ad app credential reset --id 3e18cba3-f774-4557-bba8-c6633656fb12 --append --query "password" -o tsv
```

### `REVIEW_USER_ID`
```
7842a177-7164-464e-9563-c1de1d3f985e
```

### `REVIEW_UPN`
```
review@NETORGFT18200403.onmicrosoft.com
```

## Quick Setup Script

Run this from the review-bot directory to set all secrets via GitHub CLI:

```bash
# Make sure you're logged in to GitHub CLI
gh auth status

# Set each secret
gh secret set AZURE_SUBSCRIPTION_ID --body "5745cb5e-8c39-470f-ab6f-8a5897b7f9af"
gh secret set AZURE_TENANT_ID --body "cc8f25ed-7019-48b7-ba94-2b54a35a42aa"
gh secret set BOT_APP_ID --body "3e18cba3-f774-4557-bba8-c6633656fb12"
gh secret set REVIEW_USER_ID --body "7842a177-7164-464e-9563-c1de1d3f985e"
gh secret set REVIEW_UPN --body "review@NETORGFT18200403.onmicrosoft.com"

# For BOT_APP_SECRET - enter it interactively (paste when prompted)
gh secret set BOT_APP_SECRET

# For AZURE_CREDENTIALS - create and set in one command
az ad sp create-for-rbac --name "github-review-bot" \
  --role contributor \
  --scopes /subscriptions/5745cb5e-8c39-470f-ab6f-8a5897b7f9af/resourceGroups/rg-review-bot \
  --sdk-auth | gh secret set AZURE_CREDENTIALS
```

## Verify Secrets

After setting up, verify all secrets are configured:

```bash
gh secret list
```

You should see all 7 secrets listed.

