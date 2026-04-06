export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#967259",
        primaryDashboard: "#13ec5b",
        "background-light": "#fdfbf9",
        "background-dark": "#1a1411",
        "earth-900": "#2a1f1a",
        "earth-800": "#3d2e27",
        "earth-700": "#5a463d",
        "earth-200": "#dcc8be",
        "earth-100": "#f2e9e4",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
