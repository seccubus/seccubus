steal.plugins('jquery/controller','jquery/event/drop','jquery/event/drag/limit','jquery/event/default').then(function($){
	
	/**
	 * 
	 * @param {Object} el
	 */
	$.Controller.extend("Mxui.Sortable",{
		defaults:{
			//makes a placeholder for the element dragged over
			makePlaceHolder : function(el){
				return el.clone().css({
					"visibility":"hidden",
					"position" : "",
					"float" : "left"
				})
			}
		}
	},{
		".sortable draginit" : function(el, ev, drag){
			//make sure we can't move it out
			drag.limit(this.element);
			drag.horizontal();
			//clone the drag and hide placehodler
			var clone = el.clone().addClass("sortable-placeholder").css("visibility","hidden")
			el.after(clone)
			el.css("position","absolute");
			
			
		},
		".sortable dragend" : function(el){
			el.css({
				"position": "",
				left: ""
			})
		},
		"dropover" : function(el, ev, drop, drag){

			if(!this.element.has(drag.element).length){
				this.element.trigger("sortable:addPlaceholder")
				var placeholder = this.options.makePlaceHolder(drag.element).addClass("sortable-placeholder").removeAttr("id")
				var res = this.where(ev);
				res.el[res.pos](placeholder)
			}
			
		},
		"dropout" : function(el, ev, drop, drag){
			if(!this.element.has(drag.element).length){
				this.find(".sortable-placeholder").remove();
				this.element.trigger("sortable:removePlaceholder")
			}
			
		},
		"dropmove" : function(el, ev, drop, drag){
			//if moving element is not already in my element ... I need to create a placeholder
			var res = this.where(ev,drag.movingElement),
				placeholder = this.find(".sortable-placeholder")

			if(res.el[0] != placeholder[0]){
				placeholder.remove()
				res.el[res.pos](placeholder)
			}
		},
		where : function(ev, not){
			var sortables = this.find(".sortable").not(not || []),
				sortable;

			for(var i=0; i < sortables.length; i++){
				//check if cursor is past 1/2 way
				sortable =  $(sortables[i]);
				if (ev.pageX < Math.floor(sortable.offset().left+sortable.width()/2)) {
					return {
						pos: "before",
						el: sortable
					}
				}
			}
			if(!sortables.length){
				return {
						pos: "append",
						el: this.element
					}
			}
			//check if it is at the end ...
			if (ev.pageX >= Math.floor(sortable.offset().left+sortable.width()/2)) {
				return {
						pos: "after",
						el: sortable
					}
			}
		},
		"dropon" : function(el, ev, drop, drag){
			// if we started in the sortable
			if(this.element.has(drag.element).length){
				// put drag element where it goes
				this.find(".sortable-placeholder").replaceWith(drag.element)
			}else{
				//show the placeholder
				this.find(".sortable-placeholder").css({
					"visibility": "",
					top: "",
					left: ""
				}).removeClass("sortable-placeholder").addClass("sortable")
			}
			this.element.trigger("change")
		}
	})
	
})