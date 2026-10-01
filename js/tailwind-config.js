window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        canvas: "var(--canvas)",
        blue: "var(--blue)",
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "sans-serif"],
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
};
