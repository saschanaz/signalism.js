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
declare class WaveDetector {
    public ondetect: (wave: Wave) => any;
    private signalBuffer;
    private currentBufferIndex;
    private waveBuffer;
    public indexed: boolean;
    public detectionType: string;
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
    * Export intermediate wave data from signalBuffer
    */
    private exportIntermediateWave();
    /**
    * Detect bottom value and, optionally, position from the given signal array.
    * @param signals The signal array
    */
    private getWaveFirstBottom(signals);
    private lastThreeSignals(index);
    /**
    * Read signal.
    * @param signal The single raw signal value from external signal reader
    */
    public readSignal(signal: number): void;
}
