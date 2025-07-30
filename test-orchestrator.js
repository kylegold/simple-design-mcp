#!/usr/bin/env node

/**
 * Test script for the orchestrator
 * Run with: node test-orchestrator.js
 */

import { WorkflowOrchestrator } from './src/orchestrator/WorkflowOrchestrator.js';

const orchestrator = new WorkflowOrchestrator();

console.log('=== Testing Simple Design Orchestrator ===\n');

// Test 1: Create App Workflow
console.log('1. Testing Create App Workflow:');
console.log('--------------------------------');
try {
  const createResult = orchestrator.orchestrate('create_app', {
    description: 'I want to build a recipe sharing app for home cooks',
    path: './my-recipe-app'
  });
  
  console.log('✓ Workflow ID:', createResult.workflowId);
  console.log('✓ Task:', createResult.task);
  console.log('✓ Workflow Name:', createResult.workflow.name);
  console.log('✓ Steps:', createResult.workflow.steps.length);
  console.log('✓ Estimated Tokens:', createResult.estimatedTokens.estimated);
  console.log('✓ App Type Detected:', createResult.context.appType);
  console.log('\nWorkflow Steps:');
  createResult.workflow.steps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step.name} (${step.agent})`);
  });
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 2: Update Design Workflow
console.log('\n\n2. Testing Update Design Workflow:');
console.log('-----------------------------------');
try {
  const updateResult = orchestrator.orchestrate('update_design', {
    request: 'make the primary color blue',
    projectName: 'recipe-app-1234'
  });
  
  console.log('✓ Workflow ID:', updateResult.workflowId);
  console.log('✓ Steps:', updateResult.workflow.steps.length);
  console.log('✓ Has Change Analyzer:', updateResult.agents.ChangeAnalyzer ? 'Yes' : 'No');
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 3: Get Agent Template
console.log('\n\n3. Testing Get Agent Template:');
console.log('-------------------------------');
try {
  const agent = orchestrator.agentTemplates.DesignBrief;
  console.log('✓ Agent Name:', agent.name);
  console.log('✓ Description:', agent.description);
  console.log('✓ Methods:', Object.keys(agent.methods).join(', '));
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 4: Get Component Spec
console.log('\n\n4. Testing Get Component Spec:');
console.log('-------------------------------');
try {
  const navbar = orchestrator.getComponentTemplate('navbar');
  console.log('✓ Component:', 'navbar');
  console.log('✓ Type:', navbar.type);
  console.log('✓ Variants:', navbar.variants.join(', '));
  console.log('✓ Props:', Object.keys(navbar.props).join(', '));
} catch (error) {
  console.error('✗ Error:', error.message);
}

// Test 5: App-specific components
console.log('\n\n5. Testing App-Specific Components:');
console.log('------------------------------------');
try {
  const recipeComponents = orchestrator.getComponentSpecs('recipe');
  const componentNames = Object.keys(recipeComponents);
  console.log('✓ Recipe App Components:', componentNames.length);
  console.log('✓ Has recipeCard:', 'recipeCard' in recipeComponents ? 'Yes' : 'No');
  console.log('✓ Sample components:', componentNames.slice(0, 5).join(', '));
} catch (error) {
  console.error('✗ Error:', error.message);
}

console.log('\n=== All Tests Complete ===');

// Display sample workflow output
console.log('\n\nSample Workflow Output (JSON):');
console.log('==============================');
const sampleWorkflow = orchestrator.orchestrate('create_app', {
  description: 'fitness tracking app',
  path: './'
});

console.log(JSON.stringify({
  workflowId: sampleWorkflow.workflowId,
  task: sampleWorkflow.task,
  workflow: {
    name: sampleWorkflow.workflow.name,
    steps: sampleWorkflow.workflow.steps.slice(0, 2) // Just first 2 steps for brevity
  },
  context: sampleWorkflow.context,
  estimatedTokens: sampleWorkflow.estimatedTokens
}, null, 2));

process.exit(0);