steal('jquery/controller', 'jquery/event/default').then(function($){
	$.Controller.extend("Mxui.Layout.Tree",
	{
		defaults : {
			lastNode: "last-child",
			rootNode: "root-node",
			hasChildren : "has-children",
			child_selector: "li",
			select_event: "click",
			active: "active",
			selected: "selected"
		},
		listensTo: ["default.show","default.hide","show","hide"]
	},
	//prevent deselecting old, instead toggle
	{
		init : function(){
			this.element.addClass(this.options.rootNode)
			var self= this;
			this.styleUL(this.element)

		},
		styleUL : function(ul){
			var options = this.options;
			ul.find(options.child_selector).each(function(){
				var $t = $(this);
				if(!$t.next().length)
					$t.addClass(options.lastNode);
				
				var c = $t.children();
				if(c.length > 1){
					c.eq(-1).hide()
					$t.addClass(options.hasChildren)
				}
				if(c.length == 0 ){
					$t.html("<a>"+$t.text()+"</a>")
				}
					
			});
			return ul;
		},
		
		/**
		 * By default this listens to "li click"
		 * Triggers deselect to get the party started.
		 */
		"{child_selector} {select_event}" : function(el, ev){
			if($(ev.target).closest("a").length){
				ev.preventDefault();
			}
			ev.stopPropagation();
			this.find("."+this.options.selected).removeClass(this.options.selected)
			el.addClass(this.options.selected)
			//make sure we aren't already active
			if(el.hasClass(this.options.active)){
				$(el).trigger("deselect")
			}else{
				$(el).trigger("select")
			}
		},
		"{child_selector} default.deselect" : function(el, ev){
			//Hide this guy
			$(ev.target).closest(this.options.child_selector)
				.removeClass(this.options.active)
				.children("ul").hide();
		},
		"{child_selector} default.select" : function(el, ev){
		   $(ev.target).closest(this.options.child_selector)
				.addClass(this.options.active).children("ul").show();
		},
		
		"default.hide" : function(el, ev){
			if(ev.target == this.element[0]){
				var old = this.sub(this.element.find("."+this.options.active).removeClass(this.options.active));
				old && old.triggerAsync("hide", function(){
					$(ev.target).hide()
				});
			}
			
		},
		/**
		 * By default, shows the child element.
		 */
		"default.show" : function(el, ev){
		   if(ev.target == this.element[0]){
				this.element.show();
		   }
			
		}
		
	})
})
