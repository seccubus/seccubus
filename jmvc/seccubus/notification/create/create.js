/*
 * Copyright 2017 Frank Breedijk
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
steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/dom/form_params',
	'jquery/controller/view',
	'seccubus/models',
	'seccubus/event/select'
).then(	'./views/init.ejs',
	function($){

/**
 * @class Seccubus.Notification.Create
 * @parent Notification
 * @inherits jQuery.Controller
 * Generates a dialog to create notifications
 *
 * Warning
 * =======
 * This code is unfished
 *
 * Story
 * -----
 * As a user I would like to be able to create notifications from the GUI
 */
$.Controller('Seccubus.Notification.Create',
/** @Static */
{
	/*
	 * @attribute options
	 * Object that contains the options
	 */
	defaults : {
		/*
		 * @attribute options.onClear
		 * Funciton that is called when the form is cleared, e.g. to 
		 * disable a modal display
		 */
		onClear : function () { },
		/*
		 * @attribute options.workspace
		 * Indicates which workspace the notification needs to be created in
		 *
		 * Default value: -1
		 *
		 * Special value: -1 - No notification selected
		 */
		workspace : -1,
		/*
		 * @attribute options.scan
		 * Indicates which scan the notification needs to be created in
		 *
		 * Default value: -1
		 *
		 * Special value: -1 - No notification selected
		 */
		scan : -1
	}
},
/** @Prototype */
{
	init : function(){
		this.element.html(this.view());
		$('#newNotTrigger').seccubus_event_select();
	},
	submit : function(el, ev){
		ev.preventDefault();

		var params = el.formParams();
		var ok = true;
		var elements = [];
		if ( params.subject == '' ) {
			elements.push("#newNotSubject");
			ok = false;
		}
		if ( params.recipients == '' ) {
			elements.push("#newNotRecipients");
			ok = false;
		}
		if ( params.message == '' ) {
			elements.push("#newNotMessage");
			ok = false;
		}
		if ( this.options.workspace == -1 ) {
			alert("Error: workspace is not set");
			ok = false;
		}
		if ( this.options.scan == -1 ) {
			alert("Error: scan is not set");
			ok = false;
		}
		if ( ok ) {
			this.element.find('[type=submit]').val('Creating...')
			params.workspace = this.options.workspace;
			params.scan = this.options.scan;
			new Seccubus.Models.Notification(params).save(this.callback('saved'));
		} else {
			this.nok(elements);
		}
	},
	nok : function(elements) {
		this.element.children(".nok").removeClass("nok");
		for(i=0;i<elements.length;i++) {
			$(elements[i]).addClass("nok");
		}
		this.element.css({position : "absolute"});
		this.element.animate({left : '+=20'},100);
		this.element.animate({left : '-=20'},100);
		this.element.animate({left : '+=20'},100);
		this.element.animate({left : '-=20'},100);
		this.element.animate({left : '+=20'},100);
		this.element.animate({left : '-=20'},100);
		this.element.css({position : "relative"});
	},
	".cancel click" : function() {
		this.clearAll();
	},
	saved : function(){
		this.clearAll();
	},
	clearAll : function() {
		this.element.find('[type=submit]').val('Create notification');
		this.element[0].reset()
		$(".nok").removeClass("nok");
		this.options.onClear();
	},
	".nok change" : function(el) {
		el.removeClass("nok");
	}
})

});
