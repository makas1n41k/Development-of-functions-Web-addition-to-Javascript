(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const authView = App.views.auth;
  const userModel = App.models.user;

  if (!authView || !authView.registerForm || !userModel) {
    return;
  }

  userModel.ensureDemoAccount();

  authView.bindRegister((formData) => {
    try {
      if (!formData.policy) {
        throw new Error("Потрібно погодитися з умовами сервісу.");
      }

      if (formData.password.length < 6) {
        throw new Error("Пароль має містити щонайменше 6 символів.");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Паролі не збігаються.");
      }

      userModel.register(formData);
      authView.renderRegisterMessage("success", "Реєстрацію завершено. Профіль збережено в localStorage.");
      authView.resetRegisterForm();
      window.setTimeout(() => {
        window.location.href = "profile.html";
      }, 700);
    } catch (error) {
      authView.renderRegisterMessage("error", error.message);
    }
  });
})();
