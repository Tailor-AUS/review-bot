import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getGraphClient } from '../lib/graphClient';

/**
 * Azure Function to join or process a Teams meeting
 * This can be called directly or triggered by the listener function
 */
export async function joinMeeting(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Join meeting function triggered');

  try {
    const body = await request.json() as any;
    const { meetingUrl, eventId } = body;

    if (!meetingUrl && !eventId) {
      return {
        status: 400,
        body: 'Missing meetingUrl or eventId parameter',
      };
    }

    context.log('Processing meeting:', { meetingUrl, eventId });

    // Strategy 1: Post-meeting transcript processing (simpler, no live join required)
    if (eventId) {
      const result = await processPostMeeting(eventId, context);
      return {
        status: 200,
        jsonBody: result,
      };
    }

    // Strategy 2: Live meeting join (requires Azure Communication Services)
    // This is more complex and requires additional setup
    if (meetingUrl) {
      return {
        status: 501,
        body: 'Live meeting join not yet implemented. Use post-meeting transcript processing.',
      };
    }

    return {
      status: 400,
      body: 'Invalid request',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    context.error('Error in joinMeeting:', error);
    return {
      status: 500,
      body: `Error: ${errorMessage}`,
    };
  }
}

/**
 * Process a meeting after it has ended by fetching the transcript
 */
async function processPostMeeting(eventId: string, context: InvocationContext) {
  const graphClient = getGraphClient();

  try {
    // Get the event details
    const event = await graphClient
      .api(`/users/${process.env.REVIEW_USER_ID}/events/${eventId}`)
      .get();

    context.log('Event retrieved:', event.subject);

    // Get the online meeting ID from the event
    const onlineMeetingId = event.onlineMeeting?.joinUrl?.match(/\/(\d+:\w+@\w+)$/)?.[1];

    if (!onlineMeetingId) {
      context.warn('Could not extract online meeting ID from:', event.onlineMeeting?.joinUrl);
      return {
        success: false,
        message: 'Not a valid Teams meeting',
      };
    }

    // Try to get the meeting transcript
    // Note: This requires the OnlineMeetingTranscript.Read.All permission
    try {
      const transcripts = await graphClient
        .api(`/users/${event.organizer.emailAddress.address}/onlineMeetings/${onlineMeetingId}/transcripts`)
        .get();

      context.log('Transcripts found:', transcripts.value?.length || 0);

      if (transcripts.value && transcripts.value.length > 0) {
        const transcriptId = transcripts.value[0].id;
        
        // Get transcript content
        const transcriptContent = await graphClient
          .api(`/users/${event.organizer.emailAddress.address}/onlineMeetings/${onlineMeetingId}/transcripts/${transcriptId}/content`)
          .get();

        context.log('Transcript retrieved');

        return {
          success: true,
          eventId,
          subject: event.subject,
          transcript: transcriptContent,
          message: 'Transcript retrieved successfully',
        };
      }
    } catch (transcriptError) {
      const errorMessage = transcriptError instanceof Error ? transcriptError.message : 'Unknown error';
      context.warn('Could not fetch transcript:', errorMessage);
    }

    // Fallback: Return meeting metadata without transcript
    return {
      success: true,
      eventId,
      subject: event.subject,
      start: event.start,
      end: event.end,
      attendees: event.attendees?.map((a: any) => a.emailAddress?.address),
      message: 'Meeting processed (transcript not available)',
    };
  } catch (error) {
    context.error('Error processing meeting:', error);
    throw error;
  }
}

// Register the function
app.http('joinMeeting', {
  methods: ['POST'],
  authLevel: 'function',
  handler: joinMeeting,
});

