steal('mxui/layout/table_fill').then(function($){

// helpers
var setWidths = function(cells, firstWidths){
	var length = cells.length -1;
	for (var i = 0; i <  length; i++) {
		 cells.eq(i).outerWidth(firstWidths[i]);
	}
}

/**
 * @class Mxui.Layout.TableScroll
 * 
 * Makes a table body elements under a table 
 * header.  For example if you have the following html:
 * 
 *     <div id='area' style='height: 400px'>
 *        <p>This is My Table</p>
 *        <table id='people'>
 *          <thead>
 *            <tr> <th>Name</th><th>Age</th><th>Location</th> </tr>
 *          </thead>
 *          <tbody>
 *            <tr> <td>Justin</td><td>28</td><td>Chicago</td> </tr>
 *            <tr> <td>Brian</td><td>27</td><td>Chicago</td> </tr>
 *            ...
 *          </tbody>
 *        </table>
 *     </div>
 * 
 * Thw following make the list of people, the tbody, scrollable between
 * the table header and footer:
 * 
 *     $('#people').mxui_layout_table_scroll()
 * 
 * This makes it so you can always see the table header 
 * and footer. 
 * 
 * The table will 'fill' the height of it's parent 
 * element. This means that if the <code>area</code> element's height 
 * becomes 500px, the scrollable area of the table (the scrollBody) will
 * increase 100px.
 * 
 * 
 * @param {Object} el
 * @param {Object} options
 */
$.Controller("Mxui.Layout.TableScroll",{
	setup : function(el, options){
		// a cache of elements.
		this.$ = {
			table: $(el)
		}
		// the area that scrolls
		this.$.scrollBody = this.$.table.wrap("<div><div  class='body'><div class='scrollBody'></div></div></div>").parent()
		// a div that houses the scrollable area.  IE < 8 needs this.  It acts
		// as a buffer for the scroll bar
		this.$.body = this.$.scrollBody.parent();

		this._super(this.$.body.parent()[0], options)
		//wrap table with a scrollable div
		
		
	},
	init : function(){
		// body acts as a buffer for the scroll bar
		this.$.body.css("width","100%");
		
		// get the thead, and tfoot into their own table.
		$.each(['thead','tfoot'], this.callback('_wrapWithTable'))
		
		
		// get the tbody
		this.$.tbody = this.$.table.children('tbody')
		
		// if one doesn't exist ... make it
		if(!this.$.tbody.length){
			this.$.tbody = $('<tbody/>')
			this.$.table.append(this.$.tbody)
		}
		
		// add thead
		if(this.$.theadTable){
			this.$.head = $("<div class='header'></div>")
						.css({
							"visibility":"hidden",
							overflow: "hidden"
						})
						.prependTo(this.element)
						.append(this.$.theadTable);
			this._addSpacer('thead');
		}
		if(this.$.tfootTable){
			this.$.foot = $("<div class='footer'></div>")
						.css({
							"visibility":"hidden",
							overflow: "hidden"
						})
						.appendTo(this.element)
						.append(this.$.tfootTable);
			this._addSpacer('tfoot');
		}
		
		
		// add representations of the header cells to the bottom of the table
		
		
		// fill up the parent
		//this.element.mxui_layout_fill();
		
		//make the scroll body fill up all other space
		if (this.options.filler) {
			this.$.scrollBody.mxui_layout_table_fill({
				parent: this.element.parent()
			})
		}
			
		this.bind(this.$.scrollBody,"resize", "bodyResized")
		//this.element.parent().triggerHandler('resize')
		
		//make a quick resize
		//then redraw the titles

		
		this.bind(this.$.scrollBody, "scroll", "bodyScroll")
		this._sizeHeaderAndFooters();
	},
	_wrapWithTable : function(i , tag){
		
		// save it
		this.$[tag] = this.$.table.children(tag)
		if(this.$[tag].length && this.$[tag].find('td, th').length){
			// remove it (w/o removing any widgets on it)
			this.$[tag][0].parentNode.removeChild(this.$[tag][0]);
			
			//wrap it with a table and save the table
			this.$[tag+"Table"] = this.$.thead.wrap('<table/>').parent()
		}
		
		
		
	},
	/**
	 * Returns useful elements of the table
	 * the thead, tbody, tfoot, and scrollBody of the modified table
	 */
	elements : function(){
		return {
			tbody: this.$.tbody,
			tfoot: this.$.tfoot,
			thead: this.$.thead,
			scrollBody: this.$.scrollBody
		}
	},
	/**
	 * Call when columns are added or removed or the title's changed 
	 */
	changed : function(resize){
		if(this.$.foot){
			this._addSpacer('tfoot');
		}
		if(this.$.head){
			this._addSpacer('thead');
		}
		this._sizeHeaderAndFooters();
		if (resize !== false) {
			this.element.resize()
		}
	},
	/**
	 * Add elements to this scrollable table.  This assumes these elements
	 * matches the current column headers
	 * @param {jQuery} [after]
	 * @param {jQuery} els
	 */
	append : function(after, els){
		if(!els){
			// if this spacer hasn't been created
			if(!this.$.spacer){
				this.changed(false);
			}
			this.$.spacer.before(after)
		} else{
			after.after(els)
		}
		this.element.resize();
	},
	empty : function(){
		this.$.tbody.children(":not(.spacing)").remove();
		this.element.resize();
	},
	/**
	 * @hide
	 * Adds a spacer on the bottom of the table that mimicks the dimensions
	 * of the table header elements.  This keeps the body columns for being
	 * smaller than the header widths.
	 * 
	 * This ONLY works when the table is visible.
	 */
	_addSpacer : function(tag){
		if(!this.$[tag].is(":visible")){
			return;
		}
		//check last element ...
		var last = this.$.tbody.children('.spacing.'+tag)
		if(last.length){
			last.remove();
		}
		
		var spacer = this.$[tag].children(0).clone()
			.addClass('spacing').addClass(tag);
			
		// wrap contents with a spacing
		spacer.children("th, td").each(function () { 
			var td = $(this);
			td.html("<div style='float:left'>"+td.html()+"</div>")
		});
		
		spacer.appendTo(this.$.tbody);
		
		//now set spacing, and make minimal height
		spacer.children("th, td").each(function () {
			var $td = $(this),
				$spacer = $td.children(':first'),
				width = $spacer.outerWidth();
				
			$td.css({ padding: 0, margin: 0, width: "" })
			
			$spacer.outerWidth(width + 2).css({
				"float": "none",
				"visibility": "hidden",
				height: "1px"
			}).html("")
		})
		this.$.spacer = spacer;
	},
	/**
	 * @hide
	 * When the body is resized, resize the header and footer th and td elements
	 */
	bodyResized : function(){
		this._sizeHeaderAndFooters();
	},
	bodyScroll: function (el, ev) {
		this.$.head.scrollLeft(el.scrollLeft())
	},
	/**
	 * @hide
	 * Sizes the table header cells to match the width of 
	 * the column widths.
	 */
	_sizeHeaderAndFooters: function () {

		var body = this.$.body,
			
			// getting the outer widths is the most expensive thing
			firstWidths = this.$.tbody.find("tr:first")
				.children()
				.map(function () { return $(this).outerWidth() }),
			
			padding = this.$.table.height() >= body.height() ? 
							Mxui.scrollbarWidth : 0,
			tableWidth = this.$.table.width();
		
		
		if(this.$.foot){
			var cells = this.$.tfootTable.find("th, td")
			if(cells.length == firstWidths.length){
				setWidths(cells,firstWidths);
			}
			this.$.foot.css('visibility','visible')
			this.$.tfootTable.width(tableWidth + padding) 
		}
		if(this.$.head){
			var cells = this.$.theadTable.find("th, td")
			if (cells.length == firstWidths.length) {
				setWidths(cells, firstWidths);
			}
			this.$.head.css('visibility', 'visible')
			this.$.theadTable.width(tableWidth + padding)
		}
	},
	
	destroy : function(){
		delete this.$;
		this._super();
	}
})
	
	
})