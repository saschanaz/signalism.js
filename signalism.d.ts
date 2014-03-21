interface Wave extends IntermediateWave {
    secondBottom: number;
}
interface IntermediateWave {
    firstBottom: number;
    peak: number;
}
declare class WaveDetector {
    public ondetect: (wave: Wave) => any;
    private signalBuffer;
    private waveBuffer;
    private lastBufferedWave;
    private lastThree(index);
    private exportIntermediateWave();
    private saveWave(wave);
    public readSignal(signal: number): void;
}
