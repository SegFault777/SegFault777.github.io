/* Bridge between the main page (parent window) and MiniWin (this page).
   Messages only: no page reads the other's document, so it also works when the site is opened from a file. */
(function () {
  if (window.parent === window) return;               /* MiniWin opened on its own: nothing to do */
  var parentWin = window.parent;
  var SETTINGS_ONLY = "ms-settings-only";
  var overlayMO = null;

  var css = document.createElement("style");
  css.id = "ms-bridge-style";
  css.textContent =
    "html." + SETTINGS_ONLY + ", html." + SETTINGS_ONLY + " body." + SETTINGS_ONLY +
      " { background: transparent !important; background-image: none !important; }" +
    "html." + SETTINGS_ONLY + " body." + SETTINGS_ONLY + " > *:not(#settingsOverlay):not(.theme-guide-overlay) { display: none !important; }" +
    "html." + SETTINGS_ONLY + " #settingsBackdrop { background-image: none !important; }" +
    "html." + SETTINGS_ONLY + " body." + SETTINGS_ONLY + "::before, html." + SETTINGS_ONLY + " body." + SETTINGS_ONLY + "::after { display: none !important; }";
  document.head.appendChild(css);

  function sendState() {
    var sw = document.querySelector(".style-switch");
    var labels = [], pressed = "false";
    if (sw) {
      labels = Array.prototype.map.call(sw.querySelectorAll(".style-label"), function (l) { return l.textContent; });
      var b = sw.querySelector("button");
      if (b) pressed = b.getAttribute("aria-pressed") || "false";
    }
    var sheets = Array.prototype.map.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) { return l.getAttribute("href"); });
    parentWin.postMessage({
      miniwin: "state",
      html: document.documentElement.className,
      body: document.body.className,
      sheets: sheets,
      switchLabels: labels,
      pressed: pressed
    }, "*");
  }

  function openSettings(onlySettings) {
    if (onlySettings) { document.documentElement.classList.add(SETTINGS_ONLY); document.body.classList.add(SETTINGS_ONLY); }
    try { window.miniwinOpenSettings(); } catch (e) {}
    var ov = document.getElementById("settingsOverlay");
    if (!ov) return;
    if (overlayMO) overlayMO.disconnect();
    overlayMO = new MutationObserver(function () {
      if (ov.hidden) {
        overlayMO.disconnect();
        parentWin.postMessage({ miniwin: "settingsClosed" }, "*");
      }
    });
    overlayMO.observe(ov, { attributes: true, attributeFilter: ["hidden"] });
  }

  window.addEventListener("miniwin-style-change", sendState);

  /* Any change of MiniWin's own html/body classes (OldRetro on or off, reduce-motion, ...) is sent to the main page too. */
  var pending = false;
  function queueState() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; sendState(); });
  }
  new MutationObserver(queueState).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  new MutationObserver(queueState).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("load", function () {
    parentWin.postMessage({ miniwin: "ready" }, "*");
    sendState();
  });

  window.addEventListener("message", function (e) {
    if (e.source !== parentWin || !e.data || !e.data.miniwin) return;
    var m = e.data.miniwin;
    if (m === "openSettings") openSettings(!!e.data.onlySettings);
    else if (m === "toggleStyle") { var t = document.getElementById("styleToggle"); if (t) t.click(); }
    else if (m === "state") sendState();
    else if (m === "clearSettingsOnly") { document.documentElement.classList.remove(SETTINGS_ONLY); document.body.classList.remove(SETTINGS_ONLY); }
    else if (m === "exitOldRetro") { if (typeof window.miniwinExitOldRetro === "function") window.miniwinExitOldRetro(); }
  });
})();
