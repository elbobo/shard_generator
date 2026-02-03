/**
 * Animation logic for the plane animation
 */

var PlaneAnimation = window.PlaneAnimation || {};

PlaneAnimation.Animation = (function() {
  var Utils = PlaneAnimation.Utils;

  var animationFrameId = null;
  var lastTime = null;

  /**
   * Get the state of a plane at a given progress value
   */
  function getStateAtProgress(t, planeIndex, state, planeTargets) {
    var target = planeTargets[planeIndex];
    var startStacked = state.startStacked;
    var endStacked = state.endStacked;
    var returnToStart = state.returnToStart;
    var stackGap = state.stackGap;
    var endStackGap = state.endStackGap;
    var startSpread = state.startSpread;
    var endSpread = state.endSpread;
    var startRotationAmount = state.startRotationAmount;
    var endRotationAmount = state.endRotationAmount;
    var startPosition = state.startPosition;
    var endPosition = state.endPosition;
    var containerDimensions = state.containerDimensions;

    var startStackOffset = startStacked ? planeIndex * stackGap : 0;
    var endStackOffset = endStacked ? planeIndex * endStackGap : 0;

    var stackStartPos;
    if (startStacked) {
      stackStartPos = { x: 0, y: 0, z: startStackOffset };
    } else {
      var basePos = Utils.getPositionCoords(startPosition, containerDimensions);
      var spreadScale = startSpread / 50;
      stackStartPos = {
        x: basePos.x + target.randomOffset.x * spreadScale,
        y: basePos.y + target.randomOffset.y * spreadScale,
        z: target.randomOffset.z * spreadScale
      };
    }

    var stackEndPos;
    if (returnToStart) {
      stackEndPos = stackStartPos;
    } else {
      if (endStacked) {
        stackEndPos = { x: 0, y: 0, z: endStackOffset };
      } else {
        var basePos = Utils.getPositionCoords(endPosition, containerDimensions);
        var spreadScale = endSpread / 50;
        stackEndPos = {
          x: basePos.x + target.randomOffset.x * spreadScale,
          y: basePos.y + target.randomOffset.y * spreadScale,
          z: target.randomOffset.z * spreadScale
        };
      }
    }

    var pos;
    if (startStacked || endStacked) {
      var dispersionAmount = Math.sin(t * Math.PI);
      var basePosInterp = {
        x: stackStartPos.x + (stackEndPos.x - stackStartPos.x) * t,
        y: stackStartPos.y + (stackEndPos.y - stackStartPos.y) * t,
        z: (stackStartPos.z || 0) + ((stackEndPos.z || 0) - (stackStartPos.z || 0)) * t
      };
      pos = {
        x: basePosInterp.x + target.journeyPath.x * dispersionAmount,
        y: basePosInterp.y + target.journeyPath.y * dispersionAmount,
        z: basePosInterp.z + target.journeyPath.z * dispersionAmount
      };
    } else {
      pos = {
        x: stackStartPos.x + (stackEndPos.x - stackStartPos.x) * t,
        y: stackStartPos.y + (stackEndPos.y - stackStartPos.y) * t,
        z: (stackStartPos.z || 0) + ((stackEndPos.z || 0) - (stackStartPos.z || 0)) * t
      };
    }

    var rotationAmount = Math.sin(t * Math.PI);

    var startInitialRot = startStacked ? { x: 0, y: 0, z: 0 } : {
      x: target.initialRotation.x * (startRotationAmount / 100),
      y: target.initialRotation.y * (startRotationAmount / 100),
      z: target.initialRotation.z * (startRotationAmount / 100)
    };

    var endInitialRot = returnToStart ? startInitialRot : (endStacked ? { x: 0, y: 0, z: 0 } : {
      x: target.initialRotation.x * (endRotationAmount / 100),
      y: target.initialRotation.y * (endRotationAmount / 100),
      z: target.initialRotation.z * (endRotationAmount / 100)
    });

    var currentInitialRot = {
      x: startInitialRot.x + (endInitialRot.x - startInitialRot.x) * t,
      y: startInitialRot.y + (endInitialRot.y - startInitialRot.y) * t,
      z: startInitialRot.z + (endInitialRot.z - startInitialRot.z) * t
    };

    var rot = {
      x: currentInitialRot.x + target.rotation.x * rotationAmount,
      y: currentInitialRot.y + target.rotation.y * rotationAmount,
      z: currentInitialRot.z + target.rotation.z * rotationAmount
    };

    return { pos: pos, rot: rot };
  }

  /**
   * Calculate stack rotation wrapper transform
   */
  function getStackWrapperTransform(progress, state) {
    var numPlanes = state.numPlanes;
    var startStacked = state.startStacked;
    var endStacked = state.endStacked;
    var returnToStart = state.returnToStart;
    var stackGap = state.stackGap;
    var endStackGap = state.endStackGap;
    var startRotationX = state.startRotationX;
    var startRotationY = state.startRotationY;
    var startRotationZ = state.startRotationZ;
    var endRotationX = state.endRotationX;
    var endRotationY = state.endRotationY;
    var endRotationZ = state.endRotationZ;
    var startPosition = state.startPosition;
    var endPosition = state.endPosition;
    var containerDimensions = state.containerDimensions;

    var centerZ = 0;
    if (returnToStart) {
      centerZ = startStacked ? (numPlanes - 1) * stackGap / 2 : 0;
    } else {
      var startCenterZ = startStacked ? (numPlanes - 1) * stackGap / 2 : 0;
      var endCenterZ = endStacked ? (numPlanes - 1) * endStackGap / 2 : 0;
      centerZ = startCenterZ + (endCenterZ - startCenterZ) * progress;
    }

    var transformOrigin = '50% 50% ' + centerZ + 'px';

    var position = '';
    if (startStacked || (!returnToStart && endStacked)) {
      var startPos = Utils.getPositionCoords(startPosition, containerDimensions);
      var endPos = returnToStart ? startPos : Utils.getPositionCoords(endPosition, containerDimensions);
      var x = startPos.x + (endPos.x - startPos.x) * progress;
      var y = startPos.y + (endPos.y - startPos.y) * progress;
      position = 'translateX(' + x + 'px) translateY(' + y + 'px) ';
    }

    var rotation = '';
    if (returnToStart) {
      if (startStacked) {
        rotation = 'rotateX(' + startRotationX + 'deg) rotateY(' + startRotationY + 'deg) rotateZ(' + startRotationZ + 'deg)';
      }
    } else {
      if (startStacked || endStacked) {
        var rotX = startRotationX + (endRotationX - startRotationX) * progress;
        var rotY = startRotationY + (endRotationY - startRotationY) * progress;
        var rotZ = startRotationZ + (endRotationZ - startRotationZ) * progress;
        rotation = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) rotateZ(' + rotZ + 'deg)';
      }
    }

    return {
      transform: position + rotation,
      transformOrigin: transformOrigin
    };
  }

  /**
   * Update the animation display
   */
  function updateAnimationDisplay(state, planeTargets, planeElements, wrapperElement) {
    var progress = state.progress;
    var containerDimensions = state.containerDimensions;
    var planeSize = containerDimensions.width * 0.1875;

    var wrapperTransform = getStackWrapperTransform(progress, state);
    wrapperElement.style.transform = wrapperTransform.transform;
    wrapperElement.style.transformOrigin = wrapperTransform.transformOrigin;

    for (var index = 0; index < planeElements.length; index++) {
      var planeEl = planeElements[index];
      if (index >= state.numPlanes) {
        planeEl.style.display = 'none';
        continue;
      }

      planeEl.style.display = 'block';
      planeEl.style.width = planeSize + 'px';
      planeEl.style.height = planeSize + 'px';
      planeEl.style.marginLeft = (-planeSize / 2) + 'px';
      planeEl.style.marginTop = (-planeSize / 2) + 'px';
      planeEl.style.background = state.planeColors[index];
      planeEl.style.opacity = state.planeOpacities[index];

      var planeState = getStateAtProgress(progress, index, state, planeTargets);
      planeEl.style.transform =
        'translateX(' + planeState.pos.x + 'px) ' +
        'translateY(' + planeState.pos.y + 'px) ' +
        'translateZ(' + planeState.pos.z + 'px) ' +
        'rotateX(' + planeState.rot.x + 'deg) ' +
        'rotateY(' + planeState.rot.y + 'deg) ' +
        'rotateZ(' + planeState.rot.z + 'deg)';
    }
  }

  /**
   * Start the animation loop
   */
  function startAnimation(stateRef, onProgressUpdate) {
    lastTime = Date.now();

    function animate() {
      var state = stateRef.current;
      if (!state.isPlaying) {
        animationFrameId = null;
        return;
      }

      var now = Date.now();
      var deltaTime = now - lastTime;
      lastTime = now;

      var duration = state.animationSpeed * 1000;
      var progressDelta = (deltaTime / duration) * state.direction;
      var newProgress = state.progress + progressDelta;
      var newDirection = state.direction;
      var shouldContinue = true;

      if (state.playbackMode === 'back-and-forth') {
        if (newProgress >= 1) {
          newProgress = 1;
          newDirection = -1;
        } else if (newProgress <= 0) {
          newProgress = 0;
          newDirection = 1;
        }
      } else if (state.playbackMode === 'loop') {
        if (newProgress >= 1) {
          newProgress = 0;
        } else if (newProgress < 0) {
          newProgress = 0;
        }
      } else if (state.playbackMode === 'once') {
        if (newProgress >= 1) {
          newProgress = 1;
          shouldContinue = false;
        } else if (newProgress < 0) {
          newProgress = 0;
        }
      }

      onProgressUpdate(newProgress, newDirection, shouldContinue);

      if (shouldContinue) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop the animation loop
   */
  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /**
   * Create plane elements
   */
  function createPlaneElements(wrapper, maxPlanes) {
    var planes = [];
    for (var i = 0; i < maxPlanes; i++) {
      var plane = document.createElement('div');
      plane.className = 'plane';
      plane.style.position = 'absolute';
      plane.style.left = '50%';
      plane.style.top = '50%';
      plane.style.transformStyle = 'preserve-3d';
      plane.style.display = 'none';
      wrapper.appendChild(plane);
      planes.push(plane);
    }
    return planes;
  }

  // Public API
  return {
    getStateAtProgress: getStateAtProgress,
    getStackWrapperTransform: getStackWrapperTransform,
    updateAnimationDisplay: updateAnimationDisplay,
    startAnimation: startAnimation,
    stopAnimation: stopAnimation,
    createPlaneElements: createPlaneElements
  };
})();
