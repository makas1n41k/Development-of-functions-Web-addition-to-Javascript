(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const pollModel = App.models.poll;
  const pollView = App.views.poll;

  let selectedPollId = null;
  let selectedOptionId = null;
  const participantKey = "visitor";

  function render() {
    const previousSelectedPollId = selectedPollId;
    const polls = pollModel.getAll();
    const currentPoll = selectedPollId ? pollModel.getById(selectedPollId) : polls[0] || null;
    const voteState = currentPoll
      ? {
          hasVoted: pollModel.hasParticipantVoted(currentPoll.id, participantKey),
          optionId: pollModel.getParticipantVote(currentPoll.id, participantKey),
        }
      : null;

    selectedPollId = currentPoll ? currentPoll.id : null;

    if (!currentPoll) {
      selectedOptionId = null;
    } else if (voteState && voteState.hasVoted) {
      selectedOptionId = voteState.optionId;
    } else if (previousSelectedPollId !== selectedPollId) {
      selectedOptionId = null;
    }

    pollView.renderPollList(polls, pollModel.getResponsesCount, selectedPollId);
    pollView.renderCurrentPoll(currentPoll, pollModel.getResponsesCount, voteState, selectedOptionId);
    pollView.renderAnalytics(pollModel.getAnalytics(), pollModel.getResponsesCount);
  }

  if (pollView && pollView.form) {
    pollModel.ensureDemoPolls();
    render();

    pollView.bindCreate((formData) => {
      try {
        if (!formData.title || !formData.description || !formData.question) {
          throw new Error("Заповни назву, опис і питання опитування.");
        }

        const poll = pollModel.create({
          ...formData,
          author: "PulseVote Team",
        });

        selectedPollId = poll.id;
        selectedOptionId = null;
        pollView.renderMessage("success", "Опитування збережено та додано до списку активних.");
        pollView.resetForm();
        render();
      } catch (error) {
        pollView.renderMessage("error", error.message);
      }
    });

    pollView.bindSelect((pollId) => {
      selectedPollId = pollId;
      selectedOptionId = null;
      render();
    });

    pollView.bindOptionSelect((pollId, optionId) => {
      selectedPollId = pollId;
      selectedOptionId = optionId;
      render();
    });

    pollView.bindVoteConfirm(() => {
      try {
        if (!selectedPollId || !selectedOptionId) {
          throw new Error("Спочатку обери варіант відповіді.");
        }

        pollModel.vote(selectedPollId, selectedOptionId, participantKey);
        pollView.renderMessage("success", "Дякую, голос зараховано.");
        selectedOptionId = null;
        render();
      } catch (error) {
        pollView.renderMessage("error", error.message);
      }
    });

    pollView.bindResetResponses(() => {
      try {
        if (!selectedPollId) {
          throw new Error("Спочатку обери опитування.");
        }

        if (!window.confirm("Скинути всі відповіді для цього опитування?")) {
          return;
        }

        pollModel.resetResponses(selectedPollId);
        selectedOptionId = null;
        pollView.renderMessage("success", "Усі відповіді для опитування скинуто.");
        render();
      } catch (error) {
        pollView.renderMessage("error", error.message);
      }
    });

    pollView.bindDelete(() => {
      try {
        if (!selectedPollId) {
          throw new Error("Спочатку обери опитування.");
        }

        if (!window.confirm("Видалити це опитування?")) {
          return;
        }

        pollModel.remove(selectedPollId);
        selectedPollId = null;
        selectedOptionId = null;
        pollView.renderMessage("success", "Опитування видалено.");
        render();
      } catch (error) {
        pollView.renderMessage("error", error.message);
      }
    });

    pollView.bindFocusConstructor(() => {
      pollView.focusConstructor();
    });

    pollView.bindReset(() => {
      pollView.clearMessage();
    });
  }
})();
