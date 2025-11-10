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

## Next Steps

1. Create Azure AD app registration for bot
2. Grant Graph API permissions
3. Configure mailbox change notification subscription

