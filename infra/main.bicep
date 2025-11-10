// Main infrastructure deployment for Review Bot
@description('Environment name (e.g., dev, staging, prod)')
param environmentName string = 'dev'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Azure AD App Client ID')
param botAppId string

@secure()
@description('Azure AD App Client Secret')
param botAppSecret string

@description('Review mailbox user ID')
param reviewUserId string

@description('Review mailbox UPN')
param reviewUpn string

@description('Azure tenant ID')
param tenantId string

// Variables
var resourcePrefix = 'review-bot-${environmentName}'
var storageAccountName = replace('${resourcePrefix}storage', '-', '')
var functionAppName = '${resourcePrefix}-func'
var appInsightsName = '${resourcePrefix}-insights'
var botServiceName = '${resourcePrefix}-bot'
var appServicePlanName = '${resourcePrefix}-plan'

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
}

// App Service Plan (Consumption)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: true // Linux
  }
}

// Function App
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|18'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(functionAppName)
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'AZURE_TENANT_ID'
          value: tenantId
        }
        {
          name: 'AZURE_CLIENT_ID'
          value: botAppId
        }
        {
          name: 'AZURE_CLIENT_SECRET'
          value: botAppSecret
        }
        {
          name: 'REVIEW_USER_ID'
          value: reviewUserId
        }
        {
          name: 'REVIEW_UPN'
          value: reviewUpn
        }
        {
          name: 'BOT_ID'
          value: botAppId
        }
        {
          name: 'BOT_PASSWORD'
          value: botAppSecret
        }
      ]
      cors: {
        allowedOrigins: [
          'https://portal.azure.com'
        ]
      }
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
    }
  }
}

// Azure Bot Service
resource botService 'Microsoft.BotService/botServices@2023-09-15-preview' = {
  name: botServiceName
  location: 'global'
  kind: 'azurebot'
  sku: {
    name: 'F0'
  }
  properties: {
    displayName: 'Review Bot'
    description: 'Automatically captures meeting outcomes and embeds them in documents'
    endpoint: 'https://${functionApp.properties.defaultHostName}/api/messages'
    msaAppId: botAppId
    msaAppType: 'MultiTenant'
    msaAppTenantId: tenantId
    luisAppIds: []
    schemaTransformationVersion: '1.3'
    isCmekEnabled: false
    iconUrl: 'https://docs.botframework.com/static/devportal/client/images/bot-framework-default.png'
  }
}

// Bot Service Teams Channel
resource teamsChannel 'Microsoft.BotService/botServices/channels@2023-09-15-preview' = {
  parent: botService
  name: 'MsTeamsChannel'
  location: 'global'
  properties: {
    channelName: 'MsTeamsChannel'
    properties: {
      isEnabled: true
      enableCalling: false
      incomingCallRoute: null
      deploymentEnvironment: 'Commercial'
      acceptedTerms: true
    }
  }
}

// Outputs
output functionAppName string = functionApp.name
output functionAppHostName string = functionApp.properties.defaultHostName
output functionAppPrincipalId string = functionApp.identity.principalId
output botServiceName string = botService.name
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output storageAccountName string = storageAccount.name

