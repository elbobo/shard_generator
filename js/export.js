/**
 * Export functionality for the plane animation
 */

var PlaneAnimation = window.PlaneAnimation || {};

PlaneAnimation.Export = (function() {
  var Utils = PlaneAnimation.Utils;
  var Animation = PlaneAnimation.Animation;

  /**
   * Export animation as HTML file
   */
  function exportAsHTML(state) {
    var numPlanes = state.numPlanes;
    var planeColors = state.planeColors;
    var planeOpacities = state.planeOpacities;
    var aspectRatio = state.aspectRatio;
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
    var animationSpeed = state.animationSpeed;
    var playbackMode = state.playbackMode;
    var exportQuality = state.exportQuality;
    var containerDimensions = state.containerDimensions;

    var planeTargets = Utils.generatePlaneTargets(state);

    var frameCount = {
      'low': 25,
      'medium': 50,
      'high': 100
    }[exportQuality];

    var containerSize = 800;

    var frames = [];
    for (var i = 0; i <= frameCount; i++) {
      var t = i / frameCount;
      var frameData = [];
      for (var planeIndex = 0; planeIndex < numPlanes; planeIndex++) {
        frameData.push(Animation.getStateAtProgress(t, planeIndex, state, planeTargets));
      }
      frames.push({ progress: t * 100, planes: frameData });
    }

    var keyframesCSS = '';
    for (var planeIndex = 0; planeIndex < numPlanes; planeIndex++) {
      keyframesCSS += '\n@keyframes plane' + planeIndex + 'Animation {';

      frames.forEach(function(frame) {
        var planeState = frame.planes[planeIndex];
        var xVw = Utils.pxToPercent(planeState.pos.x, containerSize);
        var yVw = Utils.pxToPercent(planeState.pos.y, containerSize);
        var zVw = Utils.pxToPercent(planeState.pos.z, containerSize);

        keyframesCSS += '\n  ' + frame.progress.toFixed(2) + '% {\n' +
          '    transform: translateX(' + xVw + 'vw)\n' +
          '               translateY(' + yVw + 'vw)\n' +
          '               translateZ(' + zVw + 'vw)\n' +
          '               rotateX(' + planeState.rot.x.toFixed(2) + 'deg)\n' +
          '               rotateY(' + planeState.rot.y.toFixed(2) + 'deg)\n' +
          '               rotateZ(' + planeState.rot.z.toFixed(2) + 'deg);\n' +
          '  }';
      });

      keyframesCSS += '\n}\n';
    }

    var stackRotationKeyframes = '';
    if (startStacked || (!returnToStart && endStacked)) {
      stackRotationKeyframes = '\n@keyframes stackRotation {';

      frames.forEach(function(frame) {
        var t = frame.progress / 100;
        var rotX, rotY, rotZ, centerZ;

        if (returnToStart) {
          rotX = startRotationX;
          rotY = startRotationY;
          rotZ = startRotationZ;
          centerZ = startStacked ? (numPlanes - 1) * stackGap / 2 : 0;
        } else {
          rotX = startRotationX + (endRotationX - startRotationX) * t;
          rotY = startRotationY + (endRotationY - startRotationY) * t;
          rotZ = startRotationZ + (endRotationZ - startRotationZ) * t;
          var startCenterZ = startStacked ? (numPlanes - 1) * stackGap / 2 : 0;
          var endCenterZ = (numPlanes - 1) * endStackGap / 2;
          centerZ = startCenterZ + (endCenterZ - startCenterZ) * t;
        }

        var startPos = Utils.getPositionCoords(startPosition, containerDimensions);
        var endPos = returnToStart ? startPos : Utils.getPositionCoords(endPosition, containerDimensions);
        var posX = startPos.x + (endPos.x - startPos.x) * t;
        var posY = startPos.y + (endPos.y - startPos.y) * t;

        stackRotationKeyframes += '\n  ' + frame.progress.toFixed(2) + '% {\n' +
          '    transform: translateX(' + Utils.pxToPercent(posX, containerSize) + 'vw)\n' +
          '               translateY(' + Utils.pxToPercent(posY, containerSize) + 'vw)\n' +
          '               rotateX(' + rotX.toFixed(2) + 'deg)\n' +
          '               rotateY(' + rotY.toFixed(2) + 'deg)\n' +
          '               rotateZ(' + rotZ.toFixed(2) + 'deg);\n' +
          '  }';
      });

      stackRotationKeyframes += '\n}\n';
    }

    var animationProps;
    if (playbackMode === 'back-and-forth') {
      animationProps = 'animation-duration: ' + animationSpeed + 's;\n' +
        '    animation-timing-function: linear;\n' +
        '    animation-iteration-count: infinite;\n' +
        '    animation-direction: alternate;';
    } else if (playbackMode === 'loop') {
      animationProps = 'animation-duration: ' + animationSpeed + 's;\n' +
        '    animation-timing-function: linear;\n' +
        '    animation-iteration-count: infinite;\n' +
        '    animation-direction: normal;';
    } else {
      animationProps = 'animation-duration: ' + animationSpeed + 's;\n' +
        '    animation-timing-function: linear;\n' +
        '    animation-iteration-count: 1;\n' +
        '    animation-direction: normal;\n' +
        '    animation-fill-mode: forwards;';
    }

    var planeSize = (150 / containerSize * 100).toFixed(2);
    var planeOffset = (planeSize / 2).toFixed(2);

    var planeStyles = '';
    for (var i = 0; i < numPlanes; i++) {
      planeStyles += '\n    .plane-' + i + ' {\n' +
        '      background: ' + planeColors[i] + ';\n' +
        '      opacity: ' + planeOpacities[i] + ';\n' +
        '      animation-name: plane' + i + 'Animation;\n' +
        '      ' + animationProps + '\n' +
        '    }';
    }

    var planeDivs = '';
    for (var i = 0; i < numPlanes; i++) {
      planeDivs += '      <div class="plane plane-' + i + '"></div>\n';
    }

    var html = '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <title>3D Plane Animation</title>\n' +
      '  <style>\n' +
      '    * {\n' +
      '      margin: 0;\n' +
      '      padding: 0;\n' +
      '      box-sizing: border-box;\n' +
      '    }\n\n' +
      '    body {\n' +
      '      width: 100vw;\n' +
      '      height: 100vh;\n' +
      '      overflow: hidden;\n' +
      '      background: transparent;\n' +
      '      display: flex;\n' +
      '      align-items: center;\n' +
      '      justify-content: center;\n' +
      '    }\n\n' +
      '    .animation-container {\n' +
      '      width: 100%;\n' +
      '      max-width: 100vw;\n' +
      '      aspect-ratio: ' + aspectRatio.replace(':', ' / ') + ';\n' +
      '      perspective: ' + (1500 / containerSize * 100).toFixed(2) + 'vw;\n' +
      '      position: relative;\n' +
      '      overflow: hidden;\n' +
      '    }\n\n' +
      '    .stack-rotation-wrapper {\n' +
      '      position: absolute;\n' +
      '      width: 100%;\n' +
      '      height: 100%;\n' +
      '      transform-style: preserve-3d;\n' +
      ((startStacked || (!returnToStart && endStacked)) ?
        '      transform-origin: 50% 50% ' + ((numPlanes - 1) * stackGap / 2 / containerSize * 100).toFixed(2) + 'vw;\n' +
        '      animation-name: stackRotation;\n' +
        '      ' + animationProps + '\n' : '') +
      '    }\n\n' +
      '    .background-plane {\n' +
      '      position: absolute;\n' +
      '      width: 300%;\n' +
      '      height: 300%;\n' +
      '      left: -100%;\n' +
      '      top: -100%;\n' +
      '      background: white;\n' +
      '      transform: translateZ(-1000vw);\n' +
      '      pointer-events: none;\n' +
      '    }\n\n' +
      '    .plane {\n' +
      '      position: absolute;\n' +
      '      width: ' + planeSize + 'vw;\n' +
      '      height: ' + planeSize + 'vw;\n' +
      '      left: 50%;\n' +
      '      top: 50%;\n' +
      '      margin-left: -' + planeOffset + 'vw;\n' +
      '      margin-top: -' + planeOffset + 'vw;\n' +
      '      transform-style: preserve-3d;\n' +
      '    }\n' +
      keyframesCSS + stackRotationKeyframes + planeStyles + '\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      '  <div class="animation-container">\n' +
      '    <div class="background-plane"></div>\n' +
      '    <div class="stack-rotation-wrapper">\n' +
      planeDivs +
      '    </div>\n' +
      '  </div>\n' +
      '</body>\n' +
      '</html>';

    Utils.downloadFile(html, '3d-plane-animation.html', 'text/html');
  }

  /**
   * Export current frame as PNG
   */
  function exportCurrentFrame(state, containerRef, setIsPlaying) {
    var multiplier = {
      '1x': 1,
      '2x': 2,
      '3x': 3,
      '4x': 4
    }[state.exportResolution];

    var wasPlaying = state.isPlaying;

    function doExport() {
      if (wasPlaying) setIsPlaying(false);

      setTimeout(function() {
        var originalBackground = containerRef.style.background;
        var originalBorder = containerRef.style.border;
        containerRef.style.background = 'transparent';
        containerRef.style.border = 'none';

        setTimeout(function() {
          window.htmlToImage.toPng(containerRef, {
            backgroundColor: null,
            pixelRatio: multiplier,
            quality: 1.0
          }).then(function(dataUrl) {
            containerRef.style.background = originalBackground;
            containerRef.style.border = originalBorder;
            Utils.downloadDataUrl(dataUrl, 'plane-animation-frame-' + state.exportResolution + '.png');
            if (wasPlaying) setIsPlaying(true);
          }).catch(function(error) {
            console.error('Export failed:', error);
            containerRef.style.background = originalBackground;
            containerRef.style.border = originalBorder;
            alert('Export failed. Please try again.');
            if (wasPlaying) setIsPlaying(true);
          });
        }, 50);
      }, 100);
    }

    if (!window.htmlToImage) {
      Utils.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js')
        .then(doExport)
        .catch(function(error) {
          console.error('Failed to load html-to-image library:', error);
          alert('Failed to load export library. Please try again.');
        });
    } else {
      doExport();
    }
  }

  // Public API
  return {
    exportAsHTML: exportAsHTML,
    exportCurrentFrame: exportCurrentFrame
  };
})();
