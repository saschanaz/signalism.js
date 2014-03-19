interface Wave extends IntermediateWave {
    secondBottom: number;
}
interface IntermediateWave {
    firstBottom: number;
    peak: number;
}
declare class WaveDetector {
    public ondetect: (wave: Wave) => any;
    private buffer;
    private lastIntermediateWave;
    private lastThree(index);
    private exportIntermediateWave();
    public readSignal(signal: number): void;
}
