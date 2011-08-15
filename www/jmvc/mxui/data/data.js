steal('jquery/model').then(function(){

/**
 * A model that widgets in data use as params to request data.
 */
$.Model("Mxui.Data",{
	attributes : {
		limit : "number",
		offset : "number",
		count : "number"
		// sort
	},
	defaults : {
		limit : 100,
		offset: 0,
		count: undefined
	}
},{
	/**
	 * A helper function that will move the offset to the next set of items
	 */
	next : function(){
		var offset = this.attr('offset'),
			limit = this.attr('limit'),
			count = this.attr('count');
			
		if(offset + limit < count){
			this.attr('offset', offset+limit)
		}
	},
	prev : function(){
		var offset = this.attr('offset'),
			limit = this.attr('limit');
		
		this.attr('offset',Math.max(offset - limit, 0))

	},
	/**
	 * Returns true if there are items after the current page
	 */
	canMoveNext : function(){
		var offset = this.attr('offset'),
			limit = this.attr('limit'),
			count = this.attr('count');
		return offset + limit < count;
	},
	/**
	 * Return true if there are items before the current page
	 */
	canMovePrev : function(){
		var offset = this.attr('offset');
		return offset > 0;
	},
	toggleSort : function(){
		
	}
})
	
	
})
