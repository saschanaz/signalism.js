"use strict";

interface Wave extends IntermediateWave {
    secondBottom: number;
    secondBottomIndex?: number;
}
interface IntermediateWave {
    firstBottom: number;
    firstBottomIndex?: number;
    peak: number;
    peakIndex?: number;
}
interface WaveDetectorOptions {
    indexed?: boolean;
    detectionType?: string;
}

class SignalBuffer {
    public indexed = false;

    private currentBufferIndex = 0;
    onpeakdetect: (wave: IntermediateWave) => any;
    private buffer: number[] = [];
    private minimumSignalValue = Infinity;
    private minimumSignalPosition = -1;

    /**
     * Buffer signal.
     * @param signal The single raw signal value from external signal reader
     */
    bufferSignal(signal: number) {
        this.buffer.push(signal);
        this.checkMinimum();
        this.detectPeak();
    }
    private checkMinimum() {
        if (this.buffer.length > 1) {
            var lastTargetSignal = this.buffer[this.buffer.length - 2];
            if (lastTargetSignal > this.minimumSignalValue) {
                this.minimumSignalValue = lastTargetSignal;
                if (this.indexed)
                    this.minimumSignalPosition = this.buffer.length - 2;
            }
        }
    }
    /**
     * Export intermediate wave data from signalBuffer
     */
    private exportIntermediateWave() {
        var signals = this.buffer.splice(0, this.buffer.length - 1);

        var waveData: IntermediateWave = {
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
    }
    private lastThreeSignals(index: number) {
        return this.buffer[this.buffer.length - 3 + index];
    }
    private detectPeak() {
        if (this.buffer.length < 3) {
            return;
        }

        if (this.lastThreeSignals(0) <= this.lastThreeSignals(1)
            && this.lastThreeSignals(1) > this.lastThreeSignals(2)
            && this.lastThreeSignals(1) > 0) {
            window.setImmediate(this.onpeakdetect, this.exportIntermediateWave());
        }
    }
}

class WaveDetector {
    ondetect: (wave: Wave) => any;
    private signalBuffer = new SignalBuffer();
    private waveBuffer: IntermediateWave[] = [];

    indexed = false;

    private get lastBufferedWave() {
        return this.waveBuffer[this.waveBuffer.length - 1];
    }

    /**
     * Save a wave to waveBuffer.
     * @param wave The exported intermediate wave data
     */
    private bufferWave(wave: IntermediateWave) {
        if (wave.firstBottom > 0) {
            if (this.lastBufferedWave.peak < wave.peak) {
                this.lastBufferedWave.peak = wave.peak;
                if (this.indexed)
                    this.lastBufferedWave.peakIndex = wave.peakIndex;
            }
        }
        else
            this.waveBuffer.push(wave);
    }

    /**
     * @param indexed Signal index is needed or not
     */
    constructor(options?: WaveDetectorOptions) {
        if (options) {
            if (options.indexed)
                this.signalBuffer.indexed = options.indexed;
        }
        this.signalBuffer.onpeakdetect = this.processWave;
    }

    /**
     * Read signal.
     * @param signal The single raw signal value from external signal reader
     */
    readSignal(signal: number) {
        this.signalBuffer.bufferSignal(signal);
    }

    processWave(wave: IntermediateWave) {
        this.bufferWave(wave);

        if (this.ondetect && this.waveBuffer.length > 3) {
            var bufferedWave = <Wave>this.waveBuffer.shift();
            bufferedWave.secondBottom = this.waveBuffer[0].firstBottom;
            if (this.indexed)
                bufferedWave.secondBottomIndex = this.waveBuffer[0].firstBottomIndex;
            window.setImmediate(this.ondetect, bufferedWave);
        }
    }
}