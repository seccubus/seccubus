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
	'./views/history.ejs',
function($){

/**
 * @class Seccubus.History.Table
 * @parent History
 * Controller that displays a table with the history of a finding
 */
$.Controller('Seccubus.History.Table',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that holds the options in its attributes
	 */
	defaults : {
                /*
		 * @attribute options.workspace
		 * The currently selected workspace,
		 * -1 = no workspace
		 */
                workspace       : -1,
		/*
		 * @attribute options.findingId
		 * The currently selected finding,
		 * -1 = no finding selected
		 */
		findingId	: -1,
		/*
		 * @attribute options.asHTML
		 * Function to translate a finding to HTML
		 */
		asHTML 		: function(txt){
			var out = $('<div/>').text(txt).html();
			out = out.replace(/\n/g,"<br>");
			return(out);
		}
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	updateView : function() {
		if ( this.options.workspace == -1 ) {
			alert("Seccubus.History.Table: woorkspace not set");
		} else if ( this.options.findingId == -1 ) {
			alert("Seccubus.History.Table: findingId not set");
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.History.findAll({
						workspace   : this.options.workspace,
						id          : this.options.findingId
					}),
					{
						asHTML	    : this.options.asHTML
					}
				)
			);
		}
	},
	/*
	 * Update, overloaded to rerender the table after and udpate event
	 */
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
