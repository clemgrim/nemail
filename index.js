#!/usr/bin/env node

var fs 		= require('fs'),
	path 	= require('path'),
	_		= require('lodash'),
	nemail 	= require('./lib/nemail'),
	yargs   = require('./lib/api')
	argv 	= yargs.argv,
	config 	= nemail.loadConfig(argv),
	method 	= _.first(argv._),
	inquirer= require('inquirer'),
	chalk   = require('chalk');

if (argv.help) {
	yargs.showHelp();
	process.exit(0);
}

switch (method) {
	case 'create':
		if (!fs.existsSync('./nemail.yml') && !fs.existsSync('./nemail.json')) {
			create();
		} else {
			inquirer.prompt([{
				type: 'confirm',
				name: 'confirm',
				message: 'Un fichier de configuration existe déjà dans ce répertoire. Continuer ?',
				default: false,
			}], function (answers) {
				if (answers.confirm) {
					create();
				} else {
					process.exit(0);
				}
			});
		}
		
		break;
		
	case 'init':
		nemail.init(config);
		break;
		
	case 'watch':
		nemail.process(config);
		
		fs.watch(path.dirname(config.input), _.debounce(function (event, file) {
			if (path.basename(file) == path.basename(config.output)) {
				return;
			}
			
			if ('change' === event) {
				var ext = path.extname(file);

				// reset the config
				if ('.yml' === ext) {
					config = nemail.loadConfig(argv);
				}
				
				nemail.process(config);
			}
		}, 150));
		
		break;
		
	case undefined:
		nemail.process(config);
		break;
		
	default:
		throw new Error('Commande inconnue.');
		break;
}

function create() {
	fs.readFile(__dirname + '/nemail.yml', function (err, content) {
		if (err) {
			console.log(chalk.red('! Une erreur est survenue'), err);
			process.exit(0);
		}
		
		var tpl = _.template(content);
		
		inquirer.prompt([{
			type: 'input',
			name: 'title',
			message: 'Titre de l\'email',
			validate: function (v) {
				return _.trim(v) !== '' ? true : 'Vous devez saisir le titre de votre email';
			},
		}, {
			type: 'confirm',
			name: 'responsive',
			message: 'Est-ce que cet email est responsive ?',
			default: false,
		}, {
			type: 'input',
			name: 'input',
			message: 'Fichier source',
			default: './output.htm',
			validate: function (v) {
				return /^((\.\/)|(c:\/\/))?[a-zA-Z0-9\-_\/]+\.html?$/.test(v) ? true : 'Veuillez rentrer un nom de fichier valide';
			},
		}, {
			type: 'input',
			name: 'output',
			message: 'Fichier destination',
			default: './index.html',
			validate: function (v) {
				return /^((\.\/)|(c:\/\/))?[a-zA-Z0-9\-_\/]+\.html?$/.test(v) ? true : 'Veuillez rentrer un nom de fichier valide';
			},
		}], function (answers) {
			fs.writeFile('./nemail.yml', tpl(answers));
			console.log(chalk.green('>>') + ' Configuration file saved !');
		});
	});
}