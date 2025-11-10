# Review Bot Configuration

## Mailbox Setup

**User Principal Name:** `review@NETORGFT18200403.onmicrosoft.com`  
**Display Name:** Review  
**Object ID:** `7842a177-7164-464e-9563-c1de1d3f985e`  
**Status:** Active (pre-existing user)

### Email Aliases

To enable `review@tailorco.au` as an email address:
1. Navigate to Microsoft 365 Admin Center → Users → Active users
2. Select the "Review" user
3. Under "Email aliases", add: `review@tailorco.au`
4. Set as primary if desired

## Azure Tenant Information

**Tenant ID:** `cc8f25ed-7019-48b7-ba94-2b54a35a42aa`  
**Tenant Display Name:** tailorco.au  
**Default Domain:** NETORGFT18200403.onmicrosoft.com  
**Subscription:** TAILOR (`5745cb5e-8c39-470f-ab6f-8a5897b7f9af`)

## Environment Variables

Create a `.env` file with the following:

```bash
AZURE_TENANT_ID=cc8f25ed-7019-48b7-ba94-2b54a35a42aa
AZURE_SUBSCRIPTION_ID=5745cb5e-8c39-470f-ab6f-8a5897b7f9af
REVIEW_USER_ID=7842a177-7164-464e-9563-c1de1d3f985e
REVIEW_UPN=review@NETORGFT18200403.onmicrosoft.com
```

## Azure AD App Registration

**App Name:** Review Bot  
**Application (client) ID:** `3e18cba3-f774-4557-bba8-c6633656fb12`  
**Object ID:** `140a0350-6dea-4eb2-a735-6e1dcd4abe4b`  
**Service Principal ID:** `9979a541-6d6c-4d24-82a6-bc6c77ac7943`  
**Client Secret:** ⚠️ **Stored securely - see local.settings.json (not in git)**

### Admin Consent Status

✅ **Admin consent has been granted** - All permissions are now active and the bot can access Microsoft Graph APIs.

### Required Permissions
- Calendars.Read
- Calendars.ReadWrite
- MailboxSettings.Read
- OnlineMeetings.Read.All
- OnlineMeetingTranscript.Read.All
- Files.ReadWrite.All
- Sites.ReadWrite.All
- Tasks.ReadWrite
- User.Read (Delegated)

## Deployment Status

1. ✅ Azure AD app created
2. ✅ Admin consent granted
3. ⏳ **Next:** Deploy Azure infrastructure (Function App, Bot Service, Storage)
4. ⏳ Deploy bot code
5. ⏳ Configure mailbox change notification subscription

## Quick Deployment Commands

```bash
# 1. Set GitHub secrets (one-time setup)
gh secret set AZURE_SUBSCRIPTION_ID --body "5745cb5e-8c39-470f-ab6f-8a5897b7f9af"
gh secret set AZURE_TENANT_ID --body "cc8f25ed-7019-48b7-ba94-2b54a35a42aa"
gh secret set BOT_APP_ID --body "3e18cba3-f774-4557-bba8-c6633656fb12"
gh secret set REVIEW_USER_ID --body "7842a177-7164-464e-9563-c1de1d3f985e"
gh secret set REVIEW_UPN --body "review@NETORGFT18200403.onmicrosoft.com"
gh secret set BOT_APP_SECRET  # Paste the secret when prompted

# 2. Create service principal for GitHub Actions
az ad sp create-for-rbac --name "github-review-bot" \
  --role contributor \
  --scopes /subscriptions/5745cb5e-8c39-470f-ab6f-8a5897b7f9af \
  --sdk-auth | gh secret set AZURE_CREDENTIALS

# 3. Deploy infrastructure (via PowerShell)
cd infra
.\deploy.ps1

# 4. Deploy code (automatic on push to master, or manually)
npm install
npm run build
func azure functionapp publish review-bot-dev-func
```

