"use strict";
var SignalBuffer = (function () {
    function SignalBuffer() {
        this.indexed = false;
        this.currentBufferIndex = 0;
        this.buffer = [];
        this.minimumSignalValue = Infinity;
        this.minimumSignalPosition = -1;
    }
    /**
    * Buffer signal.
    * @param signal The single raw signal value from external signal reader
    */
    SignalBuffer.prototype.bufferSignal = function (signal) {
        this.buffer.push(signal);
        this.checkMinimum();
        this.detectPeak();
    };
    SignalBuffer.prototype.checkMinimum = function () {
        if (this.buffer.length > 1) {
            var lastTargetSignal = this.buffer[this.buffer.length - 2];
            if (lastTargetSignal > this.minimumSignalValue) {
                this.minimumSignalValue = lastTargetSignal;
                if (this.indexed)
                    this.minimumSignalPosition = this.buffer.length - 2;
            }
        }
    };

    /**
    * Export intermediate wave data from signalBuffer
    */
    SignalBuffer.prototype.exportIntermediateWave = function () {
        var signals = this.buffer.splice(0, this.buffer.length - 1);

        var waveData = {
            firstBottom: this.minimumSignalValue,
            peak: signals[signals.length - 1]
        };

        waveData.peak = signals[signals.length - 1];
        if (this.indexed) {
            waveData.firstBottomIndex = this.minimumSignalPosition;
            waveData.peakIndex = this.currentBufferIndex + signals.length - 1;
        }

        this.currentBufferIndex += signals.length;
        return waveData;
    };
    SignalBuffer.prototype.lastThreeSignals = function (index) {
        return this.buffer[this.buffer.length - 3 + index];
    };
    SignalBuffer.prototype.detectPeak = function () {
        if (this.buffer.length < 3) {
            return;
        }

        if (this.lastThreeSignals(0) <= this.lastThreeSignals(1) && this.lastThreeSignals(1) > this.lastThreeSignals(2) && this.lastThreeSignals(1) > 0) {
            window.setImmediate(this.onpeakdetect, this.exportIntermediateWave());
        }
    };
    return SignalBuffer;
})();

var WaveDetector = (function () {
    /**
    * @param indexed Signal index is needed or not
    */
    function WaveDetector(options) {
        this.signalBuffer = new SignalBuffer();
        this.waveBuffer = [];
        this.indexed = false;
        if (options) {
            if (options.indexed)
                this.signalBuffer.indexed = options.indexed;
        }
        this.signalBuffer.onpeakdetect = this.processWave;
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
                if (this.indexed)
                    this.lastBufferedWave.peakIndex = wave.peakIndex;
            }
        } else
            this.waveBuffer.push(wave);
    };

    /**
    * Read signal.
    * @param signal The single raw signal value from external signal reader
    */
    WaveDetector.prototype.readSignal = function (signal) {
        this.signalBuffer.bufferSignal(signal);
    };

    WaveDetector.prototype.processWave = function (wave) {
        this.bufferWave(wave);

        if (this.ondetect && this.waveBuffer.length > 3) {
            var bufferedWave = this.waveBuffer.shift();
            bufferedWave.secondBottom = this.waveBuffer[0].firstBottom;
            if (this.indexed)
                bufferedWave.secondBottomIndex = this.waveBuffer[0].firstBottomIndex;
            window.setImmediate(this.ondetect, bufferedWave);
        }
    };
    return WaveDetector;
})();
//# sourceMappingURL=signalism.js.map
