/*
 * Copyright 2015 Frank Breedijk
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
steal( 	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' 
).then( './views/init.ejs', 
function($){

/**
 * @class Seccubus.Severity.Select
 * @parent Severity
 * @inherits jQuery.Controller
 * Renders a control to select a severity and show some help
 * @param {Object} options
 * Defines the options for this control
 */
$.Controller('Seccubus.Severity.Select',
/** @Static */
{
	defaults : {
		/* @attribute options.selected
		 * Value of the selected option
		 */
		selected : -1
	}
},
/** @Prototype */
{
	/* Calls updateView to render the control */
	init : function(){
		this.updateView();
	},
	/* Static
	"Seccubus.Models.Severity destroyed" : function(Severity, ev, severity) {
		this.updateView();
	},
	"Seccubus.Models.Severity created" : function(Severity, ev, severity) {
		this.updateView();
	},
	"Seccubus.Models.Severity updated" : function(Severity, ev, severity) {
		this.updateView();
	},
	*/
	updateView : function() {
		this.element.html(
			this.view(
				'init',
				Seccubus.Models.Severity.findAll(),
				{ selected :  this.options.selected }
			)
		);
	}
}); // Controller

}); // Steal
