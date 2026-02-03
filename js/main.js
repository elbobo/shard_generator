/**
 * Main entry point for the shard animation application
 */

var ShardAnimation = window.ShardAnimation || {};

ShardAnimation.Main = (function() {
  var Utils = ShardAnimation.Utils;
  var Animation = ShardAnimation.Animation;
  var Controls = ShardAnimation.Controls;
  var Export = ShardAnimation.Export;

  var MAX_SHARDS = 20;

  // Application state
  var state = {
    showControls: true,
    numShards: 5,
    shardColors: [],
    shardOpacities: [],
    aspectRatio: '4:3',
    startStacked: true,
    stackGap: 25,
    startSpread: 50,
    startRotationAmount: 0,
    startRotationX: 45,
    startRotationY: 0,
    startRotationZ: 45,
    startPosition: 'top-left',
    returnToStart: false,
    endStacked: true,
    endStackGap: 25,
    endSpread: 50,
    endRotationAmount: 0,
    endRotationX: 45,
    endRotationY: 0,
    endRotationZ: 45,
    endPosition: 'bottom-right',
    rotationVariation: 50,
    rotationMode: 'different',
    positionalVariation: 100,
    animationSpeed: 5,
    playbackMode: 'back-and-forth',
    exportQuality: 'medium',
    exportResolution: '2x',
    progress: 0,
    isPlaying: false,
    direction: 1,
    randomSeed: 0,
    containerDimensions: { width: 800, height: 600 }
  };

  // Initialize arrays
  for (var i = 0; i < MAX_SHARDS; i++) {
    state.shardColors.push('#C50978');
    state.shardOpacities.push(0.5);
  }

  var stateRef = { current: state };

  // DOM Elements
  var animationContainer;
  var stackWrapper;
  var perspectiveContainer;
  var shardElements = [];
  var shardTargets = [];

  // Position grids
  var startPositionGrid;
  var endPositionGrid;

  /**
   * Initialize the application
   */
  function init() {
    animationContainer = document.getElementById('animation-container');
    stackWrapper = document.getElementById('stack-rotation-wrapper');
    perspectiveContainer = document.getElementById('perspective-container');

    shardElements = Animation.createShardElements(stackWrapper, MAX_SHARDS);
    shardTargets = Utils.generateShardTargets(state);

    setupControls();
    setupEventListeners();

    updateContainerDimensions();
    updateUI();
    render();
  }

  /**
   * Setup control panel bindings
   */
  function setupControls() {
    document.getElementById('toggle-controls').addEventListener('click', function() {
      state.showControls = !state.showControls;
      Controls.toggleControlsPanel(state.showControls);
    });

    document.getElementById('aspect-ratio').addEventListener('change', function(e) {
      state.aspectRatio = e.target.value;
      updateContainerDimensions();
      render();
    });

    document.getElementById('num-shards').addEventListener('input', function(e) {
      state.numShards = Math.max(1, Math.min(MAX_SHARDS, Number(e.target.value)));
      shardTargets = Utils.generateShardTargets(state);
      updateShardColorControls();
      render();
    });

    updateShardColorControls();

    startPositionGrid = Controls.createPositionGrid(
      document.getElementById('start-position-grid'),
      'Start Position',
      state.startPosition,
      state.shardColors[0],
      function(pos) {
        state.startPosition = pos;
        render();
      }
    );

    endPositionGrid = Controls.createPositionGrid(
      document.getElementById('end-position-grid'),
      'End Position',
      state.endPosition,
      state.shardColors[0],
      function(pos) {
        state.endPosition = pos;
        render();
      }
    );

    document.getElementById('start-stacked').addEventListener('change', function(e) {
      state.startStacked = e.target.checked;
      Controls.updateUIVisibility(state);
      render();
    });

    Controls.bindSliderToValue(
      document.getElementById('stack-gap'),
      document.getElementById('stack-gap-value'),
      '',
      function(value) { state.stackGap = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('start-rotation-x'),
      document.getElementById('start-rotation-x-value'),
      '',
      function(value) { state.startRotationX = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('start-rotation-y'),
      document.getElementById('start-rotation-y-value'),
      '',
      function(value) { state.startRotationY = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('start-rotation-z'),
      document.getElementById('start-rotation-z-value'),
      '',
      function(value) { state.startRotationZ = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('start-spread'),
      document.getElementById('start-spread-value'),
      '',
      function(value) { state.startSpread = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('start-rotation-amount'),
      document.getElementById('start-rotation-amount-value'),
      '',
      function(value) { state.startRotationAmount = value; render(); }
    );

    document.getElementById('randomize-start').addEventListener('click', function() {
      state.randomSeed = Date.now();
      shardTargets = Utils.generateShardTargets(state);
      render();
    });

    document.getElementById('return-to-start').addEventListener('change', function(e) {
      state.returnToStart = e.target.checked;
      Controls.updateUIVisibility(state);
      render();
    });

    document.getElementById('end-stacked').addEventListener('change', function(e) {
      state.endStacked = e.target.checked;
      Controls.updateUIVisibility(state);
      render();
    });

    Controls.bindSliderToValue(
      document.getElementById('end-stack-gap'),
      document.getElementById('end-stack-gap-value'),
      '',
      function(value) { state.endStackGap = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('end-rotation-x'),
      document.getElementById('end-rotation-x-value'),
      '',
      function(value) { state.endRotationX = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('end-rotation-y'),
      document.getElementById('end-rotation-y-value'),
      '',
      function(value) { state.endRotationY = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('end-rotation-z'),
      document.getElementById('end-rotation-z-value'),
      '',
      function(value) { state.endRotationZ = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('end-spread'),
      document.getElementById('end-spread-value'),
      '',
      function(value) { state.endSpread = value; render(); }
    );

    Controls.bindSliderToValue(
      document.getElementById('end-rotation-amount'),
      document.getElementById('end-rotation-amount-value'),
      '',
      function(value) { state.endRotationAmount = value; render(); }
    );

    document.getElementById('randomize-end').addEventListener('click', function() {
      state.randomSeed = Date.now();
      shardTargets = Utils.generateShardTargets(state);
      render();
    });

    Controls.bindSliderToValue(
      document.getElementById('positional-variation'),
      document.getElementById('positional-variation-value'),
      '',
      function(value) {
        state.positionalVariation = value;
        shardTargets = Utils.generateShardTargets(state);
        render();
      }
    );

    Controls.bindSliderToValue(
      document.getElementById('rotation-variation'),
      document.getElementById('rotation-variation-value'),
      '',
      function(value) {
        state.rotationVariation = value;
        shardTargets = Utils.generateShardTargets(state);
        render();
      }
    );

    document.getElementById('rotation-mode').addEventListener('change', function(e) {
      state.rotationMode = e.target.value;
      shardTargets = Utils.generateShardTargets(state);
      render();
    });

    document.getElementById('playback-mode').addEventListener('change', function(e) {
      state.playbackMode = e.target.value;
    });

    Controls.bindSliderToValue(
      document.getElementById('animation-speed'),
      document.getElementById('animation-speed-value'),
      '',
      function(value) { state.animationSpeed = value; }
    );

    document.getElementById('export-quality').addEventListener('change', function(e) {
      state.exportQuality = e.target.value;
    });

    document.getElementById('export-resolution').addEventListener('change', function(e) {
      state.exportResolution = e.target.value;
    });

    document.getElementById('export-html').addEventListener('click', function() {
      Export.exportAsHTML(state);
    });

    document.getElementById('export-png').addEventListener('click', function() {
      Export.exportCurrentFrame(state, animationContainer, setIsPlaying);
    });

    document.getElementById('export-svg').addEventListener('click', function() {
      Export.exportAsSVG(state);
    });

    document.getElementById('play-pause').addEventListener('click', function() {
      setIsPlaying(!state.isPlaying);
    });

    document.getElementById('progress-slider').addEventListener('input', function(e) {
      setIsPlaying(false);
      state.progress = Number(e.target.value);
      updateProgressDisplay();
      render();
    });
  }

  /**
   * Setup window event listeners
   */
  function setupEventListeners() {
    window.addEventListener('resize', function() {
      updateContainerDimensions();
      render();
    });
  }

  /**
   * Update shard color controls
   */
  function updateShardColorControls() {
    var container = document.getElementById('shard-colors-container');
    var colors = state.shardColors.slice(0, state.numShards);
    var opacities = state.shardOpacities.slice(0, state.numShards);

    Controls.createShardColorControls(
      container,
      colors,
      opacities,
      function(index, color) {
        state.shardColors[index] = color;
        if (index === 0) {
          Controls.updatePrimaryColor(color);
          startPositionGrid.updateColor(color);
          endPositionGrid.updateColor(color);
        }
        render();
      },
      function(index, opacity) {
        state.shardOpacities[index] = opacity;
        render();
      },
      state.shardColors[0]
    );
  }

  /**
   * Update container dimensions based on aspect ratio
   */
  function updateContainerDimensions() {
    state.containerDimensions = Utils.calculateContainerDimensions(state.aspectRatio);

    animationContainer.style.width = state.containerDimensions.width + 'px';
    animationContainer.style.height = state.containerDimensions.height + 'px';

    perspectiveContainer.style.perspective = (state.containerDimensions.width * 1.875) + 'px';
  }

  /**
   * Update UI elements
   */
  function updateUI() {
    Controls.updateUIVisibility(state);
    Controls.updatePrimaryColor(state.shardColors[0]);
  }

  /**
   * Update progress display
   */
  function updateProgressDisplay() {
    document.getElementById('progress-slider').value = state.progress;
    document.getElementById('progress-value').textContent = Math.round(state.progress * 100) + '%';
  }

  /**
   * Update play/pause button text
   */
  function updatePlayPauseButton() {
    document.getElementById('play-pause').textContent = state.isPlaying ? 'Pause' : 'Play';
  }

  /**
   * Set playing state
   */
  function setIsPlaying(playing) {
    state.isPlaying = playing;
    stateRef.current = state;
    updatePlayPauseButton();

    if (playing) {
      Animation.startAnimation(stateRef, function(newProgress, newDirection, shouldContinue) {
        state.progress = newProgress;
        state.direction = newDirection;
        if (!shouldContinue) {
          state.isPlaying = false;
          updatePlayPauseButton();
        }
        updateProgressDisplay();
        render();
      });
    } else {
      Animation.stopAnimation();
    }
  }

  /**
   * Render the animation
   */
  function render() {
    Animation.updateAnimationDisplay(state, shardTargets, shardElements, stackWrapper);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getState: function() { return state; }
  };
})();
