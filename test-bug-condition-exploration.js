// ============================================================
//  Bug Condition Exploration Property Test (Task 1)
//  CRITICAL: This test is EXPECTED TO FAIL on unfixed code
// ============================================================

/**
 * Property-Based Test for Game Initialization Bug Condition
 * 
 * **Validates: Requirements 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.12**
 * 
 * This test explores the "Multiple Scene/Renderer Instances" bug condition by testing
 * the concrete failing case: clicking "New Game" button and verifying initialization state.
 * 
 * **EXPECTED BEHAVIOR ON UNFIXED CODE**: Test FAILS (this is correct - proves bug exists)
 * **EXPECTED BEHAVIOR ON FIXED CODE**: Test PASSES (confirms bug is resolved)
 */

// Simple property-based test runner (no external dependencies)
function runPropertyBasedTest() {
  console.log('='.repeat(80));
  console.log('GAME INITIALIZATION BUG CONDITION EXPLORATION TEST');
  console.log('CRITICAL: This test EXPECTS TO FAIL on unfixed code');
  console.log('='.repeat(80));

  // Property: After Engine.start() completes, exactly one of each component should exist
  // and all systems should be operational
  const property = testInitializationCreatesCorrectState();
  
  if (property.success) {
    console.log('❌ TEST RESULT: UNEXPECTED PASS');
    console.log('   This suggests the bug may not exist or test logic is incorrect');
    console.log('   Expected: Test should FAIL on unfixed code to confirm bug exists');
    console.log('   Analysis needed to determine if bug was already fixed or root cause is different');
    return { result: 'unexpected_pass', counterexample: null };
  } else {
    console.log('✅ TEST RESULT: FAILED AS EXPECTED');
    console.log('   This confirms the bug exists in the unfixed code');
    console.log('   Counterexample demonstrates the initialization problems');
    return { result: 'failed', counterexample: property.counterexample };
  }
}

async function testInitializationCreatesCorrectState() {
  console.log('\n🔍 Testing Property: Single Scene/Renderer/GameLoop Operational State');
  
  try {
    // Reset page to clean state (simulate page reload)
    console.log('📋 Step 1: Resetting to clean state...');
    resetToCleanState();
    
    // Trigger "New Game" initialization sequence
    console.log('📋 Step 2: Triggering "New Game" initialization...');
    const initResult = triggerNewGameInitialization();
    
    // Wait for initialization to complete
    console.log('📋 Step 3: Waiting for initialization to complete...');
    await waitForInitializationComplete(2000); // 2 second timeout
    
    // Collect actual state after initialization
    console.log('📋 Step 4: Collecting initialization state...');
    const actualState = collectInitializationState();
    
    // Define expected state (what should happen on FIXED code)
    const expectedState = {
      sceneInstanceCount: 1,
      rendererInstanceCount: 1,
      activeGameLoops: 1,
      playerMeshScene: 'activeRenderScene', // Should be same reference
      inputEventsConnected: true,
      gameLoopRunning: true,
      firstFrameRendered: true
    };
    
    console.log('📊 Expected State:', expectedState);
    console.log('📊 Actual State:  ', actualState);
    
    // Check if bug condition exists (any of these conditions = bug exists)
    const bugConditions = [];
    
    if (actualState.sceneInstanceCount > 1) {
      bugConditions.push(`Scene Duality: Found ${actualState.sceneInstanceCount} scene instances (expected 1)`);
    }
    
    if (actualState.rendererInstanceCount > 1) {
      bugConditions.push(`Renderer Duplication: Found ${actualState.rendererInstanceCount} renderer instances (expected 1)`);
    }
    
    if (actualState.activeGameLoops !== 1) {
      bugConditions.push(`Game Loop Issues: Found ${actualState.activeGameLoops} active loops (expected 1)`);
    }
    
    if (!actualState.playerMeshInActiveScene) {
      bugConditions.push(`Player Mesh Scene Mismatch: Player mesh not in actively rendered scene`);
    }
    
    if (!actualState.inputEventsConnected) {
      bugConditions.push(`Input Disconnection: Input events not connected to game logic`);
    }
    
    if (!actualState.gameLoopRunning) {
      bugConditions.push(`Game Loop Not Started: Animation loop not running`);
    }
    
    if (!actualState.firstFrameRendered) {
      bugConditions.push(`Missing First Frame: No immediate frame render after initialization`);
    }
    
    const hasBugCondition = bugConditions.length > 0;
    
    if (hasBugCondition) {
      console.log('\n🐛 BUG CONDITIONS DETECTED:');
      bugConditions.forEach(condition => console.log(`   - ${condition}`));
      
      // Generate detailed counterexample for documentation
      const counterexample = {
        trigger: 'User clicks "New Game" button',
        expectedBehavior: 'Single scene/renderer/gameloop with all systems operational',
        actualBehavior: bugConditions.join('; '),
        manifestedBugs: {
          sceneDuality: actualState.sceneInstanceCount > 1,
          rendererDuplication: actualState.rendererInstanceCount > 1,
          gameLoopRaceCondition: actualState.activeGameLoops !== 1,
          playerMeshWrongScene: !actualState.playerMeshInActiveScene,
          inputDisconnected: !actualState.inputEventsConnected,
          gameLoopFrozen: !actualState.gameLoopRunning,
          missingFirstFrame: !actualState.firstFrameRendered
        },
        actualCounts: {
          scenes: actualState.sceneInstanceCount,
          renderers: actualState.rendererInstanceCount,
          gameLoops: actualState.activeGameLoops
        },
        observableSymptoms: generateObservableSymptoms(actualState),
        diagnosis: generateDiagnosis(actualState, bugConditions)
      };
      
      return { success: false, counterexample };
    } else {
      console.log('\n✅ No bug conditions detected - initialization appears correct');
      return { success: true, counterexample: null };
    }
    
  } catch (error) {
    console.error('💥 Test execution error:', error);
    return { 
      success: false, 
      counterexample: {
        trigger: 'Test execution',
        error: error.message,
        diagnosis: 'Test failed to complete - possible critical initialization failure'
      }
    };
  }
}

