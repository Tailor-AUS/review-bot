import { Client } from '@microsoft/microsoft-graph-client';
import { getGraphClient } from '../lib/graphClient';

export interface MeetingOutcome {
  decisions: string[];
  tasks: Array<{
    description: string;
    assignee?: string;
    dueDate?: string;
  }>;
  actionItems: string[];
  summary: string;
}

/**
 * Summarize meeting content using Azure OpenAI
 */
export async function summarizeMeetingContent(
  transcript: string,
  meetingSubject: string
): Promise<MeetingOutcome> {
  // TODO: Integrate with Azure OpenAI
  // For now, return a mock structure
  
  const mockOutcome: MeetingOutcome = {
    decisions: [
      'Decided to launch on January 5th',
      'Approved budget allocation for Q1',
    ],
    tasks: [
      {
        description: 'Prepare launch materials',
        assignee: 'Alice',
        dueDate: '2025-01-03',
      },
      {
        description: 'Finalize rollout plan',
        assignee: 'Bob',
        dueDate: '2024-12-30',
      },
    ],
    actionItems: [
      'Alice to own the rollout',
      'Schedule follow-up meeting for Dec 20',
    ],
    summary: `Meeting: ${meetingSubject}\n\nKey outcomes:\n- Launch date set for January 5th\n- Budget approved\n- Alice assigned as rollout owner`,
  };

  return mockOutcome;
}

/**
 * Embed outcomes into a SharePoint document or Word file
 */
export async function embedOutcomesInDocument(
  documentUrl: string,
  outcomes: MeetingOutcome
): Promise<boolean> {
  const graphClient = getGraphClient();

  try {
    // Parse document URL to determine the type and location
    const urlParts = parseDocumentUrl(documentUrl);
    
    if (!urlParts) {
      throw new Error('Invalid document URL');
    }

    // Strategy depends on document type
    if (urlParts.type === 'word') {
      return await embedInWordDocument(graphClient, urlParts, outcomes);
    } else if (urlParts.type === 'sharepoint') {
      return await embedInSharePointPage(graphClient, urlParts, outcomes);
    } else if (urlParts.type === 'loop') {
      return await embedInLoopComponent(graphClient, urlParts, outcomes);
    }

    throw new Error(`Unsupported document type: ${urlParts.type}`);
  } catch (error) {
    console.error('Error embedding outcomes:', error);
    throw error;
  }
}

/**
 * Parse document URL to extract site, drive, and item information
 */
function parseDocumentUrl(url: string): any {
  // This is a simplified parser - production version would be more robust
  try {
    const urlObj = new URL(url);
    
    // SharePoint document
    if (urlObj.hostname.includes('sharepoint.com')) {
      return {
        type: 'sharepoint',
        siteUrl: `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.split('/_layouts')[0]}`,
        filePath: urlObj.pathname,
      };
    }
    
    // Word document
    if (url.includes('.docx') || url.includes('Word')) {
      return {
        type: 'word',
        url: url,
      };
    }

    // Loop component
    if (url.includes('loop.microsoft.com')) {
      return {
        type: 'loop',
        url: url,
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

/**
 * Embed outcomes in a Word document using Graph API
 */
async function embedInWordDocument(
  client: Client,
  urlParts: any,
  outcomes: MeetingOutcome
): Promise<boolean> {
  // This requires the Files.ReadWrite permission
  // The actual implementation would use the Word API to insert content
  
  console.log('Would embed in Word document:', urlParts.url);
  console.log('Outcomes:', outcomes);
  
  // TODO: Implement Word document insertion
  // Reference: https://docs.microsoft.com/en-us/graph/api/resources/word
  
  return true;
}

/**
 * Embed outcomes in a SharePoint page
 */
async function embedInSharePointPage(
  client: Client,
  urlParts: any,
  outcomes: MeetingOutcome
): Promise<boolean> {
  console.log('Would embed in SharePoint page:', urlParts.siteUrl);
  console.log('Outcomes:', outcomes);
  
  // TODO: Implement SharePoint page content insertion
  // Reference: https://docs.microsoft.com/en-us/graph/api/sitepage-create
  
  return true;
}

/**
 * Embed outcomes in a Loop component
 */
async function embedInLoopComponent(
  client: Client,
  urlParts: any,
  outcomes: MeetingOutcome
): Promise<boolean> {
  console.log('Would embed in Loop component:', urlParts.url);
  console.log('Outcomes:', outcomes);
  
  // TODO: Implement Loop component insertion
  // Loop API is still evolving - may need to use alternative approach
  
  return true;
}

/**
 * Create tasks in Microsoft Planner from meeting outcomes
 */
export async function createPlannerTasks(
  planId: string,
  bucketId: string,
  outcomes: MeetingOutcome
): Promise<void> {
  const graphClient = getGraphClient();

  for (const task of outcomes.tasks) {
    try {
      const plannerTask = {
        planId: planId,
        bucketId: bucketId,
        title: task.description,
        dueDateTime: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
      };

      await graphClient.api('/planner/tasks').post(plannerTask);
      
      console.log(`Created task: ${task.description}`);
    } catch (error) {
      console.error(`Error creating task "${task.description}":`, error);
    }
  }
}

