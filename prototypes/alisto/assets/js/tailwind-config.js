/* Tailwind config (externalized). This script must run before the Tailwind CDN script */
tailwind = tailwind || {};
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#ec7c13",
        "background-light": "#fffaf4ff",
        "background-dark": "#ee9c9cff"
      },
      fontFamily: {
        display: ["Public Sans", "sans-serif"]
      },
      borderRadius: { DEFAULT: "0.5rem", lg: "0.75rem", xl: "1rem", full: "9999px" },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'feature-bounce': 'feature-bounce 0.3s ease-in-out'
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.5' },
          '100%': { transform: 'scale(1.6)', opacity: '0' }
        },
        'feature-bounce': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-8px)' }
        }
      }
    }
  }
};