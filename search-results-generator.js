(function () {
  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function titleCase(text) {
    return String(text || '').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function hashText(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) {
      h = (h * 31 + text.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  function rotatePick(list, count, seed) {
    if (!Array.isArray(list) || !list.length || count <= 0) return [];
    var start = seed % list.length;
    var out = [];
    for (var i = 0; i < Math.min(count, list.length); i++) {
      out.push(list[(start + i) % list.length]);
    }
    return out;
  }

  function domainFromUrl(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return '';
    }
  }

  function logoUrlForDomain(domain) {
    if (!domain) return '/logos/default.png';
    return '/api/logo?domain=' + encodeURIComponent(domain) + '&size=64&format=png&theme=auto&fallback=404';
  }

  var CATEGORY_MAPPING = {
    food: {
      real: [
        { siteName: 'MyFitnessPal', baseUrl: 'https://www.myfitnesspal.com/search', titlePrefix: 'Track calories with', desc: 'Track meals, macros, and workouts instead of ordering food.' },
        { siteName: 'Healthline', baseUrl: 'https://www.healthline.com/search', titlePrefix: 'Nutrition guidance on', desc: 'Read health-focused guidance that aligns with your reversed intent.' },
        { siteName: 'Strava', baseUrl: 'https://www.strava.com', titlePrefix: 'Activity goals on', desc: 'Switch from delivery ideas to movement and fitness tracking.' }
      ],
      fake: [
        { siteName: 'AntiDelivery Weekly', domain: 'antidelivery.example', desc: 'A newsletter for people who almost ordered food, but opened a step counter instead.' },
        { siteName: 'Cardio Cart Canceler', domain: 'cartcanceler.example', desc: 'Converts cravings into treadmill sessions with suspicious confidence.' },
        { siteName: 'The Opposite Menu', domain: 'oppositemenu.example', desc: 'Every dish recommendation is replaced with a hydration reminder.' }
      ]
    },
    shopping: {
      real: [
        { siteName: 'NerdWallet', baseUrl: 'https://www.nerdwallet.com', titlePrefix: 'Save money with', desc: 'Compare saving strategies that counter impulse shopping.' },
        { siteName: 'The Minimalists', baseUrl: 'https://www.theminimalists.com', titlePrefix: 'Own less with', desc: 'Practical ideas for buying less and keeping only essentials.' },
        { siteName: 'Reddit Frugal', baseUrl: 'https://www.reddit.com/r/frugal', titlePrefix: 'Frugal tips on', desc: 'Community advice for avoiding unnecessary purchases.' }
      ],
      fake: [
        { siteName: 'Cart Detox Club', domain: 'cartdetox.example', desc: 'A support group for tabs full of products you never needed.' },
        { siteName: 'Refund Oracle', domain: 'refundoracle.example', desc: 'Predicts regrets before checkout with dramatic accuracy.' },
        { siteName: 'Minimal Cart Labs', domain: 'minimalcart.example', desc: 'Automatically rounds your cart down to one useful item.' }
      ]
    },
    travel: {
      real: [
        { siteName: 'Netflix', baseUrl: 'https://www.netflix.com', titlePrefix: 'Stay home with', desc: 'Home entertainment options for when travel plans become opposite plans.' },
        { siteName: 'YouTube', baseUrl: 'https://www.youtube.com/results', titlePrefix: 'At-home alternatives on', desc: 'Watch destination videos from your couch instead of booking tickets.' },
        { siteName: 'Spotify', baseUrl: 'https://open.spotify.com/search', titlePrefix: 'Travel mood, no travel on', desc: 'Playlists for the vibe of travel without leaving home.' }
      ],
      fake: [
        { siteName: 'Couch Passport', domain: 'couchpassport.example', desc: 'Collect digital stamps for visiting your living room repeatedly.' },
        { siteName: 'NoFlight Tonight', domain: 'noflighttonight.example', desc: 'Find local snacks and stream a documentary instead of boarding.' },
        { siteName: 'Staycation Radar', domain: 'staycationradar.example', desc: 'Detects the nearest blanket and marks it as a premium destination.' }
      ]
    },
    productivity: {
      real: [
        { siteName: 'YouTube', baseUrl: 'https://www.youtube.com/results', titlePrefix: 'Distraction ideas on', desc: 'Videos carefully optimized to derail your productivity plans.' },
        { siteName: 'Reddit', baseUrl: 'https://www.reddit.com', titlePrefix: 'Lose focus on', desc: 'Threads that start useful and end two hours later.' },
        { siteName: '9GAG', baseUrl: 'https://9gag.com/search', titlePrefix: 'Break your flow with', desc: 'Endless scrolling for when focus is not the goal.' }
      ],
      fake: [
        { siteName: 'Procrastination Pro', domain: 'procrastinationpro.example', desc: 'Turns every task into a perfectly timed delay.' },
        { siteName: 'Tab Collector', domain: 'tabcollector.example', desc: 'Opens fifteen tabs so your original task can hide safely.' },
        { siteName: 'Deadline Dodger', domain: 'deadlinedodger.example', desc: 'Strategic avoidance techniques with polished explanations.' }
      ]
    },
    fitness: {
      real: [
        { siteName: 'DoorDash', baseUrl: 'https://www.doordash.com/search/store', titlePrefix: 'Refuel on', desc: 'Food delivery suggestions as the opposite of fitness searches.' },
        { siteName: 'Uber Eats', baseUrl: 'https://www.ubereats.com/search', titlePrefix: 'Order in with', desc: 'Quick meal options for staying still after searching fitness topics.' },
        { siteName: 'Zomato', baseUrl: 'https://www.zomato.com/search', titlePrefix: 'Meal picks on', desc: 'Restaurant recommendations replacing your workout intent.' }
      ],
      fake: [
        { siteName: 'Cardio Cancel Kitchen', domain: 'cardiocancel.example', desc: 'Automatically swaps workout plans for snack plans.' },
        { siteName: 'Lazy Gains Diner', domain: 'lazygains.example', desc: 'High-calorie menus for low-movement afternoons.' },
        { siteName: 'Rest Day Forever', domain: 'restdayforever.example', desc: 'A complete strategy for extending one rest day indefinitely.' }
      ]
    }
  };

  var CATEGORY_KEYWORDS = {
    food: ['food', 'pizza', 'burger', 'delivery', 'restaurant', 'eat', 'meal'],
    shopping: ['shop', 'shopping', 'buy', 'deal', 'amazon', 'product', 'cart'],
    travel: ['travel', 'trip', 'flight', 'hotel', 'vacation', 'beach', 'tour'],
    productivity: ['productivity', 'productive', 'focus', 'study', 'task', 'work', 'procrastinate'],
    fitness: ['fitness', 'workout', 'exercise', 'gym', 'running', 'weight loss']
  };

  function detectCategory(query) {
    var source = String(query || '').toLowerCase();
    var best = { category: 'productivity', score: 0 };
    Object.keys(CATEGORY_KEYWORDS).forEach(function (cat) {
      var score = 0;
      CATEGORY_KEYWORDS[cat].forEach(function (kw) {
        if (source.indexOf(kw) > -1) score += 1;
      });
      if (score > best.score) best = { category: cat, score: score };
    });
    return best.category;
  }

  function buildRealResult(entry, query, reversedQuery) {
    var searchTerm = encodeURIComponent(reversedQuery);
    var url = entry.baseUrl + (entry.baseUrl.indexOf('?') > -1 ? '&' : '?') + 'q=' + searchTerm;
    var domain = domainFromUrl(url);
    return {
      title: titleCase(reversedQuery) + ' - ' + entry.titlePrefix + ' ' + entry.siteName,
      description: entry.desc + ' Opposite intent from "' + query + '" to "' + reversedQuery + '".',
      url: url,
      siteName: entry.siteName,
      logo: logoUrlForDomain(domain)
    };
  }

  function buildFakeResult(entry, query, reversedQuery) {
    var slug = slugify(reversedQuery) || 'opposite-search';
    var url = 'https://' + entry.domain + '/search/' + slug;
    return {
      title: titleCase(reversedQuery) + ' - ' + entry.siteName,
      description: entry.desc + ' Built around the opposite search "' + reversedQuery + '".',
      url: url,
      siteName: entry.siteName,
      logo: '/logos/default.png'
    };
  }

  function generateOppositeResults(input, options) {
    var opts = options || {};
    var query = String((input && input.query) || '').trim();
    var reversedQuery = String((input && input.reversedQuery) || '').trim();
    var category = String((input && input.category) || '').trim().toLowerCase() || detectCategory(query);

    var bucket = CATEGORY_MAPPING[category] || CATEGORY_MAPPING.productivity;
    var seed = hashText(query + '|' + reversedQuery + '|' + category);

    var realCount = opts.realCount || 3;
    var fakeCount = opts.fakeCount || 3;

    var realPicked = rotatePick(bucket.real, realCount, seed);
    var fakePicked = rotatePick(bucket.fake, fakeCount, seed >>> 2);

    var results = [];
    realPicked.forEach(function (entry) {
      results.push(buildRealResult(entry, query, reversedQuery));
    });
    fakePicked.forEach(function (entry) {
      results.push(buildFakeResult(entry, query, reversedQuery));
    });

    return results.slice(0, 6);
  }

  window.detectOppositeCategory = detectCategory;
  window.generateOppositeResults = generateOppositeResults;
})();
