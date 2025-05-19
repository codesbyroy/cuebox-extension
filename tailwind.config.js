/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,js,ts,jsx,tsx}',
		'./public/index.html',
		'./src/popup/App.css',
	],
	theme: {
		extend: {
			spacing: {
				'72': '18rem',
				'84': '21rem',
				'96': '24rem',
			},
			fontFamily: {
				sans: ['Inter', 'InterVariable', 'Graphik', 'sans-serif'],
				serif: ['Merriweather', 'serif'],
				inter: ['Inter', 'sans-serif'],
				'inter-variable': ['InterVariable', 'sans-serif'],
				'inter-display': ['InterDisplay', 'sans-serif'],
			},
		},
	},
	darkMode: 'class',
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
	],
};
