/* global jest */
import Blob from 'node-blob';

global.Blob = Blob;
global.URL.createObjectURL = jest.fn();
global.window = {};
