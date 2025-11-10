# Graph API Subscription Information

## Active Subscription

**Subscription ID:** `c46e8bc4-6cd3-46e3-a4a2-13a7533ecc5b`  
**Created:** 2025-11-10  
**Expires:** 2025-11-17T00:00:00Z  
**Status:** ✅ Active  

### Configuration

- **Change Type:** created, updated
- **Resource:** `/users/7842a177-7164-464e-9563-c1de1d3f985e/events`
- **Notification URL:** https://review-bot-dev-func.azurewebsites.net/api/listener
- **Client State:** ReviewBotSecret123

## How It Works

When a meeting invite is sent to `review@NETORGFT18200403.onmicrosoft.com`:
1. Calendar event is created in the mailbox
2. Graph API detects the change
3. Graph sends webhook POST to our listener function
4. Listener processes the event and triggers meeting processing

## Renewing the Subscription

Subscriptions expire after 7 days. To renew:

```powershell
# From the review-bot directory
.\scripts\create-subscription.ps1
```

Or manually via Graph API:

```bash
PATCH https://graph.microsoft.com/v1.0/subscriptions/c46e8bc4-6cd3-46e3-a4a2-13a7533ecc5b
{
  "expirationDateTime": "2025-11-24T00:00:00Z"
}
```

## Viewing Subscription

```bash
az rest --method GET --url "https://graph.microsoft.com/v1.0/subscriptions/c46e8bc4-6cd3-46e3-a4a2-13a7533ecc5b"
```

## Deleting Subscription

```bash
az rest --method DELETE --url "https://graph.microsoft.com/v1.0/subscriptions/c46e8bc4-6cd3-46e3-a4a2-13a7533ecc5b"
```

## Testing the Bot

### Create a Test Meeting

1. Open Outlook or Teams Calendar
2. Create a new Teams meeting
3. Add `review@NETORGFT18200403.onmicrosoft.com` as an attendee
4. Save the meeting

### Monitor Notifications

```bash
# Stream function logs
func azure functionapp logstream review-bot-dev-func

# Or via Azure CLI
az functionapp log tail --name review-bot-dev-func --resource-group rg-review-bot
```

### Check Logs

```bash
# Check recent traces
az monitor app-insights query \
  --app review-bot-dev-insights \
  --analytics-query "traces | where timestamp > ago(1h) | order by timestamp desc | take 50"
```

## Troubleshooting

### Subscription Not Receiving Notifications

1. **Check subscription status:**
   ```bash
   az rest --method GET --url "https://graph.microsoft.com/v1.0/subscriptions/c46e8bc4-6cd3-46e3-a4a2-13a7533ecc5b"
   ```

2. **Test endpoint manually:**
   ```bash
   curl "https://review-bot-dev-func.azurewebsites.net/api/listener?validationToken=test"
   ```

3. **Check function app logs** for any errors

### Subscription Expired

Subscriptions expire after 7 days. Create a new one using the script above.

