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
    return 'https://logo.clearbit.com/' + domain;
  }

  var OPPOSITE_BY_CATEGORY = {
    food: 'fitness_nutrition',
    entertainment: 'productivity',
    productivity: 'distraction',
    shopping: 'minimalism_saving',
    travel: 'stay_home',
    fitness: 'indulgence_junk_food'
  };

  var DID_YOU_MEAN_BY_OPPOSITE = {
    fitness_nutrition: 'track calories and eat healthy',
    productivity: 'improve productivity',
    distraction: 'ways to waste time',
    minimalism_saving: 'stop buying things',
    stay_home: 'things to do at home',
    indulgence_junk_food: 'best fast food near you'
  };

  var RESULT_LIBRARY = {
    fitness_nutrition: {
      real: [
        { siteName: 'MyFitnessPal', url: 'https://www.myfitnesspal.com', title: 'Track Calories and Improve Your Diet', description: 'Monitor daily nutrition, set realistic goals, and build healthier habits with a simple tracking workflow.' },
        { siteName: 'Healthline', url: 'https://www.healthline.com/nutrition', title: 'Nutrition Plans Backed by Research', description: 'Explore practical nutrition guidance and evidence-based recommendations for long-term health improvements.' },
        { siteName: 'Strava', url: 'https://www.strava.com', title: 'Build Consistent Activity Routines', description: 'Track workouts, monitor progress over time, and stay motivated with measurable fitness milestones.' }
      ],
      fake: [
        { siteName: 'Macro Journal Daily', domain: 'macrojournaldaily.com', title: 'Create a Weekly Macro Tracking Plan', description: 'Use a lightweight weekly structure to track intake, improve consistency, and avoid nutrition guesswork.' },
        { siteName: 'Streak Metrics', domain: 'streakmetrics.com', title: 'Small Habits That Improve Fitness Consistency', description: 'Learn how tiny daily actions can compound into measurable results over a few weeks.' },
        { siteName: 'Calorie Compass', domain: 'caloriecompass.io', title: 'Calorie Targets for Sustainable Progress', description: 'Understand maintenance, deficit, and surplus strategies with practical examples you can apply quickly.' }
      ]
    },
    productivity: {
      real: [
        { siteName: 'Notion', url: 'https://www.notion.so', title: 'Organize Work and Personal Tasks in One Place', description: 'Create structured notes, project boards, and workflows to keep daily priorities clear and actionable.' },
        { siteName: 'Trello', url: 'https://trello.com', title: 'Plan Projects with Clear Visual Workflows', description: 'Track progress, assign tasks, and simplify collaboration using flexible boards and checklists.' },
        { siteName: 'RescueTime', url: 'https://www.rescuetime.com', title: 'Measure Focus and Improve Time Management', description: 'Understand how your day is spent and identify high-impact opportunities to improve attention.' }
      ],
      fake: [
        { siteName: 'Focus Blueprint', domain: 'focusblueprint.io', title: 'A Practical System for Better Deep Work', description: 'Set boundaries, block interruptions, and use focused sessions to complete meaningful tasks faster.' },
        { siteName: 'Output Weekly', domain: 'outputweekly.com', title: 'Weekly Planning Framework for High-Impact Work', description: 'Align weekly priorities with measurable outcomes using a repeatable planning cycle.' },
        { siteName: 'Task Lens', domain: 'tasklens.app', title: 'Simplify Task Prioritization in Minutes', description: 'Use a lightweight method to sort urgent work from important long-term initiatives.' }
      ]
    },
    distraction: {
      real: [
        { siteName: 'YouTube', url: 'https://www.youtube.com', title: 'Trending Videos to Watch Right Now', description: 'Browse new videos, creator channels, and recommendations designed for casual viewing sessions.' },
        { siteName: 'Reddit', url: 'https://www.reddit.com', title: 'Browse Popular Discussions and Communities', description: 'Jump into active threads, discover niche topics, and follow ongoing community conversations.' },
        { siteName: '9GAG', url: 'https://9gag.com', title: 'Light Content and Viral Posts', description: 'Explore short-form posts and fast-scrolling entertainment for quick online breaks.' }
      ],
      fake: [
        { siteName: 'Procrastination Studio', domain: 'procrastinationstudio.com', title: 'How to Procrastinate Like a Pro', description: 'A polished guide to delaying tasks with highly optimized low-priority routines.' },
        { siteName: 'Idle Loop', domain: 'idleloop.net', title: 'Advanced Techniques for Doing Nothing', description: 'Learn distraction patterns that can quietly consume an afternoon without obvious effort.' },
        { siteName: 'OpenTab Daily', domain: 'opentabdaily.com', title: 'The Infinite Tab Strategy', description: 'Keep curiosity active by rotating between links that feel useful but rarely get finished.' }
      ]
    },
    minimalism_saving: {
      real: [
        { siteName: 'NerdWallet', url: 'https://www.nerdwallet.com', title: 'Practical Ways to Save More Each Month', description: 'Compare budgeting methods and simple spending habits that support long-term financial stability.' },
        { siteName: 'The Minimalists', url: 'https://www.theminimalists.com', title: 'Minimalist Habits for Intentional Spending', description: 'Learn how reducing clutter and unnecessary purchases can improve financial and mental clarity.' },
        { siteName: 'r/Frugal', url: 'https://www.reddit.com/r/frugal', title: 'Community Tips for Cutting Everyday Costs', description: 'Find practical ideas from real people focused on saving money across housing, food, and shopping.' }
      ],
      fake: [
        { siteName: 'Save Smart Journal', domain: 'savesmartjournal.com', title: 'A 30-Day Plan to Reduce Impulse Buying', description: 'Use daily checkpoints and purchase-delay rules to improve spending decisions.' },
        { siteName: 'Minimal Living Notes', domain: 'minimallivingnotes.com', title: 'How to Buy Less Without Feeling Restricted', description: 'Replace impulse purchases with durable alternatives and priority-based spending.' },
        { siteName: 'Spend Less Weekly', domain: 'spendlessweekly.com', title: 'Weekly Cost-Cutting Checklist', description: 'Track subscriptions, habits, and routine expenses with a repeatable weekly review process.' }
      ]
    },
    stay_home: {
      real: [
        { siteName: 'Netflix', url: 'https://www.netflix.com', title: 'Top Streaming Picks for Tonight', description: 'Browse popular series and films for a relaxed evening at home.' },
        { siteName: 'YouTube', url: 'https://www.youtube.com', title: 'Long-Form Videos and Virtual Tours', description: 'Watch curated entertainment, documentaries, and immersive virtual experiences.' },
        { siteName: 'Spotify', url: 'https://open.spotify.com', title: 'Playlists for Home Evenings', description: 'Discover mood-based playlists and curated mixes for focused or relaxed indoor time.' }
      ],
      fake: [
        { siteName: 'Indoor Life Guide', domain: 'indoorlifeguide.com', title: 'Indoor Weekend Ideas That Actually Work', description: 'Plan enjoyable evenings with simple home-based activities and routines.' },
        { siteName: 'Home Mode', domain: 'homemode.co', title: 'A Better Stay-In Routine', description: 'Create a practical mix of entertainment, rest, and low-effort activities.' },
        { siteName: 'Local Night In', domain: 'localnightin.com', title: 'At-Home Plans for Any Mood', description: 'Choose structured stay-in options for solo time, couples, or family evenings.' }
      ]
    },
    indulgence_junk_food: {
      real: [
        { siteName: 'DoorDash', url: 'https://www.doordash.com', title: 'Order Comfort Food Near You', description: 'Browse popular takeout options and get meals delivered quickly.' },
        { siteName: 'Uber Eats', url: 'https://www.ubereats.com', title: 'Top-Rated Delivery Restaurants', description: 'Explore trending dishes, local favorites, and fast delivery options.' },
        { siteName: 'Zomato', url: 'https://www.zomato.com', title: 'Find Popular Meals and Fast Delivery', description: 'Compare menus, ratings, and delivery times across nearby restaurants.' }
      ],
      fake: [
        { siteName: 'Snack Route', domain: 'snackroute.com', title: 'Late-Night Delivery Favorites', description: 'A curated list of comfort-food picks for quick ordering.' },
        { siteName: 'Comfort Bites', domain: 'comfortbites.co', title: 'Most-Ordered Comfort Meals This Week', description: 'Discover high-demand dishes and neighborhood recommendations.' },
        { siteName: 'Quick Cravings', domain: 'quickcravings.io', title: 'Fast Food Delivery Picks by Area', description: 'Shortlists of popular delivery options for immediate ordering.' }
      ]
    }
  };

  var CATEGORY_PATTERNS = {
    food: [
      /\b(food|eat|meal|dinner|lunch|breakfast|restaurant|cafe|stall|stalls|delivery|takeout|pizza|burger|snack)\b/i,
      /\b(near me|nearby)\b.*\b(food|restaurant|eat|meal)\b/i
    ],
    entertainment: [
      /\b(netflix|movie|movies|show|shows|series|watch|stream|streaming|youtube|anime|music|game|games|fun)\b/i,
      /\b(what to watch|watch tonight|binge)\b/i
    ],
    productivity: [
      /\b(productive|productivity|focus|study|notion|todo|task|tasks|organize|planning|time management)\b/i,
      /\b(work better|study tips|deep work)\b/i
    ],
    shopping: [
      /\b(buy|shop|shopping|deals|discount|amazon|flipkart|order|cart|checkout|price|shoes|clothes|phone|cheap)\b/i,
      /\b(best .* to buy)\b/i
    ],
    travel: [
      /\b(travel|trip|flight|flights|hotel|vacation|holiday|tour|tourism|goa|itinerary|destination)\b/i,
      /\b(where to go|places to visit)\b/i
    ],
    fitness: [
      /\b(gym|workout|exercise|fitness|weight loss|lose weight|run|running|calisthenics|cardio|training)\b/i,
      /\b(get fit|build muscle|fat loss)\b/i
    ]
  };

  function detectCategory(query) {
    var source = String(query || '');
    var best = { category: 'productivity', score: 0 };
    Object.keys(CATEGORY_PATTERNS).forEach(function (cat) {
      var score = 0;
      CATEGORY_PATTERNS[cat].forEach(function (rx) {
        if (rx.test(source)) score += 1;
      });
      if (score > best.score) best = { category: cat, score: score };
    });
    return best.category;
  }

  function buildRealResult(entry) {
    var url = entry.url;
    var domain = domainFromUrl(url);
    return {
      title: entry.title,
      description: entry.description + ' Explore practical tips, compare options, and follow step-by-step guidance tailored to this topic.',
      url: url,
      siteName: entry.siteName,
      logo: logoUrlForDomain(domain),
      isFake: false
    };
  }

  function buildFakeResult(entry) {
    var url = 'https://' + entry.domain;
    return {
      title: entry.title,
      description: entry.description + ' Includes structured recommendations, quick-start checklists, and clear next actions you can apply immediately.',
      url: url,
      siteName: entry.siteName,
      logo: '/logos/default.png',
      isFake: true
    };
  }

  function generateOppositeResults(input, options) {
    var opts = options || {};
    var query = String((input && input.query) || '').trim();
    var category = String((input && input.category) || '').trim().toLowerCase() || detectCategory(query);
    var oppositeCategory = OPPOSITE_BY_CATEGORY[category] || 'distraction';

    var bucket = RESULT_LIBRARY[oppositeCategory] || RESULT_LIBRARY.distraction;
    var seed = hashText(oppositeCategory);

    var realCount = opts.realCount || 3;
    var fakeCount = opts.fakeCount || 3;

    var realPicked = rotatePick(bucket.real, realCount, seed);
    var fakePicked = rotatePick(bucket.fake, fakeCount, seed >>> 2);

    var results = [];
    realPicked.forEach(function (entry) {
      results.push(buildRealResult(entry));
    });
    fakePicked.forEach(function (entry) {
      results.push(buildFakeResult(entry));
    });

    return {
      didYouMean: DID_YOU_MEAN_BY_OPPOSITE[oppositeCategory] || 'discover practical resources',
      results: results.slice(0, 6)
    };
  }

  function getOppositeCategory(category) {
    return OPPOSITE_BY_CATEGORY[category] || 'distraction';
  }

  function getOppositeTopicTerm(category) {
    var oppositeCategory = OPPOSITE_BY_CATEGORY[category] || 'distraction';
    return DID_YOU_MEAN_BY_OPPOSITE[oppositeCategory] || 'general web topics';
  }

  window.detectOppositeCategory = detectCategory;
  window.generateOppositeResults = generateOppositeResults;
  window.getOppositeCategory = getOppositeCategory;
  window.getOppositeTopicTerm = getOppositeTopicTerm;
})();
