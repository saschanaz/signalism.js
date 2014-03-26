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

class WaveDetector {
    ondetect: (wave: Wave) => any;
    private signalBuffer: number[] = [];
    private currentBufferIndex = 0;
    private waveBuffer: IntermediateWave[] = [];

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
    constructor(private indexed?: boolean) {
    }


    /** 
     * Export intermediate wave data from signalBuffer
     */
    private exportIntermediateWave(): IntermediateWave {
        var signals = this.signalBuffer.splice(0, this.signalBuffer.length - 1);
        this.currentBufferIndex += signals.length;

        var waveData = this.getWaveFirstBottom(signals);
        waveData.peak = signals[signals.length - 1];
        if (this.indexed)
            waveData.peakIndex = this.currentBufferIndex + signals.length - 1;

        return waveData;
    }


    /** 
     * Detect bottom value and, optionally, position from the given signal array.
     * @param signals The signal array
     */
    private getWaveFirstBottom(signals: number[]): IntermediateWave {
        if (!this.indexed) {
            return {
                firstBottom: Math.min.apply(null, signals),
                peak: null
            }
        }
        else {
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
            }
        }
    }

    private lastThreeSignals(index: number) {
        return this.signalBuffer[this.signalBuffer.length - 3 + index];
    }

    /**
     * Read signal.
     * @param signal The single raw signal value from external signal reader
     */
    readSignal(signal: number) {
        this.signalBuffer.push(signal);
        if (this.signalBuffer.length < 3) {
            return;
        }

        if (this.lastThreeSignals(0) <= this.lastThreeSignals(1)
            && this.lastThreeSignals(1) > this.lastThreeSignals(2)
            && this.lastThreeSignals(1) > 0) {
            this.bufferWave(this.exportIntermediateWave());

            if (this.ondetect && this.waveBuffer.length > 3) {
                var wave = <Wave>this.waveBuffer.shift();
                wave.secondBottom = this.waveBuffer[0].firstBottom;
                if (this.indexed)
                    wave.secondBottomIndex = this.waveBuffer[0].firstBottomIndex;
                window.setImmediate(this.ondetect, wave);
            }
        }
    }
}