/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
          '100%': { opacity: '1' },
				},
			},
			animation: {
				fadeIn: 'fadeIn 0.5s ease-in-out'
			}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
