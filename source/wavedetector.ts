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
     * Export intermediate wave.
     */
    private exportIntermediateWave(): IntermediateWave {
        var signals = this.signalBuffer.splice(0, this.signalBuffer.length - 1);

        return {
            firstBottom: Math.min.apply(null, signals),
            peak: signals[signals.length - 1]
        };
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
                var wave = this.waveBuffer.shift();
                window.setImmediate(this.ondetect, {
                    firstBottom: wave.firstBottom,
                    peak: wave.peak,
                    secondBottom: this.waveBuffer[0].firstBottom
                });
            }
        }
    }
}