
steal.then(function() {
	
	
	/**
	 * @attribute DocumentJS.tags
	 * @parent DocumentJS
	 * A tag adds additional information to the comment being processed.
	 * For example, if you want the current comment to include the author,
	 * include an @@author tag.
	 * 
	 * ## Creating your own tag
	 * 
	 * To create a tag, you need to add to DocumentJS.tags an object with an add and an optional
	 * addMore method like:
	 * 
	 * @codestart
	 * DocumentJS.tags.mytag = {
	 *   add : function(line){ ... },
	 *   addMore : function(line, last){ ... }
	 * }
	 * @codeend 
	 */
	
	
	DocumentJS.tags = {};

}).then('//documentjs/tags/alias', '//documentjs/tags/author', '//documentjs/tags/codeend', '//documentjs/tags/codestart', '//documentjs/tags/constructor', '//documentjs/tags/demo', '//documentjs/tags/download', '//documentjs/tags/hide', '//documentjs/tags/iframe', '//documentjs/tags/inherits', '//documentjs/tags/page', '//documentjs/tags/param', '//documentjs/tags/parent', '//documentjs/tags/plugin', '//documentjs/tags/return', '//documentjs/tags/scope', '//documentjs/tags/tag', '//documentjs/tags/test', '//documentjs/tags/type', '//documentjs/tags/image')