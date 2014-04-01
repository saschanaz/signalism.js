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
}
declare class SignalBuffer {
    public indexed: boolean;
    private currentBufferIndex;
    public onpeakdetect: (wave: IntermediateWave) => any;
    private buffer;
    private minimumSignalValue;
    private minimumSignalPosition;
    /**
    * Buffer signal.
    * @param signal The single raw signal value from external signal reader
    */
    public bufferSignal(signal: number): void;
    private checkMinimum();
    /**
    * Export intermediate wave data from signalBuffer
    */
    private exportIntermediateWave();
    private lastThreeSignals(index);
    private detectPeak();
}
declare class WaveDetector {
    public ondetect: (wave: Wave) => any;
    private signalBuffer;
    private waveBuffer;
    public indexed: boolean;
    private lastBufferedWave;
    /**
    * Save a wave to waveBuffer.
    * @param wave The exported intermediate wave data
    */
    private bufferWave(wave);
    /**
    * @param indexed Signal index is needed or not
    */
    constructor(options?: WaveDetectorOptions);
    /**
    * Read signal.
    * @param signal The single raw signal value from external signal reader
    */
    public readSignal(signal: number): void;
    public processWave(wave: IntermediateWave): void;
}
