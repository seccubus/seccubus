steal.css("../../mxui/data/grid/grid", "grid")
	.plugins('mxui/data/grid', 'jupiter/create', 'jupiter/style')
	.then(function($){

/**
 * @class Clui.Grid
 */
$.Controller('Jupiter.ScrollableGrid',
/* @Static */
{
	defaults : {
		model: null,
		params: null,
		// path to EJS of create form
		create: null
	}
},
/* @Prototype */
{
	init : function(){
		this.element.append(this.view())
		var gridOptions = {};
		$.extend(gridOptions, this.options, {newPageClears: false});
		this.find(".cluigrid").mxui_data_grid(gridOptions);
		this.find(".create").jupiter_create({
			model: this.options.model,
			insertInto: this.find("tbody"),
			form: this.options.create
		})
		this.bind(this.find(".scrollBody")[0], "scroll", "gridscroll")
	},
	"{params} updated.attr" : function(params, ev, attr, val){
		if(attr == "count") {
			this.find(".count").html(val)
		}
	},
	gridscroll: function(el, ev){
		if (el[0].scrollHeight - el.scrollTop() == el.outerHeight()) { // we're at the bottom
			this.options.params.attr("offset", this.options.params.offset + 50)
		}
	}
})

});