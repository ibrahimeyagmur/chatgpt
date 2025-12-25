export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#212121',
        'chat-bg-secondary': '#171717',
        'chat-sidebar': '#171717',
        'chat-border': '#303030',
        'chat-hover': '#2f2f2f',
        'chat-text': '#ececec',
        'chat-text-secondary': '#b4b4b4',
        'chat-accent': '#10a37f',
        'chat-accent-hover': '#1a7f64',
        'chat-user-bubble': '#2f2f2f',
        'chat-assistant-bubble': 'transparent',
        'chat-input-bg': '#2f2f2f',
        'chat-code-bg': '#1e1e1e',
      },
      fontFamily: {
        sans: ['Söhne', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Inter', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
