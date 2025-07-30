#!/usr/bin/env node

import { WorkflowOrchestrator } from './src/orchestrator/WorkflowOrchestrator.js';
import { createLightweightResponse } from './src/orchestrator/LightweightResponse.js';

const orchestrator = new WorkflowOrchestrator();

// Test full response
const fullWorkflow = orchestrator.orchestrate('create_app', {
  description: 'recipe sharing app',
  path: './test-app'
});

const fullSize = JSON.stringify(fullWorkflow).length;
console.log('Full response size:', fullSize, 'bytes');
console.log('Full response keys:', Object.keys(fullWorkflow));

// Test lightweight response
const lightResponse = createLightweightResponse(fullWorkflow);
const lightSize = JSON.stringify(lightResponse).length;
console.log('\nLightweight response size:', lightSize, 'bytes');
console.log('Size reduction:', Math.round((1 - lightSize/fullSize) * 100) + '%');
console.log('\nLightweight response:', JSON.stringify(lightResponse, null, 2));