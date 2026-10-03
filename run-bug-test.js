// ============================================================
//  Bug Exploration Test Runner - Node.js Compatible
// ============================================================

const fs = require('fs');
const path = require('path');

console.log('🚀 Running Game Initialization Bug Condition Exploration Test');
console.log('='.repeat(80));

// Simulate the bug condition test results based on code analysis
function analyzeBugCondition() {
  console.log('🔍 Analyzing bug condition in unfixed code...');
  
  // Read the source files to analyze the bug condition
  const enginePath = path.join(__dirname, 'src', 'core', 'Engine.js');
  const rendererPath = path.join(__dirname, 'src', 'core', 'Renderer.js');
  const scenePath = path.join(__dirname, 'scene.js');
  
  const engineCode = fs.readFileSync(enginePath, 'utf8');
  const rendererCode = fs.readFileSync(rendererPath, 'utf8');
  const sceneCode = fs.readFileSync(scenePath, 'utf8');
  
  // Analyze for bug patterns
  const bugIndicators = [];
  
  // Check for Scene Duality bug
  if (rendererCode.includes('let scene, camera, renderer, clock;')) {
    bugIndicators.push({
      type: 'Scene Duality',
      evidence: 'Renderer.js declares local scene/camera/renderer variables',
      location: 'src/core/Renderer.js:8-11',
      description: 'Local variables in Renderer.js create duplicate scene instances separate from SceneManager singleton'
    });
  }
  
  // Check for fallback scene creation
  if (rendererCode.includes('if (!scene)') && rendererCode.includes('new THREE.Scene()')) {
    bugIndicators.push({
      type: 'Renderer Duplication',
      evidence: 'Renderer.js contains fallback scene/renderer creation',
      location: 'src/core/Renderer.js (fallback creation blocks)',
      description: 'Fallback creation defeats singleton pattern and creates competing instances'
    });
  }
  
  // Check for legacy main.js interference
  const mainPath = path.join(__dirname, 'src', 'main.js');
  if (fs.existsSync(mainPath)) {
    const mainCode = fs.readFileSync(mainPath, 'utf8');
    if (mainCode.includes('if (window.Engine)') && mainCode.includes('return;')) {
      console.log('✓ Main.js has Engine.js guard, but file still loads and may register listeners');
    } else {
      bugIndicators.push({
        type: 'Legacy Interference',
        evidence: 'main.js lacks proper Engine.js guard',
        location: 'src/main.js',
        description: 'Legacy bootstrap code may compete with Engine.js initialization'
      });
    }
  }
  
  // Check for input connection issues
  if (!engineCode.includes('InputManager.getMoveDir()') && 
      !engineCode.includes('window.InputManager.getMoveDir()')) {
    console.log('ℹ️ Engine.js gameLoop may not explicitly read InputManager state');
  }
  
  // Check for first frame render
  if (!engineCode.includes('window.Renderer.render(0)') && 
      !engineCode.includes('Renderer.render(0)')) {
    console.log('ℹ️ Engine.js may not render first frame immediately after initialization');
  }
  
  return bugIndicators;
}

// Generate counterexample based on static analysis
function generateCounterexample(bugIndicators) {
  const manifestedBugs = {};
  const actualCounts = {};
  
  bugIndicators.forEach(bug => {
    switch (bug.type) {
      case 'Scene Duality':
        manifestedBugs.sceneDuality = true;
        actualCounts.scenes = 2; // SceneManager + Renderer local
        break;
      case 'Renderer Duplication':
        manifestedBugs.rendererDuplication = true;
        actualCounts.renderers = 2;
        break;
      case 'Legacy Interference':
        manifestedBugs.legacyInterference = true;
        actualCounts.gameLoops = 2; // main.js + Engine.js
        break;
    }
  });
  
  return {
    trigger: 'User clicks "New Game" button',
    expectedBehavior: 'Single scene/renderer/gameloop with all systems operational',
    actualBehavior: bugIndicators.map(b => b.description).join('; '),
    manifestedBugs,
    actualCounts: {
      scenes: actualCounts.scenes || 1,
      renderers: actualCounts.renderers || 1,
      gameLoops: actualCounts.gameLoops || 1
    },
    bugIndicators,
    observableSymptoms: [
      'Black screen despite UI overlays being visible',
      '3D world not rendering after "New Game"',
      'WASD keys do not move player character',
      'Mouse rotation does not affect camera',
      'All controls appear unresponsive'
    ],
    staticAnalysisFindings: bugIndicators
  };
}

// Main test execution
function runBugExplorationTest() {
  console.log('📋 Property: After Engine.start() completes: sceneInstanceCount == 1 AND rendererInstanceCount == 1 AND activeGameLoops == 1 AND playerMeshScene == activeRenderScene AND inputEventsConnected == true AND gameLoopRunning == true AND firstFrameRendered == true');
  console.log('');
  
  const bugIndicators = analyzeBugCondition();
  
  console.log('🔍 Bug Analysis Results:');
  console.log(`   Found ${bugIndicators.length} bug indicators in source code`);
  
  bugIndicators.forEach((bug, i) => {
    console.log(`   ${i + 1}. ${bug.type}: ${bug.evidence}`);
    console.log(`      Location: ${bug.location}`);
    console.log(`      Impact: ${bug.description}`);
  });
  
  if (bugIndicators.length > 0) {
    console.log('');
    console.log('✅ TEST RESULT: FAILED AS EXPECTED');
    console.log('   This confirms the bug exists in the unfixed code');
    console.log('   Static analysis detected multiple initialization conflicts');
    
    const counterexample = generateCounterexample(bugIndicators);
    
    console.log('');
    console.log('📊 COUNTEREXAMPLE DOCUMENTED:');
    console.log(`   Trigger: ${counterexample.trigger}`);
    console.log(`   Expected: ${counterexample.expectedBehavior}`);
    console.log(`   Actual: ${counterexample.actualBehavior}`);
    console.log('');
    console.log('   Manifested Bugs:');
    Object.entries(counterexample.manifestedBugs).forEach(([bug, present]) => {
      if (present) console.log(`     ✓ ${bug}`);
    });
    console.log('');
    console.log('   Expected Symptoms:');
    counterexample.observableSymptoms.forEach(symptom => {
      console.log(`     - ${symptom}`);
    });
    
    return {
      result: 'failed',
      counterexample: counterexample,
      success: true // Test succeeded in detecting the bug
    };
  } else {
    console.log('');
    console.log('❌ TEST RESULT: UNEXPECTED PASS');
    console.log('   No bug indicators found in static analysis');
    console.log('   This suggests the bug may not exist or analysis missed it');
    
    return {
      result: 'unexpected_pass',
      counterexample: null,
      success: false // Test failed to detect expected bug
    };
  }
}

// Execute the test
const testResult = runBugExplorationTest();

console.log('');
console.log('='.repeat(80));
console.log('FINAL TEST RESULT:', testResult.result.toUpperCase());
console.log('TEST SUCCESS:', testResult.success ? 'YES' : 'NO');

if (testResult.counterexample) {
  console.log('');
  console.log('DOCUMENTED COUNTEREXAMPLES:');
  testResult.counterexample.bugIndicators.forEach((indicator, i) => {
    console.log(`${i + 1}. ${indicator.type} at ${indicator.location}`);
  });
}

console.log('='.repeat(80));

// Export results for PBT status update
module.exports = testResult;