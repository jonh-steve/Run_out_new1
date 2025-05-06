module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/index.html',
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#e6f1fe',
            100: '#cce3fd',
            200: '#99c7fb',
            300: '#66aaf9',
            400: '#338ef7',
            500: '#0072f5', // Primary color
            600: '#005bc4',
            700: '#004493',
            800: '#002e62',
            900: '#001731',
          },
        },
        fontFamily: {
          sans: ['Roboto', 'Arial', 'sans-serif'],
          heading: ['Montserrat', 'Arial', 'sans-serif'],
        },
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
        borderRadius: {
          'xl': '0.75rem',
          '2xl': '1rem',
        },
        boxShadow: {
          'outline-blue': '0 0 0 3px rgba(0, 114, 245, 0.3)',
        },
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  };