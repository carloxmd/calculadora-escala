/* Domain functions stay independent of the UI so future modules can reuse them. */
(function (global) {
  'use strict';
  const units = Object.freeze({ mm: 0.001, cm: 0.01, m: 1, km: 1000 });
  const presets = Object.freeze({
    Objetos: [1, 2, 5, 10],
    Arquitectura: [20, 25, 50, 75, 100, 125, 200, 250],
    Urbanismo: [500, 1000, 2000, 5000, 10000, 25000],
    Territorio: [50000, 100000, 250000, 500000]
  });
  function parse(value) {
    const text = String(value).trim();
    if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(text)) return NaN;
    const number = Number(text.replace(',', '.'));
    return Number.isFinite(number) ? number : NaN;
  }
  function convert(value, from, to) { return value * units[from] / units[to]; }
  function toPlan(value, realUnit, planUnit, scale) { return convert(value, realUnit, planUnit) / scale; }
  function toReal(value, planUnit, realUnit, scale) { return convert(value, planUnit, realUnit) * scale; }
  function findScale(real, realUnit, plan, planUnit) { return convert(real, realUnit, planUnit) / plan; }
  const engine = Object.freeze({ units, presets, parse, convert, toPlan, toReal, findScale });
  global.Escala = Object.freeze({ version: '1.0.0', engine, modules: Object.freeze({ scale: engine }) });
  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  const readable = value => Number(value.toPrecision(10)).toLocaleString('en-US', { maximumSignificantDigits: 10 });
  const editable = value => String(Number(value.toPrecision(14)));
  const equivalence = n => `1 cm en plano = ${readable(n / 100)} m reales`;
  let lastEdited = 'real';
  // Exact physical quantities are retained when display units change.
  const meters = { real: 25, plan: 0.05, 'known-real': 850, 'known-plan': 0.17 };
  let found = NaN;
  function updatePresets(n) {
    document.querySelectorAll('[data-scale]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.scale) === n)));
  }
  function updateConversion() {
    const n = parse($('scale').value);
    const source = lastEdited, target = source === 'real' ? 'plan' : 'real';
    const value = meters[source];
    const valid = n > 0 && Number.isFinite(n) && value >= 0 && Number.isFinite(value);
    const resultMeters = source === 'real' ? value / n : value * n;
    if (!valid || !Number.isFinite(resultMeters) || (value > 0 && resultMeters === 0)) {
      $('convert-error').textContent = !valid ? 'Introduce una escala positiva y una medida válida (cero o mayor).' : 'Estos valores exceden el rango de cálculo. Usa valores más moderados.';
      $(target).value = ''; meters[target] = NaN;
      $('equivalence').textContent = 'Revisa los valores para calcular';
      $('scale-summary').textContent = 'Admite coma o punto decimal, sin separadores de miles.';
      updatePresets(n); return;
    }
    meters[target] = resultMeters;
    $(target).value = editable(resultMeters / units[$(`${target}-unit`).value]);
    $('convert-error').textContent = '';
    $('equivalence').textContent = equivalence(n);
    $('scale-summary').textContent = `Escala 1:${readable(n)} · ${n > 1 ? 'reducción' : n < 1 ? 'ampliación' : 'tamaño natural'}`;
    updatePresets(n);
  }
  function updateFinder() {
    found = meters['known-real'] / meters['known-plan'];
    const valid = meters['known-real'] > 0 && meters['known-plan'] > 0 && found > 0 && Number.isFinite(found);
    $('find-error').textContent = valid ? '' : 'Ambas medidas deben ser positivas y estar dentro del rango de cálculo.';
    $('found-scale').textContent = valid ? `1:${readable(found)}` : '—';
    $('found-equivalence').textContent = valid ? equivalence(found) : 'Introduce dos medidas válidas.';
    $('use-scale').disabled = !valid;
  }
  function activateTab(mode) {
    ['convert', 'find'].forEach(id => {
      const active = id === mode;
      $(`${id}-tab`).setAttribute('aria-selected', String(active));
      $(`${id}-tab`).tabIndex = active ? 0 : -1;
      $(`${id}-panel`).hidden = !active;
    });
  }
  Object.entries(presets).forEach(([name, values]) => {
    const group = document.createElement('div'); group.className = 'preset-group';
    const label = document.createElement('span'); label.textContent = name;
    const buttons = document.createElement('div'); buttons.className = 'preset-buttons';
    values.forEach(n => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.scale = n;
      button.textContent = `1:${readable(n)}`; button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => { $('scale').value = n; updateConversion(); }); buttons.append(button);
    });
    group.append(label, buttons); $('presets').append(group);
  });
  ['real', 'plan', 'known-real', 'known-plan'].forEach(id => {
    const finder = id.startsWith('known');
    $(id).addEventListener('input', () => {
      meters[id] = parse($(id).value) * units[$(`${id}-unit`).value];
      if (finder) updateFinder(); else { lastEdited = id; updateConversion(); }
    });
    $(`${id}-unit`).addEventListener('change', () => {
      if (Number.isFinite(meters[id])) $(id).value = editable(meters[id] / units[$(`${id}-unit`).value]);
      if (finder) updateFinder(); else updateConversion();
    });
  });
  $('scale').addEventListener('input', updateConversion);
  ['convert', 'find'].forEach(id => {
    $(`${id}-tab`).addEventListener('click', () => activateTab(id));
    $(`${id}-tab`).addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 'convert' : event.key === 'End' ? 'find' : id === 'convert' ? 'find' : 'convert';
        activateTab(next); $(`${next}-tab`).focus();
      }
    });
  });
  $('use-scale').addEventListener('click', () => {
    if (!(found > 0 && Number.isFinite(found))) return;
    $('scale').value = String(found); updateConversion(); activateTab('convert'); $('scale').focus();
  });
  updateConversion(); updateFinder();
})(typeof globalThis !== 'undefined' ? globalThis : window);
