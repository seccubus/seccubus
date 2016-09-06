/*
 * Copyright 2013 Frank Breedijk
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
steal(	
	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models'
     )
.then( './views/init.ejs', 
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
