steal('mxui/layout/fill',
	'mxui/util/scrollbar_width',
	'jquery/controller').then(function(){
	
//makes a table fill out it's parent

$.Controller('Mxui.Layout.TableFill',{
	setup : function(el, options){
		//remove the header and put in another table
		el = $(el);
		if(el[0].nodeName.toLowerCase() == 'table'){
			this.$ = {
				table: el
			}
			this._super(this.$.table.wrap("<div></div>").parent(), 
					options)
		} else {
			this.$ = {
				table: el.find('table:first')
			}
			this._super(el, options);
		}
		
	},
	init : function(){
		// add a filler ...
		var options = {};
		if(this.options.parent){
			options.parent = this.options.parent;
			options.filler = this.options.filler;
		}
		this.element.mxui_layout_fill(options).css('overflow','auto');
		
	},
	// listen on resize b/c we want to do this right away
	// in case anyone else cares about the table's
	// dimensions (like table scroll)
	resize : function(ev){
		var table = this.$.table,
			el = this.element[0];
		//let the table flow naturally
		table.css("width","");
		
		// is it scrolling vertically
		if(el.offsetHeight < el.scrollHeight){
			table.outerWidth(this.element.width() - Mxui.scrollbarWidth)
		} else {
			table.outerWidth(this.element.width() )
		}
		
	}
})
	
})