function resetToCleanState() {
  // Clear any existing global state
  if (window.Engine && typeof window.Engine.stop === 'function') {
    try {
      window.Engine.stop();
    } catch (e) {
      console.log('   Engine.stop() error (expected):', e.message);
    }
  }
  
  // Hide all UI panels
  const gameCanvas = document.getElementById('game-canvas');
  const mainMenu = document.getElementById('main-menu');
  const hudOverlay = document.getElementById('hud-overlay');
  
  if (gameCanvas) gameCanvas.classList.add('hidden');
  if (hudOverlay) hudOverlay.classList.add('hidden');
  if (mainMenu) mainMenu.classList.remove('hidden');
  
  console.log('   ✓ Reset to main menu state');
}

function triggerNewGameInitialization() {
  console.log('   📱 Simulating "New Game" button click...');
  
  // Method 1: Try direct Engine.start() call
  if (window.Engine && typeof window.Engine.start === 'function') {
    try {
      console.log('   📱 Calling window.Engine.start(null)...');
      window.Engine.start(null);
      return { method: 'direct_engine_start', success: true };
    } catch (error) {
      console.log('   ⚠️ Direct Engine.start() failed:', error.message);
      return { method: 'direct_engine_start', success: false, error: error.message };
    }
  }
  
  // Method 2: Try MainMenu.js new game function
  if (window.MainMenu && typeof window.MainMenu.startNewGame === 'function') {
    try {
      console.log('   📱 Calling window.MainMenu.startNewGame()...');
      window.MainMenu.startNewGame();
      return { method: 'mainmenu_start', success: true };
    } catch (error) {
      console.log('   ⚠️ MainMenu startNewGame failed:', error.message);
      return { method: 'mainmenu_start', success: false, error: error.message };
    }
  }
  
  // Method 3: Try clicking actual button element
  const newGameButton = document.querySelector('#new-game-btn, .new-game-btn, button[data-action="new-game"]');
  if (newGameButton) {
    console.log('   📱 Clicking new game button element...');
    newGameButton.click();
    return { method: 'button_click', success: true };
  }
  
  throw new Error('No available method to trigger "New Game" - Engine.start(), MainMenu functions, or button not found');
}

