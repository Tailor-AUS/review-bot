# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Review Bot.

## Workflows Overview

### 🚀 `teams-agent-deploy.yml` - **Deploy Teams Agent (Full Stack)**

**Use this for:** Initial deployment or when updating infrastructure

**What it does:**
- ✅ Validates all required secrets are configured
- ✅ Deploys/updates Azure infrastructure (Function App, Bot Service, Storage, App Insights)
- ✅ Builds and deploys bot code
- ✅ Provides post-deployment instructions

**Trigger:** Manual (workflow_dispatch)

**Options:**
- Choose environment: `dev`, `staging`, or `prod`
- Toggle infrastructure deployment on/off
- Toggle code deployment on/off

**When to use:**
- First-time deployment
- Adding/updating Azure resources
- Full redeployment after major changes
- Deploying to new environments

**Example:**
```
GitHub → Actions → "Deploy Teams Agent (Full Stack)" → Run workflow
  Environment: dev
  Deploy infrastructure: ✓
  Deploy code: ✓
```

---

### ⚡ `deploy.yml` - **Auto-Deploy Code (Fast)**

**Use this for:** Quick code updates during development

**What it does:**
- ✅ Automatically deploys code changes when pushed to master
- ✅ Fast deployment (2-3 minutes)
- ✅ Only updates Function App code (no infrastructure changes)

**Trigger:** 
- Automatic on push to `master` or `main` branches
- Only triggers when code files change (`src/**`, `package.json`, etc.)
- Manual via workflow_dispatch

**When to use:**
- Day-to-day development
- Bug fixes
- Code updates that don't require infrastructure changes
- Iterating on bot logic

**Example:**
```bash
# Make code changes
git add src/
git commit -m "Fix meeting processor logic"
git push origin master
# Automatically deploys!
```

---

### 🏗️ `infrastructure.yml` - **Deploy Infrastructure** (Deprecated)

**Status:** ⚠️ Use `teams-agent-deploy.yml` instead

This workflow only deploys infrastructure. The new `teams-agent-deploy.yml` supersedes it by offering both infrastructure and code deployment with better control.

---

## Workflow Comparison

| Feature | Auto-Deploy Code | Teams Agent Deploy |
|---------|-----------------|-------------------|
| **Trigger** | Automatic on push | Manual |
| **Speed** | 2-3 minutes | 5-8 minutes |
| **Infrastructure** | ❌ No | ✅ Yes (optional) |
| **Code** | ✅ Yes | ✅ Yes (optional) |
| **Validation** | Basic | Comprehensive |
| **Post-deploy steps** | ❌ No | ✅ Yes |
| **Environment choice** | dev only | dev/staging/prod |

---

## Deployment Workflow

### First Time Setup

1. **Configure GitHub Secrets** (one-time)
   ```bash
   gh secret set AZURE_CREDENTIALS --body "$(az ad sp create-for-rbac --sdk-auth)"
   gh secret set BOT_APP_SECRET
   gh secret set AZURE_SUBSCRIPTION_ID --body "..."
   # ... (see GITHUB_SECRETS.md)
   ```

2. **Run Full Deployment**
   - Go to: GitHub → Actions → "Deploy Teams Agent (Full Stack)"
   - Click: "Run workflow"
   - Select: `dev` environment
   - Enable: Both infrastructure and code
   - Click: "Run workflow"

3. **Wait for completion** (~5-8 minutes)

4. **Follow post-deployment steps** shown in the workflow output

### Day-to-Day Development

1. **Make code changes**
   ```bash
   git checkout -b feature/my-improvement
   # ... make changes ...
   git commit -m "Improve outcome extraction"
   git push origin feature/my-improvement
   ```

2. **Merge to master**
   - Create PR → Merge to master
   - Auto-deploy triggers automatically

3. **Monitor deployment**
   - GitHub Actions tab shows progress
   - Check Application Insights for logs

### Infrastructure Updates

When you need to add/change Azure resources:

1. **Update Bicep files**
   ```bash
   # Edit infra/main.bicep
   git add infra/
   git commit -m "Add Azure OpenAI resource"
   git push
   ```

2. **Run Full Deployment**
   - GitHub → Actions → "Deploy Teams Agent (Full Stack)"
   - Enable infrastructure deployment
   - Run workflow

---

## Required GitHub Secrets

All workflows require these secrets:

| Secret | Description | Example |
|--------|-------------|---------|
| `AZURE_CREDENTIALS` | Service principal JSON | `{"clientId":"..."}` |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription GUID | `5745cb5e...` |
| `AZURE_TENANT_ID` | Azure AD tenant GUID | `cc8f25ed...` |
| `BOT_APP_ID` | App registration ID | `3e18cba3...` |
| `BOT_APP_SECRET` | App client secret | `PFr8Q~...` |
| `REVIEW_USER_ID` | Mailbox user object ID | `7842a177...` |
| `REVIEW_UPN` | Mailbox UPN | `review@...` |

See [GITHUB_SECRETS.md](../../GITHUB_SECRETS.md) for setup instructions.

---

## Monitoring Deployments

### View Logs in GitHub
```
GitHub → Actions → [Workflow run] → Click on job → View logs
```

### View Logs in Azure
```bash
# Stream function logs
func azure functionapp logstream review-bot-dev-func

# Query Application Insights
az monitor app-insights query \
  --app review-bot-dev-insights \
  --analytics-query "traces | order by timestamp desc | limit 50"
```

### Check Deployment Status
```bash
# List deployments
az deployment group list --resource-group rg-review-bot

# Check function app status
az functionapp show --name review-bot-dev-func --resource-group rg-review-bot
```

---

## Troubleshooting

### Deployment fails with "secret not found"
- Verify all secrets are set: `gh secret list`
- Re-create missing secrets: `gh secret set SECRET_NAME`

### Infrastructure deployment fails
- Check Azure subscription has sufficient quota
- Verify service principal has Contributor role
- Check Bicep syntax: `az bicep build --file infra/main.bicep`

### Code deployment succeeds but bot doesn't respond
- Check function app logs for errors
- Verify admin consent is granted
- Test Graph API connectivity
- Ensure webhook notification URL is correct

---

## Best Practices

1. **Use feature branches** for development
2. **Test locally** before pushing (use `func start`)
3. **Review deployment logs** after each run
4. **Monitor Application Insights** for runtime errors
5. **Update secrets** when they expire (client secrets expire after 1-2 years)

---

For more details, see:
- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Full deployment guide
- [GITHUB_SECRETS.md](../../GITHUB_SECRETS.md) - Secrets setup
- [SETUP.md](../../SETUP.md) - Configuration reference

