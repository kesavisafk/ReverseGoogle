(function(){
  function toArrayValue(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  }

  function normalizeMap(rawMap) {
    var out = {};
    Object.keys(rawMap || {}).forEach(function(key){
      var normalizedKey = String(key || '').toLowerCase().trim();
      if (!normalizedKey) return;
      var values = toArrayValue(rawMap[key]).filter(function(v){ return typeof v === 'string' && v.trim(); });
      if (!values.length) return;
      out[normalizedKey] = values.map(function(v){ return v.toLowerCase().trim(); });
    });
    return out;
  }

  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function keyToRegex(key) {
    // Support flexible spaces in multi-word keys while preserving word boundaries.
    var parts = key.split(/\s+/).map(escapeRegex);
    return new RegExp('\\b' + parts.join('\\s+') + '\\b', 'g');
  }

  function chooseOpposite(options, randomize) {
    if (!options || !options.length) return '';
    if (!randomize) return options[0];
    return options[Math.floor(Math.random() * options.length)];
  }

  var baseMap = normalizeMap(window.CUSTOM_OPPOSITES || {});
  window.OPPOSITE_MAPPING = Object.assign({}, baseMap);

  async function loadOppositesFromJson() {
    try {
      var res = await fetch('opposites.json', { cache: 'no-store' });
      if (!res.ok) return;
      var json = await res.json();
      var normalized = normalizeMap(json);
      if (Object.keys(normalized).length) {
        window.OPPOSITE_MAPPING = normalized;
      }
    } catch (e) {
      // Keep fallback map from opposites.js
    }
  }

  function reverseQuery(query, opts) {
    var options = opts || {};
    var randomize = !!options.randomize;
    var fallbackPrefix = options.fallbackPrefix || 'opposite of ';

    var source = String(query || '').toLowerCase().trim().replace(/\s+/g, ' ');
    if (!source) return fallbackPrefix.trim();

    var map = window.OPPOSITE_MAPPING || {};
    var keys = Object.keys(map).sort(function(a, b){ return b.length - a.length; });

    var transformed = source;
    var replacedAny = false;

    keys.forEach(function(key){
      var replacement = chooseOpposite(map[key], randomize);
      if (!replacement) return;
      var regex = keyToRegex(key);
      if (regex.test(transformed)) {
        replacedAny = true;
        transformed = transformed.replace(regex, replacement);
      }
    });

    transformed = transformed.replace(/\s+/g, ' ').trim();
    if (!replacedAny) return fallbackPrefix + source;
    return transformed;
  }

  window.reverseQuery = reverseQuery;
  window.loadOppositesFromJson = loadOppositesFromJson;

  // Best-effort JSON load for easier external expansion.
  loadOppositesFromJson();
})();
