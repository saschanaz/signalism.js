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
    private buffer: number[] = [];
    private lastIntermediateWave: IntermediateWave;

    private lastThree(index: number) {
        return this.buffer[this.buffer.length - 3 + index];
    }

    private exportIntermediateWave(): IntermediateWave {
        var signals = this.buffer.splice(0, this.buffer.length - 1);
        return {
            firstBottom: Math.min.apply(null, signals),
            peak: signals[signals.length - 1]
        };
    }

    readSignal(signal: number) {
        this.buffer.push(signal);
        if (this.buffer.length < 3) {
            return;
        }

        if (this.lastThree(0) <= this.lastThree(1)
            && this.lastThree(1) > this.lastThree(2)
            && this.lastThree(1) > 0) {
            var newIntermediateWave = this.exportIntermediateWave();
            if (this.ondetect && this.lastIntermediateWave) {
                window.setImmediate(this.ondetect, {
                    firstBottom: this.lastIntermediateWave.firstBottom,
                    peak: this.lastIntermediateWave.peak,
                    secondBottom: newIntermediateWave.firstBottom
                });
            }
            this.lastIntermediateWave = newIntermediateWave;
        }
		//var currentPointValues = [];
        //for (var i = 0; i < 3 && coordinate[0] <= matrix.size[0]; i++) {
        //    currentPointValues.push(matrix.getFor(coordinate));
        //    coordinate[0]++;
        //}
        //while (coordinate[0] <= matrix.size[0]
        //    && !(currentPointValues[0] <= currentPointValues[1]
        //    && currentPointValues[1] > currentPointValues[2])) {

        //    currentPointValues.shift();
        //    currentPointValues.push(matrix.getFor(coordinate));
        //    coordinate[0]++;
        //}
        //if (coordinate[0] <= matrix.size[0])
        //    return { value: currentPointValues[1], position: coordinate[0] - 2 };
        //else
        //    return null;
    }
}