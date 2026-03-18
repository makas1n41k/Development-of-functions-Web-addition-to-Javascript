(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const helpers = App.helpers;
  const storage = App.storage;
  const USERS_KEY = "pulsevote-users";
  const CURRENT_USER_KEY = "pulsevote-current-user";
  const DEMO_EMAIL = "demo@pulsevote.ua";
  const DEMO_PASSWORD = "pulse12345";

  function getUsers() {
    return storage.getLocal(USERS_KEY, []);
  }

  function setUsers(users) {
    storage.setLocal(USERS_KEY, users);
    return users;
  }

  function ensureDemoAccount() {
    const users = getUsers();
    const hasDemoUser = users.some((user) => String(user.email || "").toLowerCase() === DEMO_EMAIL);

    if (hasDemoUser) {
      return users;
    }

    const demoUser = {
      id: helpers.createId("user"),
      name: "Demo User",
      email: DEMO_EMAIL,
      gender: "Інша",
      birthDate: "2004-05-12",
      password: DEMO_PASSWORD,
      role: "Демо акаунт",
      createdAt: "2026-03-01T10:00:00.000Z",
      lastLoginAt: null,
    };

    return setUsers([demoUser].concat(users));
  }

  function sanitizeUser(user) {
    if (!user) {
      return null;
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  function findUserByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    return ensureDemoAccount().find((user) => String(user.email || "").toLowerCase() === normalizedEmail) || null;
  }

  App.models = App.models || {};
  App.models.user = {
    ensureDemoAccount,

    getDemoCredentials() {
      return {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      };
    },

    getCurrentUser() {
      const currentEmail = storage.getLocal(CURRENT_USER_KEY, null);

      if (!currentEmail) {
        return null;
      }

      return sanitizeUser(findUserByEmail(currentEmail));
    },

    register(userData) {
      const normalizedEmail = String(userData.email || "").trim().toLowerCase();

      if (!userData.name || !normalizedEmail || !userData.gender || !userData.birthDate || !userData.password) {
        throw new Error("Заповни всі обов'язкові поля реєстрації.");
      }

      if (findUserByEmail(normalizedEmail)) {
        throw new Error("Користувач із таким email вже існує.");
      }

      const users = ensureDemoAccount();
      const newUser = {
        id: helpers.createId("user"),
        name: String(userData.name).trim(),
        email: normalizedEmail,
        gender: String(userData.gender).trim(),
        birthDate: userData.birthDate,
        password: String(userData.password),
        role: "Користувач",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      setUsers([newUser].concat(users));
      storage.setLocal(CURRENT_USER_KEY, newUser.email);
      return sanitizeUser(newUser);
    },

    login(email, password) {
      const user = findUserByEmail(email);

      if (!user || user.password !== String(password || "")) {
        throw new Error("Неправильний email або пароль.");
      }

      const users = ensureDemoAccount().map((currentUser) =>
        currentUser.id === user.id
          ? { ...currentUser, lastLoginAt: new Date().toISOString() }
          : currentUser,
      );

      setUsers(users);
      storage.setLocal(CURRENT_USER_KEY, user.email);
      return sanitizeUser(findUserByEmail(user.email));
    },

    logout() {
      storage.setLocal(CURRENT_USER_KEY, null);
    },

    getPublicByEmail(email) {
      return sanitizeUser(findUserByEmail(email));
    },
  };
})();
