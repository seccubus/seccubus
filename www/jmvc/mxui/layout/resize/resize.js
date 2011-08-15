steal('jquery/controller',
	'mxui/layout/wrap',
	'jquery/event/drag',
	'jquery/dom/dimensions',
	'mxui/layout/fill')
     .then(function(){
	 	//we need to check we aren't evil and have overflow size our container
		
		$.support.correctOverflow = false;
		
		
		
		$(function(){
			var container =$("<div style='height: 18px; padding: 0; margin: 0'><div style='height: 20px; padding: 0; margin: 0'></div></div>").appendTo(document.body)
			$.support.correctOverflow = container.height() == 18;
			container.remove();
			container = null;
		})
		
		
		
		$.Controller.extend("Mxui.Layout.Resize",{
			defaults : {
				minHeight: 10,
				minWidth: 10,
				handles : 'e, s, se'
			}
		},
		{
			setup : function(el, options){
				var diff = $(el).mxui_layout_wrap()[0]
				this._super(diff, options)
				if(diff != el){
					this.original = $(el).mxui_layout_fill({all: true}); //set to fill
				}
			},
			directionInfo: {
				"s" : {
					limit : "vertical",
					dim :  "height"
				},
				"e" : {
					limit : "horizontal",
					dim :  "width"
				},
				"se" : {
					
				}
			},
			init : function(el, options){
				//draw in resizeable
				this.element.height(this.element.height())
				this.element.prepend("<div class='ui-resizable-e ui-resizable-handle'/><div class='ui-resizable-s ui-resizable-handle'/><div class='ui-resizable-se ui-resizable-handle'/>")
			},
			getDirection : function(el){
				return el[0].className.match(/ui-resizable-(se|s|e)/)[1]
			},
			".ui-resizable-handle draginit" : function(el, ev, drag){
				//get direction
				//how far is top corner 
				this.margin = this.element.offsetv().plus(this.element.dimensionsv('outer')).minus(  el.offsetv()  ) 
				this.overflow = $.curCSS(this.element[0], "overflow")
				if(!$.support.correctOverflow && this.overflow == "visible"){
					this.element.css("overflow","hidden")
				}
				var direction = this.getDirection(el)
				ev.stopPropagation();
				if(this.directionInfo[direction].limit)
					drag[this.directionInfo[direction].limit]()
			},
			".ui-resizable-handle dragmove" : function(el, ev, drag){

				ev.preventDefault(); //prevent from drawing .. 
				var direction = this.getDirection(el);

				if(direction.indexOf("s") > -1){
					var top = drag.location.y();
				
					var start = this.element.offset().top;
					var outerHeight = top-start
					if(outerHeight < this.options.minHeight){
						outerHeight = this.options.minHeight
					}
					this.element.outerHeight(outerHeight+this.margin.y())
					
				}
				if(direction.indexOf("e") > -1){
					var left = drag.location.x();
				
					var start = this.element.offset().left;
					var outerWidth = left-start
					if(outerHeight < this.options.minWidth){
						outerWidth = this.options.minWidth
					}
					this.element.outerWidth(outerWidth+this.margin.x())
				}
				var el = this.element;
				el.trigger("resize")
				

			},
			".ui-resizable-handle dragend" : function(){
				if (!$.support.correctOverflow && this.overflow == "visible") {
					this.element.css("overflow","visible")
				}
			}
		})
		
	 })