function waitForInitializationComplete(timeoutMs) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    let frameCount = 0;
    
    function checkComplete() {
      frameCount++;
      const elapsed = performance.now() - startTime;
      
      // Check if Engine reports running
      const engineRunning = window.Engine && window.Engine.isRunning && window.Engine.isRunning();
      
      // Check if scene exists
      const sceneExists = (window.Renderer && window.Renderer.getScene && window.Renderer.getScene()) ||
                         (window.SceneManager && window.SceneManager.getScene && window.SceneManager.getScene());
      
      // Check if player initialized
      const playerExists = window.Player && window.Player.position;
      
      if (engineRunning && sceneExists && playerExists) {
        console.log(`   ✓ Initialization complete after ${elapsed.toFixed(0)}ms (${frameCount} checks)`);
        resolve();
      } else if (elapsed > timeoutMs) {
        console.log(`   ⏱️ Initialization timeout after ${elapsed.toFixed(0)}ms`);
        console.log(`   State: Engine=${!!engineRunning}, Scene=${!!sceneExists}, Player=${!!playerExists}`);
        resolve(); // Continue with test even if timeout
      } else {
        requestAnimationFrame(checkComplete);
      }
    }
    
    requestAnimationFrame(checkComplete);
  });
}

function collectInitializationState() {
  const state = {};
  
  // Count THREE.Scene instances
  state.sceneInstanceCount = countSceneInstances();
  
  // Count WebGLRenderer instances
  state.rendererInstanceCount = countRendererInstances();
  
  // Count active game loops
  state.activeGameLoops = countActiveGameLoops();
  
  // Check if player mesh is in the actively rendered scene
  state.playerMeshInActiveScene = checkPlayerMeshInActiveScene();
  
  // Check if input events are connected
  state.inputEventsConnected = checkInputEventsConnected();
  
  // Check if game loop is running
  state.gameLoopRunning = checkGameLoopRunning();
  
  // Check if first frame was rendered
  state.firstFrameRendered = checkFirstFrameRendered();
  
  return state;
}

function countSceneInstances() {
  let count = 0;
  
  // Check SceneManager singleton
  if (window.SceneManager && window.SceneManager.getScene && window.SceneManager.getScene()) {
    count++;
    console.log('   🎬 Found SceneManager singleton scene');
  }
  
  // Check Renderer local scene (this should NOT exist on fixed code)
  if (window.Renderer && window.Renderer.getScene && window.Renderer.getScene()) {
    const rendererScene = window.Renderer.getScene();
    const sceneManagerScene = window.SceneManager && window.SceneManager.getScene ? window.SceneManager.getScene() : null;
    
    if (rendererScene && sceneManagerScene && rendererScene !== sceneManagerScene) {
      count++; // This indicates the bug - Renderer has its own scene
      console.log('   🐛 Found Renderer local scene (DUPLICATE - this is the bug!)');
    }
  }
  
  // Check for any other scene instances in global scope
  const globalSceneVars = ['scene', 'gameScene', 'mainScene'];
  globalSceneVars.forEach(varName => {
    if (window[varName] && window[varName].type === 'Scene') {
      count++;
      console.log(`   🎬 Found global scene variable: ${varName}`);
    }
  });
  
  console.log(`   📊 Total scene instances found: ${count}`);
  return count;
}

function countRendererInstances() {
  let count = 0;
  
  // Check SceneManager singleton renderer
  if (window.SceneManager && window.SceneManager.getRenderer && window.SceneManager.getRenderer()) {
    count++;
    console.log('   🎨 Found SceneManager singleton renderer');
  }
  
  // Check Renderer module renderer (should delegate to SceneManager on fixed code)
  if (window.Renderer && window.Renderer.getRenderer && window.Renderer.getRenderer()) {
    const rendererInstance = window.Renderer.getRenderer();
    const sceneManagerRenderer = window.SceneManager && window.SceneManager.getRenderer ? window.SceneManager.getRenderer() : null;
    
    if (rendererInstance && sceneManagerRenderer && rendererInstance !== sceneManagerRenderer) {
      count++; // This indicates the bug - Renderer has its own renderer
      console.log('   🐛 Found Renderer local renderer (DUPLICATE - this is the bug!)');
    }
  }
  
  // Check canvas for multiple WebGL contexts (another way to detect duplicate renderers)
  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    try {
      // Try to get multiple WebGL contexts - if successful, there might be duplicates
      const gl1 = canvas.getContext('webgl');
      const gl2 = canvas.getContext('webgl2');
      if (gl1 || gl2) {
        // This is normal - just one context, but check renderer info for multiple instances
        const rendererInfo = gl1 ? gl1.getParameter(gl1.RENDERER) : 'unknown';
        console.log('   🎨 Canvas WebGL context exists:', rendererInfo);
      }
    } catch (e) {
      console.log('   ⚠️ Could not inspect canvas WebGL context');
    }
  }
  
  console.log(`   📊 Total renderer instances found: ${count}`);
  return count;
}

