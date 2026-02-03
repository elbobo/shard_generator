/**
 * Export functionality for the shard animation
 */

var ShardAnimation = window.ShardAnimation || {};

ShardAnimation.Export = (function() {
  var Utils = ShardAnimation.Utils;
  var Animation = ShardAnimation.Animation;

  /**
   * Export animation as HTML file
   */
  function exportAsHTML(state) {
    var numShards = state.numShards;
    var shardColors = state.shardColors;
    var shardOpacities = state.shardOpacities;
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

    var shardTargets = Utils.generateShardTargets(state);

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
      for (var shardIndex = 0; shardIndex < numShards; shardIndex++) {
        frameData.push(Animation.getStateAtProgress(t, shardIndex, state, shardTargets));
      }
      frames.push({ progress: t * 100, shards: frameData });
    }

    var keyframesCSS = '';
    for (var shardIndex = 0; shardIndex < numShards; shardIndex++) {
      keyframesCSS += '\n@keyframes shard' + shardIndex + 'Animation {';

      frames.forEach(function(frame) {
        var shardState = frame.shards[shardIndex];
        var xVw = Utils.pxToPercent(shardState.pos.x, containerSize);
        var yVw = Utils.pxToPercent(shardState.pos.y, containerSize);
        var zVw = Utils.pxToPercent(shardState.pos.z, containerSize);

        keyframesCSS += '\n  ' + frame.progress.toFixed(2) + '% {\n' +
          '    transform: translateX(' + xVw + 'vw)\n' +
          '               translateY(' + yVw + 'vw)\n' +
          '               translateZ(' + zVw + 'vw)\n' +
          '               rotateX(' + shardState.rot.x.toFixed(2) + 'deg)\n' +
          '               rotateY(' + shardState.rot.y.toFixed(2) + 'deg)\n' +
          '               rotateZ(' + shardState.rot.z.toFixed(2) + 'deg);\n' +
          '  }';
      });

      keyframesCSS += '\n}\n';
    }

    var stackRotationKeyframes = '';
    if (startStacked || (!returnToStart && endStacked)) {
      stackRotationKeyframes = '\n@keyframes stackRotation {';

      frames.forEach(function(frame) {
        var t = frame.progress / 100;
        var rotX, rotY, rotZ;

        if (returnToStart) {
          rotX = startRotationX;
          rotY = startRotationY;
          rotZ = startRotationZ;
        } else {
          rotX = startRotationX + (endRotationX - startRotationX) * t;
          rotY = startRotationY + (endRotationY - startRotationY) * t;
          rotZ = startRotationZ + (endRotationZ - startRotationZ) * t;
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

    var shardSize = (150 / containerSize * 100).toFixed(2);
    var shardOffset = (shardSize / 2).toFixed(2);

    var shardStyles = '';
    for (var i = 0; i < numShards; i++) {
      shardStyles += '\n    .shard-' + i + ' {\n' +
        '      background: ' + shardColors[i] + ';\n' +
        '      opacity: ' + shardOpacities[i] + ';\n' +
        '      animation-name: shard' + i + 'Animation;\n' +
        '      ' + animationProps + '\n' +
        '    }';
    }

    var shardDivs = '';
    for (var i = 0; i < numShards; i++) {
      shardDivs += '      <div class="shard shard-' + i + '"></div>\n';
    }

    var html = '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <title>3D Shard Animation</title>\n' +
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
        '      transform-origin: 50% 50% ' + ((numShards - 1) * stackGap / 2 / containerSize * 100).toFixed(2) + 'vw;\n' +
        '      animation-name: stackRotation;\n' +
        '      ' + animationProps + '\n' : '') +
      '    }\n\n' +
      '    .background-shard {\n' +
      '      position: absolute;\n' +
      '      width: 300%;\n' +
      '      height: 300%;\n' +
      '      left: -100%;\n' +
      '      top: -100%;\n' +
      '      background: white;\n' +
      '      transform: translateZ(-1000vw);\n' +
      '      pointer-events: none;\n' +
      '    }\n\n' +
      '    .shard {\n' +
      '      position: absolute;\n' +
      '      width: ' + shardSize + 'vw;\n' +
      '      height: ' + shardSize + 'vw;\n' +
      '      left: 50%;\n' +
      '      top: 50%;\n' +
      '      margin-left: -' + shardOffset + 'vw;\n' +
      '      margin-top: -' + shardOffset + 'vw;\n' +
      '      transform-style: preserve-3d;\n' +
      '    }\n' +
      keyframesCSS + stackRotationKeyframes + shardStyles + '\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      '  <div class="animation-container">\n' +
      '    <div class="background-shard"></div>\n' +
      '    <div class="stack-rotation-wrapper">\n' +
      shardDivs +
      '    </div>\n' +
      '  </div>\n' +
      '</body>\n' +
      '</html>';

    Utils.downloadFile(html, '3d-shard-animation.html', 'text/html');
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
            Utils.downloadDataUrl(dataUrl, 'shard-animation-frame-' + state.exportResolution + '.png');
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
