"use strict";
var WaveDetector = (function () {
    function WaveDetector() {
        this.signalBuffer = [];
        this.waveBuffer = [];
    }
    Object.defineProperty(WaveDetector.prototype, "lastBufferedWave", {
        get: function () {
            return this.waveBuffer[this.waveBuffer.length - 1];
        },
        enumerable: true,
        configurable: true
    });

    WaveDetector.prototype.lastThree = function (index) {
        return this.signalBuffer[this.signalBuffer.length - 3 + index];
    };

    WaveDetector.prototype.exportIntermediateWave = function () {
        var signals = this.signalBuffer.splice(0, this.signalBuffer.length - 1);
        return {
            firstBottom: Math.min.apply(null, signals),
            peak: signals[signals.length - 1]
        };
    };

    WaveDetector.prototype.saveWave = function (wave) {
        if (wave.firstBottom > 0) {
            if (this.lastBufferedWave.peak < wave.peak) {
                this.lastBufferedWave.peak = wave.peak;
            }
        } else
            this.waveBuffer.push(wave);
    };

    WaveDetector.prototype.readSignal = function (signal) {
        this.signalBuffer.push(signal);
        if (this.signalBuffer.length < 3) {
            return;
        }

        if (this.lastThree(0) <= this.lastThree(1) && this.lastThree(1) > this.lastThree(2) && this.lastThree(1) > 0) {
            this.saveWave(this.exportIntermediateWave());

            if (this.ondetect && this.waveBuffer.length > 3) {
                var wave = this.waveBuffer.shift();
                window.setImmediate(this.ondetect, {
                    firstBottom: wave.firstBottom,
                    peak: wave.peak,
                    secondBottom: this.waveBuffer[0].firstBottom
                });
            }
        }
    };
    return WaveDetector;
})();
//# sourceMappingURL=signalism.js.map
