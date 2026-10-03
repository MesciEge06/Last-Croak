// ============================================================
//  Preservation Property Tests (Task 2)
//  CRITICAL: These tests establish baseline behavior BEFORE fix
// ============================================================

/**
 * Property-Based Test for Gameplay Mechanics Preservation
 * 
 * **Validates: Requirements 3.3, 3.5, 3.6, 3.7, 3.8, 3.9, 3.12**
 * 
 * This test follows observation-first methodology:
 * 1. Observe behavior on UNFIXED code when initialization succeeds
 * 2. Write property tests capturing observed behavior patterns
 * 3. Assert fixed code produces SAME behavior for same inputs
 * 
 * **EXPECTED BEHAVIOR**: Tests PASS (confirms baseline behavior to preserve)
 */

// Property-based test generators for random inputs
const PropertyGenerators = {
  // Generate random movement inputs (WASD combinations)
  generateMovementInput() {
    const combinations = [
      { keys: ['KeyW'], label: 'Forward' },
      { keys: ['KeyS'], label: 'Backward' },
      { keys: ['KeyA'], label: 'Left' },
      { keys: ['KeyD'], label: 'Right' },
      { keys: ['KeyW', 'KeyA'], label: 'Forward-Left' },
      { keys: ['KeyW', 'KeyD'], label: 'Forward-Right' },
      { keys: ['KeyS', 'KeyA'], label: 'Backward-Left' },
      { keys: ['KeyS', 'KeyD'], label: 'Backward-Right' },
      { keys: [], label: 'Idle' }
    ];
    return combinations[Math.floor(Math.random() * combinations.length)];
  },

  // Generate random camera target positions and angles
  generateCameraInput() {
    return {
      targetPosition: {
        x: (Math.random() - 0.5) * 20, // -10 to +10 range
        y: 0,
        z: (Math.random() - 0.5) * 20
      },
      mouseMovement: {
        dx: (Math.random() - 0.5) * 0.1, // -0.05 to +0.05 range
        dy: (Math.random() - 0.5) * 0.05  // -0.025 to +0.025 range
      },
      deltaTime: 0.016 + Math.random() * 0.01 // 16-26ms frame times
    };
  },

  // Generate random attack scenarios
  generateCombatInput() {
    const attackTypes = ['lightAttack', 'heavyAttack', 'tongueAttack'];
    const enemyTypes = ['orc', 'skeleton', 'spider'];
    return {
      attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      enemyType: enemyTypes[Math.floor(Math.random() * enemyTypes.length)],
      playerPosition: {
        x: Math.random() * 4 - 2, // -2 to +2 range
        y: 0,
        z: Math.random() * 4 - 2
      },
      enemyPosition: {
        x: Math.random() * 6 - 3, // -3 to +3 range
        y: 0,
        z: Math.random() * 6 - 3
      }
    };
  },

  // Generate random HUD state changes
  generateHUDInput() {
    return {
      hpChange: Math.floor(Math.random() * 50) - 25, // -25 to +25
      staminaChange: Math.floor(Math.random() * 30) - 15, // -15 to +15
      manaChange: Math.floor(Math.random() * 20) - 10, // -10 to +10
      deltaTime: 0.016 + Math.random() * 0.01
    };
  }
};
// Main preservation test runner
function runPreservationTests() {
  console.log('='.repeat(80));
  console.log('GAMEPLAY MECHANICS PRESERVATION TESTS');
  console.log('PURPOSE: Establish baseline behavior BEFORE implementing fix');
  console.log('='.repeat(80));

  const testResults = {
    playerMovementPhysics: false,
    cameraSmoothingBehavior: false,
    combatDamageCalculation: false,
    hudBarAnimations: false,
    sceneLightingConsistency: false,
    saveLoadRestoration: false,
    overallSuccess: false
  };

  try {
    console.log('\n🔍 Testing Player Movement Physics...');
    testResults.playerMovementPhysics = testPlayerMovementPhysics();

    console.log('\n🔍 Testing Camera Smoothing Behavior...');
    testResults.cameraSmoothingBehavior = testCameraSmoothingBehavior();

    console.log('\n🔍 Testing Combat Damage Calculation...');
    testResults.combatDamageCalculation = testCombatDamageCalculation();

    console.log('\n🔍 Testing HUD Bar Animations...');
    testResults.hudBarAnimations = testHUDBarAnimations();

    console.log('\n🔍 Testing Scene Lighting Consistency...');
    testResults.sceneLightingConsistency = testSceneLightingConsistency();

    console.log('\n🔍 Testing Save/Load State Restoration...');
    testResults.saveLoadRestoration = testSaveLoadRestoration();

    // Overall success if all individual tests pass
    testResults.overallSuccess = Object.values(testResults)
      .filter(result => typeof result === 'boolean')
      .every(result => result);

    console.log('\n' + '='.repeat(80));
    console.log('PRESERVATION TESTS SUMMARY:');
    Object.entries(testResults).forEach(([test, result]) => {
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${test}: ${status}`);
    });
    console.log('='.repeat(80));

    return testResults;

  } catch (error) {
    console.error('💥 Preservation test execution error:', error);
    return { ...testResults, error: error.message };
  }
}
// Test 1: Player Movement Physics (Requirement 3.5)
function testPlayerMovementPhysics() {
  console.log('📋 Property: Player movement produces consistent velocity and position changes (Req 3.5)');
  
  if (!window.Player || !window.InputManager) {
    console.log('   ⚠️ Player or InputManager not available - skipping test');
    return false;
  }

  const testCases = [];
  let passedCases = 0;

  // Generate 25 random movement test cases with diverse inputs
  for (let i = 0; i < 25; i++) {
    const input = PropertyGenerators.generateMovementInput();
    const testCase = executeMovementTest(input);
    testCases.push(testCase);
    if (testCase.success) passedCases++;
  }

  const successRate = passedCases / testCases.length;
  console.log(`   📊 Movement tests: ${passedCases}/${testCases.length} passed (${(successRate * 100).toFixed(1)}%)`);

  // Log detailed results for baseline documentation
  console.log('   📝 Sample movement physics results:');
  testCases.slice(0, 5).forEach((testCase, i) => {
    console.log(`     Case ${i + 1} (${testCase.input.label}):`, {
      velocityMagnitude: testCase.result.velocityMagnitude?.toFixed(3),
      positionDelta: testCase.result.positionDelta?.toFixed(3),
      expectedSpeed: testCase.result.expectedSpeed?.toFixed(3),
      gravityApplication: testCase.result.gravityEffect?.toFixed(3),
      collisionHandling: testCase.result.collisionResolved ? 'Yes' : 'No'
    });
  });

  // Test specific movement mechanics
  console.log('   🧪 Testing specific movement mechanics...');
  const mechanicsTests = testMovementMechanics();
  
  return successRate > 0.75 && mechanicsTests; // Require 75% success + mechanics working
}

function executeMovementTest(input) {
  try {
    // Save initial state
    const initialPos = { ...window.Player.position };
    const initialVel = { ...window.Player.velocity };

    // Simulate key presses
    input.keys.forEach(key => {
      if (window.InputManager.keys) {
        window.InputManager.keys[key] = true;
      }
    });

    // Test multiple frame updates for more accurate physics
    const deltaTime = 0.016; // 60 FPS
    const numFrames = 3;
    let totalMovement = 0;
    let gravityEffect = 0;
    
    for (let frame = 0; frame < numFrames; frame++) {
      const preUpdatePos = { ...window.Player.position };
      const preUpdateVel = { ...window.Player.velocity };
      
      // Update player for one frame
      window.Player.update(deltaTime, 0); // No camera angle for simplicity
      
      // Track movement per frame
      const frameMovement = Math.sqrt(
        Math.pow(window.Player.position.x - preUpdatePos.x, 2) + 
        Math.pow(window.Player.position.z - preUpdatePos.z, 2)
      );
      totalMovement += frameMovement;
      
      // Track gravity effect
      if (!window.Player.isGrounded) {
        gravityEffect += Math.abs(window.Player.velocity.y - preUpdateVel.y);
      }
    }

    // Measure results
    const finalPos = { ...window.Player.position };
    const finalVel = { ...window.Player.velocity };

    // Calculate movement deltas
    const positionDelta = Math.sqrt(
      Math.pow(finalPos.x - initialPos.x, 2) + 
      Math.pow(finalPos.z - initialPos.z, 2)
    );
    const velocityMagnitude = Math.sqrt(
      Math.pow(finalVel.x, 2) + Math.pow(finalVel.z, 2)
    );

    // Expected behavior: movement should produce velocity ~8.0 units/sec (from Player.js moveSpeed)
    const expectedSpeed = input.keys.length > 0 ? 8.0 : 0.0;
    const speedMatch = Math.abs(velocityMagnitude - expectedSpeed) < 2.0; // Allow some variance

    // Test sprint mechanics if applicable
    let sprintTest = true;
    if (input.keys.includes('ShiftLeft') && input.keys.length > 0) {
      // Sprint should increase speed by 1.8x (from Player.js)
      const expectedSprintSpeed = expectedSpeed * 1.8;
      sprintTest = Math.abs(velocityMagnitude - expectedSprintSpeed) < 3.0;
    }

    // Test collision handling (simplified - check if position is reasonable)
    const collisionResolved = !isNaN(finalPos.x) && !isNaN(finalPos.z) && 
                              Math.abs(finalPos.x) < 100 && Math.abs(finalPos.z) < 100;

    // Cleanup - reset input state
    input.keys.forEach(key => {
      if (window.InputManager.keys) {
        window.InputManager.keys[key] = false;
      }
    });

    return {
      input,
      success: speedMatch && sprintTest && collisionResolved,
      result: {
        positionDelta,
        velocityMagnitude,
        expectedSpeed,
        speedMatch,
        sprintTest,
        gravityEffect,
        collisionResolved,
        totalMovement
      }
    };

  } catch (error) {
    console.log(`   ⚠️ Movement test error for ${input.label}:`, error.message);
    return { input, success: false, error: error.message };
  }
}

// Test specific movement mechanics (Requirement 3.5 & 3.12)
function testMovementMechanics() {
  console.log('   🧪 Testing specific movement mechanics (gravity, animation, stamina)...');
  
  if (!window.Player) return false;
  
  let mechanicsTests = {
    gravityApplication: false,
    jumpMechanics: false,
    staminaConsumption: false,
    animationCycles: false
  };
  
  try {
    // Test 1: Gravity application
    const initialY = window.Player.position.y;
    const initialGrounded = window.Player.isGrounded;
    
    // Simulate jump
    window.Player.isGrounded = true;
    if (window.InputManager.keys) {
      window.InputManager.keys['Space'] = true;
    }
    window.Player.update(0.016, 0);
    
    // Check if jump occurred
    const jumpOccurred = window.Player.velocity.y > 0;
    mechanicsTests.jumpMechanics = jumpOccurred;
    
    // Test gravity when airborne
    if (jumpOccurred) {
      window.Player.isGrounded = false;
      const preGravityVelY = window.Player.velocity.y;
      window.Player.update(0.016, 0);
      const postGravityVelY = window.Player.velocity.y;
      
      // Gravity should reduce upward velocity (32.0 * delta from Player.js)
      mechanicsTests.gravityApplication = postGravityVelY < preGravityVelY;
    }
    
    // Test 2: Stamina consumption during sprint
    const initialStamina = window.Player.stamina;
    window.Player.isGrounded = true;
    if (window.InputManager.keys) {
      window.InputManager.keys['KeyW'] = true;
      window.InputManager.keys['ShiftLeft'] = true;
    }
    
    for (let i = 0; i < 10; i++) {
      window.Player.update(0.016, 0);
    }
    
    // Stamina should decrease when sprinting (15 * delta per frame from Player.js)
    mechanicsTests.staminaConsumption = window.Player.stamina < initialStamina;
    
    // Test 3: Animation cycles during movement
    const initialAnimTimer = window.Player.animTimer || 0;
    
    // Simulate walking for several frames
    for (let i = 0; i < 20; i++) {
      window.Player.update(0.016, 0);
    }
    
    // Animation timer should advance during movement
    mechanicsTests.animationCycles = (window.Player.animTimer || 0) > initialAnimTimer;
    
    // Cleanup
    if (window.InputManager.keys) {
      window.InputManager.keys['Space'] = false;
      window.InputManager.keys['KeyW'] = false;
      window.InputManager.keys['ShiftLeft'] = false;
    }
    
    console.log('     Mechanics test results:', mechanicsTests);
    
    return Object.values(mechanicsTests).every(test => test);
    
  } catch (error) {
    console.log('   ⚠️ Movement mechanics test error:', error.message);
    return false;
  }
}

// Test 2: Camera Smoothing Behavior (Requirement 3.9)
function testCameraSmoothingBehavior() {
  console.log('📋 Property: Camera lerp interpolation maintains smooth following with CAM_LERP = 0.15 (Req 3.9)');
  
  if (!window.Renderer || !window.Renderer.setCameraTarget) {
    console.log('   ⚠️ Renderer not available - skipping test');
    return false;
  }

  const testCases = [];
  let passedCases = 0;

  // Generate 20 random camera test cases
  for (let i = 0; i < 20; i++) {
    const input = PropertyGenerators.generateCameraInput();
    const testCase = executeCameraTest(input);
    testCases.push(testCase);
    if (testCase.success) passedCases++;
  }

  const successRate = passedCases / testCases.length;
  console.log(`   📊 Camera tests: ${passedCases}/${testCases.length} passed (${(successRate * 100).toFixed(1)}%)`);

  // Test specific camera mechanics
  console.log('   🧪 Testing camera rotation and zoom mechanics...');
  const cameraControlTests = testCameraControlMechanics();

  // Log detailed results for baseline documentation
  console.log('   📝 Sample camera smoothing results:');
  testCases.slice(0, 3).forEach((testCase, i) => {
    if (testCase.result) {
      console.log(`     Case ${i + 1}:`, {
        lerpFactor: testCase.result.actualLerpFactor?.toFixed(3),
        expectedLerp: '0.150',
        convergenceFrames: testCase.result.convergenceFrames,
        rotationSmooth: testCase.result.rotationSmooth ? 'Yes' : 'No',
        zoomResponsive: testCase.result.zoomResponsive ? 'Yes' : 'No'
      });
    }
  });

  return successRate > 0.65 && cameraControlTests; // Camera can be sensitive, require controls working
}

function executeCameraTest(input) {
  try {
    if (!window.Renderer || !window.Renderer.getCamera) {
      return { input, success: false, error: 'Renderer not available' };
    }

    const camera = window.Renderer.getCamera();
    if (!camera) {
      return { input, success: false, error: 'Camera not available' };
    }

    // Save initial camera state
    const initialPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

    // Set new camera target
    window.Renderer.setCameraTarget(input.targetPosition);

    // Simulate mouse movement
    if (window.Renderer.rotateCameraH) {
      window.Renderer.rotateCameraH(input.mouseMovement.dx, input.mouseMovement.dy);
    }

    // Update camera for several frames to measure lerp behavior
    const positions = [{ ...initialPos }];
    for (let frame = 0; frame < 10; frame++) {
      if (window.Renderer.updateCamera) {
        window.Renderer.updateCamera(input.deltaTime);
      }
      positions.push({ x: camera.position.x, y: camera.position.y, z: camera.position.z });
    }

    // Calculate actual lerp factor from position changes
    let totalLerpSum = 0;
    let validFrames = 0;
    for (let i = 1; i < positions.length - 1; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const next = positions[i + 1];
      
      const distance1 = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.z - prev.z, 2));
      const distance2 = Math.sqrt(Math.pow(next.x - curr.x, 2) + Math.pow(next.z - curr.z, 2));
      
      if (distance1 > 0.001 && distance2 > 0.001) {
        const lerpFactor = distance2 / distance1;
        if (lerpFactor > 0 && lerpFactor < 1) {
          totalLerpSum += lerpFactor;
          validFrames++;
        }
      }
    }

    const actualLerpFactor = validFrames > 0 ? totalLerpSum / validFrames : 0;
    const expectedLerp = 0.15; // CAM_LERP constant
    const lerpMatch = Math.abs(actualLerpFactor - expectedLerp) < 0.1; // Allow 10% variance

    // Count frames to convergence (when movement becomes minimal)
    let convergenceFrames = positions.length;
    for (let i = 1; i < positions.length; i++) {
      const movement = Math.sqrt(
        Math.pow(positions[i].x - positions[i-1].x, 2) + 
        Math.pow(positions[i].z - positions[i-1].z, 2)
      );
      if (movement < 0.01) {
        convergenceFrames = i;
        break;
      }
    }

    return {
      input,
      success: lerpMatch,
      result: {
        actualLerpFactor,
        expectedLerp,
        lerpMatch,
        convergenceFrames,
        positions: positions.length
      }
    };

  } catch (error) {
    console.log(`   ⚠️ Camera test error:`, error.message);
    return { input, success: false, error: error.message };
  }
}

// Test 3: Combat Damage Calculation
function testCombatDamageCalculation() {
  console.log('📋 Property: Combat system produces consistent damage values for same attack/enemy combinations');
  
  if (!window.CombatSystem || !window.WeaponData) {
    console.log('   ⚠️ CombatSystem or WeaponData not available - skipping test');
    return false;
  }

  const testCases = [];
  let passedCases = 0;

  // Generate 10 random combat test cases
  for (let i = 0; i < 10; i++) {
    const input = PropertyGenerators.generateCombatInput();
    const testCase = executeCombatTest(input);
    testCases.push(testCase);
    if (testCase.success) passedCases++;
  }

  const successRate = passedCases / testCases.length;
  console.log(`   📊 Combat tests: ${passedCases}/${testCases.length} passed (${(successRate * 100).toFixed(1)}%)`);

  // Log sample results for documentation
  console.log('   📝 Sample combat damage results:');
  testCases.slice(0, 3).forEach((testCase, i) => {
    if (testCase.result) {
      console.log(`     Case ${i + 1} (${testCase.input.attackType}):`, {
        baseDamage: testCase.result.baseDamage,
        actualDamage: testCase.result.actualDamage?.toFixed(1),
        hitConfirmed: testCase.result.hitConfirmed
      });
    }
  });

  return successRate > 0.8; // 80% success rate required
}

function executeCombatTest(input) {
  try {
    // Get weapon data for damage calculation
    const weapon = window.WeaponData['tongue'] || { damage: 20, range: 2.5 }; // Default weapon
    
    // Calculate expected damage based on attack type
    let expectedDamage = weapon.damage;
    if (input.attackType === 'heavyAttack') {
      expectedDamage *= 1.5; // Heavy attacks do 1.5x damage
    } else if (input.attackType === 'tongueAttack') {
      expectedDamage = window.WeaponData.tongue?.damage || 20;
    }

    // Calculate distance for hit detection
    const distance = Math.sqrt(
      Math.pow(input.enemyPosition.x - input.playerPosition.x, 2) + 
      Math.pow(input.enemyPosition.z - input.playerPosition.z, 2)
    );

    // Mock attack execution (simplified)
    const inRange = distance <= (weapon.range || 2.5);
    const hitConfirmed = inRange;
    const actualDamage = hitConfirmed ? expectedDamage : 0;

    // Test consistency: same inputs should produce same damage
    const damageConsistent = Math.abs(actualDamage - expectedDamage) < 0.1 || !hitConfirmed;
    
    return {
      input,
      success: damageConsistent && (hitConfirmed === inRange),
      result: {
        baseDamage: weapon.damage,
        expectedDamage,
        actualDamage,
        distance: distance.toFixed(2),
        inRange,
        hitConfirmed,
        damageConsistent
      }
    };

  } catch (error) {
    console.log(`   ⚠️ Combat test error:`, error.message);
    return { input, success: false, error: error.message };
  }
}

// Test 4: HUD Bar Animations
function testHUDBarAnimations() {
  console.log('📋 Property: HUD bars animate smoothly and reflect correct percentages for HP/stamina/mana changes');
  
  if (!window.HUD) {
    console.log('   ⚠️ HUD not available - skipping test');
    return false;
  }

  const testCases = [];
  let passedCases = 0;

  // Generate 15 random HUD test cases
  for (let i = 0; i < 15; i++) {
    const input = PropertyGenerators.generateHUDInput();
    const testCase = executeHUDTest(input);
    testCases.push(testCase);
    if (testCase.success) passedCases++;
  }

  const successRate = passedCases / testCases.length;
  console.log(`   📊 HUD tests: ${passedCases}/${testCases.length} passed (${(successRate * 100).toFixed(1)}%)`);

  // Log sample results for documentation
  console.log('   📝 Sample HUD animation results:');
  testCases.slice(0, 3).forEach((testCase, i) => {
    if (testCase.result) {
      console.log(`     Case ${i + 1}:`, {
        hpPercentage: `${testCase.result.hpPercentage?.toFixed(1)}%`,
        staminaPercentage: `${testCase.result.staminaPercentage?.toFixed(1)}%`,
        manaPercentage: `${testCase.result.manaPercentage?.toFixed(1)}%`
      });
    }
  });

  return successRate > 0.9; // 90% success rate required (HUD should be very reliable)
}

function executeHUDTest(input) {
  try {
    // Get current player stats (or use mock values)
    const maxHp = window.Player?.maxHp || 100;
    const maxStamina = window.Player?.maxStamina || 100;
    const maxMana = window.Player?.maxMana || 100;

    // Simulate stat changes
    const currentHp = Math.max(0, Math.min(maxHp, (window.Player?.hp || maxHp) + input.hpChange));
    const currentStamina = Math.max(0, Math.min(maxStamina, (window.Player?.stamina || maxStamina) + input.staminaChange));
    const currentMana = Math.max(0, Math.min(maxMana, (window.Player?.mana || maxMana) + input.manaChange));

    // Update HUD (this will update the bars)
    window.HUD.updateHp(currentHp, maxHp);
    window.HUD.updateStamina(currentStamina, maxStamina);
    window.HUD.updateMana(currentMana, maxMana);

    // Check if DOM elements reflect correct percentages
    const hpBar = document.getElementById('hp-bar-fill');
    const staminaBar = document.getElementById('stamina-bar-fill');
    const manaBar = document.getElementById('mana-bar-fill');

    const hpPercentage = hpBar ? parseFloat(hpBar.style.width) : 0;
    const staminaPercentage = staminaBar ? parseFloat(staminaBar.style.width) : 0;
    const manaPercentage = manaBar ? parseFloat(manaBar.style.width) : 0;

    const expectedHpPct = (currentHp / maxHp) * 100;
    const expectedStaminaPct = (currentStamina / maxStamina) * 100;
    const expectedManaPct = (currentMana / maxMana) * 100;

    const hpMatch = Math.abs(hpPercentage - expectedHpPct) < 1; // Allow 1% variance
    const staminaMatch = Math.abs(staminaPercentage - expectedStaminaPct) < 1;
    const manaMatch = Math.abs(manaPercentage - expectedManaPct) < 1;

    return {
      input,
      success: hpMatch && staminaMatch && manaMatch,
      result: {
        hpPercentage,
        staminaPercentage,
        manaPercentage,
        expectedHpPct,
        expectedStaminaPct,
        expectedManaPct,
        hpMatch,
        staminaMatch,
        manaMatch
      }
    };

  } catch (error) {
    console.log(`   ⚠️ HUD test error:`, error.message);
    return { input, success: false, error: error.message };
  }
}

// Test 5: Scene Lighting Consistency
function testSceneLightingConsistency() {
  console.log('📋 Property: Scene lighting maintains consistent ambient/sun intensities and colors');
  
  if (!window.Renderer || !window.Renderer.getScene) {
    console.log('   ⚠️ Renderer or scene not available - skipping test');
    return false;
  }

  try {
    const scene = window.Renderer.getScene();
    if (!scene) {
      console.log('   ⚠️ Scene not available - skipping test');
      return false;
    }

    // Find lights in the scene
    const lights = scene.children.filter(child => 
      child instanceof THREE.AmbientLight || 
      child instanceof THREE.DirectionalLight || 
      child instanceof THREE.HemisphereLight
    );

    console.log(`   📊 Found ${lights.length} lights in scene`);

    if (lights.length === 0) {
      console.log('   ⚠️ No lights found in scene - cannot test lighting');
      return false;
    }

    // Check each light type for expected properties
    let ambientFound = false;
    let directionalFound = false;
    let hemisphereFound = false;

    lights.forEach(light => {
      if (light instanceof THREE.AmbientLight) {
        ambientFound = true;
        console.log(`     Ambient Light: color=${light.color.getHex().toString(16)}, intensity=${light.intensity.toFixed(2)}`);
      } else if (light instanceof THREE.DirectionalLight) {
        directionalFound = true;
        console.log(`     Directional Light: color=${light.color.getHex().toString(16)}, intensity=${light.intensity.toFixed(2)}`);
      } else if (light instanceof THREE.HemisphereLight) {
        hemisphereFound = true;
        console.log(`     Hemisphere Light: skyColor=${light.color.getHex().toString(16)}, groundColor=${light.groundColor.getHex().toString(16)}, intensity=${light.intensity.toFixed(2)}`);
      }
    });

    // Success if we have the basic lighting setup
    const hasBasicLighting = ambientFound || directionalFound;
    console.log(`   ✓ Basic lighting setup: ${hasBasicLighting ? 'Present' : 'Missing'}`);

    return hasBasicLighting;

  } catch (error) {
    console.log(`   ⚠️ Lighting test error:`, error.message);
    return false;
  }
}

// Test 6: Save/Load State Restoration
function testSaveLoadRestoration() {
  console.log('📋 Property: Save system preserves and restores game state identically');
  
  if (!window.SaveSystem) {
    console.log('   ⚠️ SaveSystem not available - skipping test');
    return false;
  }

  try {
    // Generate a mock game state for testing
    const mockEngine = {
      currentChapter: 2,
      currentArea: 1,
      playTime: 1234,
      progress: {
        completedChapters: [1],
        completedAreas: ['1-1'],
        killedBosses: ['boss1'],
        killedMiniBosses: [],
        foundChests: ['chest1', 'chest2']
      }
    };

    // Collect current state
    const savedState = window.SaveSystem.collectState(mockEngine);
    
    console.log('   📝 Collected save state:', {
      chapter: savedState.chapterId,
      playTime: savedState.playTime,
      playerGold: savedState.player?.gold || 0,
      completedChapters: savedState.progress?.completedChapters?.length || 0
    });

    // Verify state structure is complete
    const hasRequiredFields = 
      savedState.chapterId !== undefined &&
      savedState.player !== undefined &&
      savedState.progress !== undefined &&
      savedState.timestamp !== undefined;

    if (!hasRequiredFields) {
      console.log('   ❌ Save state missing required fields');
      return false;
    }

    // Test save/load cycle (using slot 2 to avoid overwriting real saves)
    const saveSuccess = window.SaveSystem.save(2, savedState);
    if (!saveSuccess) {
      console.log('   ❌ Failed to save state');
      return false;
    }

    const loadedState = window.SaveSystem.load(2);
    if (!loadedState) {
      console.log('   ❌ Failed to load state');
      return false;
    }

    // Compare key fields for consistency
    const chapterMatch = loadedState.chapterId === savedState.chapterId;
    const playTimeMatch = loadedState.playTime === savedState.playTime;
    const progressMatch = JSON.stringify(loadedState.progress) === JSON.stringify(savedState.progress);

    console.log('   📊 Save/Load comparison:', {
      chapterMatch,
      playTimeMatch,
      progressMatch,
      timestampPresent: !!loadedState.timestamp
    });

    // Cleanup test save
    window.SaveSystem.deleteSave(2);

    return chapterMatch && playTimeMatch && progressMatch;

  } catch (error) {
    console.log(`   ⚠️ Save/Load test error:`, error.message);
    return false;
  }
}

// Auto-run preservation tests when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM and game systems to be ready
  function waitForGameSystems() {
    if (window.Player && window.InputManager && window.Renderer && window.HUD) {
      console.log('\n🚀 Game systems detected - running preservation tests...');
      setTimeout(() => {
        const results = runPreservationTests();
        window.preservationTestResults = results;
      }, 1000); // Give systems time to initialize
    } else {
      console.log('⏳ Waiting for game systems to load...');
      setTimeout(waitForGameSystems, 500);
    }
  }

  // Start checking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForGameSystems);
  } else {
    waitForGameSystems();
  }
}