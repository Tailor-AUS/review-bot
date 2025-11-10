# Review Bot - User Guide

Welcome! This guide shows you how to use Review Bot to automatically capture and document meeting outcomes.

## What is Review Bot?

Review Bot is your intelligent meeting assistant that:
- 📝 Captures decisions and action items from your Teams meetings
- 🤖 Automatically summarizes key outcomes
- 📄 Embeds results directly into your project documents
- ✅ Creates tasks in Microsoft Planner
- 💬 Posts a recap in the meeting chat

## How to Use Review Bot

### Method 1: CC the Bot on Meeting Invites (Easiest!)

1. **Create a Teams meeting** in Outlook or Teams Calendar
2. **Add review@tailorco.au to the attendees** (To or CC line)
3. **That's it!** The bot will automatically:
   - Join or monitor your meeting
   - Process the transcript after the meeting ends
   - Extract decisions, tasks, and action items
   - Post a summary in the meeting chat

### Method 2: Install the Teams App

1. Open Microsoft Teams
2. Go to **Apps**
3. Search for **"Review Bot"**
4. Click **Add**
5. The bot will now be available in your chats

## What Review Bot Captures

### ✅ Decisions
Statements like:
- "We decided to launch on January 5th"
- "The budget is approved"
- "We'll go with option B"

### 📋 Tasks
Action items with assignees:
- "Alice will prepare the launch materials by December 30"
- "Bob owns the rollout"
- "Sarah to finalize the design by next week"

### 🎯 Action Items
Follow-up items:
- "Schedule a follow-up meeting"
- "Send the report to stakeholders"
- "Review the feedback by Friday"

## Example Workflow

### Before the Meeting
```
From: knox.hart@tailorco.au
To: team@tailorco.au, review@tailorco.au
Subject: Q1 Planning Meeting
```

### During the Meeting
Review Bot listens quietly in the background (or processes the transcript afterward).

### After the Meeting
You receive an Adaptive Card in the Teams meeting chat:

```
✅ Meeting Outcomes Captured

Q1 Planning Meeting

Decisions Made:
• Launch date set for January 5th
• Budget approved for Q1

Action Items:
• Alice to own the rollout
• Schedule follow-up meeting for Dec 20

Tasks Created:
• Prepare launch materials (Alice) - Due: 2025-01-03
• Finalize rollout plan (Bob) - Due: 2024-12-30

Summary:
Key outcomes from today's planning session...

[View Document] [View in Planner]
```

## Where Outcomes Are Saved

Review Bot can embed outcomes in:

- **Word Documents** - Adds a "Meeting Outcomes" section
- **SharePoint Pages** - Appends outcomes to the page
- **Loop Components** - Updates live Loop content
- **Microsoft Planner** - Creates tasks with due dates and assignees

## Tips for Best Results

### During Meetings

✅ **DO:**
- Clearly state decisions: "We decided to..."
- Assign ownership: "Alice will handle..."
- Mention deadlines: "...by December 30"
- Speak naturally - the AI understands context

❌ **DON'T:**
- Worry about special keywords or commands
- Try to "game" the system with formatted text
- Expect perfect accuracy - review the summary

### After Meetings

1. **Review the summary** in the meeting chat
2. **Edit outcomes** in the target document if needed
3. **Check Planner** for created tasks
4. **Assign additional details** (priority, tags, etc.)

## Troubleshooting

### The bot didn't join my meeting

**Check:**
- Was `review@tailorco.au` added to the meeting invite?
- Is the meeting a Teams meeting (not just a calendar event)?
- Did the meeting already end before the bot was added?

**Solution:**
Add the bot before the meeting starts or during the meeting.

### No outcomes were captured

**Possible reasons:**
- The meeting had no transcript (recording/transcription disabled)
- The conversation was too short or informal
- Technical issues with transcript access

**Solution:**
Ensure meeting transcription is enabled in Teams settings.

### Outcomes are inaccurate

**What to do:**
- Review Bot uses AI and may misinterpret context
- **Always review and edit** the outcomes in your document
- Provide feedback to help improve accuracy

### The bot isn't responding

**Check:**
1. Is the bot service running? (Admin can check Azure portal)
2. Are there any Microsoft 365 service issues?
3. Has admin consent been granted for the app?

**Contact your IT admin** if issues persist.

## Privacy and Security

- ✅ Review Bot only accesses meetings it's invited to
- ✅ All data stays within your Microsoft 365 tenant
- ✅ Transcripts are processed securely via Azure OpenAI
- ✅ No meeting content is stored permanently
- ✅ Complies with your organization's data policies

## Support

### For Users
Contact your IT admin or Teams administrator.

### For Admins
- 📖 [Deployment Guide](./DEPLOYMENT.md)
- 🔧 [Setup Instructions](./SETUP.md)
- 📝 [Configuration](./CONFIG.md)
- 🐛 Check Application Insights logs in Azure Portal

## Feedback

Found a bug or have a feature request?  
Open an issue on [GitHub](https://github.com/Tailor-AUS/review-bot/issues).

---

**Happy meeting documenting! 🎉**

