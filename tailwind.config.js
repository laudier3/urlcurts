/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{html,js,ts,ejs,jsx,tsx}",
      "./views/**/*.{html,ejs,hbs}", // se usar templates em outra pasta
    ],
    theme: {
      extend: {},
    },
      plugins: [require('@tailwindcss/line-clamp')],
  };
  