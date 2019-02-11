#!/usr/bin/env bash

# normalizes volume and removes silence
# requires ffmpeg  and ffmpeg-normalize (https://github.com/slhck/ffmpeg-normalize)

remove_silence()
{
    INPUT_DIR=$1
    OUTPUT_DIR=$2

    rm -rf $OUTPUT_DIR
    mkdir -p $OUTPUT_DIR

    for AUDIO_FILE in $( ls $INPUT_DIR ); do
        echo $AUDIO_FILE
        ffmpeg -y -i $INPUT_DIR$AUDIO_FILE -af silenceremove=stop_periods=-1:stop_threshold=-30dB:stop_duration=1:detection=rms $OUTPUT_DIR$AUDIO_FILE
    done;
}

# normalize
ffmpeg-normalize -f -nt rms -t 0 ./audio/train/*.wav -of ./audio-normalized/train/ -ext wav
ffmpeg-normalize -f -nt rms -t 0 ./audio/test/*.wav -of ./audio-normalized/test/ -ext wav

# remove silence
remove_silence ./audio-normalized/test/ ./audio-preprocessed/test/
remove_silence ./audio-normalized/train/ ./audio-preprocessed/train/

# clean up
rm -rf ./audio-normalized
