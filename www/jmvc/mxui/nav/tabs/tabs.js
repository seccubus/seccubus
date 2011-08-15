steal('mxui/nav/menuable').then(function($){
	//problem with this is it will search and find everything ...
	Mxui.Nav.Menuable("Mxui.Nav.Tabable",
	{
		defaults: {
			tab_class_names : "",
			button_class_names : "",
			tabs_container_class: "",
			child_types: [],
			types: []
		}
	},
	{
		init : function(){
			var selected = this.find(this.options.child_selector+"."+this.options.active)
			selected = selected.length ? selected : this.find(this.options.child_selector+":first")
			var self = this;
			//make sure everything is deactivated ...
			this.find(this.options.child_selector).each(function(){
				
				var sub = self.sub($(this).addClass(self.options.button_class_names))
				$.each(self.options.types,function(){
					sub[this]();
				})

				sub.addClass(self.options.tab_class_names);
				if(!$(this).hasClass(self.options.active) && ! sub.triggerHandled("hide")){
					$(sub).hide();
				}
			})
			selected.trigger("activate");
			this.element.addClass(this.options.class_names)
			this.element.parent().addClass(this.options.tabs_container_class)
			return this.element;
		},
		/**
		 * Gets the sub element from the href, or just the order of things.
		 * @param {Object} el
		 */
        sub: function (el) {
            var a = el.find("a[href]"), c, hashMatch;
            if (a.length) {
				hashMatch = a.attr('href').match(/^.*(#.*)/);
				if(hashMatch)
 	            	c = $(a.attr('href').match(/^.*(#.*)/)[1])
                if (c && c.length)
                    return c;
            }
			//find first parent that has next
			var cur = this.element, 
				next = cur.next();
			while(next.length ==0 && cur.length){
				cur = cur.parent()
				next = cur.next()
			}
			return cur.nextAll().eq(el.index())
		},
		/**
		 * Overwritten for performance
		 */
		calculateSubmenuPosition : function(){
		
		}
	})
	Mxui.Nav.Tabable("Mxui.Nav.Tabs",{},{
	   "{child_selector} click" : function(el, ev){
			ev.preventDefault();
			el.trigger("activate")	  
	   },
	   "{child_selector} mouseenter" : function(el, ev){
			el.trigger("select")	  
	   },
	   "{child_selector} mouseleave" : function(el, ev){
		    el.trigger("deselect")	    
	   },
	   "{child_selector} keypress" : function(el, ev){
		    if(ev.keyCode === 13)
				el.trigger("activate")	    
	   }
	})
	
	
	Mxui.Nav.Tabable("Mxui.UI.Tabs", {
		defaults: {
			tabs_container_class: "ui-tabs ui-widget ui-widget-content ui-corner-all",
			tab_class_names: "ui-tabs-panel ui-widget-content ui-corner-bottom",
			button_class_names: "ui-state-default ui-corner-all",
			class_names: "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all",
			active: "ui-state-active",
			select: "ui-tabs-selected",
			types: []
		}
	}, {
	   "{child_selector} mouseenter" : function(el){
			el.addClass("ui-state-hover")	  
	   },
	   "{child_selector} mouseleave" : function(el){
		    el.removeClass("ui-state-hover")	  
	   },
	   "{child_selector} click" : function(el, ev){
	   		ev.preventDefault();
			
			el.trigger("activate");
	   },
	   "{child_selector} activate" : function(el, ev){
	   		var el = this.element;
			setTimeout(function(){
				el.parent().triggerHandler("resize")
			},13)
	   }
   })
})
