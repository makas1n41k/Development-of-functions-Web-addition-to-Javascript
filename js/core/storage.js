(function () {
  const App = (window.PulseVote = window.PulseVote || {});

  function parseValue(rawValue, fallbackValue) {
    if (!rawValue) {
      return fallbackValue;
    }

    try {
      return JSON.parse(rawValue);
    } catch (error) {
      return fallbackValue;
    }
  }

  App.storage = {
    hasLocal(key) {
      return window.localStorage.getItem(key) !== null;
    },

    getLocal(key, fallbackValue) {
      return parseValue(window.localStorage.getItem(key), fallbackValue);
    },

    setLocal(key, value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },

    hasSession(key) {
      return window.sessionStorage.getItem(key) !== null;
    },

    getSession(key, fallbackValue) {
      return parseValue(window.sessionStorage.getItem(key), fallbackValue);
    },

    setSession(key, value) {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
  };
})();
