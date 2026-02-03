/**
 * Utility functions for the shard animation
 */

var ShardAnimation = window.ShardAnimation || {};

ShardAnimation.Utils = (function() {

  /**
   * Seeded random number generator
   */
  function seededRandom(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Convert position name to coordinates based on container dimensions
   */
  function getPositionCoords(posName, containerDimensions) {
    var containerWidth = containerDimensions.width;
    var containerHeight = containerDimensions.height;

    var percentages = {
      'top-left': { xPercent: 15, yPercent: 15 },
      'top-center': { xPercent: 50, yPercent: 15 },
      'top-right': { xPercent: 85, yPercent: 15 },
      'center-left': { xPercent: 15, yPercent: 50 },
      'center-center': { xPercent: 50, yPercent: 50 },
      'center-right': { xPercent: 85, yPercent: 50 },
      'bottom-left': { xPercent: 15, yPercent: 85 },
      'bottom-center': { xPercent: 50, yPercent: 85 },
      'bottom-right': { xPercent: 85, yPercent: 85 }
    };

    var pos = percentages[posName] || percentages['center-center'];

    return {
      x: (pos.xPercent / 100) * containerWidth - containerWidth / 2,
      y: (pos.yPercent / 100) * containerHeight - containerHeight / 2
    };
  }

  /**
   * Generate shard targets for animation based on random seed
   */
  function generateShardTargets(state) {
    var numShards = state.numShards;
    var randomSeed = state.randomSeed;
    var rotationVariation = state.rotationVariation;
    var rotationMode = state.rotationMode;
    var positionalVariation = state.positionalVariation;

    var targets = [];
    for (var i = 0; i < numShards; i++) {
      targets.push({
        randomOffset: {
          x: (seededRandom(randomSeed + i * 3) - 0.5) * 200,
          y: (seededRandom(randomSeed + i * 3 + 1) - 0.5) * 200,
          z: (seededRandom(randomSeed + i * 3 + 2) - 0.5) * 150
        },
        initialRotation: {
          x: (seededRandom(randomSeed + i * 3 + 200) - 0.5) * 360,
          y: (seededRandom(randomSeed + i * 3 + 201) - 0.5) * 360,
          z: (seededRandom(randomSeed + i * 3 + 202) - 0.5) * 360
        },
        journeyPath: {
          x: (seededRandom(randomSeed + i * 3 + 50) - 0.5) * 300 * (positionalVariation / 50),
          y: (seededRandom(randomSeed + i * 3 + 51) - 0.5) * 300 * (positionalVariation / 50),
          z: (seededRandom(randomSeed + i * 3 + 52) - 0.5) * 200 * (positionalVariation / 50)
        },
        rotation: rotationMode === 'different' ? {
          x: (seededRandom(randomSeed + i * 3 + 100) - 0.5) * 720 * (rotationVariation / 50),
          y: (seededRandom(randomSeed + i * 3 + 101) - 0.5) * 720 * (rotationVariation / 50),
          z: (seededRandom(randomSeed + i * 3 + 102) - 0.5) * 720 * (rotationVariation / 50)
        } : {
          x: 360 * (rotationVariation / 50),
          y: 360 * (rotationVariation / 50),
          z: 360 * (rotationVariation / 50)
        }
      });
    }
    return targets;
  }

  /**
   * Calculate container dimensions based on aspect ratio and window size
   */
  function calculateContainerDimensions(aspectRatio) {
    var parts = aspectRatio.split(':');
    var w = parseInt(parts[0], 10);
    var h = parseInt(parts[1], 10);

    var width = 800;
    var height = 800 * h / w;

    var maxHeight = window.innerHeight - 120;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * w / h;
    }

    var maxWidth = window.innerWidth * 0.9;
    if (width > maxWidth) {
      width = maxWidth;
      height = width * h / w;
    }

    return { width: width, height: height };
  }

  /**
   * Convert pixels to percentage of container
   */
  function pxToPercent(px, containerSize) {
    return (px / containerSize * 100).toFixed(2);
  }

  /**
   * Download a file with given content
   */
  function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Download a data URL as a file
   */
  function downloadDataUrl(dataUrl, filename) {
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Load an external script dynamically
   */
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Public API
  return {
    seededRandom: seededRandom,
    getPositionCoords: getPositionCoords,
    generateShardTargets: generateShardTargets,
    calculateContainerDimensions: calculateContainerDimensions,
    pxToPercent: pxToPercent,
    downloadFile: downloadFile,
    downloadDataUrl: downloadDataUrl,
    loadScript: loadScript
  };
})();
