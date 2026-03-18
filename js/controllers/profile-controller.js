(function () {
  const App = (window.PulseVote = window.PulseVote || {});
  const profileView = App.views.profile;
  const userModel = App.models.user;

  if (!profileView || !userModel) {
    return;
  }

  userModel.ensureDemoAccount();

  function renderProfileState() {
    const currentUser = userModel.getCurrentUser();

    if (currentUser) {
      profileView.renderUser(currentUser);
    } else {
      profileView.renderGuest();
    }
  }

  profileView.bindLogout(() => {
    userModel.logout();
    renderProfileState();
  });

  renderProfileState();
})();
