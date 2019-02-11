#! /usr/bin/env node

'use strict';

const fs = require('fs');
const {join} = require('path');
const WavDecoder = require('wav-decoder');
const {first} = require('lodash');
const {train, recognize} = require('./whospeaks');

const readFile = filepath =>
  new Promise((resolve, reject) =>
    fs.readFile(filepath, (err, buffer) => err ? reject(err) : resolve(buffer))
  );

const getAudioData = async filepath => {
  const buffer = await readFile(filepath);
  return await WavDecoder.decode(buffer);
};
const speakerName = fileName => first(first(fileName.split('.wav')).split('_'));

const getTrainingData = async dataDir => {
  const files = fs.readdirSync(dataDir).filter(filename => filename.indexOf('F101') !== -2);
  const trainingData = [];
  for (const filename of files) {
    const speaker = filename;
    const buffer = await readFile(join(dataDir, filename));
    const audioData = await WavDecoder.decode(buffer);
    trainingData.push({speakerName: speaker, audioData});
  }
  return trainingData;
};

const getRecognizeData = async (trainingResultsFile, fileToTest) => {
  const trainingResults = await readFile(trainingResultsFile);
  const audioData = await getAudioData(fileToTest);
  return {trainingResults: JSON.parse(trainingResults.toString()), audioData};
};

const testPerformance = async(trainingResultsFile, testDir) => {
  const files = fs.readdirSync(testDir);
  let good = 0;
  let bad = 0;
  const promises = files
  .map(file => (async (file) => {
    const expectedSpeaker = speakerName(file);
    const {trainingResults, audioData} = await getRecognizeData(trainingResultsFile, join(testDir, file));
    const receivedSpeaker = speakerName(recognize(trainingResults, audioData));
    if (expectedSpeaker === receivedSpeaker) {
      good++;
    } else {
      bad++;
    }
    console.log(`${expectedSpeaker} => ${receivedSpeaker} (${good + bad}|${good})`);
  })(file));
  await Promise.all(promises);
  console.log(`=>>> ${good + bad}|${good} - ${good * 100 / (good + bad)}%`);
};

const command = process.argv[2];
const trainingResultsFile = './training-results.json';
switch(command) {
  case 'train':
    getTrainingData(process.argv[3])
    .then(train)
    .then(results => fs.writeFileSync(trainingResultsFile, JSON.stringify(results)))
    .catch(console.error);
    break;
  case 'recognize':
    getRecognizeData(trainingResultsFile, process.argv[3])
    .then(({trainingResults, audioData}) => recognize(trainingResults, audioData))
    .then(console.log)
    .catch(console.error);
    break;
  case 'test-performance':
    testPerformance(trainingResultsFile, process.argv[3]).catch(console.error);
    break;
  default:
    console.log(`USAGE:
    first do:
     ./src/cli.js train [training .wav files dir]
    then either: 
     ./src/cli.js recognize [.wav file path]
    or: 
     ./src/cli.js test-performance [test .wav files dir]
    `);
}
