import { getGraphClient } from '../lib/graphClient';

/**
 * Automatically accept a meeting invitation
 * This allows the bot to process meetings without manual acceptance
 */
export async function acceptMeetingInvitation(
  eventId: string,
  userId: string
): Promise<boolean> {
  const graphClient = getGraphClient();

  try {
    // Accept the meeting on behalf of the review user
    await graphClient
      .api(`/users/${userId}/events/${eventId}/accept`)
      .post({
        comment: 'Automatically accepted by Review Bot',
        sendResponse: false, // Don't send response email
      });

    console.log(`✅ Meeting accepted: ${eventId}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error accepting meeting:', errorMessage);
    return false;
  }
}

/**
 * Check if an event is a meeting invitation (not yet accepted)
 */
export async function isMeetingInvitation(
  eventId: string,
  userId: string
): Promise<boolean> {
  const graphClient = getGraphClient();

  try {
    const event = await graphClient
      .api(`/users/${userId}/events/${eventId}`)
      .select('responseStatus')
      .get();

    // If response is "notResponded" or "none", it's an invitation
    return event.responseStatus?.response === 'notResponded' || 
           event.responseStatus?.response === 'none';
  } catch (error) {
    console.error('Error checking event status:', error);
    return false;
  }
}

