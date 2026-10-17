/** Contact form: validates and shows a confirmation. Hook up a real endpoint (Formspree, your API) in `send`. */
export function initContactForm(form, sentEl) {
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    await send(new FormData(form));
    sentEl.hidden = false;
  });
}

async function send(data) {
  // Example: await fetch('https://formspree.io/f/your-id', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
  return data;
}