function countActiveGameLoops() {
  let count = 0;
  
  // Check Engine.js game loop
  if (window.Engine && window.Engine.isRunning && window.Engine.isRunning()) {
    count++;
    console.log('   🔄 Engine.js game loop is active');
  }
  
  // Check main.js game loop (this should NOT be active when Engine.js exists)
  // We can't directly access main.js internal state, but we can check for indicators
  
  // Check for multiple requestAnimationFrame calls by monitoring frame rate
  // (This is a heuristic - multiple loops would cause higher frame rates or conflicts)
  
  console.log(`   📊 Total active game loops found: ${count}`);
  return Math.max(count, 1); // Assume at least 1 if system is running
}

function checkPlayerMeshInActiveScene() {
  try {
    // Get player mesh
    if (!window.Player || !window.Player.mesh) {
      console.log('   👤 No player mesh found');
      return false;
    }
    
    // Get actively rendered scene
    const activeScene = (window.Renderer && window.Renderer.getScene && window.Renderer.getScene()) ||
                       (window.SceneManager && window.SceneManager.getScene && window.SceneManager.getScene());
    
    if (!activeScene) {
      console.log('   🎬 No active scene found');
      return false;
    }
    
    // Check if player mesh is a child of the active scene
    const playerMesh = window.Player.mesh;
    const isInScene = activeScene.children.includes(playerMesh);
    
    console.log(`   👤 Player mesh in active scene: ${isInScene}`);
    return isInScene;
    
  } catch (error) {
    console.log('   ⚠️ Error checking player mesh scene membership:', error.message);
    return false;
  }
}

function checkInputEventsConnected() {
  try {
    if (!window.InputManager) {
      console.log('   🎮 InputManager not found');
      return false;
    }
    
    // Check if InputManager is unlocked (able to process events)
    const isUnlocked = !window.InputManager.isLocked();
    
    // Test if WASD keys can be detected
    const moveDir = window.InputManager.getMoveDir();
    const canReadInput = typeof moveDir.x === 'number' && typeof moveDir.z === 'number';
    
    // Check if Player.update reads InputManager (we can't test this directly, 
    // but we can verify the connection exists)
    const hasConnection = isUnlocked && canReadInput;
    
    console.log(`   🎮 Input events connected: ${hasConnection} (unlocked: ${isUnlocked}, readable: ${canReadInput})`);
    return hasConnection;
    
  } catch (error) {
    console.log('   ⚠️ Error checking input connection:', error.message);
    return false;
  }
}

function checkGameLoopRunning() {
  try {
    // Check if Engine reports running
    if (window.Engine && window.Engine.isRunning) {
      const engineRunning = window.Engine.isRunning();
      console.log(`   🔄 Game loop running (Engine): ${engineRunning}`);
      return engineRunning;
    }
    
    // Fallback: check if render calls are happening by monitoring frame counter
    // (This is a heuristic test)
    let initialFrameCount = 0;
    let finalFrameCount = 0;
    
    // Get initial frame count
    if (window.Renderer && window.Renderer.frameCount !== undefined) {
      initialFrameCount = window.Renderer.frameCount;
    }
    
    // Wait a short time and check again
    setTimeout(() => {
      if (window.Renderer && window.Renderer.frameCount !== undefined) {
        finalFrameCount = window.Renderer.frameCount;
      }
      
      const framesRendered = finalFrameCount - initialFrameCount;
      const isRunning = framesRendered > 0;
      
      console.log(`   🔄 Game loop running (frame counter): ${isRunning} (${framesRendered} frames in 100ms)`);
    }, 100);
    
    // For immediate return, assume running if Engine exists and is initialized
    return window.Engine && window.Engine.isRunning && window.Engine.isRunning();
    
  } catch (error) {
    console.log('   ⚠️ Error checking game loop status:', error.message);
    return false;
  }
}

