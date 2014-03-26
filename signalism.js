"use strict";
var WaveDetector = (function () {
    /**
    * @param indexed Signal index is needed or not
    */
    function WaveDetector(indexed) {
        this.indexed = indexed;
        this.signalBuffer = [];
        this.currentBufferIndex = 0;
        this.waveBuffer = [];
    }
    Object.defineProperty(WaveDetector.prototype, "lastBufferedWave", {
        get: function () {
            return this.waveBuffer[this.waveBuffer.length - 1];
        },
        enumerable: true,
        configurable: true
    });

    /**
    * Save a wave to waveBuffer.
    * @param wave The exported intermediate wave data
    */
    WaveDetector.prototype.bufferWave = function (wave) {
        if (wave.firstBottom > 0) {
            if (this.lastBufferedWave.peak < wave.peak) {
                this.lastBufferedWave.peak = wave.peak;
            }
        } else
            this.waveBuffer.push(wave);
    };

    /**
    * Export intermediate wave data from signalBuffer
    */
    WaveDetector.prototype.exportIntermediateWave = function () {
        var signals = this.signalBuffer.splice(0, this.signalBuffer.length - 1);
        this.currentBufferIndex += signals.length;

        return {
            firstBottom: Math.min.apply(null, signals),
            peak: signals[signals.length - 1]
        };
    };

    /**
    * Detect bottom value and, optionally, position from the given signal array.
    * @param signals The signal array
    */
    WaveDetector.prototype.getWaveFirstBottom = function (signals) {
        if (!this.indexed) {
            return {
                firstBottom: Math.min.apply(null, signals),
                peak: null
            };
        } else {
            var minimum = signals[0];
            var minimumPosition = 0;
            for (var i = 1; i < signals.length; i++) {
                if (signals[i] <= minimum) {
                    minimum = signals[i];
                    minimumPosition = i;
                }
            }
            return {
                firstBottom: minimum,
                firstBottomIndex: this.currentBufferIndex + minimumPosition,
                peak: null,
                peakIndex: null
            };
        }
    };

    WaveDetector.prototype.lastThreeSignals = function (index) {
        return this.signalBuffer[this.signalBuffer.length - 3 + index];
    };

    /**
    * Read signal.
    * @param signal The single raw signal value from external signal reader
    */
    WaveDetector.prototype.readSignal = function (signal) {
        this.signalBuffer.push(signal);
        if (this.signalBuffer.length < 3) {
            return;
        }

        if (this.lastThreeSignals(0) <= this.lastThreeSignals(1) && this.lastThreeSignals(1) > this.lastThreeSignals(2) && this.lastThreeSignals(1) > 0) {
            this.bufferWave(this.exportIntermediateWave());

            if (this.ondetect && this.waveBuffer.length > 3) {
                var wave = this.waveBuffer.shift();
                wave.secondBottom = this.waveBuffer[0].firstBottom;
                window.setImmediate(this.ondetect, wave);
            }
        }
    };
    return WaveDetector;
})();
//# sourceMappingURL=signalism.js.map
