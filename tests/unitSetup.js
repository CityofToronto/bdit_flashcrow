/* global jest */
import Blob from 'node-blob';

global.Blob = Blob;
global.URL.createObjectURL = jest.fn();
global.window = {
  location: {
    origin: 'https://localhost:8081',
  },
};

/*
 * This is overkill for unit tests, but helpful to ensure that database-backed
 * tests don't timeout.
 */
jest.setTimeout(60000);
