import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getGraphClient } from '../lib/graphClient';

/**
 * Azure Function that handles Graph change notifications for calendar events
 * This function is triggered when a new meeting invite arrives at review@tailorco.au mailbox
 */
export async function listener(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Calendar event listener triggered');

  // Handle validation token for subscription setup
  const validationToken = request.query.get('validationToken');
  if (validationToken) {
    context.log('Returning validation token');
    return {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: validationToken,
    };
  }

  try {
    const payload = await request.json() as any;
    context.log('Received notification:', JSON.stringify(payload));

    // Process each notification
    if (payload.value && Array.isArray(payload.value)) {
      for (const notification of payload.value) {
        await processNotification(notification, context);
      }
    }

    return {
      status: 202,
      body: 'Notification processed',
    };
  } catch (error) {
    context.error('Error processing notification:', error);
    return {
      status: 500,
      body: 'Error processing notification',
    };
  }
}

/**
 * Process a single calendar event notification
 */
async function processNotification(
  notification: any,
  context: InvocationContext
) {
  const { changeType, resourceData } = notification;
  
  context.log(`Processing ${changeType} event for resource:`, resourceData?.id);

  if (changeType === 'created' || changeType === 'updated') {
    // Get the full event details
    const graphClient = getGraphClient();
    
    try {
      const event = await graphClient
        .api(`/users/${process.env.REVIEW_USER_ID}/events/${resourceData.id}`)
        .get();

      context.log('Event details:', JSON.stringify(event));

      // Check if this is a Teams meeting
      if (event.isOnlineMeeting && event.onlineMeeting) {
        context.log('Teams meeting detected:', event.onlineMeeting.joinUrl);
        
        // TODO: Trigger meeting join logic
        // For now, just log the meeting details
        context.log('Meeting info:', {
          subject: event.subject,
          start: event.start,
          end: event.end,
          joinUrl: event.onlineMeeting.joinUrl,
          organizer: event.organizer?.emailAddress?.address,
        });
      }
    } catch (error) {
      context.error('Error fetching event details:', error);
    }
  }
}

// Register the function
app.http('listener', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: listener,
});

