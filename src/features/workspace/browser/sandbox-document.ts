// The frame has an opaque origin. It receives only source text and stdin.
const workerSource = String.raw`
let lines = [];
let errors = [];
let outputChars = 0;
let outputTruncated = false;
let steps = [];
let traceTruncated = false;
let iterations = 0;
const MAX_CHARS = 8000;
const MAX_LINES = 100;
const MAX_STEPS = 200;
function format(value) {
  if (typeof value === 'string') return value.slice(0, MAX_CHARS + 1);
  if (value === undefined) return 'undefined';
  try { return JSON.stringify(safeValue(value)) ?? String(value); } catch { return '[unavailable]'; }
}
function append(target, values) {
  const text = values.map(format).join(' ');
  if (lines.length + errors.length >= MAX_LINES || outputChars + text.length > MAX_CHARS) {
    outputTruncated = true;
    return;
  }
  target.push(text);
  outputChars += text.length + 1;
  trace(0, 'output', {}, undefined, text);
}
function safeValue(value) {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value.slice(0, 120);
  if (value === null || ['number', 'boolean'].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map(safeValue);
  return '[object]';
}
function trace(line, event, variables, condition, output, functionName, arrayAccess) {
  if (steps.length >= MAX_STEPS) { traceTruncated = true; return; }
  const safeVariables = {};
  for (const key of Object.keys(variables ?? {}).slice(0, 24)) {
    try { safeVariables[key] = safeValue(variables[key]); } catch { safeVariables[key] = '[unavailable]'; }
  }
  const step = { line, event, variables: safeVariables };
  if (condition !== undefined) step.condition = Boolean(condition);
  if (output !== undefined) step.output = String(output).slice(0, 300);
  if (functionName !== undefined) step.function = String(functionName).slice(0, 80);
  if (arrayAccess !== undefined) step.arrayAccess = arrayAccess;
  if (event === 'iteration') step.iteration = ++iterations;
  steps.push(step);
}
function condition(value, line, variables) { trace(line, 'condition', variables, value); return value; }
function returning(value, line, variables) { trace(line, 'return', variables, undefined, format(value)); return value; }
function arrayAccess(value, arrayName, index, line, variables) {
  trace(line, 'array_access', variables, undefined, undefined, undefined, { array: arrayName, index: safeValue(index), value: safeValue(value) });
  return value;
}
self.onmessage = function(event) {
  const { source, input, visualize } = event.data ?? {};
  const started = performance.now();
  try {
    const localConsole = { log: (...values) => append(lines, values), error: (...values) => append(errors, values) };
    const run = new Function('input', 'console', '__tcTrace', '__tcCondition', '__tcReturn', '__tcArrayAccess', source);
    run(input, localConsole, visualize ? trace : () => {}, visualize ? condition : (value) => value, visualize ? returning : (value) => value, visualize ? arrayAccess : (value) => value);
    self.postMessage({ status: 'success', stdout: lines.join('\n'), stderr: errors.join('\n'), executionTimeMs: Math.round(performance.now() - started), trace: { steps, truncated: traceTruncated }, outputTruncated });
  } catch (error) {
    const status = error instanceof SyntaxError ? 'syntax_error' : 'runtime_error';
    self.postMessage({ status, stdout: lines.join('\n'), stderr: String(error?.message ?? error).slice(0, 1000), executionTimeMs: Math.round(performance.now() - started), trace: { steps, truncated: traceTruncated }, outputTruncated });
  }
};`;

export const sandboxDocument = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; img-src 'none'; media-src 'none'; font-src 'none'; form-action 'none'; base-uri 'none'"></head><body><script>
const workerSource = ${JSON.stringify(workerSource)};
let worker = null;
let timer = null;
window.addEventListener('message', (event) => {
  if (event.source !== parent || !event.data || typeof event.data.id !== 'string') return;
  const { id, source, input, visualize, timeoutMs, kind } = event.data;
  if (kind === 'stop') { if (worker) worker.terminate(); worker = null; clearTimeout(timer); return; }
  if (kind !== 'run' || worker || typeof source !== 'string' || source.length > 32000 || typeof input !== 'string' || input.length > 4000) return;
  const url = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
  worker = new Worker(url);
  URL.revokeObjectURL(url);
  worker.onmessage = (message) => { clearTimeout(timer); parent.postMessage({ id, kind: 'result', result: message.data }, '*'); worker.terminate(); worker = null; };
  worker.onerror = () => { clearTimeout(timer); parent.postMessage({ id, kind: 'error' }, '*'); worker.terminate(); worker = null; };
  timer = setTimeout(() => { worker.terminate(); worker = null; parent.postMessage({ id, kind: 'timeout' }, '*'); }, Math.min(Math.max(Number(timeoutMs) || 1500, 100), 3000));
  worker.postMessage({ source, input, visualize });
});
</script></body></html>`;
