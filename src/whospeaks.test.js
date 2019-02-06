'use strict';

const assert = require('assert');
const {
  signalToFrames,
  splitCentroids,
  eucDistance,
  nearestNeighbor,
  vAvg,
  centroidIsStable,
  calcDistortion,
  lbg,
} = require('./whospeaks');
const testFeatures = require('./test-features.json');

describe('whospeaks', () => {
  describe('signalToFrames', () => {
    it('is ok', () => {
      const signal = [1, 2, 3, 4, 5, 6, 7, 8];
      const sampleRate = 4;
      const frameLengthMs = 500;
      const overlapLengthMs = 250;
      const expectedFrames = [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 8]
      ];
      assert.deepStrictEqual(signalToFrames(signal, {sampleRate, frameLengthMs, overlapLengthMs}), expectedFrames);
    });
  });

  describe('splitCentroids', () => {
    it('is ok', () => {
      assert.deepStrictEqual(splitCentroids([[1, 2], [3, 4]], 1), [[2, 4], [0, 0], [6, 8], [0, 0]]);
    });
  });

  describe('eucDistance', () => {
    it('is ok', () => {
      assert.deepStrictEqual(eucDistance([1, 2], [2, 2]), 1);
      assert.deepStrictEqual(eucDistance([1, 2, 3], [1, 2, 3]), 0);
      assert.deepStrictEqual(eucDistance([1, 2, 3], [2, 3, 4]), 3 ** 0.5);
    });
  });

  describe('nearestNeighbor', () => {
    it('is ok', () => {
      assert.deepStrictEqual(nearestNeighbor([1, 2, 3], [[1, 2, 3], [3, 4, 5]]).index, 0);
    });
  });

  describe('vAvg', () => {
    it('is ok', () => {
      assert.deepStrictEqual(vAvg([[1, 2, 3], [3, 4, 3]]), [2, 3, 3]);
    });
  });

  describe('centroidIsStable', () => {
    it('is ok', () => {
      assert.deepStrictEqual(centroidIsStable(1, 0.5, 0.01), false);
      assert.deepStrictEqual(centroidIsStable(102, 100, 0.01), false);
      assert.deepStrictEqual(centroidIsStable(100, 99, 0.01), false);
      assert.deepStrictEqual(centroidIsStable(100, 99.5, 0.01), true);
    });
  });

  describe('calcDistortion', () => {
    it('is ok', () => {
      const clusters = [
        [[1, 2], [2, 1]],
        [[10, 11], [9, 10]]
      ];
      const codebook = [
        [2, 2],
        [10, 10]
      ];
      const distortion = calcDistortion(clusters, codebook);
      assert.deepStrictEqual(distortion, 1);
    });
  });

  describe('lbg', () => {
    it('should converge', () => {
      const m = 16;
      const codebook = lbg(testFeatures, m);
      assert.deepStrictEqual(codebook.length, m);
      codebook.forEach(codeword => {
        assert.equal(codeword.length, testFeatures[0].length);
      });
    });
  });
});
