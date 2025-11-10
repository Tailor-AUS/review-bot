# Troubleshooting: Bot Not Receiving Meeting Notifications

## 🔍 Diagnosis

When you added `review@NETORGFT18200403.onmicrosoft.com` to the meeting, the invitation was sent correctly (as shown by "Review" appearing in the attendees list with "Didn't respond: 1").

However, **the bot didn't receive a notification** because:

### Root Cause

The Graph subscription monitors **calendar events**, not **meeting invitations**.

When you add the Review mailbox to a meeting:
1. ✅ Outlook sends an invitation EMAIL
2. ✅ The invitation arrives in the mailbox
3. ❌ **BUT** it's not yet a calendar EVENT (it's pending acceptance)
4. ❌ Since no calendar event was created/updated, no notification was sent

---

## 🔧 Solutions

### Solution 1: Accept the Meeting (Quick Test)

**Manually accept the meeting on behalf of the Review account:**

1. Go to [Outlook Web](https://outlook.office365.com)
2. Sign in as `review@NETORGFT18200403.onmicrosoft.com`
3. Open the meeting invite
4. Click **Accept**
5. This creates a calendar event → triggers notification → bot activates! ✅

---

### Solution 2: Configure Auto-Accept (Recommended)

**Convert the mailbox to a Room/Resource mailbox that auto-accepts:**

This requires admin access. Run in Microsoft 365 Admin Center or Exchange Online PowerShell:

```powershell
# Connect to Exchange Online
Connect-ExchangeOnline

# Convert to room mailbox (auto-accepts meetings)
Set-Mailbox review@NETORGFT18200403.onmicrosoft.com -Type Room

# Configure auto-accept settings
Set-CalendarProcessing review@NETORGFT18200403.onmicrosoft.com `
    -AutomateProcessing AutoAccept `
    -AddOrganizerToSubject $false `
    -DeleteComments $false `
    -DeleteSubject $false `
    -RemovePrivateProperty $false
```

**After this:** Meeting invites will be automatically accepted, creating calendar events that trigger the bot!

---

### Solution 3: Monitor Messages Instead (Alternative Approach)

**Add Mail.Read permission and subscribe to messages:**

1. ✅ I've already added `Mail.Read.All` permission
2. ⚠️ **You need to grant admin consent again** in Azure Portal:
   - Go to Azure Portal → Azure AD → App registrations → Review Bot
   - API permissions → Grant admin consent for tailorco.au

3. Then create the messages subscription:
```powershell
cd "C:\Users\knoxh\Documents\CUSOR - AGENTS\MS AGENT\tailor-app\review-bot"

# Use the script which prompts for the secret
$env:BOT_APP_SECRET = "<your-bot-secret>"
.\scripts\create-subscription.ps1
```

4. Update the listener function to handle message notifications

---

## ✅ Recommended Approach: Solution 2 (Auto-Accept)

**Why this is best:**
- ✅ No code changes needed
- ✅ Meetings automatically accepted
- ✅ Works with existing calendar event subscription
- ✅ Standard pattern for bot/resource mailboxes
- ✅ One-time setup

**Steps:**

1. **Admin runs** (via Exchange Online PowerShell or M365 Admin Center):
   ```powershell
   Set-Mailbox review@NETORGFT18200403.onmicrosoft.com -Type Room
   Set-CalendarProcessing review@NETORGFT18200403.onmicrosoft.com -AutomateProcessing AutoAccept
   ```

2. **Test immediately:**
   - Create a new meeting
   - Add review@NETORGFT18200403.onmicrosoft.com
   - It will auto-accept ✅
   - Calendar event created → notification sent → bot activates! 🎉

---

## 🧪 Testing After Fix

Run this to monitor for notifications:

```powershell
cd "C:\Users\knoxh\Documents\CUSOR - AGENTS\MS AGENT\tailor-app\review-bot"
.\scripts\monitor-live.ps1
```

Then create a meeting and add the bot. You should see:
```
🎉 NOTIFICATION RECEIVED! (+1 executions)
Timestamp: 16:45:23
```

---

## 📊 Current Status

| Item | Status | Notes |
|------|--------|-------|
| Function App | ✅ Running | review-bot-dev-func |
| Functions Deployed | ✅ 2/2 | listener, joinMeeting |
| Calendar Subscription | ✅ Active | ID: 892eb986-8546-4ed7-a8cf-9a4ca8c74025 |
| Messages Subscription | ❌ Needs Mail.Read | Permission added, needs consent |
| Mailbox Type | ⚠️ User mailbox | Should be Room/Resource |
| Auto-Accept | ❌ Not configured | **This is the fix needed** |

---

## 🎯 Action Required

**OPTION A: Quick Test (Manual Accept)**
- Accept the "test 1" meeting in Outlook as the Review user
- Bot should trigger immediately

**OPTION B: Permanent Fix (Auto-Accept)** ⭐ RECOMMENDED
- Run the Exchange Online commands above
- All future meetings auto-accept
- Bot triggers automatically

**OPTION C: Alternative Approach (Messages)**
- Grant admin consent for Mail.Read.All (I added it)
- Use subscription-messages.json approach
- Requires listener function update

---

**Which solution would you like to implement?**

