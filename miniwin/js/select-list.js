/* Settings dropdowns (Layout and Language) as one shared list.
   The native <select> stays in place and keeps its value and change events; this only replaces how it is shown:
   a button with the current value, and a list of at most 8 rows that scrolls (the same size for every dropdown). */
(function () {
  var ROWS = 8;
  var openList = null;

  var style = document.createElement("style");
  style.id = "msel-style";
  style.textContent =
    ".msel{position:relative;display:block;min-width:0;}" +
    ".msel-btn{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:36px;" +
      "padding:6px 10px;font:inherit;color:inherit;background:inherit;border:1px solid currentColor;border-radius:4px;" +
      "text-align:left;cursor:pointer;box-sizing:border-box;}" +
    ".msel-btn:focus-visible{outline:2px solid currentColor;outline-offset:2px;}" +
    ".msel-caret{flex:0 0 auto;font-size:.8em;opacity:.8;}" +
    ".msel-pop{position:fixed;z-index:30000;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;" +
      "border:1px solid currentColor;border-radius:4px;padding:4px 0;box-shadow:0 6px 18px rgba(0,0,0,.25);" +
      "font:inherit;color:inherit;background:#ffffff;}" +
    ".msel-group{padding:6px 12px 2px;font-size:.85em;opacity:.7;}" +
    ".msel-opt{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:30px;" +
      "padding:4px 12px;cursor:pointer;color:inherit;}" +
    ".msel-opt:hover,.msel-opt.is-active{background:rgba(127,127,127,.2);}" +
    ".msel-opt[aria-selected='true']{font-weight:700;}" +
    ".msel-tick{flex:0 0 auto;}";
  document.head.appendChild(style);

  function closeList() {
    if (!openList) return;
    openList.pop.remove();
    openList.btn.setAttribute("aria-expanded", "false");
    openList = null;
  }

  function place(pop, btn) {
    var r = btn.getBoundingClientRect();
    var below = window.innerHeight - r.bottom - 8;
    var above = r.top - 8;
    var rowsH = 30 * ROWS + 12;
    var useBelow = below >= Math.min(rowsH, 160) || below >= above;
    pop.style.left = Math.round(r.left) + "px";
    pop.style.width = Math.round(r.width) + "px";
    var room = useBelow ? below : above;
    var h = Math.min(rowsH, Math.max(120, room));
    pop.style.maxHeight = h + "px";
    pop.style.top = useBelow ? Math.round(r.bottom + 4) + "px" : Math.round(r.top - 4 - h) + "px";
  }

  function enhance(sel) {
    if (!sel || sel.dataset.mselDone) return;
    sel.dataset.mselDone = "1";
    sel.style.display = "none";

    var wrap = document.createElement("div");
    wrap.className = "msel";
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "msel-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<span class="msel-label"></span><span class="msel-caret" aria-hidden="true">\u25be</span>';
    wrap.insertBefore(btn, sel);

    function label() {
      var o = sel.options[sel.selectedIndex];
      btn.querySelector(".msel-label").textContent = o ? o.textContent : "";
    }

    function open() {
      if (openList && openList.btn === btn) return closeList();
      closeList();
      var pop = document.createElement("div");
      pop.className = "msel-pop";
      pop.setAttribute("role", "listbox");
      var bg = getComputedStyle(btn).backgroundColor;
      if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) pop.style.background = bg;
      var idx = sel.selectedIndex;
      Array.prototype.forEach.call(sel.children, function (child) {
        if (child.tagName === "OPTGROUP") {
          var g = document.createElement("div");
          g.className = "msel-group";
          g.textContent = child.label;
          pop.appendChild(g);
          Array.prototype.forEach.call(child.children, addOpt);
        } else if (child.tagName === "OPTION") {
          addOpt(child);
        }
      });
      function addOpt(o) {
        var row = document.createElement("div");
        row.className = "msel-opt";
        row.setAttribute("role", "option");
        var i = Array.prototype.indexOf.call(sel.options, o);
        var on = i === idx;
        row.setAttribute("aria-selected", on ? "true" : "false");
        row.dataset.value = o.value;
        row.innerHTML = '<span></span><span class="msel-tick" aria-hidden="true">' + (on ? "\u2713" : "") + "</span>";
        row.firstChild.textContent = o.textContent;
        row.addEventListener("click", function (e) {
          e.stopPropagation();
          choose(o.value);
        });
        pop.appendChild(row);
      }
      document.body.appendChild(pop);
      place(pop, btn);
      btn.setAttribute("aria-expanded", "true");
      openList = { pop: pop, btn: btn };
      var cur = pop.querySelector('[aria-selected="true"]');
      if (cur) cur.scrollIntoView({ block: "nearest" });
    }

    function choose(value) {
      sel.value = value;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      label();
      closeList();
      btn.focus();
    }

    btn.addEventListener("click", function (e) { e.stopPropagation(); open(); });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var n = sel.options.length, i = sel.selectedIndex + (e.key === "ArrowDown" ? 1 : -1);
        if (i >= 0 && i < n) choose(sel.options[i].value);
      }
    });

    /* keep the button label in step with the native select, however its value is set */
    var proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    Object.defineProperty(sel, "value", {
      configurable: true,
      get: function () { return proto.get.call(this); },
      set: function (v) { proto.set.call(this, v); label(); }
    });
    sel.refreshMsel = label;
    label();
  }

  document.addEventListener("click", function (e) {
    if (openList && !openList.pop.contains(e.target) && !openList.btn.contains(e.target)) closeList();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeList(); });
  window.addEventListener("resize", closeList);

  window.miniwinEnhanceSelect = enhance;
  window.miniwinRefreshSelect = function (sel) { if (sel && sel.refreshMsel) sel.refreshMsel(); };
})();
