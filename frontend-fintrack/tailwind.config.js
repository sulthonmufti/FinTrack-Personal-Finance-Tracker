/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "bg-slate-500",
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-purple-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
