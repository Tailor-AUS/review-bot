import * as outcomeCardTemplate from './outcomeCard.json';
import { MeetingOutcome } from '../services/outcomeEmbed';

/**
 * Create an Adaptive Card for meeting outcomes
 */
export function createOutcomeCard(
  meetingSubject: string,
  outcomes: MeetingOutcome,
  documentUrl: string,
  plannerUrl?: string
): any {
  // Clone the template
  const card = JSON.parse(JSON.stringify(outcomeCardTemplate));

  // Format decisions as bullet list
  const decisionsText = outcomes.decisions.map(d => `• ${d}`).join('\n');
  
  // Format action items as bullet list
  const actionItemsText = outcomes.actionItems.map(a => `• ${a}`).join('\n');
  
  // Format tasks as bullet list with assignees
  const tasksText = outcomes.tasks.map(t => {
    const assignee = t.assignee ? ` (${t.assignee})` : '';
    const dueDate = t.dueDate ? ` - Due: ${t.dueDate}` : '';
    return `• ${t.description}${assignee}${dueDate}`;
  }).join('\n');

  // Replace placeholders in the card
  let cardJson = JSON.stringify(card);
  cardJson = cardJson.replace(/\$\{meetingSubject\}/g, meetingSubject);
  cardJson = cardJson.replace(/\$\{decisions\}/g, decisionsText || 'None recorded');
  cardJson = cardJson.replace(/\$\{actionItems\}/g, actionItemsText || 'None recorded');
  cardJson = cardJson.replace(/\$\{tasks\}/g, tasksText || 'None created');
  cardJson = cardJson.replace(/\$\{summary\}/g, outcomes.summary);
  cardJson = cardJson.replace(/\$\{documentUrl\}/g, documentUrl);
  cardJson = cardJson.replace(/\$\{plannerUrl\}/g, plannerUrl || 'https://tasks.office.com');

  return JSON.parse(cardJson);
}

/**
 * Create a simple status card
 */
export function createStatusCard(
  title: string,
  message: string,
  isSuccess: boolean = true
): any {
  return {
    type: 'AdaptiveCard',
    version: '1.5',
    body: [
      {
        type: 'TextBlock',
        text: isSuccess ? '✅' : '❌',
        size: 'ExtraLarge',
        horizontalAlignment: 'Center',
      },
      {
        type: 'TextBlock',
        text: title,
        weight: 'Bolder',
        size: 'Large',
        horizontalAlignment: 'Center',
      },
      {
        type: 'TextBlock',
        text: message,
        wrap: true,
        horizontalAlignment: 'Center',
      },
    ],
  };
}

/**
 * Create an error card
 */
export function createErrorCard(errorMessage: string): any {
  return createStatusCard('Error', errorMessage, false);
}

