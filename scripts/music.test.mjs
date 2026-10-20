import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../js/script.js', import.meta.url), 'utf8');
const music = source.slice(source.indexOf('  var bgMusic ='), source.indexOf('  // ---------- Opening flow:'));
function setup(blocked = false) {
  const listeners = {}, audioEvents = {}, attrs = {};
  let toggle, attempts = 0;
  const audio = {paused: true, play() { attempts++; if (blocked) return Promise.reject(new Error('NotAllowedError')); this.paused = false; return Promise.resolve(); }, pause() { this.paused = true; }, addEventListener(k, fn) { audioEvents[k] = fn; }};
  const button = {classList: {toggle() {}}, setAttribute(k, v) { attrs[k] = v; }, addEventListener(k, fn) { toggle = fn; }};
  const context = {document: {getElementById: id => id === 'bgMusic' ? audio : button, addEventListener(k, fn) { listeners[k] = fn; }}};
  vm.createContext(context); vm.runInContext(music, context);
  return {audio, attrs, context, listeners, toggle: () => toggle(), allow: () => { blocked = false; }, attempts: () => attempts};
}
const gesture = {target: {closest: () => false}};
test('music starts on entry when allowed; guest pause survives other gestures and opening', async () => {
  const p = setup(); await Promise.resolve(); assert.equal(p.attempts(), 1); assert.equal(p.audio.paused, false);
  p.toggle(); assert.equal(p.audio.paused, true); p.listeners.pointerdown(gesture); p.context.startMusic(); assert.equal(p.attempts(), 1);
  p.toggle(); await Promise.resolve(); assert.equal(p.audio.paused, false);
});
test('blocked autoplay shows stopped state and retries on first permitted gesture', async () => {
  const p = setup(true); await new Promise(resolve => setImmediate(resolve)); assert.equal(p.attrs['aria-pressed'], 'false');
  p.allow(); p.listeners.pointerdown(gesture); await Promise.resolve(); assert.equal(p.audio.paused, false); assert.equal(p.attrs['aria-pressed'], 'true');
});
test('music toggle interaction is not consumed by the generic gesture handler', () => {
  const p = setup(); const n = p.attempts(); p.listeners.pointerdown({target: {closest: () => true}}); assert.equal(p.attempts(), n);
});
