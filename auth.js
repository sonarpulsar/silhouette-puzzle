// Simple client-side password gate for the Control + Display pages.
// Deterrent only (the password lives in the page). Gallery is NOT gated.
// Once unlocked on a device, it stays unlocked (stored per-browser).

(function () {
  const KEY = "app_unlock";
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored === APP_PASSWORD) return; // already unlocked on this device

  const overlay = document.createElement("div");
  overlay.id = "auth-overlay";
  overlay.innerHTML = `
    <form id="auth-form">
      <div class="auth-title">🔒 Enter password</div>
      <input type="password" id="auth-input" autocomplete="current-password" autofocus />
      <button type="submit">Unlock</button>
      <div class="auth-err" id="auth-err"></div>
    </form>`;

  const style = document.createElement("style");
  style.textContent = `
    #auth-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      z-index: 99999; background: #0f1115;
      display: flex; align-items: center; justify-content: center; }
    #auth-form { text-align: center; font-family: system-ui, sans-serif; color: #f2f4f8; }
    .auth-title { font-size: 1.4rem; margin-bottom: 16px; }
    #auth-input { font-size: 1.2rem; padding: 12px 14px; border-radius: 10px;
      border: 1px solid #2a2f3a; background: #1a1d24; color: #f2f4f8; width: 240px; }
    #auth-form button { display: block; margin: 14px auto 0; font-size: 1.1rem;
      padding: 12px 28px; border-radius: 10px; border: none; background: #4f8cff;
      color: #fff; cursor: pointer; }
    .auth-err { color: #ff6b6b; margin-top: 12px; min-height: 1.2em; }`;

  function mount() {
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    const input = document.getElementById("auth-input");
    const err = document.getElementById("auth-err");
    document.getElementById("auth-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value === APP_PASSWORD) {
        try { localStorage.setItem(KEY, APP_PASSWORD); } catch (e2) {}
        overlay.remove();
      } else {
        err.textContent = "Wrong password";
        input.value = "";
        input.focus();
      }
    });
    input.focus();
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
