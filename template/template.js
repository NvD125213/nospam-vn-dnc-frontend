(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header shadow ---------- */
  var top = document.getElementById("top");
  var onScroll = function () {
    top.classList.toggle("stuck", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, {
    passive: true,
  });
  onScroll();

  /* ---------- drawer ---------- */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");

  function setDrawer(open) {
    drawer.classList.toggle("on", open);
    scrim.classList.toggle("on", open);
    document.body.classList.toggle("lock", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    var vi = document.documentElement.lang === "vi";
    burger.setAttribute(
      "aria-label",
      open ? (vi ? "Đóng menu" : "Close menu") : vi ? "Mở menu" : "Open menu",
    );
  }
  burger.addEventListener("click", function () {
    setDrawer(!drawer.classList.contains("on"));
  });
  var themeBtn = document.getElementById("theme");
  function paintTheme(dark) {
    document.documentElement.classList.toggle("dark", dark);
    if (!themeBtn) return;
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    themeBtn.setAttribute(
      "aria-label",
      dark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối",
    );
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = !document.documentElement.classList.contains("dark");
      paintTheme(next);
      try {
        localStorage.setItem("cgv-theme", next ? "dark" : "light");
      } catch (e) {}
    });
    paintTheme(document.documentElement.classList.contains("dark"));
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.add("drawer-ready");
    });
  });
  scrim.addEventListener("click", function () {
    setDrawer(false);
  });
  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) setDrawer(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setDrawer(false);
  });

  /* ---------- reveal with mandatory fallback ---------- */
  var items = document.querySelectorAll(".rv");

  function showAll() {
    for (var i = 0; i < items.length; i++) items[i].classList.add("in");
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );
    for (var i = 0; i < items.length; i++) io.observe(items[i]);
    setTimeout(showAll, 3000);
  } else {
    showAll();
  }

  /* ---------- back to top, retreats with the hero ---------- */
  var hero = document.querySelector(".hero");
  if ("IntersectionObserver" in window && hero) {
    var ho = new IntersectionObserver(
      function (en) {
        document.body.classList.toggle("away", en[0].intersectionRatio < 0.5);
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    ho.observe(hero);
  }
  document.getElementById("up").addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: reduce ? "auto" : "smooth",
    });
  });

  /* ---------- hero parallax, decorative layers only ---------- */
  var stage = document.querySelector(".stage");
  if (stage && !reduce && window.matchMedia("(min-width:721px)").matches) {
    var layers = stage.querySelectorAll("[data-depth]");
    var tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      hRaf = null;
    var pump = function () {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      for (var i = 0; i < layers.length; i++) {
        var d = parseFloat(layers[i].getAttribute("data-depth"));
        if (isNaN(d)) d = 0;
        var base = layers[i].classList.contains("core")
          ? "translate(-50%,-50%) "
          : "";
        layers[i].style.transform =
          base +
          "translate3d(" +
          (cx * d).toFixed(2) +
          "px," +
          (cy * d).toFixed(2) +
          "px,0)";
      }
      if (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) {
        hRaf = requestAnimationFrame(pump);
      } else {
        hRaf = null;
      }
    };
    window.addEventListener(
      "pointermove",
      function (e) {
        var r = stage.getBoundingClientRect();
        tx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 2;
        ty = ((e.clientY - (r.top + r.height / 2)) / r.height) * 2;
        if (hRaf === null) hRaf = requestAnimationFrame(pump);
      },
      {
        passive: true,
      },
    );
  }

  /* ---------- stat counters ---------- */
  var nums = document.querySelectorAll(".stat b");

  function runNum(el) {
    var to = parseFloat(el.getAttribute("data-to"));
    var sfx = el.getAttribute("data-suffix") || "";
    if (isNaN(to)) return;
    if (reduce) {
      el.textContent = to.toLocaleString() + sfx;
      return;
    }
    var t0 = performance.now(),
      dur = 1200;
    var tick = function (now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString() + sfx;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var no = new IntersectionObserver(
      function (en) {
        en.forEach(function (x) {
          if (x.isIntersecting) {
            runNum(x.target);
            no.unobserve(x.target);
          }
        });
      },
      {
        threshold: 0.5,
      },
    );
    for (var n = 0; n < nums.length; n++) no.observe(nums[n]);
    setTimeout(function () {
      for (var n = 0; n < nums.length; n++) runNum(nums[n]);
    }, 3000);
  } else {
    for (var n2 = 0; n2 < nums.length; n2++) runNum(nums[n2]);
  }

  /* ---------- testimonial rail ---------- */
  var view = document.getElementById("viewport");
  var lane = document.getElementById("lane");
  if (view && lane) {
    var cards = lane.children;
    var x = 0,
      minX = 0,
      vel = 0,
      snap = null,
      raf = null;
    var down = false,
      promoted = false,
      startX = 0,
      startPointer = 0,
      lastP = 0,
      lastT = 0,
      padL = 0;
    var idx = -1,
      blockUntil = 0;
    var prevB = document.getElementById("prev");
    var nextB = document.getElementById("next");
    var count = document.getElementById("count");

    function pad2(n) {
      return (n < 10 ? "0" : "") + n;
    }

    /* each card lags the lane velocity with its own stiffness, so the row
           behaves like a loosely strung chain instead of a rigid strip */
    var lag = [],
      tfCache = [];
    for (var c = 0; c < cards.length; c++) {
      lag.push(0);
      tfCache.push("");
    }

    function physics() {
      if (reduce) return false;
      var moving = false;
      for (var i = 0; i < cards.length; i++) {
        var k = 0.155 - (i % 3) * 0.032;
        lag[i] += (vel - lag[i]) * k;
        if (Math.abs(lag[i]) > 0.03) moving = true;
        else lag[i] = 0;
        var rot = (-lag[i] * 0.115).toFixed(2);
        var dy = (Math.abs(lag[i]) * 0.3).toFixed(2);
        var t = "rotate(" + rot + "deg) translateY(" + dy + "px)";
        if (tfCache[i] !== t) {
          cards[i].style.transform = t;
          tfCache[i] = t;
        }
      }
      return moving;
    }

    function measure() {
      padL = parseFloat(getComputedStyle(lane).paddingLeft) || 0;
      minX = Math.min(0, view.clientWidth - lane.scrollWidth);
      if (x < minX) x = minX;
      if (x > 0) x = 0;
      draw();
    }

    function nearest() {
      var best = 0,
        bestD = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var d = Math.abs(cards[i].offsetLeft + x - padL);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    }

    function draw() {
      lane.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      var i = nearest();
      if (i !== idx) {
        idx = i;
        count.textContent = pad2(i + 1) + " / " + pad2(cards.length);
      }
      prevB.disabled = x >= -1;
      nextB.disabled = x <= minX + 1;
    }

    function loop() {
      if (snap !== null) {
        x += (snap - x) * 0.16;
        if (Math.abs(snap - x) < 0.5) {
          x = snap;
          snap = null;
        }
      } else if (!down) {
        if (Math.abs(vel) > 0.1) {
          x += vel;
          vel *= 0.92;
          if (x > 0) {
            x = 0;
            vel = 0;
          }
          if (x < minX) {
            x = minX;
            vel = 0;
          }
        } else {
          vel = 0;
        }
      }
      draw();
      var springing = physics();
      if (snap !== null || Math.abs(vel) > 0.1 || down || springing) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }

    function kick() {
      if (raf === null) raf = requestAnimationFrame(loop);
    }

    function goTo(i) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      snap = Math.max(minX, Math.min(0, -(cards[i].offsetLeft - padL)));
      kick();
    }
    prevB.addEventListener("click", function () {
      goTo(nearest() - 1);
    });
    nextB.addEventListener("click", function () {
      goTo(nearest() + 1);
    });

    view.addEventListener("pointerdown", function (e) {
      down = true;
      promoted = false;
      snap = null;
      vel = 0;
      startX = x;
      startPointer = e.clientX;
      lastP = e.clientX;
      lastT = performance.now();
    });
    view.addEventListener("pointermove", function (e) {
      if (!down) return;
      var travel = e.clientX - startPointer;
      if (!promoted) {
        if (Math.abs(travel) < 8) return;
        promoted = true;
        view.classList.add("dragging");
        try {
          view.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
      x = startX + travel;
      if (x > 0) x = x * 0.35;
      if (x < minX) x = minX + (x - minX) * 0.35;
      var now = performance.now(),
        dt = now - lastT;
      if (dt > 0) vel = ((e.clientX - lastP) / dt) * 15;
      lastP = e.clientX;
      lastT = now;
      kick();
    });

    function endDrag() {
      if (!down) return;
      down = false;
      if (promoted) {
        blockUntil = Date.now() + 240;
      }
      promoted = false;
      view.classList.remove("dragging");
      if (x > 0 || x < minX) {
        snap = x > 0 ? 0 : minX;
        vel = 0;
      }
      /* nudge the chain so the cards settle back through zero instead of stopping flat */
      if (!reduce) {
        for (var i = 0; i < lag.length; i++) {
          lag[i] *= 1.35;
        }
      }
      kick();
    }
    view.addEventListener("pointerup", endDrag);
    view.addEventListener("pointercancel", endDrag);
    view.addEventListener("lostpointercapture", endDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("blur", endDrag);
    view.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });
    view.addEventListener(
      "wheel",
      function () {
        snap = null;
      },
      {
        passive: true,
      },
    );

    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    measure();
  }

  /* ---------- features slab, click only ---------- */
  var slabrow = document.getElementById("slabrow");
  if (slabrow) {
    var staves = slabrow.querySelectorAll(".stave");

    function openStave(el) {
      if (el.classList.contains("open")) return;
      for (var i = 0; i < staves.length; i++) {
        var on = staves[i] === el;
        staves[i].classList.toggle("open", on);
        staves[i].setAttribute("aria-expanded", on ? "true" : "false");
      }
    }
    for (var s = 0; s < staves.length; s++) {
      (function (el) {
        el.addEventListener("click", function () {
          openStave(el);
        });
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openStave(el);
            return;
          }
          var dir =
            e.key === "ArrowRight" || e.key === "ArrowDown"
              ? 1
              : e.key === "ArrowLeft" || e.key === "ArrowUp"
                ? -1
                : 0;
          if (dir) {
            e.preventDefault();
            var here = Array.prototype.indexOf.call(staves, el);
            var to =
              staves[Math.max(0, Math.min(staves.length - 1, here + dir))];
            openStave(to);
            to.focus();
          }
        });
      })(staves[s]);
    }
  }

  /* ---------- pricing toggle ---------- */
  var sw = document.getElementById("switch");
  if (sw) {
    var prices = document.querySelectorAll(".price");
    var pers = document.querySelectorAll(".per");
    var totals = document.querySelectorAll(".plan .total");
    var plansEl = document.querySelector(".plans");
    var lblM = document.getElementById("lblM"),
      lblY = document.getElementById("lblY");

    function money(n) {
      return "$" + Number(n).toLocaleString();
    }

    function setYear(yearly) {
      sw.setAttribute("aria-checked", yearly ? "true" : "false");
      sw.setAttribute(
        "aria-label",
        yearly ? "Switch to monthly billing" : "Switch to yearly billing",
      );
      lblM.classList.toggle("on", !yearly);
      lblY.classList.toggle("on", yearly);
      if (plansEl) plansEl.classList.toggle("yearly", yearly);
      for (var i = 0; i < prices.length; i++) {
        prices[i].textContent = money(
          prices[i].getAttribute(yearly ? "data-y" : "data-m"),
        );
      }
      for (var j = 0; j < pers.length; j++) {
        pers[j].textContent = yearly ? "per month, billed yearly" : "per month";
      }
      for (var k = 0; k < totals.length; k++) {
        var t = totals[k];
        if (yearly) {
          var full = parseFloat(t.getAttribute("data-m")) * 12;
          t.innerHTML =
            "<b>" +
            money(t.getAttribute("data-y")) +
            '</b> a year <span class="was">' +
            money(full) +
            "</span>";
        } else {
          t.textContent = "Billed monthly";
        }
      }
    }
    sw.addEventListener("click", function () {
      setYear(sw.getAttribute("aria-checked") !== "true");
    });
    sw.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setYear(sw.getAttribute("aria-checked") !== "true");
      }
    });
  }

  /* ---------- faq, click only ---------- */
  var qs = document.querySelectorAll(".q");

  function toggleQ(q) {
    var open = q.classList.toggle("open");
    q.setAttribute("aria-expanded", open ? "true" : "false");
  }
  for (var q = 0; q < qs.length; q++) {
    (function (el) {
      el.addEventListener("click", function () {
        toggleQ(el);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleQ(el);
        }
      });
    })(qs[q]);
  }

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains("sheet")) return;
    e.preventDefault();
    runApi(form);
  });
  document.addEventListener("click", function (e) {
    var show = e.target.closest("[data-show]");
    if (show) {
      var panel = document.getElementById(show.getAttribute("data-show"));
      if (panel) panel.hidden = false;
      return;
    }
    var addBtn = e.target.closest("[data-reflect-add]");
    if (addBtn) {
      var addForm = addBtn.closest("form[data-type='reflect-many']");
      if (addForm) addReflectRow(addForm);
      return;
    }
    var removeBtn = e.target.closest("[data-reflect-remove]");
    if (removeBtn) {
      var removeForm = removeBtn.closest("form[data-type='reflect-many']");
      var row = removeBtn.closest("tr.reflect-row");
      if (removeForm && row) removeReflectRow(removeForm, row);
      return;
    }
    var action = e.target.closest("[data-api-action]");
    if (!action) return;
    var host = action.closest("[data-endpoint]");
    if (host) runApi(host);
  });
  document.addEventListener("change", function (e) {
    var input = e.target;
    if (!input.classList || !input.classList.contains("pick")) return;
    syncFilePick(input);
  });

  document.addEventListener("dragover", function (e) {
    var drop = e.target.closest && e.target.closest(".file-drop");
    if (!drop) return;
    e.preventDefault();
    drop.classList.add("is-drag");
  });

  document.addEventListener("dragleave", function (e) {
    var drop = e.target.closest && e.target.closest(".file-drop");
    if (!drop) return;
    if (drop.contains(e.relatedTarget)) return;
    drop.classList.remove("is-drag");
  });

  document.addEventListener("drop", function (e) {
    var drop = e.target.closest && e.target.closest(".file-drop");
    if (!drop) return;
    e.preventDefault();
    drop.classList.remove("is-drag");
    var input = drop.querySelector("input.pick");
    var file =
      e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!input || !file) return;
    try {
      var transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
    } catch (err) {
      return;
    }
    syncFilePick(input);
  });

  function syncFilePick(input) {
    var drop = input.closest(".file-drop");
    var file = input.files && input.files[0];
    if (drop) {
      var name = drop.querySelector(".file-drop-name");
      var title = drop.querySelector(".file-drop-title");
      var hint = drop.querySelector(".file-drop-hint");
      var cta = drop.querySelector(".file-drop-cta");
      drop.classList.toggle("has-file", !!file);
      if (name) {
        name.hidden = !file;
        name.textContent = file ? file.name : "";
      }
      if (title) title.hidden = !!file;
      if (hint) hint.hidden = !!file;
      if (cta) cta.textContent = file ? "Đổi tệp" : "Chọn tệp";
      return;
    }
    var label = input.parentNode.querySelector("span");
    if (label && file) label.textContent = file.name;
  }

  function apiBase() {
    var base = window.CGV_API_URL || "";
    return String(base).replace(/\/+$/, "");
  }

  function captchaSiteKey() {
    return String(window.RECAPTCHA_SITE_KEY || "").trim();
  }

  var captchaReadyWaiters = [];
  window.onCgvRecaptchaLoad = function () {
    window.CGV_RECAPTCHA_READY = true;
    var queue = captchaReadyWaiters.slice();
    captchaReadyWaiters.length = 0;
    for (var i = 0; i < queue.length; i++) queue[i]();
  };

  function whenCaptchaReady(cb) {
    if (
      window.CGV_RECAPTCHA_READY &&
      window.grecaptcha &&
      typeof window.grecaptcha.render === "function"
    ) {
      cb();
      return;
    }
    captchaReadyWaiters.push(cb);
  }

  function mountCaptchas(root) {
    var key = captchaSiteKey();
    var scope = root || document;
    var hosts = scope.querySelectorAll("[data-endpoint]");
    if (!hosts.length) return;
    if (!key) {
      for (var i = 0; i < hosts.length; i++) {
        ensureCaptchaSlot(hosts[i], true);
      }
      return;
    }
    whenCaptchaReady(function () {
      for (var i = 0; i < hosts.length; i++) {
        renderCaptcha(hosts[i], key);
      }
    });
  }

  function ensureCaptchaSlot(host, missingKey) {
    var slot = host.querySelector(".captcha-slot");
    if (!slot) {
      slot = document.createElement("div");
      slot.className = "captcha-slot";
      var submit =
        host.querySelector('button[type="submit"]') ||
        host.querySelector("[data-api-action]") ||
        host.querySelector(".btn.solid");
      var anchor = submit;
      if (
        submit &&
        submit.parentNode &&
        submit.parentNode !== host &&
        host.contains(submit.parentNode)
      ) {
        anchor = submit.parentNode;
      }
      if (anchor && host.contains(anchor)) {
        host.insertBefore(slot, anchor);
      } else {
        host.appendChild(slot);
      }
    }
    if (missingKey) {
      slot.innerHTML =
        '<p class="captcha-missing">Thiếu RECAPTCHA_SITE_KEY trong cấu hình.</p>';
      host._captchaWidgetId = null;
    }
    return slot;
  }

  function renderCaptcha(host, key) {
    if (host._captchaWidgetId != null) return;
    var slot = ensureCaptchaSlot(host, false);
    slot.innerHTML = "";
    var box = document.createElement("div");
    slot.appendChild(box);
    try {
      host._captchaWidgetId = window.grecaptcha.render(box, {
        sitekey: key,
        theme: document.documentElement.classList.contains("dark")
          ? "dark"
          : "light",
      });
    } catch (err) {
      slot.innerHTML =
        '<p class="captcha-missing">Không khởi tạo được captcha.</p>';
      host._captchaWidgetId = null;
    }
  }

  function getCaptchaToken(host) {
    if (!captchaSiteKey()) return "";
    if (
      !window.grecaptcha ||
      typeof window.grecaptcha.getResponse !== "function"
    ) {
      return "";
    }
    if (host._captchaWidgetId == null) return "";
    return String(window.grecaptcha.getResponse(host._captchaWidgetId) || "");
  }

  function resetCaptcha(host) {
    if (
      host._captchaWidgetId == null ||
      !window.grecaptcha ||
      typeof window.grecaptcha.reset !== "function"
    ) {
      return;
    }
    try {
      window.grecaptcha.reset(host._captchaWidgetId);
    } catch (err) {}
  }

  function resultNode(host) {
    return host.querySelector(".work-result");
  }

  function setResult(host, text, isError) {
    var note = resultNode(host);
    if (!note) return;
    note.hidden = false;
    note.textContent = text;
    note.classList.toggle("is-error", !!isError);
  }

  function formatApiErrors(payload) {
    var err = payload && payload.msg_error;
    var describe =
      typeof window.describeError === "function"
        ? window.describeError
        : function (code) {
            return String(code == null ? "" : code).trim();
          };
    if (Array.isArray(err)) {
      return err.map(describe).filter(Boolean).join("\n");
    }
    if (err) return describe(err) || String(err);
    if (payload && payload.message) return String(payload.message);
    if (payload && payload.status) return String(payload.status);
    return "Có lỗi xảy ra";
  }

  function envelopeState(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return null;
    }
    var hasCode = payload.code != null && payload.code !== "";
    var hasMsg =
      payload.msg_success != null ||
      payload.msg_error != null ||
      payload.status != null;
    if (!hasCode && !hasMsg) return null;
    var code = Number(payload.code);
    var err = payload.msg_error;
    var hasError = Array.isArray(err)
      ? err.length > 0
      : err != null && err !== "";
    if (hasError) return false;
    if (hasCode && !isNaN(code) && code !== 200) return false;
    return true;
  }

  function notify(host, text, isError, meta) {
    setResult(host, text, isError);
    if (!window.Swal) return;
    var title =
      (meta && meta.title) || (isError ? "Không thành công" : "Thành công");
    var detail = text && String(text).trim() ? String(text).trim() : "";
    // Tránh lặp tiêu đề với nội dung (vd. cả hai đều "Thành công")
    if (detail && detail.toLowerCase() === String(title).toLowerCase()) {
      detail = "";
    }
    var bits = [];
    if (detail) {
      if (detail.indexOf("\n") >= 0) {
        bits.push(
          '<div class="cgv-swal-msg">' +
            detail
              .split("\n")
              .map(function (line) {
                return "<div>" + escapeHtml(line) + "</div>";
              })
              .join("") +
            "</div>",
        );
      } else {
        bits.push('<p class="cgv-swal-msg">' + escapeHtml(detail) + "</p>");
      }
    }
    if (meta && meta.timestamp) {
      bits.push(
        '<p class="cgv-swal-meta">Thời gian: ' +
          escapeHtml(String(meta.timestamp)) +
          "</p>",
      );
    }
    window.Swal.fire({
      icon: isError ? "error" : "success",
      title: title,
      html: bits.length ? bits.join("") : undefined,
      confirmButtonText: "Đóng",
      buttonsStyling: false,
      customClass: {
        popup: "cgv-swal",
        title: "cgv-swal-title",
        htmlContainer: "cgv-swal-body",
        confirmButton: "btn solid cgv-swal-btn",
        icon: isError ? "cgv-swal-icon is-error" : "cgv-swal-icon is-ok",
      },
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function reportPayload(host, payload) {
    var ok = envelopeState(payload);
    if (ok === false) {
      notify(host, formatApiErrors(payload), true, {
        title: "Không thành công",
        timestamp: payload.timestamp,
      });
      return;
    }
    if (ok === true) {
      notify(host, payload.msg_success || summarize(payload), false, {
        title: "Thành công",
        timestamp: payload.timestamp,
      });
      return;
    }
    notify(host, summarize(payload), false);
  }

  function showLoading(host) {
    setResult(host, "Đang gửi yêu cầu…", false);
    if (!window.Swal) return;
    window.Swal.fire({
      title: "Đang gửi yêu cầu…",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      buttonsStyling: false,
      customClass: {
        popup: "cgv-swal",
        title: "cgv-swal-title",
      },
      didOpen: function () {
        window.Swal.showLoading();
      },
    });
  }

  function setBusy(host, busy) {
    var buttons = host.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) buttons[i].disabled = !!busy;
  }

  function formValues(form) {
    var data = {};
    var fields = form.querySelectorAll("[name]");
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (el.type === "file") continue;
      data[el.name] = el.value;
    }
    return data;
  }

  function reflectRowsHost(form) {
    return form.querySelector("[data-reflect-rows]");
  }

  function syncReflectRemoveButtons(form) {
    var rows = form.querySelectorAll("tr.reflect-row");
    var multi = rows.length > 1;
    for (var i = 0; i < rows.length; i++) {
      var btn = rows[i].querySelector("[data-reflect-remove]");
      if (btn) btn.hidden = !multi;
    }
  }

  function addReflectRow(form) {
    var body = reflectRowsHost(form);
    if (!body) return;
    var first = body.querySelector("tr.reflect-row");
    if (!first) return;
    var clone = first.cloneNode(true);
    var fields = clone.querySelectorAll("[name]");
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (el.tagName === "SELECT") {
        el.selectedIndex = 0;
      } else {
        el.value = "";
      }
    }
    var remove = clone.querySelector("[data-reflect-remove]");
    if (remove) remove.hidden = false;
    body.appendChild(clone);
    syncReflectRemoveButtons(form);
    var phone = clone.querySelector('input[name="cusPhone"]');
    if (phone) phone.focus();
    var wrap = form.querySelector(".reflect-table-wrap");
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
  }

  function removeReflectRow(form, row) {
    var body = reflectRowsHost(form);
    if (!body || body.querySelectorAll("tr.reflect-row").length <= 1) return;
    row.remove();
    syncReflectRemoveButtons(form);
  }

  function collectReflectMany(form) {
    var rows = form.querySelectorAll("tr.reflect-row");
    var items = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var phoneEl = row.querySelector('[name="cusPhone"]');
      var formEl = row.querySelector('[name="reflectFormCode"]');
      var typeEl = row.querySelector('[name="reflectTypeCode"]');
      var reqEl = row.querySelector('[name="requestType"]');
      var cusPhone = phoneEl ? String(phoneEl.value || "").trim() : "";
      if (!cusPhone) continue;
      items.push({
        cusPhone: cusPhone,
        reflectFormCode: formEl ? formEl.value || "SMS" : "SMS",
        reflectTypeCode: typeEl ? typeEl.value : "",
        requestType: reqEl ? reqEl.value : "",
      });
    }
    return items;
  }

  function toDncDate(value, endOfDay) {
    if (!value) return "";
    var parts = String(value).split("-");
    if (parts.length !== 3) return value;
    var time = endOfDay ? "23:59:59" : "00:00:00";
    return parts[2] + "/" + parts[1] + "/" + parts[0] + " " + time;
  }

  function filenameFromDisposition(header, fallback) {
    if (!header) return fallback;
    var match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(header);
    if (!match) return fallback;
    try {
      return decodeURIComponent(match[1] || match[2]);
    } catch (e) {
      return match[1] || match[2] || fallback;
    }
  }

  function summarize(payload) {
    if (payload == null) return "Xong.";
    if (typeof payload === "string") return payload;
    if (payload.msg_success) return payload.msg_success;
    if (payload.msg_error) return formatApiErrors(payload);
    if (payload.message) return payload.message;
    if (payload.fileUrl) return "Đã nhận. fileUrl: " + payload.fileUrl;
    if (payload.requestId) return "requestId: " + payload.requestId;
    try {
      return JSON.stringify(payload, null, 2);
    } catch (e) {
      return String(payload);
    }
  }

  function parseError(res, text) {
    try {
      var json = JSON.parse(text);
      if (json.msg_error) return formatApiErrors(json);
      return (
        json.message || json.msg_success || json.error || text || res.statusText
      );
    } catch (e) {
      return text || res.statusText || "Lỗi " + res.status;
    }
  }

  function normalizeComplainTypes(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.content)) return payload.content;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function fillComplainTypeSelects(root, items) {
    var scope = root || document;
    var list = Array.isArray(items) ? items : [];
    var selects = scope.querySelectorAll("[data-complain-types]");
    for (var i = 0; i < selects.length; i++) {
      var select = selects[i];
      var prev = select.value;
      select.innerHTML = "";
      var placeholder = document.createElement("option");
      placeholder.value = "";
      if (!list.length) {
        placeholder.textContent = "Không có loại phản ánh";
        select.appendChild(placeholder);
        select.disabled = true;
        continue;
      }
      placeholder.textContent = "Chọn loại phản ánh";
      select.appendChild(placeholder);
      select.disabled = false;
      for (var j = 0; j < list.length; j++) {
        var item = list[j] || {};
        var opt = document.createElement("option");
        opt.value = item.id == null ? "" : String(item.id);
        opt.textContent = item.name
          ? String(item.name)
          : opt.value || "Loại " + (j + 1);
        select.appendChild(opt);
      }
      if (prev) select.value = prev;
    }
  }

  function loadComplainTypes(root) {
    var scope = root || document;
    var selects = scope.querySelectorAll("[data-complain-types]");
    if (!selects.length) return;
    var base = apiBase();
    if (!base) {
      fillComplainTypeSelects(scope, []);
      for (var i = 0; i < selects.length; i++) {
        selects[i].querySelector("option").textContent =
          "Thiếu API_URL trong cấu hình";
      }
      return;
    }
    fetch(base + "/integrate/complain/get-list-type", {
      method: "GET",
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var payload = null;
          if (text) {
            try {
              payload = JSON.parse(text);
            } catch (err) {
              payload = null;
            }
          }
          if (payload && !Array.isArray(payload) && envelopeState(payload) === false) {
            throw new Error(formatApiErrors(payload));
          }
          if (!res.ok) throw new Error(parseError(res, text));
          return payload;
        });
      })
      .then(function (payload) {
        fillComplainTypeSelects(scope, normalizeComplainTypes(payload));
      })
      .catch(function () {
        fillComplainTypeSelects(scope, []);
        for (var i = 0; i < selects.length; i++) {
          var first = selects[i].querySelector("option");
          if (first) first.textContent = "Không tải được danh mục";
        }
      });
  }

  function runApi(host) {
    var endpoint = host.getAttribute("data-endpoint");
    var type = host.getAttribute("data-type") || "json";
    if (!endpoint) return;
    var base = apiBase();
    if (!base) {
      notify(host, "Thiếu API_URL trong cấu hình.", true);
      return;
    }
    if (!captchaSiteKey()) {
      notify(host, "Thiếu RECAPTCHA_SITE_KEY trong cấu hình.", true);
      return;
    }
    var captchaToken = getCaptchaToken(host);
    if (!captchaToken) {
      notify(host, "Vui lòng xác nhận captcha trước khi gửi.", true);
      return;
    }

    var values = host.tagName === "FORM" ? formValues(host) : {};
    var method = type === "list-type" ? "GET" : "POST";
    var url = base + endpoint;
    var init = { method: method };

    if (type === "json") {
      init.headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (values.fromDate) values.fromDate = toDncDate(values.fromDate, false);
      if (values.toDate) values.toDate = toDncDate(values.toDate, true);
      Object.keys(values).forEach(function (key) {
        if (values[key] === "") delete values[key];
      });
      values.captchaToken = captchaToken;
      init.body = JSON.stringify(values);
    } else if (type === "reflect-many") {
      var importData = collectReflectMany(host);
      if (!importData.length) {
        notify(host, "Cần nhập ít nhất một số thuê bao.", true);
        return;
      }
      init.headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      init.body = JSON.stringify({
        importData: importData,
        captchaToken: captchaToken,
      });
    } else if (type === "upload") {
      var fileInput = host.querySelector('input[type="file"]');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        notify(host, "Cần chọn tệp trước khi gửi.", true);
        return;
      }
      var formData = new FormData();
      formData.append(fileInput.name || "file", fileInput.files[0]);
      formData.append("captchaToken", captchaToken);
      init.body = formData;
    } else if (type === "download") {
      init.headers = { "Content-Type": "application/json", Accept: "*/*" };
      init.body = JSON.stringify({
        fromDate: toDncDate(values.fromDate, false),
        toDate: toDncDate(values.toDate, true),
        captchaToken: captchaToken,
      });
    } else if (type === "list-type") {
      init.headers = { Accept: "application/json" };
      url +=
        (url.indexOf("?") >= 0 ? "&" : "?") +
        "captchaToken=" +
        encodeURIComponent(captchaToken);
    }

    setBusy(host, true);
    showLoading(host);

    fetch(url, init)
      .then(function (res) {
        if (type === "download") {
          var ctype = (res.headers.get("Content-Type") || "").toLowerCase();
          if (ctype.indexOf("json") >= 0 || !res.ok) {
            return res.text().then(function (text) {
              var payload = null;
              if (text) {
                try {
                  payload = JSON.parse(text);
                } catch (err) {
                  payload = null;
                }
              }
              if (payload && envelopeState(payload) === false) {
                throw Object.assign(new Error(formatApiErrors(payload)), {
                  payload: payload,
                });
              }
              if (!res.ok) throw new Error(parseError(res, text));
              return payload || { ok: true, message: "Đã tải xong." };
            });
          }
          var name = filenameFromDisposition(
            res.headers.get("Content-Disposition"),
            "download-" + Date.now() + ".zip",
          );
          return res.blob().then(function (blob) {
            var link = document.createElement("a");
            var href = URL.createObjectURL(blob);
            link.href = href;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(function () {
              URL.revokeObjectURL(href);
            }, 1000);
            return { ok: true, message: "Đã tải tệp: " + name };
          });
        }
        return res.text().then(function (text) {
          var payload = null;
          if (text) {
            try {
              payload = JSON.parse(text);
            } catch (err) {
              payload = text;
            }
          }
          if (payload && envelopeState(payload) === false) {
            throw Object.assign(new Error(formatApiErrors(payload)), {
              payload: payload,
            });
          }
          if (!res.ok) throw new Error(parseError(res, text));
          return payload;
        });
      })
      .then(function (payload) {
        if (type === "list-type") {
          var list = host.querySelector(".types");
          var items = normalizeComplainTypes(payload);
          fillComplainTypeSelects(document, items);
          if (list) {
            list.innerHTML = "";
            for (var i = 0; i < items.length; i++) {
              var li = document.createElement("li");
              li.innerHTML = "<b></b> <span></span>";
              li.querySelector("b").textContent = items[i].id;
              li.querySelector("span").textContent = items[i].name;
              list.appendChild(li);
            }
            list.hidden = !items.length;
          }
          if (envelopeState(payload) != null) {
            reportPayload(host, payload);
            return;
          }
          notify(
            host,
            items.length
              ? "Đã lấy " + items.length + " loại phản ánh."
              : summarize(payload),
            false,
          );
          return;
        }
        if (type === "download") {
          if (payload && payload.message) {
            notify(host, payload.message, false);
            return;
          }
          reportPayload(host, payload);
          return;
        }
        reportPayload(host, payload);
      })
      .catch(function (err) {
        if (err && err.payload) {
          reportPayload(host, err.payload);
          return;
        }
        notify(host, err && err.message ? err.message : String(err), true);
      })
      .finally(function () {
        setBusy(host, false);
        resetCaptcha(host);
      });
  }

  var pageSlot = document.getElementById("page");
  if (pageSlot) {
    var groups = [
      "phan-anh-dnc",
      "kho-du-lieu",
      // "hau-kiem", // tạm ẩn
      "phan-anh-tin-nhan-cuoc-goi-rac",
    ];
    var homeTitle =
      "CGV Telecom — Hệ thống phòng, chống tin nhắn rác, cuộc gọi rác";
    var pageCache = {};
    var pageToken = 0;

    var shown = "";

    function appRoot() {
      var path = location.pathname;
      var re = new RegExp("/(?:" + groups.join("|") + ")$");
      if (re.test(path)) return path.replace(re, "/");
      if (/index\.html$/i.test(path)) return path.replace(/index\.html$/i, "");
      if (path.slice(-1) !== "/") return path.replace(/[^/]*$/, "");
      return path;
    }

    function canonical(route) {
      var root = appRoot();
      if (root.slice(-1) !== "/") root += "/";
      return route ? root + route : root;
    }

    function cleanRoute(value) {
      return (value || "")
        .replace(/^#/, "")
        .replace(/^\/+/, "")
        .replace(/\.html$/i, "")
        .replace(/\/index$/i, "")
        .replace(/\/$/, "");
    }

    function splitHref(href) {
      var raw = href || "";
      var cut = raw.indexOf("#");
      return {
        route: cleanRoute(cut >= 0 ? raw.slice(0, cut) : raw),
        hash: cut >= 0 ? raw.slice(cut + 1) : "",
      };
    }

    function routeFromLocation() {
      var path = location.pathname.replace(/\/+$/, "") || "/";
      var matched = path.match(new RegExp("/(" + groups.join("|") + ")$"));
      return matched ? matched[1] : "";
    }

    function sectionFromLocation() {
      return (location.hash || "").replace(/^#/, "");
    }

    function scrollToSection(id) {
      if (!id) {
        window.scrollTo(0, 0);
        return;
      }
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: "start" });
      else window.scrollTo(0, 0);
    }

    function markNav(route) {
      var links = document.querySelectorAll(".nav a, .drawer a, .acts a");
      for (var k = 0; k < links.length; k++) {
        var parts = splitHref(links[k].getAttribute("href") || "");
        if (route && parts.route === route)
          links[k].setAttribute("aria-current", "page");
        else links[k].removeAttribute("aria-current");
      }
    }

    function showRoute(route) {
      shown = route || "";
      var token = ++pageToken;
      var main = document.getElementById("home");
      var home = !route;
      if (main) {
        main.classList.toggle("is-route", !home);
        main.classList.toggle("is-home", home);
      }
      document.documentElement.classList.toggle("has-route", !home);
      markNav(route);
      if (home) {
        pageSlot.innerHTML = "";
        document.documentElement.classList.add("route-ready");
        document.title = homeTitle;
        window.scrollTo(0, 0);
        return;
      }
      function paint(html) {
        if (token !== pageToken) return;
        pageSlot.innerHTML = html;
        document.documentElement.classList.add("route-ready");
        var heading = pageSlot.querySelector("h2");
        document.title = heading
          ? heading.textContent.trim() + " — CGV Telecom"
          : homeTitle;
        scrollToSection(sectionFromLocation());
        loadComplainTypes(pageSlot);
        mountCaptchas(pageSlot);
      }
      if (pageCache[route]) {
        paint(pageCache[route]);
        return;
      }
      document.documentElement.classList.remove("route-ready");
      pageSlot.innerHTML = "";
      fetch("template/pages/" + route + ".html")
        .then(function (res) {
          return res.ok ? res.text() : "";
        })
        .then(function (html) {
          if (!html) {
            paint(
              '<section class="band on"><div class="shell"><p class="lede">Không mở được mục này.</p></div></section>',
            );
            return;
          }
          pageCache[route] = html;
          paint(html);
        })
        .catch(function () {
          paint(
            '<section class="band on"><div class="shell"><p class="lede">Không mở được mục này.</p></div></section>',
          );
        });
    }

    document.addEventListener(
      "click",
      function (e) {
        var link = e.target.closest("a");
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (link.target && link.target !== "_self") return;
        var href = link.getAttribute("href");
        if (!href || /^(https?:|mailto:|tel:)/.test(href)) return;
        var parts = splitHref(href);
        var isHome =
          href === "./" ||
          href === "/" ||
          href === "index.html" ||
          href === "#";
        var isPage = new RegExp("^(" + groups.join("|") + ")$").test(
          parts.route,
        );
        if (!isHome && !isPage) return;
        e.preventDefault();
        var next = isHome ? "" : parts.route;
        if (next && next === routeFromLocation()) {
          var same = canonical(next) + (parts.hash ? "#" + parts.hash : "");
          if (location.pathname + location.hash !== same)
            history.pushState({ route: next }, "", same);
          scrollToSection(parts.hash);
          markNav(next);
          setDrawer(false);
          return;
        }
        history.pushState(
          { route: next },
          "",
          canonical(next) + (parts.hash ? "#" + parts.hash : ""),
        );
        showRoute(next);
        setDrawer(false);
      },
      true,
    );
    window.addEventListener("hashchange", function () {
      var route = routeFromLocation();
      if (route && route === shown) {
        scrollToSection(sectionFromLocation());
        markNav(route);
        return;
      }
      showRoute(route);
    });
    window.addEventListener("popstate", function () {
      showRoute(routeFromLocation());
    });
    var opened = routeFromLocation();
    if (opened) {
      var openedUrl = canonical(opened) + location.hash;
      if (location.pathname + location.hash !== openedUrl)
        history.replaceState({ route: opened }, "", openedUrl);
    }
    showRoute(opened);
  }

  var footerSlot = document.getElementById("site-footer");
  if (footerSlot) {
    fetch("components/footer.html")
      .then(function (res) {
        return res.ok ? res.text() : "";
      })
      .then(function (html) {
        if (html) footerSlot.outerHTML = html.trim();
      });
  }
})();
