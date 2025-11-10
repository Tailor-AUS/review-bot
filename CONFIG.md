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

### Grant Admin Consent (Required)

Permissions have been requested but need manual admin consent:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: Azure Active Directory → App registrations → Review Bot
3. Select "API permissions"
4. Click "Grant admin consent for tailorco.au"
5. Confirm the consent

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

## Next Steps

1. ✅ Azure AD app created
2. ⚠️ Grant admin consent via Azure Portal
3. Create Azure infrastructure (Function App, Bot Service, Storage)
4. Deploy bot code
5. Configure mailbox change notification subscription

