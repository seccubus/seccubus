steal('jquery/controller',
	'jquery/event/drop',
	'jquery/event/drag/limit',
	'jquery/event/default',
	'jquery/event/drag/scroll').then(function($){
	
	/**
	 * Makes a sortable control that can accept outside draggables
	 * @param {Object} el
	 */
	$.Controller("Mxui.Layout.Sortable",{
		defaults:{
			//makes a placeholder for the element dragged over
			makePlaceHolder : function(el, ev, drop, drag){
				return drag.element.clone().css({
					"visibility":"hidden",
					"position" : "",
					"float" : "left"
				})
			},
			sortable : ".sortable",
			scrolls : null,
			scrollOptions: {}
		}
	},{
		"{sortable} dragdown" : function(el, ev){
			ev.preventDefault();
		},
		
		"{sortable} draginit" : function(el, ev, drag){
			//make sure we can't move it out
			if(this.options.scrolls){
				drag.scrolls(this.options.scrolls, this.options.scrollOptions);
			}
			
			drag.limit(this.element);
			drag.horizontal();
			//clone the drag and hide placehodler
			var clone = el.clone().addClass("sortable-placeholder").css("visibility","hidden")
			el.after(clone)
			el.css("position","absolute");
			
			el.trigger("sortable.start")
		},
		"{sortable} dragend" : function(el){
			el.css({
				"position": "",
				left: ""
			})
			el.trigger("sortable.end")
		},
		/**
		 * 
		 */
		"dropover" : function(el, ev, drop, drag){

			if(!this.element.has(drag.element).length){
				
				// we probably need the ability to cancel this ...
				
				
				// make the placholder element
				var placeholder = this.options.makePlaceHolder(el, ev, drop, drag)
					.addClass("sortable-placeholder")
					.removeAttr("id")
					
				// figure out where to put it
				var res = this.where(ev);
				
				
				
				// place it
				res.el[res.pos](placeholder);
				
				placeholder.trigger("sortable.addPlaceholder")
			}
		},
		"dropout" : function(el, ev, drop, drag){
			if(!this.element.has(drag.element).length){
				
				// remove the placeholder
				this.find(".sortable-placeholder").remove();
				
				
				// let people know it
				this.element.trigger("sortable.removePlaceholder")
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
		/**
		 * Returns where the element should be placed
		 * @param {Object} ev
		 * @param {Object} not
		 * @return {object} position object with
		 * 
		 *   - el - the element to positoin the placeholder relative to
		 *   - pos - 
		 */
		where : function(ev, not){
			var sortables = this.find(this.options.sortable).not(not || []),
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
		},
		"dropend" : function(el, ev, drop, drag){
			// set back to normal
			this.find(".sortable-placeholder").remove();
		}
	})
	
})