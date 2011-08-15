steal('jquery/controller','mxui/data').then(function($){

var sortName = function(el){
	return el[0].className.match(/([^ ]+)-sort/)[1];
};

/**
 * @class Mxui.Data.Order
 * Adds sort ordering to widgets
 */
$.Controller('Mxui.Data.Order',
/* @Static */
{
	defaults : {
		params : null,
		order : ["asc","desc"],
		// if true, can sort by multiple columns at a time
		multiSort: true,
		// if true, there are three states (asc, desc, no sort)
		canUnsort: true,
		clicker: "th"
	}
},
/* @Prototype */
{
	init: function(){
		if(this.options.params && this.options.params.order){
			this._addSortClass(this.options.params.order);
		}
	},
	"{params} order" : function(params, ev, order){
		this._addSortClass(order)
	},
	_addSortClass: function(order){
		this.find(this.options.clicker).each(function(){
			var el = $(this),
				attr = sortName(el);
			
			if($.inArray(attr+" asc", order) > -1) {
				el.addClass('asc').removeClass('desc')
			} else if( $.inArray(attr+" desc", order) > -1 ){
				el.addClass('desc').removeClass('asc')
			} else {
				el.removeClass('desc').removeClass('asc')
			}
		})
	},
	"{clicker} click": function( el, ev ) {

		var attr = sortName(el),
			i = 0,
			order = (this.options.params.attr('order') || []).slice(0),
			current;
		
		
		
		//see if we might already have something with this
		while ( i < order.length ) {
			if ( order[i].indexOf(attr + " ") == 0 ) {
				current = order[i].replace(attr+" ","")
				order.splice(i, 1)
			} else {
				i++;
			}
		}
		
		var index = $.inArray(current, this.options.order)
		
		current = this.options.order[index+1];
		if(!current && !this.options.canUnsort){
			current = this.options.order[0]
		}
		
		
		if(current){
			var newOrder = attr+" "+current;
			if(!this.options.multiSort){
				order = [newOrder]
			} else {
				order.unshift(newOrder)
			}
		}
		this.options.params.attrs({
			'order' : order,
			offset: 0})
	}
})

});