steal('jquery/controller',
	'jquery/event/default',
	'jquery/event/pause',
	'jquery/dom/closest').then(function($){
	
	
	/**
	 * A general Menu System.
	 * 1. Listens for 'click' on 'li' elements (configurable)
	 * 2. Triggers "deselect" on that li.
	 * 3. By Default on "deselect" 
	 * 			triggers "hide" on the old submenu.  
	 * 				If hide is prevented -> stops.
	 * 			removes selected styling on old li
	 * 			triggers "select" on that li
	 * 4. By Default on "select"
	 * 			triggers "show" on the new submenu
	 * 			adds selected styling on li
	 * 
	 * The menu also listens to the following by default:
	 * "hide" -> hides the menu
	 * "show" -> shows the menu
	 */
	$.Controller('Mxui.Nav.Menuable',
	{
		defaults : {
			/**
			 * A list of other types we want to mixin to each menu
			 */
			types : [],
			/**
			 * The active className
			 */
			active : "active",
			/**
			 * The selected className
			 */
			select : "selected",
			child_selector : "li"
		},
		listensTo : ["hide","show"]
	},
	{
		/**
		 * Returns the sub-menu from this item
		 */
		sub : function(el){
			return el.children().eq(1);
		},
		/**
		 * Returns where a sub-menu element should be positioned from.
		 */
		calculateSubmenuPosition : function(el, ev){
			return el;
		},
		">{child_selector} activate" : function(el, ev){
			if(el.hasClass(this.options.active))
				return;
			if(this.activating)
				return;
			this.activating = true;
			var options = this.options, oldActive = this.find("."+options.active+":first"), self= this;
			
			ev.pause();
			var doThis = function(){
				oldActive.triggerAsync("deactivate", function(){
					self.sub(el).triggerAsync('show',
								self.calculateSubmenuPosition(el, ev),
								function(){
						ev.resume();
					})
				})

			}
			// if we are already selected
			if(el.hasClass(this.options.select))
				doThis();
			else
				// select us, after we have been selected, do everything ...
				el.triggerAsync("select", function(){
					doThis();
				});
			
		},
		">{child_selector} default.activate" : function(el, ev){
			el.addClass(this.options.active)
			this.activating = false;
			this.element.trigger("change")
		},
		">{child_selector} deactivate" : function(el, ev ){
			ev.pause();
			this.sub(el).triggerAsync('hide', function(){
				ev.resume();
			})
		},
		">{child_selector} default.deactivate" : function(el, ev){
			el.removeClass(this.options.active)
		},
		//there is no preventing this behavior ...
		">{child_selector} select" : function(el, ev){
			if(this.selecting)
				return;
			this.selecting = true;
			ev.pause();
			this.find("."+this.options.select+":first").triggerAsync('deselect',function(){
				ev.resume(); // should hit your handler and the default behavior
			})
		
		},
		">{child_selector} default.select" : function(el, ev){
			el.addClass(this.options.select)
			this.selecting = false;
		},
		">{child_selector} default.deselect" : function(el, ev ){
			el.removeClass(this.options.select)
		},
		/** 
		 * Checks if we are the target for the hide, and hides any active submenus.
		 * This could check that those submenu hides are ok, but doesnt .... yet.
		 */
		">hide" : function(el, ev){
			var self = this;
			ev.pause();
			this.element.find("."+this.options.active).triggerAsync("deactivate", function(){
				self.element.find("."+self.options.select).triggerAsync("deselect", function(){
					ev.resume();
				})
			});
		}
   });
	
})
