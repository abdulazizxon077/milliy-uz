/** @type {import('tailwindcss').Config} */
export default {
  content: ['./web/index.html', './web/src/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
