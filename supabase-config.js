(() => {
  const projectUrl = 'https://pwfgibabyihlqqjxaicu.supabase.co';
  const publishableKey = 'PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE';
  const configured = Boolean(
    window.supabase &&
    projectUrl.startsWith('https://') &&
    publishableKey &&
    !publishableKey.startsWith('PASTE_')
  );

  window.carelineSupabase = {
    client: configured ? window.supabase.createClient(projectUrl, publishableKey) : null,
    configured
  };
})();