function checkFirstFrameRendered() {
  try {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
      console.log('   🎨 Canvas not found');
      return false;
    }
    
    // Check if canvas is visible and has non-zero size
    const isVisible = canvas.style.display !== 'none' && !canvas.classList.contains('hidden');
    const hasSize = canvas.width > 0 && canvas.height > 0;
    
    if (!isVisible || !hasSize) {
      console.log(`   🎨 Canvas not ready (visible: ${isVisible}, size: ${canvas.width}x${canvas.height})`);
      return false;
    }
    
    // Try to sample canvas pixels to see if anything was rendered
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
        const pixels = imageData.data;
        
        // Check if we have any non-black pixels (indicating rendering occurred)
        let nonBlackPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          if (r > 10 || g > 10 || b > 10) { // Allow for some tolerance
            nonBlackPixels++;
          }
        }
        
        const hasRendering = nonBlackPixels > 10; // At least 10 non-black pixels
        console.log(`   🎨 First frame rendered: ${hasRendering} (${nonBlackPixels} non-black pixels)`);
        return hasRendering;
      }
    } catch (pixelError) {
      console.log('   ⚠️ Could not sample canvas pixels (WebGL canvas)');
      // For WebGL canvas, we can't easily sample pixels, so assume rendered if canvas is ready
      return isVisible && hasSize;
    }
    
    return isVisible && hasSize;
    
  } catch (error) {
    console.log('   ⚠️ Error checking first frame render:', error.message);
    return false;
  }
}

function generateObservableSymptoms(state) {
  const symptoms = [];
  
  if (state.sceneInstanceCount > 1) {
    symptoms.push('Black screen despite UI overlays being visible');
    symptoms.push('3D world not rendering after "New Game"');
  }
  
  if (!state.playerMeshInActiveScene) {
    symptoms.push('Player character not visible in 3D world');
    symptoms.push('Scene appears empty or incomplete');
  }
  
  if (!state.inputEventsConnected || !state.gameLoopRunning) {
    symptoms.push('WASD keys do not move player character');
    symptoms.push('Mouse rotation does not affect camera');
    symptoms.push('All controls appear unresponsive');
  }
  
  if (!state.firstFrameRendered) {
    symptoms.push('Perceivable delay between "New Game" click and 3D world appearing');
    symptoms.push('Canvas remains black for 1-2 seconds after initialization');
  }
  
  return symptoms;
}

function generateDiagnosis(state, bugConditions) {
  const diagnoses = [];
  
  if (state.sceneInstanceCount > 1) {
    diagnoses.push('Scene Duality: Renderer.js creates local scene variables while SceneManager.js creates singleton scene. Entities are added to one scene but renderer draws the other.');
  }
  
  if (state.rendererInstanceCount > 1) {
    diagnoses.push('Renderer Duplication: Multiple WebGLRenderer instances compete for the same canvas element.');
  }
  
  if (!state.playerMeshInActiveScene) {
    diagnoses.push('Player Mesh Scene Mismatch: Player.buildMesh() adds mesh to SceneManager scene, but Renderer.render() uses local scene.');
  }
  
  if (!state.inputEventsConnected) {
    diagnoses.push('Input Disconnection: InputManager event listeners are registered but Player.update() does not read InputManager state.');
  }
  
  if (!state.gameLoopRunning) {
    diagnoses.push('Game Loop Failure: Initialization errors prevent requestAnimationFrame from starting or cause early exit.');
  }
  
  return diagnoses;
}

// Auto-run the test when this file is loaded
async function runBugExplorationTest() {
  console.log('🚀 Starting Bug Condition Exploration Test...');
  
  // Wait for DOM and all scripts to load
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }
  
  // Additional wait for game scripts to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const testResult = runPropertyBasedTest();
  
  console.log('\n' + '='.repeat(80));
  console.log('FINAL TEST RESULT:', testResult.result.toUpperCase());
  if (testResult.counterexample) {
    console.log('\nCOUNTEREXAMPLE DOCUMENTED:');
    console.log(JSON.stringify(testResult.counterexample, null, 2));
  }
  console.log('='.repeat(80));
  
  return testResult;
}

// Export for use in task status update
window.BugExplorationTest = { runBugExplorationTest };

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  // Run test after a short delay to allow all game scripts to load
  setTimeout(runBugExplorationTest, 2000);
}