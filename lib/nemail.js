var fs = require('fs'),
	cheerio = require('cheerio'),
	util	= require('util'),
	yml = require('js-yaml'),
	_		= require('lodash'),
	defaults = require('../config');

module.exports = {
	process: function (config) {
		return run(require('./main'), config);
	},
	init: function (config) {
		return run(require('./init'), config);
	},
	loadConfig: function (cfg) {
		var config = {};
		
		if (fs.existsSync('./nemail.yml')) {
			config = yml.safeLoad(fs.readFileSync('./nemail.yml'));
		} else if (fs.existsSync('./nemail.json')) {
			config = JSON.parse(fs.readFileSync('./nemail.json'));
		}
		
		if (cfg) {
			for (k in cfg) {
				if (k !== '_') {
					config[k] = cfg[k];
				}
			}
		}

		return config;
	},
};

function run (handler, config) {
	config = config ? _.extend({}, defaults, config) : defaults;

	if (!config.input) {
		fail('You have to provide a file input');
	} 
	
	if (!fs.existsSync(config.input)) {
		fail('The file "%s" does not exist !', config.input);
	}
	
	fs.readFile(config.input, 'utf8', function (err, data) {
		if (err){
			return console.log(err);
		}

		// parse html content
		var $ = cheerio.load(data);
		
		handler($, config);
	});
}

function fail () {
	console.error(util.format.apply(util, arguments));
	process.exit(1);
}