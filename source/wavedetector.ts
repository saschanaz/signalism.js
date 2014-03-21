"use strict";

interface Wave extends IntermediateWave {
    secondBottom: number;
}
interface IntermediateWave {
    firstBottom: number;
    peak: number;
}

class WaveDetector {
    ondetect: (wave: Wave) => any;
    private signalBuffer: number[] = [];
    private waveBuffer: IntermediateWave[] = [];
    private get lastBufferedWave() {
        return this.waveBuffer[this.waveBuffer.length - 1];
    }

    private lastThree(index: number) {
        return this.signalBuffer[this.signalBuffer.length - 3 + index];
    }

    private exportIntermediateWave(): IntermediateWave {
        var signals = this.signalBuffer.splice(0, this.signalBuffer.length - 1);
        return {
            firstBottom: Math.min.apply(null, signals),
            peak: signals[signals.length - 1]
        };
    }

    private saveWave(wave: IntermediateWave) {
        if (wave.firstBottom > 0) {
            if (this.lastBufferedWave.peak < wave.peak) {
                this.lastBufferedWave.peak = wave.peak;
            }
        }
        else
            this.waveBuffer.push(wave);
    }

    readSignal(signal: number) {
        this.signalBuffer.push(signal);
        if (this.signalBuffer.length < 3) {
            return;
        }

        if (this.lastThree(0) <= this.lastThree(1)
            && this.lastThree(1) > this.lastThree(2)
            && this.lastThree(1) > 0) {
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
    }
}