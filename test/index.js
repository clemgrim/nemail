var nemail = require('../lib/nemail.js'),
	config = {
		input: './test.html',
		output: './email.html',
		title: 'My Email',
		textCss: {
			'font-family': 'Arial',
			'color': '#333333',
			'font-size': '13px',
		},
		classes: {
			small: {
				'font-size': 'small',
			},
			title: {
				'font-weight': 'bold',
				'font-size': '25px',
			},
			red: {
				'color': 'red',
			},
		},
	};

nemail.process(config);