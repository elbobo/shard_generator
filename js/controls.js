/**
 * UI Controls for the plane animation
 */

var PlaneAnimation = window.PlaneAnimation || {};

PlaneAnimation.Controls = (function() {

  /**
   * Create a position grid component
   */
  function createPositionGrid(container, label, initialValue, color, onChange) {
    var positions = [
      ['top-left', 'top-center', 'top-right'],
      ['center-left', 'center-center', 'center-right'],
      ['bottom-left', 'bottom-center', 'bottom-right']
    ];

    var currentValue = initialValue;

    var labelEl = document.createElement('label');
    labelEl.className = 'position-grid-label';
    labelEl.textContent = label;
    container.appendChild(labelEl);

    var grid = document.createElement('div');
    grid.className = 'position-grid';
    container.appendChild(grid);

    var buttons = {};

    positions.forEach(function(row) {
      row.forEach(function(pos) {
        var button = document.createElement('button');
        button.title = pos;
        button.dataset.position = pos;

        if (pos === currentValue) {
          button.classList.add('selected');
          button.style.borderColor = color;
          button.style.background = color + '15';
        }

        button.addEventListener('click', function() {
          Object.keys(buttons).forEach(function(key) {
            buttons[key].classList.remove('selected');
            buttons[key].style.borderColor = '#ccc';
            buttons[key].style.background = 'white';
          });

          button.classList.add('selected');
          button.style.borderColor = color;
          button.style.background = color + '15';
          currentValue = pos;
          onChange(pos);
        });

        buttons[pos] = button;
        grid.appendChild(button);
      });
    });

    return {
      getValue: function() { return currentValue; },
      setValue: function(value) {
        if (buttons[value]) {
          Object.keys(buttons).forEach(function(key) {
            buttons[key].classList.remove('selected');
            buttons[key].style.borderColor = '#ccc';
            buttons[key].style.background = 'white';
          });
          buttons[value].classList.add('selected');
          buttons[value].style.borderColor = color;
          buttons[value].style.background = color + '15';
          currentValue = value;
        }
      },
      updateColor: function(newColor) {
        color = newColor;
        var selectedBtn = buttons[currentValue];
        if (selectedBtn) {
          selectedBtn.style.borderColor = newColor;
          selectedBtn.style.background = newColor + '15';
        }
      }
    };
  }

  /**
   * Create plane color controls
   */
  function createPlaneColorControls(container, colors, opacities, onColorChange, onOpacityChange, primaryColor) {
    container.innerHTML = '';

    colors.forEach(function(color, i) {
      var item = document.createElement('div');
      item.className = 'plane-color-item';

      var colorRow = document.createElement('div');
      colorRow.className = 'plane-color-row';

      var label = document.createElement('span');
      label.className = 'plane-color-label';
      label.textContent = 'Plane ' + (i + 1) + ':';

      var colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = color;
      colorInput.addEventListener('input', function(e) {
        onColorChange(i, e.target.value);
      });

      var opacityInput = document.createElement('input');
      opacityInput.type = 'range';
      opacityInput.min = '0';
      opacityInput.max = '1';
      opacityInput.step = '0.01';
      opacityInput.value = opacities[i];
      opacityInput.title = 'Opacity: ' + Math.round(opacities[i] * 100) + '%';

      var opacityValue = document.createElement('span');
      opacityValue.className = 'opacity-value';
      opacityValue.textContent = Math.round(opacities[i] * 100) + '%';

      var resetBtn = document.createElement('button');
      resetBtn.className = 'reset-button';
      resetBtn.textContent = 'Reset';
      resetBtn.style.background = primaryColor;
      resetBtn.addEventListener('click', function() {
        colorInput.value = '#C50978';
        opacityInput.value = 0.5;
        opacityValue.textContent = '50%';
        onColorChange(i, '#C50978');
        onOpacityChange(i, 0.5);
      });

      colorRow.appendChild(label);
      colorRow.appendChild(colorInput);
      colorRow.appendChild(resetBtn);

      var opacityRow = document.createElement('div');
      opacityRow.className = 'plane-opacity-row';

      opacityInput.addEventListener('input', function(e) {
        var value = Number(e.target.value);
        opacityValue.textContent = Math.round(value * 100) + '%';
        onOpacityChange(i, value);
      });

      opacityRow.appendChild(opacityInput);
      opacityRow.appendChild(opacityValue);

      item.appendChild(colorRow);
      item.appendChild(opacityRow);
      container.appendChild(item);
    });

    return {
      update: function(newColors, newOpacities, newPrimaryColor) {
        createPlaneColorControls(container, newColors, newOpacities, onColorChange, onOpacityChange, newPrimaryColor);
      }
    };
  }

  /**
   * Bind slider to display value element
   */
  function bindSliderToValue(slider, valueDisplay, suffix, onChange) {
    suffix = suffix || '';
    slider.addEventListener('input', function(e) {
      var value = Number(e.target.value);
      valueDisplay.textContent = value + suffix;
      if (onChange) onChange(value);
    });
  }

  /**
   * Update UI visibility based on state
   */
  function updateUIVisibility(state) {
    var startStackedOptions = document.getElementById('start-stacked-options');
    var startUnstackedOptions = document.getElementById('start-unstacked-options');

    if (state.startStacked) {
      startStackedOptions.style.display = 'block';
      startUnstackedOptions.style.display = 'none';
    } else {
      startStackedOptions.style.display = 'none';
      startUnstackedOptions.style.display = 'block';
    }

    var endOptions = document.getElementById('end-options');
    var endStackedOptions = document.getElementById('end-stacked-options');
    var endUnstackedOptions = document.getElementById('end-unstacked-options');

    if (state.returnToStart) {
      endOptions.style.display = 'none';
    } else {
      endOptions.style.display = 'block';
      if (state.endStacked) {
        endStackedOptions.style.display = 'block';
        endUnstackedOptions.style.display = 'none';
      } else {
        endStackedOptions.style.display = 'none';
        endUnstackedOptions.style.display = 'block';
      }
    }

    var helperText = document.getElementById('positional-variation-helper');
    if (helperText) {
      helperText.textContent = state.startStacked
        ? 'How much planes spread apart during journey'
        : 'How much planes move around during journey';
    }
  }

  /**
   * Toggle controls panel visibility
   */
  function toggleControlsPanel(show) {
    var panel = document.getElementById('controls-panel');
    var toggleBtn = document.getElementById('toggle-controls');
    var playbackControls = document.getElementById('playback-controls');

    if (show) {
      panel.classList.remove('hidden');
      toggleBtn.classList.remove('collapsed');
      playbackControls.classList.remove('expanded');
    } else {
      panel.classList.add('hidden');
      toggleBtn.classList.add('collapsed');
      playbackControls.classList.add('expanded');
    }
  }

  /**
   * Update primary color CSS variable
   */
  function updatePrimaryColor(color) {
    document.documentElement.style.setProperty('--primary-color', color);
  }

  // Public API
  return {
    createPositionGrid: createPositionGrid,
    createPlaneColorControls: createPlaneColorControls,
    bindSliderToValue: bindSliderToValue,
    updateUIVisibility: updateUIVisibility,
    toggleControlsPanel: toggleControlsPanel,
    updatePrimaryColor: updatePrimaryColor
  };
})();
