'use strict';

// Tests for .devcontainer/devcontainer.json
//
// This repository has no existing JS test framework configured, so these
// tests use Node's built-in test runner (node:test) and assert module,
// which require no additional dependencies. Run with:
//   node --test .devcontainer/devcontainer.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DEVCONTAINER_PATH = path.join(__dirname, 'devcontainer.json');

function readRawContents() {
  return fs.readFileSync(DEVCONTAINER_PATH, 'utf8');
}

function readDevcontainer() {
  return JSON.parse(readRawContents());
}

test('devcontainer.json exists', () => {
  assert.ok(fs.existsSync(DEVCONTAINER_PATH), 'expected .devcontainer/devcontainer.json to exist');
});

test('devcontainer.json is valid, parseable JSON', () => {
  const raw = readRawContents();
  assert.doesNotThrow(() => JSON.parse(raw), 'devcontainer.json should be valid JSON');
});

test('devcontainer.json parses to a plain object', () => {
  const config = readDevcontainer();
  assert.strictEqual(typeof config, 'object');
  assert.ok(config !== null);
  assert.strictEqual(Array.isArray(config), false);
});

test('devcontainer.json contains only the expected top-level keys', () => {
  const config = readDevcontainer();
  const keys = Object.keys(config).sort();
  assert.deepStrictEqual(keys, ['features', 'image']);
});

test('"image" field is present and is a non-empty string', () => {
  const config = readDevcontainer();
  assert.ok('image' in config, 'expected an "image" field');
  assert.strictEqual(typeof config.image, 'string');
  assert.ok(config.image.length > 0, 'image should not be an empty string');
});

test('"image" field matches the expected universal devcontainer image', () => {
  const config = readDevcontainer();
  assert.strictEqual(config.image, 'mcr.microsoft.com/devcontainers/universal:2');
});

test('"image" field looks like a well-formed container image reference', () => {
  const config = readDevcontainer();
  // registry/namespace/image:tag - basic sanity check on shape, not a full
  // OCI reference grammar validation.
  const imageReferencePattern = /^[a-z0-9.-]+(:[0-9]+)?(\/[a-zA-Z0-9._-]+)+:[a-zA-Z0-9._-]+$/;
  assert.match(config.image, imageReferencePattern);
});

test('"features" field is present and is a plain object', () => {
  const config = readDevcontainer();
  assert.ok('features' in config, 'expected a "features" field');
  assert.strictEqual(typeof config.features, 'object');
  assert.ok(config.features !== null);
  assert.strictEqual(Array.isArray(config.features), false);
});

test('"features" is empty in this configuration', () => {
  const config = readDevcontainer();
  assert.deepStrictEqual(config.features, {});
});

test('devcontainer.json does not define conflicting build/dockerFile/dockerComposeFile alongside image', () => {
  const config = readDevcontainer();
  // The devcontainer spec disallows mixing "image" with "build",
  // "dockerFile", or "dockerComposeFile" - guard against future edits
  // accidentally introducing an invalid combination.
  assert.strictEqual(config.build, undefined);
  assert.strictEqual(config.dockerFile, undefined);
  assert.strictEqual(config.dockerComposeFile, undefined);
});

test('devcontainer.json file has no UTF-8 BOM', () => {
  const buffer = fs.readFileSync(DEVCONTAINER_PATH);
  const hasBom = buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  assert.strictEqual(hasBom, false);
});