(function () {
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var today = document.querySelector("[data-today]");
  var todayShort = document.querySelector("[data-today-short]");
  var todayLong = document.querySelector("[data-today-long]");

  if (today) {
    var now = new Date();
    var shortLabel = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }).format(now);
    var longLabel = new Intl.DateTimeFormat("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(now);

    today.dateTime = now.toISOString().slice(0, 10);
    if (todayShort) todayShort.textContent = shortLabel;
    if (todayLong) todayLong.textContent = longLabel;
    (today.closest(".date-chip") || today).setAttribute("aria-label", "Hôm nay, " + longLabel);
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = root.classList.contains("dark");
    toggle.setAttribute("aria-pressed", dark ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      dark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
    );
  }

  syncToggle();

  if (!toggle) return;

  toggle.addEventListener("click", function () {
    var dark = root.classList.toggle("dark");
    try {
      localStorage.setItem("cgv-theme", dark ? "dark" : "light");
    } catch (error) {}
    syncToggle();
  });
})();
