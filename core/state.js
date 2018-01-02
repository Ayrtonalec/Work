var state = function () {
    this.fontSizeScale = 1;
    this.fontWeight = 12;
    this.fontSize = 0;

    this.leading = 0;

    // Current point (in user coordinates)
    this.x = 0;
    this.y = 0;

    // Start of text line (in text coordinates)
    this.lineX = 0;
    this.lineY = 0;

    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRise = 0;
    this.textContent = '';

    // Default foreground and background colors
    this.fillColor = '#000000';
    this.strokeColor = '#000000';

    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.lineJoin = '';
    this.lineCap = '';
    this.miterLimit = 0;

    this.dashArray = [];
    this.dashPhase = 0;

    this.dependencies = [];

    // Clipping
    this.activeClipUrl = null;
    this.clipGroup = null;

    this.maskId = '';
};

state.prototype = {
    clone: function() {
      return Object.create(this);
    },
    setCurrentPoint: function(x, y) {
      this.x = x;
      this.y = y;
    }
};

module.exports = state;