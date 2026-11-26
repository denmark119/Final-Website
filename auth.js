(() => {
  const client = window.carelineSupabase && window.carelineSupabase.client;
  const form = document.getElementById('auth-form');
  if (!form) return;

  const setupNotice = document.getElementById('setup-notice');
  const authPanel = document.getElementById('auth-panel');
  const signedInPanel = document.getElementById('signed-in-panel');
  const fullNameField = document.getElementById('full-name-field');
  const nameInput = document.getElementById('full-name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const message = document.getElementById('auth-message');
  const submit = document.getElementById('auth-submit');
  const tabs = [...document.querySelectorAll('.auth-tab')];
  let mode = 'signin';

  const nextPage = () => {
    const requested = new URLSearchParams(window.location.search).get('next');
    return ['index.html', 'book.html', 'appointments.html', 'history.html'].includes(requested)
      ? requested
      : 'index.html';
  };

  const showSession = (session) => {
    authPanel.hidden = Boolean(session);
    signedInPanel.hidden = !session;
    if (session) {
      document.getElementById('signed-in-email').textContent = session.user.email || '';
    }
  };

  const setMode = (nextMode) => {
    mode = nextMode;
    fullNameField.hidden = mode !== 'signup';
    nameInput.required = mode === 'signup';
    passwordInput.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
    submit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
    message.textContent = '';
    tabs.forEach((tab) => tab.classList.toggle('on', tab.dataset.mode === mode));
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

  if (!client) {
    setupNotice.hidden = false;
    submit.disabled = true;
    tabs.forEach((tab) => { tab.disabled = true; });
  } else {
    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        message.textContent = `Could not check your sign-in status: ${error.message}`;
        return;
      }
      showSession(data.session);
    }).catch((error) => {
      message.textContent = `Could not check your sign-in status: ${error.message}`;
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (mode === 'signup' && !nameInput.value.trim()) {
        message.textContent = 'Enter your name to create an account.';
        return;
      }
      submit.disabled = true;
      message.textContent = '';
      try {
        const credentials = {
          email: emailInput.value.trim(),
          password: passwordInput.value
        };
        const result = mode === 'signup'
          ? await client.auth.signUp({
            ...credentials,
            options: { data: { full_name: nameInput.value.trim() } }
          })
          : await client.auth.signInWithPassword(credentials);

        if (result.error) {
          message.textContent = result.error.message;
        } else if (mode === 'signup' && !result.data.session) {
          message.textContent = 'Check your email to confirm your account, then sign in.';
        } else {
          window.location.href = nextPage();
        }
      } catch (error) {
        message.textContent = `Sign-in request failed: ${error.message}`;
      } finally {
        submit.disabled = false;
      }
    });

    document.getElementById('sign-out').addEventListener('click', async () => {
      const { error } = await client.auth.signOut();
      if (error) {
        document.getElementById('signed-in-email').textContent = `Could not sign out: ${error.message}`;
        return;
      }
      showSession(null);
    });
  }
})();
