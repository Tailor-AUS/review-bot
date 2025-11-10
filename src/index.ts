// Main entry point for Azure Functions v4
// This file imports and exports all function handlers

import { app } from '@azure/functions';

// Import function registrations
import './functions/listener';
import './functions/joinMeeting';

// The functions are registered in their respective files using app.http()
// Azure Functions runtime will auto-discover them from this entry point

export default app;

