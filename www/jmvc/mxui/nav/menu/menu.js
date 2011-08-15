steal('mxui/layout/positionable','mxui/nav/menuable','jquery/event/hover').then(function($){
	
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
	
	Mxui.Nav.Menuable.extend("Mxui.Nav.Menu",
	{
		defaults : {
			/**
			 * A list of other types we want to mixin to each menu
			 */
			types : [],
			/**
			 * The default event to listen to
			 */
			select_event : "click",
			/**
			 * The default menu button selector
			 */
			child_selector : "li",
			/**
			 * Class names to provide each menu
			 */
			class_names : "", //ui-widget-content ui-menu ui-widget ui-corner-all
			/**
			 * Class names to provide each menu button
			 */
			child_class_names : "",
			/**
			 * If you want the top level menu to have 'types' mixed in.
			 */
			apply_types_to_top : false
		}
	},
	{
		init : function(){
			var MyClass = this.Class;
			var options = this.options;
			
			//Menus are often nested, we want to know how deep we are
			options.level = (options.level == null ? 0 : options.level+1);
			
			//If we are a submenu or we want the top menu to also have types 
			if(options.level > 0 || this.options.apply_types_to_top){
				//mixin types and hide
				var el =  this.element;
				$.each(this.options.types, function(){
					new this(el)
				})
				this.element.hide()
			}
					//add pretty class names
			return this.element.addClass(this.options.class_names+" ui-menu-"+options.level).
					//get the menu buttons
					children(this.options.child_selector).
					//add pretty names to menu buttons
					addClass(this.options.child_class_names).
					each(function(){
						//for each menu button, save a reference to its sub ul in data.
						//we save a sub reference, b/c menus are pulled apart from their parent menu
						//in the dom
						var el = $(this);
						el.data("menu-element", el.find(">ul, >.ui-menu").each(function(){
							//for each sub menu (which there should only be 1 per menu button,
							//recursively create a new clas
							new MyClass(this, {level: options.level})  
						}));
						
					})
			
			//create sub menus
		},
		"{child_selector} {select_event}" : function(el, ev){
			if($(ev.target).closest("a").length){
				ev.preventDefault();
			}
			$(el).trigger("activate")
		},
		sub : function(el){
			return el.data("menu-element");
		},
		/**
		 * Returns where a sub-menu element should be positioned from.
		 */
		calculateSubmenuPosition : function(el, ev){
			return el;
		},
		">hide" : function(el, ev){
			if (ev.target == this.element[0]) {
				this.element.hide();
			}
		},
		/**
		 * By default, shows the child element.
		 */
		">show" : function(el, ev){
		   if(ev.target == this.element[0]){
				this.element.show();
		   }
			
		}
   });
   /**
    * Adds basic higlighting.
    */
   $.Controller.extend("Mxui.Highlight",
   {
	   defaults: {
		   child_selector : "li",
		   hover_class : "hover"
	   }
   },
   {
	   "{child_selector} mouseenter" : function(el){
		   el.addClass(this.options.hover_class)
	   },
	   "{child_selector} mouseleave" : function(el){
		   el.removeClass(this.options.hover_class)
	   }
   })
   /**
    * jQuery.UI themed highlighting
    */
   Mxui.Highlight.extend("Mxui.UI.Highlight",{
   		defaults: {hover_class : "ui-state-hover"}
   },{})
   
   /**
    * Mxui.UI.Menu is a jQuery.UI themed menu.
    */
   Mxui.Nav.Menu.extend("Mxui.UI.Menu",{
   		defaults: {
			types : [Mxui.Layout.Positionable("Mxui.UI.TopLeft",{defaults: {my: "left top",at: "right top"}},{}), 
					 Mxui.UI.Highlight],
			select_event : "hoverenter",
			child_selector : "li",
			class_names : "ui-widget-content ui-menu ui-widget ui-corner-all",
			child_class_names : "ui-menu-item ui-state-default", 
			apply_types_to_top : true,
			active : "ui-state-active"
		}
	},{})
   
   
   
});