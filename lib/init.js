var util	= require('util'),
	fs = require('fs'),
	extend  = util._extend,
	chalk = require('chalk');

function handler ($, config) {
	// deal with table cells
	$('td').each(function() {
		var self = $(this),
			img  = $('img', self).eq(0);
		
		// deal with images inside the cell
    	if (img.length){
	        // apply image sizes to its parent (current cell)
    		var width = img.attr('width'),
    			height =  img.attr('height');
    		
    		if (!self.attr('width')) {
    			self.attr('width', width);
    		}
    		
    		if (!self.attr('height')) {
    			self.attr('height', height);
    		}
	        
	        // remove useless attrs
	        img.removeAttr('name');
	        img.removeAttr('id');
		}
	});
	
	// append doctype and html tag
	// @todo find a way to get this line from the input file
	var html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' + "\n"
			 + '<html xmlns="http://www.w3.org/1999/xhtml">';
	
	// append our new html content
	html += $('html').html();
	
	// close the html document...
	html += '</html>';
	
	html = html.replace(/<!--[\s\S]*?-->/g, '');
	
	// write the html content in the output file.. so close
	fs.writeFile(config.input, html, {encoding: 'utf8'}, function(err){
		// an error occurred !
		if (err){
			console.error(err);
		} else { // all is good, let's notify the user
			console.log(chalk.green('>>') + util.format(' Email has been initialized !', chalk.cyan(config.input)));
		}
	})
}

module.exports = handler;