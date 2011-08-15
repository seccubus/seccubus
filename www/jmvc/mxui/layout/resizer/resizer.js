steal(
'jquery/controller',
'jquery/event/default',
'jquery/event/drag',
'jquery/dom/dimensions').then(function($){

//Resizer is like a splitter, but it does not do resizing, only sends mesages

$.Controller.extend("Mxui.Layout.Resizer",{
	defaults: {
		selector: "th",
		distance : 8
	}
},
{
	"{selector} dragdown": function (el, ev, drag) {
		var distance = this.distance(el, ev);
		
		
		if (distance-2 < this.options.distance) {			
			this.start = ev.pageX;
			ev.preventDefault();
			el.trigger(this.makeEvent("size:start", ev),[distance] )
			//prevent others from dragging
		} else {
			drag.cancel();
		}
	},
	"{selector} dragmove": function (el, ev, drag) {
		ev.preventDefault();
		el.trigger(this.makeEvent("size", ev),[ev.pageX - this.start])
	},
	"{selector} dragend": function (el, ev, drag) {
		el.trigger(this.makeEvent("size:end", ev), [ev.pageX - this.start] )
	},
	//make sure this is really fast
	"{selector} mousemove": function (el, ev) {
		if (this.isOnRight(el, ev)) {
			el.css("cursor", "e-resize")
		} else {
			el.css("cursor", "")
		}
	},
	isOnRight: function (el, ev, extra) {
		return el.offset().left + el.outerWidth() - 8 - (extra || 0) < ev.vector().left()
	},
	// how many pixels to the left the current event is
	distance : function(el, ev){
		return el.offset().left + el.outerWidth() - ev.vector().left();
	},
	makeEvent : function(type, ev){
		var event = $.Event(type);
		$.each(["clientX","clientY","pageX","pageY"], function(i, prop){
			event[prop] = ev[prop]
		})
		return event;
	}
})


})
