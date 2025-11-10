# Review Bot - Teams CC-The-Bot Agent

A Microsoft Teams bot that activates when `review@tailor.au` is CC'd on a meeting invite.

## Overview

This bot:
- Monitors the `review@tailor.au` mailbox for meeting invitations
- Joins or monitors Teams meetings
- Extracts and summarizes meeting outcomes (decisions, tasks, action items)
- Embeds outcomes directly into the target document (Word, Loop, SharePoint)
- Posts a recap Adaptive Card in the meeting chat

## Architecture

Built with:
- Azure Functions (TypeScript)
- Microsoft Teams AI Library
- Microsoft Graph API
- Azure OpenAI

## Setup

See [Blueprint.md](../blueprint.md) for detailed implementation instructions.

## Usage

Simply add `review@tailor.au` to any Teams meeting invite. The bot will automatically:
1. Join the meeting
2. Capture decisions and outcomes
3. Write them back to the project document
4. Post a confirmation in the meeting chat

## Development

Prerequisites:
- Azure CLI
- GitHub CLI  
- Teams Toolkit CLI
- Node.js LTS

```bash
# Install dependencies
npm install

# Deploy to Azure
teamsfx deploy --env dev
```

## License

© 2025 Tailor-App Team

