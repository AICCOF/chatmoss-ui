/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./index.html',
		'./src/**/*.{vue,js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			animation: {
				blink: 'blink 1.2s infinite steps(1, start)',
			},
			keyframes: {
				blink: {
					'0%, 100%': {
						'background-color': 'currentColor'
					},
					'50%': {
						'background-color': 'transparent'
					},
				},
			},
		},
	},
	plugins: [{
		handler({
			addBase
		}) {
			addBase({
				':root': {
					'--moss-header-color': '#FFFFFF',
					'--moss-bg-color': '#6B83FF',
					'--moss-bg-btn-color': '#45485C88',
					'--moss-bg-btn-send-color': '#38394B',
					'--moss-bg-ask-color': '#6388FF',
					'--moss-bg-reply-color': '#FFFFFF',
					'--moss-bg-content-color': '#F7F8FC',
					'--moss-bg-text-color': '#6B83FF22',
					'--moss-text-purple-color': '#A677E7',
					'--moss-text-blue-color': '#6B83FF',
					'--moss-text-green-color': '#52CABC',
					'--moss-text-red-color': '#FE5D64',
					'--moss-text-reply-color': '#45485C',
					'--moss-text-ask-color': '#FFFFFF',
					'--moss-text-time-color': '#9EA2B5',
					'--moss-border-color': '#E6E6E6',
					'--moss-text': "#45485C",
					// "--n-border": '1px solid red'
				},
				'.dark': {
					'--moss-header-color': '#2B2D31',
					// '--moss-bg-color': '#313338',
					"--moss-bg-content-color": "#313338",
					'--moss-bg-reply-color': '#FFFFFF10',
					'--moss-text': "#9EA2B5",
					
				},
			});
		},
	}],
}
