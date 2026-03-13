import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder in Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
