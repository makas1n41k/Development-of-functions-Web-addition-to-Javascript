(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const helpers = App.helpers;

  function createPollListItem(poll, responsesCount, isActive) {
    const activeClass = isActive ? " active" : "";

    return [
      '<li class="list-group-item poll-list-item',
      activeClass,
      '" data-poll-select="',
      helpers.escapeHtml(poll.id),
      '">',
      '<div class="poll-list-copy">',
      '<strong class="poll-list-title d-block">',
      helpers.escapeHtml(poll.title),
      "</strong>",
      '<small class="text-muted">Активне опитування</small>',
      "</div>",
      '<span class="badge bg-primary rounded-pill">',
      responsesCount,
      "</span>",
      "</li>",
    ].join("");
  }

  function createOptionButton(option, pollId, voteState, selectedOptionId) {
    const isLocked = voteState && voteState.hasVoted;
    const isSelected = isLocked && voteState.optionId === option.id;
    const isPending = !isLocked && selectedOptionId === option.id;
    const selectedClass = isSelected || isPending ? " active" : "";
    const disabledAttribute = isLocked ? " disabled" : "";
    const statusLabel = isSelected ? " Ваш голос" : isPending ? " Обрано" : "";

    return [
      '<button class="btn btn-outline-primary text-start poll-vote-button',
      selectedClass,
      '" type="button" data-poll-id="',
      helpers.escapeHtml(pollId),
      '" data-option-id="',
      helpers.escapeHtml(option.id),
      '"',
      disabledAttribute,
      '>',
      helpers.escapeHtml(option.label),
      '<span class="float-end text-muted">',
      String(option.votes || 0),
      statusLabel,
      "</span>",
      "</button>",
    ].join("");
  }

  App.views = App.views || {};
  App.views.poll = {
    form: document.querySelector("[data-poll-form]"),
    message: document.querySelector("[data-poll-message]"),
    list: document.querySelector("[data-poll-list]"),
    cardTitle: document.querySelector("[data-poll-card-title]"),
    cardMeta: document.querySelector("[data-poll-card-meta]"),
    cardQuestion: document.querySelector("[data-poll-card-question]"),
    cardOptions: document.querySelector("[data-poll-card-options]"),
    cardResponses: document.querySelector("[data-poll-card-responses]"),
    cardVoteState: document.querySelector("[data-poll-vote-state]"),
    confirmButton: document.querySelector("[data-poll-confirm]"),
    resetResponsesButton: document.querySelector("[data-poll-reset-responses]"),
    deleteButton: document.querySelector("[data-poll-delete]"),
    cardEmpty: document.querySelector("[data-poll-card-empty]"),
    constructorButton: document.querySelector("[data-poll-card-create]"),
    totalPolls: document.querySelector("[data-analytics-total-polls]"),
    totalResponses: document.querySelector("[data-analytics-total-responses]"),
    averageResponses: document.querySelector("[data-analytics-average]"),
    topPoll: document.querySelector("[data-analytics-top]"),

    bindCreate(handler) {
      if (!this.form) {
        return;
      }

      this.form.addEventListener("submit", (event) => {
        event.preventDefault();
        helpers.clearMessage(this.message);
        handler({
          title: this.form.elements.title.value.trim(),
          description: this.form.elements.description.value.trim(),
          question: this.form.elements.question.value.trim(),
          options: [
            this.form.elements.option1.value,
            this.form.elements.option2.value,
            this.form.elements.option3.value,
            this.form.elements.option4.value,
          ],
        });
      });
    },

    bindSelect(handler) {
      if (!this.list) {
        return;
      }

      this.list.addEventListener("click", (event) => {
        const item = event.target.closest("[data-poll-select]");

        if (!item) {
          return;
        }

        handler(item.dataset.pollSelect);
      });
    },

    bindOptionSelect(handler) {
      if (!this.cardOptions) {
        return;
      }

      this.cardOptions.addEventListener("click", (event) => {
        const button = event.target.closest("[data-option-id]");

        if (!button) {
          return;
        }

        handler(button.dataset.pollId, button.dataset.optionId);
      });
    },

    bindVoteConfirm(handler) {
      if (!this.confirmButton) {
        return;
      }

      this.confirmButton.addEventListener("click", () => {
        handler();
      });
    },

    bindResetResponses(handler) {
      if (!this.resetResponsesButton) {
        return;
      }

      this.resetResponsesButton.addEventListener("click", () => {
        handler();
      });
    },

    bindDelete(handler) {
      if (!this.deleteButton) {
        return;
      }

      this.deleteButton.addEventListener("click", () => {
        handler();
      });
    },

    bindFocusConstructor(handler) {
      if (!this.constructorButton) {
        return;
      }

      this.constructorButton.addEventListener("click", handler);
    },

    bindReset(handler) {
      if (!this.form) {
        return;
      }

      this.form.addEventListener("reset", () => {
        window.setTimeout(handler, 0);
      });
    },

    renderPollList(polls, getResponsesCount, selectedPollId) {
      if (!this.list) {
        return;
      }

      this.list.innerHTML = polls
        .map((poll) => createPollListItem(poll, getResponsesCount(poll), poll.id === selectedPollId))
        .join("");
    },

    renderCurrentPoll(poll, getResponsesCount, voteState, selectedOptionId) {
      if (!this.cardTitle || !this.cardMeta || !this.cardQuestion || !this.cardOptions || !this.cardResponses || !this.cardVoteState || !this.confirmButton || !this.cardEmpty || !this.resetResponsesButton || !this.deleteButton) {
        return;
      }

      if (!poll) {
        this.cardTitle.textContent = "Немає вибраного опитування";
        this.cardMeta.textContent = "Створи нове опитування в конструкторі.";
        this.cardQuestion.textContent = "Після створення опитування тут з'явиться блок для голосування.";
        this.cardResponses.textContent = "0 голосів";
        this.cardVoteState.hidden = true;
        this.cardVoteState.className = "alert mb-3";
        this.cardVoteState.textContent = "";
        this.cardOptions.innerHTML = "";
        this.confirmButton.disabled = true;
        this.confirmButton.textContent = "Підтвердити голос";
        this.resetResponsesButton.disabled = true;
        this.deleteButton.disabled = true;
        this.cardEmpty.hidden = false;
        return;
      }

      this.cardTitle.textContent = poll.title;
      this.cardMeta.textContent = "Автор: " + poll.author + " • " + helpers.formatDate(poll.createdAt);
      this.cardQuestion.textContent = poll.question;
      this.cardResponses.textContent = String(getResponsesCount(poll)) + " голосів";
      this.cardOptions.innerHTML = poll.options.map((option) => createOptionButton(option, poll.id, voteState, selectedOptionId)).join("");
      this.cardVoteState.hidden = false;
      this.cardVoteState.className = "alert mb-3 " + (voteState && voteState.hasVoted ? "alert-success" : "alert-light border");
      this.cardVoteState.textContent = voteState && voteState.hasVoted
        ? "Голос зараховано. Повторне голосування для цього опитування на цьому акаунті або пристрої заблоковане."
        : selectedOptionId
          ? "Варіант обрано. Натисни кнопку нижче, щоб підтвердити голос."
          : "Спочатку обери один варіант, а потім підтвердь голос окремою кнопкою.";
      this.confirmButton.disabled = Boolean(voteState && voteState.hasVoted) || !selectedOptionId;
      this.confirmButton.textContent = voteState && voteState.hasVoted ? "Голос уже підтверджено" : "Підтвердити голос";
      this.resetResponsesButton.disabled = false;
      this.deleteButton.disabled = false;
      this.cardEmpty.hidden = poll.options.length > 0;
    },

    renderAnalytics(analytics, getResponsesCount) {
      if (this.totalPolls) {
        this.totalPolls.textContent = String(analytics.totalPolls);
      }

      if (this.totalResponses) {
        this.totalResponses.textContent = String(analytics.totalResponses);
      }

      if (this.averageResponses) {
        this.averageResponses.textContent = String(analytics.averageResponses) + " голосів";
      }

      if (this.topPoll) {
        this.topPoll.textContent = analytics.topPoll
          ? analytics.topPoll.title + " (" + getResponsesCount(analytics.topPoll) + ")"
          : "Ще немає даних";
      }
    },

    renderMessage(type, text) {
      helpers.showMessage(this.message, type, text);
    },

    clearMessage() {
      helpers.clearMessage(this.message);
    },

    resetForm() {
      if (this.form) {
        this.form.reset();
      }
    },

    focusConstructor() {
      if (this.form) {
        this.form.scrollIntoView({ block: "start" });
      }
    },
  };
})();
