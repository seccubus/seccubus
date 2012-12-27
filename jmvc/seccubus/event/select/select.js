steal(	
	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models'
     )
.then( './views/init.ejs', 
       './views/event.ejs', 
       function($){

/**
 * @class Seccubus.Event.Select
 * @parent Event
 * @inherits jQuery.Controller
 * Builds a dropdown selector of events
 */
$.Controller('Seccubus.Event.Select',
/** @Static */
{
	defaults : {
		/*
		 * @attribute options.selected
		 * This attribute indicates which item in the dropdown is 
		 * initially selected.
		 * Default value: -1
		 */
		selected : -1

	}
},
/** @Prototype */
{
	/* This funciton calls updateView to render the control
	 */
	init : function(el, fn){
		this.updateView();
	},
	// (re-)Render on delete
	"{Seccubus.Models.Event} destroyed" : function(Event, ev, event) {
		this.updateView();
	},
	// (re-)Render on create
	"{Seccubus.Models.Event} created" : function(Event, ev, event){
		this.updateView();
	},
	// Apend on update
	"{Seccubus.Models.Event} updated" : function(Event, ev, event){
		event.elements(this.element)
		      .html(this.view('event', event) );
	},
	/*
	 * This fuction rerenders the entire control with data from findAll
	 */
	updateView : function() {
		this.element.html(
			this.view(
				'init',
				Seccubus.Models.Event.findAll(),
				{
					selected : this.options.selected

				}
			) 
		);
		/*
		if ( this.options.selected != -1 ) {
			//alert(this.element.attr("html"));
			this.element.attr("value",this.options.selected);
		};
		*/
	}

}); // Controller

}); // Steal
