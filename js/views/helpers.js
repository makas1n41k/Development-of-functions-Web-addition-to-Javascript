(function () {
  const App = (window.PulseVote = window.PulseVote || {});

  const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  App.helpers = {
    escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, (symbol) => escapeMap[symbol]);
    },

    createId(prefix) {
      return [prefix, Date.now(), Math.random().toString(16).slice(2, 8)].join("-");
    },

    formatDate(value) {
      if (!value) {
        return "Не вказано";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "Не вказано";
      }

      return new Intl.DateTimeFormat("uk-UA").format(date);
    },

    formatDateTime(value) {
      if (!value) {
        return "Ще не входив";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "Ще не входив";
      }

      return new Intl.DateTimeFormat("uk-UA", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    },

    getInitials(name) {
      const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

      if (parts.length === 0) {
        return "PV";
      }

      return parts.map((part) => part.charAt(0).toUpperCase()).join("");
    },

    showMessage(target, type, text) {
      if (!target) {
        return;
      }

      target.className = "alert mt-3 mb-0";
      target.classList.add(type === "success" ? "alert-success" : "alert-danger");
      target.textContent = text;
      target.hidden = false;
    },

    clearMessage(target) {
      if (!target) {
        return;
      }

      target.hidden = true;
      target.textContent = "";
      target.className = "alert mt-3 mb-0";
    },
  };
})();
