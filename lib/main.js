var util	= require('util'),
	fs = require('fs'),
	extend  = util._extend,
	chalk = require('chalk'),
	moment = require('moment');

function handler ($, config){
	// deal with table
	$('table').each(function () {
		var self = $(this);
		
		if (!self.attr('align')) {
			self.attr('align', 'center');
		}
		
		self.css(config.textCss)
		  .css(config.tableCss)
		  .attr('border', 0)
		  .attr('cellpadding', 0)
		  .attr('cellspacing', 0);
	});
	
	var tableWidth = $('table').eq(0).attr('width');
	
	// some default color to the body
	$('body').attr('bgcolor', config.defaultBgColor);
	
	if (config.title) {
		// set page title
		$('title').text(config.title);
	}
	
	// deal with table cells
	$('td').each(function() {
		var self = $(this),
			text = self.find('p, span, b, strong, em, i, ul, u, a'),
			img  = $('img', self).eq(0);
		
		// reset css / html for this cell (compatibilities)
		if (!self.attr('valign')) {
			self.attr('valign', 'top');
		}
		
		if (!self.attr('align')) {
			self.attr('align', 'left');
		}
		
		if (self.find('table').length > 0) {
			self.find('table').each (function () {
				var table = $(this);
				
				if (!table.attr('width')) {
					table.attr('width', '100%');
				}
			});
			
			return;
		}
		
		if (config.addClass && self.attr('width')) {
			self.addClass('w' + self.attr('width'));
		}

		// there's content inside this cell (text, not an image)
		if (text.length){
			if (!self.attr('bgcolor')) {
				self.attr('bgcolor', config.defaultBgColor);
			}
			
			// for each text tag iniside this cell
			text.each(function(){
				var tag = $(this),
					css = extend({}, config.textCss), // clone the global textCss object
					tagname = tag[0].name,
					imgIn = tag.find('img').filter(function () {
						return !$(this).hasClass('ignore');
					});
				
				if (imgIn.length > 0) {
					return;
				}
				
				// reset css for some tags
				if (tagname == 'strong' || tagname == 'b'){
					css['font-weight'] = 'bold';
				} else if (tagname == 'em' || tagname == 'i'){
					css['font-style'] = 'italic';
				} else if (tagname == 'u') {
					css['text-decoration'] = 'underline';
				} else if (tagname == 'a'){
					extend(css, config.linkCss);
				}
				
				// get data-css attribute
				var iCss = tag.attr('style');
				
				var iClass = tag.attr('class');
				
				if (iClass) {
					iClass = iClass.split(' ');
					
					iClass.forEach(function(cls){
						if (typeof config.classes[cls] === 'object') {
							extend(css, config.classes[cls]);
							tag.removeClass(cls);
						}
					});
					
					if (!tag.attr('class')) {
						tag.removeAttr('class');
					}
				}
				
				// has custom inline css ?
				if (iCss){
					var styles   = iCss.split(';');
					var override = {};
					
					// yes get its css as an object
					styles.forEach(function(style){
						var tmp = style.split(':');
						
						if (tmp[1] && tmp[0]){
							override[tmp[0]] = tmp[1];
						}
					});

					// merge this custom css with default css to apply
					if (Object.keys(override).length > 0){
						extend(css, override);
					}
				}
				
				// apply css to our text element
				tag.css(css);
			});
		}
		
		if (config.linkTarget) {
			$('a').each(function () {
				var link = $(this);
				
				if (!link.attr('target')) {
					link.attr('target', config.linkTarget);
				 }
			});
		}
		
		// deal with images inside the cell
    	if (img.length){
	        // apply image sizes to its parent (current cell)
    		var width = config.responsive ? (img.attr('width')/tableWidth*100).toFixed(4) + '%' : img.attr('width'),
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
	        
	        if (config.responsive) {
	        	img.attr('style', 'max-width:' + img.attr('width') + 'px;' + (img.attr('style') ? img.attr('style') : ''));
	        	img.attr('width', '100%');
	        }
		}
	});
	
	if (config.imagesUrl){
		$('img').each(function () {
			var src 	= $(this).attr('src'),
				file	= src;
			
			$(this).attr('src', config.imagesUrl + '/' + file);
		});
	}
	
	// process CSS
	$('style').each(function () {
		var style = $(this),
			css = style.text();
		
		/*css = css.replace(/\.([a-zA-Z0-9\-_]+)(\s|{|,)/g, function (match, cls, end) {
			return '[class="' + cls + '"]' + end;
		});*/
		
		// prefix images url in css
		if (config.imagesUrl) {
			css = css.replace(/url\(([^)]+\.(png|jpe?g))\)/g, function (match, url) {
				return match.replace(url, config.imagesUrl + url);
			});
		}
		
		// minify css
		css = css.replace(/\s{2,}/g, '');
		
		style.text(css);
	});
	
	// append doctype and html tag
	// @todo find a way to get this line from the input file
	var html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' + "\n"
			 + '<html xmlns="http://www.w3.org/1999/xhtml">';
	
	// append our new html content
	html += $('html').html();
	
	// close the html document...
	html += '</html>';
	
	// remove comments
	html = html.replace(/<!--[\s\S]*?-->/g, '')
				.replace(/&#x2019;/g, '&apos;')
				.replace(/&#xE9;/g, '&eacute;')
				.replace(/&#xE0;/g, '&agrave;')
				.replace(/&#xAE;/g, '&reg;')
				.replace(/&#xB0;/g, '&deg;')
				.replace(/&#xBB;/g, '&raquo;')
				.replace(/&#xE8;/g, '&egrave;')
				.replace(/&#x2026;/g, '&#8230;')
				.replace(/&#xAB;/g, '&laquo;')
				.replace(/&apos;/g, '\'')
				.replace(/&#xE7;/g, '&ccedil;')
				.replace(/&#xEA;/g, '&ecirc;')
				.replace(/&#xF9;/g, '&ugrave;')
				.replace(/&#x2022;/g, '&bull;')
				.replace(/&#x2192;/g, '&rarr;')
				.replace(/&#xA0;/g, ' ')
				.replace(/&#x20AC;/g, '&euro;');
	
	// remove indentation and empty lines
	html = html.split("\n").filter(function (line) {
		return line.replace(/\s/g, '') !== '';
	}).map(function (line) {
		return line.replace(/\s{2,}/g, '');
	}).join("\n");
	
	// write the html content in the output file.. so close
	fs.writeFile(config.output, html, {encoding: 'utf8'}, function(err){
		// an error occurred !
		if (err){
			console.error(err);
		} else { // all is good, let's notify the user
			var now = '[' + moment().format('HH:mm:ss') + ']';
			console.log(util.format('%s The output content has been written in %s', chalk.gray(now), chalk.cyan(config.output)));
		}
	});
}

module.exports = handler;