import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { DefaultAzureCredential } from '@azure/identity';

/**
 * Creates and returns a Microsoft Graph client
 * Uses DefaultAzureCredential which works with managed identity in Azure Functions
 */
export function getGraphClient(): Client {
  const credential = new DefaultAzureCredential();
  
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });

  return Client.initWithMiddleware({
    authProvider,
  });
}

/**
 * Get the authenticated user for testing
 */
export async function getMe(client: Client) {
  try {
    return await client.api('/me').get();
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Subscribe to calendar events for a specific user
 */
export async function createCalendarSubscription(
  client: Client,
  userId: string,
  notificationUrl: string
) {
  const subscription = {
    changeType: 'created,updated',
    notificationUrl: notificationUrl,
    resource: `/users/${userId}/events`,
    expirationDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    clientState: 'ReviewBotSecret123',
  };

  try {
    return await client.api('/subscriptions').post(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

