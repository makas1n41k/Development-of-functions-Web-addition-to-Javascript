(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const helpers = App.helpers;
  const storage = App.storage;
  const POLLS_KEY = "pulsevote-polls";
  const VOTES_KEY = "pulsevote-vote-registry";

  function getPolls() {
    return storage.getLocal(POLLS_KEY, []);
  }

  function setPolls(polls) {
    storage.setLocal(POLLS_KEY, polls);
    return polls;
  }

  function getVoteRegistry() {
    return storage.getSession(VOTES_KEY, {});
  }

  function setVoteRegistry(voteRegistry) {
    storage.setSession(VOTES_KEY, voteRegistry);
    return voteRegistry;
  }

  function clearPollVotes(pollId) {
    const voteRegistry = getVoteRegistry();
    const nextVoteRegistry = Object.keys(voteRegistry).reduce((registry, participantKey) => {
      const participantVotes = { ...(voteRegistry[participantKey] || {}) };

      delete participantVotes[pollId];

      if (Object.keys(participantVotes).length > 0) {
        registry[participantKey] = participantVotes;
      }

      return registry;
    }, {});

    setVoteRegistry(nextVoteRegistry);
  }

  function getResponsesCount(poll) {
    return (poll.options || []).reduce((total, option) => total + Number(option.votes || 0), 0);
  }

  function ensureDemoPolls() {
    if (storage.hasLocal(POLLS_KEY)) {
      return getPolls();
    }

    return setPolls([
      {
        id: helpers.createId("poll"),
        title: "Атмосфера в аудиторії",
        description: "Зворотний зв'язок про комфорт і динаміку занять.",
        question: "Як ти оцінюєш атмосферу на парах цього тижня?",
        author: "Шевченко Максим",
        createdAt: "2026-03-01T09:00:00",
        options: [
          { id: helpers.createId("option"), label: "Дуже комфортна", votes: 14 },
          { id: helpers.createId("option"), label: "Нормальна", votes: 11 },
          { id: helpers.createId("option"), label: "Потрібні покращення", votes: 7 },
        ],
      },
      {
        id: helpers.createId("poll"),
        title: "Формат консультацій",
        description: "Обираємо найзручніший спосіб коротких консультацій.",
        question: "Який формат консультацій для тебе найкращий?",
        author: "PulseVote Team",
        createdAt: "2026-03-03T13:30:00",
        options: [
          { id: helpers.createId("option"), label: "Очно після пари", votes: 7 },
          { id: helpers.createId("option"), label: "Google Meet", votes: 6 },
          { id: helpers.createId("option"), label: "Чат у Telegram", votes: 5 },
        ],
      },
      {
        id: helpers.createId("poll"),
        title: "Тема наступного воркшопу",
        description: "Плануємо наступну практичну зустріч для групи.",
        question: "Яку тему воркшопу хочеш розібрати наступною?",
        author: "PulseVote Team",
        createdAt: "2026-03-05T17:10:00",
        options: [
          { id: helpers.createId("option"), label: "UI-анімації", votes: 21 },
          { id: helpers.createId("option"), label: "Робота з формами", votes: 18 },
          { id: helpers.createId("option"), label: "Адаптивна сітка", votes: 15 },
        ],
      },
    ]);
  }

  App.models = App.models || {};
  App.models.poll = {
    ensureDemoPolls,

    getAll() {
      return ensureDemoPolls()
        .slice()
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    },

    create(pollData) {
      const options = pollData.options
        .map((option) => option.trim())
        .filter(Boolean)
        .map((label) => ({
          id: helpers.createId("option"),
          label,
          votes: 0,
        }));

      if (options.length < 2) {
        throw new Error("Додай щонайменше два варіанти відповіді.");
      }

      const poll = {
        id: helpers.createId("poll"),
        title: pollData.title.trim(),
        description: pollData.description.trim(),
        question: pollData.question.trim(),
        author: pollData.author || "PulseVote Team",
        createdAt: new Date().toISOString(),
        options,
      };

      setPolls([poll].concat(this.getAll()));
      return poll;
    },

    vote(pollId, optionId, participantKey) {
      if (!participantKey) {
        throw new Error("Не вдалося визначити користувача для голосування.");
      }

      if (this.hasParticipantVoted(pollId, participantKey)) {
        throw new Error("Ти вже голосував у цьому опитуванні.");
      }

      const polls = this.getAll().map((poll) => {
        if (poll.id !== pollId) {
          return poll;
        }

        return {
          ...poll,
          options: poll.options.map((option) => {
            if (option.id !== optionId) {
              return option;
            }

            return {
              ...option,
              votes: Number(option.votes || 0) + 1,
            };
          }),
        };
      });
      const voteRegistry = getVoteRegistry();

      setPolls(polls);
      setVoteRegistry({
        ...voteRegistry,
        [participantKey]: {
          ...(voteRegistry[participantKey] || {}),
          [pollId]: optionId,
        },
      });
      return polls.find((poll) => poll.id === pollId) || null;
    },

    getById(pollId) {
      return this.getAll().find((poll) => poll.id === pollId) || null;
    },

    hasParticipantVoted(pollId, participantKey) {
      const voteRegistry = getVoteRegistry();
      return Boolean(voteRegistry[participantKey] && voteRegistry[participantKey][pollId]);
    },

    getParticipantVote(pollId, participantKey) {
      const voteRegistry = getVoteRegistry();
      return voteRegistry[participantKey] ? voteRegistry[participantKey][pollId] || null : null;
    },

    resetResponses(pollId) {
      const poll = this.getById(pollId);

      if (!poll) {
        throw new Error("Опитування не знайдено.");
      }

      const polls = this.getAll().map((currentPoll) => {
        if (currentPoll.id !== pollId) {
          return currentPoll;
        }

        return {
          ...currentPoll,
          options: currentPoll.options.map((option) => ({
            ...option,
            votes: 0,
          })),
        };
      });

      setPolls(polls);
      clearPollVotes(pollId);
      return this.getById(pollId);
    },

    remove(pollId) {
      const poll = this.getById(pollId);

      if (!poll) {
        throw new Error("Опитування не знайдено.");
      }

      const polls = this.getAll().filter((currentPoll) => currentPoll.id !== pollId);
      setPolls(polls);
      clearPollVotes(pollId);
      return poll;
    },

    getAnalytics() {
      const polls = this.getAll();
      const totalResponses = polls.reduce((total, poll) => total + getResponsesCount(poll), 0);
      const averageResponses = polls.length ? Math.round(totalResponses / polls.length) : 0;
      const topPoll = polls
        .slice()
        .sort((first, second) => getResponsesCount(second) - getResponsesCount(first))[0] || null;

      return {
        totalPolls: polls.length,
        totalResponses,
        averageResponses,
        topPoll,
      };
    },

    getResponsesCount,
  };
})();
