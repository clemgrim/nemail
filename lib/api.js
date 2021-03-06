module.exports = require('yargs')
					.usage('Usage: nemail <command> [options]')
					.command('create', 'Create the configuration file for build your email')
					.command('init', 'Initialize your input file (set the image width and height, etc)')
					.command('watch', 'Watch config and input file changes, and rebuild output')
					.alias('i', 'input')
					.alias('o', 'output')
					.describe('i', 'Your input file, the file to parse and build')
					.describe('o', 'The output file, where parsed email content is write')
					.example('nemail create && nemail init', 'First create a config file and init your input file')
					.example('nemail or nemail watch', 'When you have your configuration file, you use watch for easy work');