(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const helpers = App.helpers;

  function createRow(label, value) {
    return [
      "<tr>",
      "<th>",
      helpers.escapeHtml(label),
      "</th>",
      "<td>",
      helpers.escapeHtml(value),
      "</td>",
      "</tr>",
    ].join("");
  }

  App.views = App.views || {};
  App.views.profile = {
    summaryInitials: document.querySelector("[data-profile-initials]"),
    summaryName: document.querySelector("[data-profile-name]"),
    summaryRole: document.querySelector("[data-profile-role]"),
    summaryNote: document.querySelector("[data-profile-note]"),
    tableBody: document.querySelector("[data-profile-table]"),
    logoutButton: document.querySelector("[data-profile-logout]"),

    renderUser(user) {
      if (!this.summaryInitials || !this.summaryName || !this.summaryRole || !this.summaryNote || !this.tableBody) {
        return;
      }

      this.summaryInitials.textContent = helpers.getInitials(user.name);
      this.summaryName.textContent = user.name;
      this.summaryRole.textContent = user.role || "Користувач";
      this.summaryNote.textContent = "Акаунт активний. Дані завантажені з localStorage.";
      this.tableBody.innerHTML = [
        createRow("Ім'я", user.name),
        createRow("Email", user.email),
        createRow("Стать", user.gender || "Не вказано"),
        createRow("Дата народження", helpers.formatDate(user.birthDate)),
        createRow("Роль", user.role || "Користувач"),
        createRow("Останній вхід", helpers.formatDateTime(user.lastLoginAt)),
      ].join("");
    },

    renderGuest() {
      if (!this.summaryInitials || !this.summaryName || !this.summaryRole || !this.summaryNote || !this.tableBody) {
        return;
      }

      this.summaryInitials.textContent = "PV";
      this.summaryName.textContent = "Профіль користувача";
      this.summaryRole.textContent = "Немає активної сесії";
      this.summaryNote.textContent = "Увійди або зареєструйся, щоб побачити дані профілю.";
      this.tableBody.innerHTML = [
        createRow("Статус", "Не авторизовано"),
        createRow("Email", "Немає активної сесії"),
        createRow("Порада", "Увійдіть або зареєструйтесь"),
        createRow("Доступ", "Профіль доступний після авторизації"),
      ].join("");
    },

    bindLogout(handler) {
      if (!this.logoutButton) {
        return;
      }

      this.logoutButton.addEventListener("click", handler);
    },
  };
})();
