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
declare class WaveDetector {
    private indexed;
    public ondetect: (wave: Wave) => any;
    private signalBuffer;
    private waveBuffer;
    private lastBufferedWave;
    /**
    * Save a wave to waveBuffer.
    * @param wave The exported intermediate wave data
    */
    private bufferWave(wave);
    /**
    * @param indexed Signal index is needed or not
    */
    constructor(indexed?: boolean);
    /**
    * Export intermediate wave.
    */
    private exportIntermediateWave();
    private lastThreeSignals(index);
    /**
    * Read signal.
    * @param signal The single raw signal value from external signal reader
    */
    public readSignal(signal: number): void;
}
