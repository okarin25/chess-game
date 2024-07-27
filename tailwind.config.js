// tailwind.config.js
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/**/*.js',
  ],
  theme: {
    extend: {
      keyframes: {
        movePiece: {
          '0%': { transform: 'translate(0, 0)', opacity: '0.5' },
          '100%': { transform: 'translate(var(--move-x), var(--move-y))', opacity: '1' },
        },
      },
      animation: {
        movePiece: 'movePiece 0.3s ease-in-out',
      },
    },
  },
  darkMode: 'media', // You can use 'media' or remove it if not needed
  plugins: [],
}
