# Review Bot - Teams CC-The-Bot Agent

> 🤖 **Automatically capture meeting outcomes and embed them in your documents**

A Microsoft Teams bot that activates when `review@tailorco.au` is CC'd on a meeting invite.

[![Deploy](https://github.com/Tailor-AUS/review-bot/actions/workflows/deploy.yml/badge.svg)](https://github.com/Tailor-AUS/review-bot/actions/workflows/deploy.yml)
[![Infrastructure](https://github.com/Tailor-AUS/review-bot/actions/workflows/infrastructure.yml/badge.svg)](https://github.com/Tailor-AUS/review-bot/actions/workflows/infrastructure.yml)

## 🎯 What It Does

Review Bot is your intelligent meeting assistant that:

- 📝 **Captures decisions and action items** from Teams meetings
- 🤖 **Automatically summarizes** key outcomes using Azure OpenAI
- 📄 **Embeds results** directly into Word, SharePoint, or Loop
- ✅ **Creates tasks** in Microsoft Planner with assignees and due dates
- 💬 **Posts a recap** Adaptive Card in the meeting chat

## 🚀 Quick Start

### For End Users

**Just CC the bot on your meeting invite:**

```
To: team@tailorco.au
CC: review@tailorco.au
Subject: Q1 Planning Meeting
```

That's it! See [User Guide](./USER_GUIDE.md) for details.

### For Administrators

1. **Prerequisites:** Azure CLI, GitHub CLI, Node.js 18+
2. **Deploy:** Follow [Deployment Guide](./DEPLOYMENT.md)
3. **Configure:** Set up GitHub Secrets per [GITHUB_SECRETS.md](./GITHUB_SECRETS.md)

## 📋 Documentation

| Document | Description |
|----------|-------------|
| [**User Guide**](./USER_GUIDE.md) | How to use the bot as an end user |
| [**Deployment Guide**](./DEPLOYMENT.md) | Step-by-step deployment instructions |
| [**Setup Guide**](./SETUP.md) | Detailed setup and configuration |
| [**Configuration**](./CONFIG.md) | Environment and infrastructure details |
| [**GitHub Secrets**](./GITHUB_SECRETS.md) | CI/CD secrets configuration |

## 🏗️ Architecture

Built with modern Azure cloud-native technologies:

```
Teams Meeting (with review@tailorco.au invited)
    ↓
📧 Graph API Change Notification
    ↓
⚡ Azure Function (listener.ts)
    ↓
📊 Process meeting & transcript
    ↓
🤖 Azure OpenAI (summarize outcomes)
    ↓
📝 Write to Word/SharePoint/Loop via Graph API
    ↓
💬 Post Adaptive Card to Teams chat
```

**Tech Stack:**
- Azure Functions (Node.js 18, TypeScript)
- Microsoft Graph API
- Azure Bot Service
- Azure OpenAI (GPT-4)
- Application Insights
- Bicep (Infrastructure as Code)

## 🔐 Security & Compliance

- ✅ All data stays within your Microsoft 365 tenant
- ✅ Uses managed identity and Azure AD authentication
- ✅ Encrypted connections (HTTPS, TLS 1.2+)
- ✅ No permanent storage of meeting content
- ✅ Admin-controlled permissions via Azure AD
- ✅ Complies with organizational data policies

## 🛠️ Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/Tailor-AUS/review-bot.git
cd review-bot

# Install dependencies
npm install

# Copy and configure local settings
cp local.settings.json.example local.settings.json
# Edit local.settings.json with your values

# Build the project
npm run build

# Start the function app locally
func start
```

### Deploy to Azure

```bash
# Via GitHub Actions (recommended)
git push origin master

# Or manually
npm run build
func azure functionapp publish review-bot-dev-func
```

## 📊 Monitoring

View logs and telemetry in Azure:

```bash
# Stream function logs
func azure functionapp logstream review-bot-dev-func

# Query Application Insights
az monitor app-insights query \
  --app review-bot-dev-insights \
  --analytics-query "traces | order by timestamp desc | limit 50"
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

© 2025 Tailor-App Team. All rights reserved.

## 🆘 Support

- **Users:** See [User Guide](./USER_GUIDE.md) or contact your IT admin
- **Admins:** Check [Deployment Guide](./DEPLOYMENT.md) or open an [issue](https://github.com/Tailor-AUS/review-bot/issues)
- **Bugs:** Report via [GitHub Issues](https://github.com/Tailor-AUS/review-bot/issues)

---

**Made with ❤️ by the Tailor team**

