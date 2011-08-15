//steal/js mxui/grid/scripts/gridfiller/scripts/compress.js

load("steal/rhino/rhino.js");
steal('steal/clean',function(){
	steal.clean('mxui/grid/scripts/grid.html',{indent_size: 1, indent_char: '\t'});
});
