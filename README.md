# Who speaks?

Speaker recognition using Mel Frequency Cepstral Coefficients (MFCC) and Linde-Buzo-Gray (LBG) clustering algorithm.
The implementation is based on [this matlab tutorial](http://www.ifp.illinois.edu/~minhdo/teaching/speaker_recognition/).
It gives about **~65%** of correct results using [this data set](http://www.openslr.org/22/).

## Prepare audio files

```
bash scripts/preprocess-audio.sh
```

Creates `audio-preprocessed` folder


## Train

```
./src/cli.js train ./audio-preprocessed/train/
```

Creates `training-results.json`

## Recognize

Requires `training-results.json`

```
./src/cli.js recognize ./audio-preprocessed/test/F101_test_1.wav
```

## Test performance

Requires `training-results.json`

```
./src/cli.js test-performance ./audio-preprocessed/test/
```
