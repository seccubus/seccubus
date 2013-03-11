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
steal( 	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models' 
).then( './views/init.ejs', 
	'./views/help.ejs',
function($){

/**
 * @class Seccubus.Scanner.Select
 * @parent Scanner
 * @inherits jQuery.Controller
 * Renders a control to select a scanner and show some help
 * @param {Object} options
 * Defines the options for this control
 */
$.Controller('Seccubus.Scanner.Select',
/** @Static */
{
	defaults : {
		/*
		 * @attribute options.helpHere
		 * jQuery query string that determines where the help text
		 * should be put
		 * Default value: null
		 * Special value: null - Don't render help
		 */
		helpHere : null,
		/*
		 * @attribute options.paramsHere
		 * jQuery query string that determines where the default 
		 * parameters need to be put
		 * should be put
		 * Default value: null
		 * Special value: null - Don't render default paramers
		 */
		paramsHere : null,
		/* @attribute options.selected
		 * Value of the selected option
		 */
		selected : "none"
	}
},
/** @Prototype */
{
	/* Calls updateView to render the control */
	init : function(){
		this.updateView();
	},
	"Seccubus.Models.Scanner destroyed" : function(Scanner, ev, scanner) {
		this.updateView();
	},
	"Seccubus.Models.Scanner created" : function(Scanner, ev, scanner) {
		this.updateView();
	},
	"Seccubus.Models.Scanner updated" : function(Scanner, ev, scanner) {
		this.updateView();
	},
	/* Renders the control */
	"change" : function() {
		this.updateHelp();
		this.updateParams();
	},
	/* Renders the control */
	"mouseover" : function() {
		if ( this.options.selected == this.element.val() ) {
			this.updateHelp();
			this.updateParams();
			this.options.selcted = "none";
		}
	},
	updateView : function() {
		var dfd = Seccubus.Models.Scanner.findAll();
		this.element.html(
			this.view(
				'init',
				dfd,
				{
					selected : this.options.selected
				}
			)
		);
		this.updateHelp();
		this.updateParams();
	},
	/* 
	 * Renders the help text in the jQuery query string options.helpHere
	 * if options.helpHere is set to null it does not render the help text
	 */
	updateHelp : function() {
		if( this.options.helpHere != null ) {
			$(this.options.helpHere).html(
				this.view(
					'help',
					{
						message : this.element.children("option:selected").attr("help")
					}
				)
			)
		}
	},
	/* 
	 * Updates the value of a control with default parameters
	 */
	updateParams : function() {
		if( this.options.paramsHere != null ) {
			$(this.options.paramsHere).val(this.element.children("option:selected").attr("params"));
		}
	}

}); // Controller

}); // Steal
