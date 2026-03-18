(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const helpers = App.helpers;

  App.views = App.views || {};
  App.views.auth = {
    registerForm: document.querySelector("[data-register-form]"),
    registerMessage: document.querySelector("[data-register-message]"),
    loginForm: document.querySelector("[data-login-form]"),
    loginMessage: document.querySelector("[data-login-message]"),
    loginHint: document.querySelector("[data-demo-hint]"),

    bindRegister(handler) {
      if (!this.registerForm) {
        return;
      }

      this.registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        helpers.clearMessage(this.registerMessage);
        handler({
          name: this.registerForm.elements.name.value.trim(),
          email: this.registerForm.elements.email.value.trim(),
          gender: this.registerForm.elements.gender.value,
          birthDate: this.registerForm.elements.birthDate.value,
          password: this.registerForm.elements.password.value,
          confirmPassword: this.registerForm.elements.confirmPassword.value,
          policy: this.registerForm.elements.policy.checked,
        });
      });
    },

    bindLogin(handler) {
      if (!this.loginForm) {
        return;
      }

      this.loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        helpers.clearMessage(this.loginMessage);
        handler({
          email: this.loginForm.elements.email.value.trim(),
          password: this.loginForm.elements.password.value,
        });
      });
    },

    renderRegisterMessage(type, text) {
      helpers.showMessage(this.registerMessage, type, text);
    },

    renderLoginMessage(type, text) {
      helpers.showMessage(this.loginMessage, type, text);
    },

    renderDemoHint(credentials) {
      if (!this.loginHint) {
        return;
      }

      this.loginHint.innerHTML = [
        '<strong class="d-block mb-2">Демо акаунт для перевірки</strong>',
        "<div>Email: <code>",
        helpers.escapeHtml(credentials.email),
        "</code></div>",
        "<div>Пароль: <code>",
        helpers.escapeHtml(credentials.password),
        "</code></div>",
      ].join("");
    },

    resetRegisterForm() {
      if (this.registerForm) {
        this.registerForm.reset();
      }
    },
  };
})();
