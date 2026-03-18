(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const authView = App.views.auth;
  const userModel = App.models.user;

  if (!authView || !authView.loginForm || !userModel) {
    return;
  }

  userModel.ensureDemoAccount();
  authView.renderDemoHint(userModel.getDemoCredentials());

  authView.bindLogin((credentials) => {
    try {
      userModel.login(credentials.email, credentials.password);
      authView.renderLoginMessage("success", "Вхід успішний. Дані акаунта прочитані з localStorage.");
      window.setTimeout(() => {
        window.location.href = "profile.html";
      }, 700);
    } catch (error) {
      authView.renderLoginMessage("error", error.message);
    }
  });
})();
