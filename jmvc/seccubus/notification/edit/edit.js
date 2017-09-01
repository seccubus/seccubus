/*
 * Copyright 2012-2017 Frank Breedijk
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
 * @class Seccubus.Notification.Edit
 * @parent Notification
 * @inherits jQuery.Controller
 * Generates a dialog to edit a notification
 *
 * Story
 * -----
 * As a user I would like to be able to edit notifications from the GUI
 */
$.Controller('Seccubus.Notification.Edit',
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
		/* attribute options.notification
		 * Notification object that needs to be edited
		 */
		notification : null
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	updateView : function() {
		this.element.html(
			this.view(
				'init',
				this.options.notification
			)
		);
		$('#editNotTrigger').seccubus_event_select({
			selected : this.options.notification.trigger
		});
	},
	submit : function(el, ev){
		ev.preventDefault();

		var params = el.formParams();
		var ok = true;
		var elements = [];
		if ( params.subject == '' ) {
			elements.push("#editNotSubject");
			ok = false;
		}
		if ( params.recipients == '' ) {
			elements.push("#editNotRecipients");
			ok = false;
		}
		if ( params.message == '' ) {
			elements.push("#editNotMessage");
			ok = false;
		}
		if ( ok ) {
			this.element.find('[type=submit]').val('Updating...')

			//notification = this.options.notification;
			this.options.notification.subject = params.subject;
			this.options.notification.trigger = params.trigger;
			this.options.notification.recipients = params.recipients;
			this.options.notification.message = params.message;

			this.options.notification.save(this.callback('saved'));
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
		this.element.find('[type=submit]').val('Update Notification');
		this.element[0].reset()
		$(".nok").removeClass("nok");
		this.options.onClear();
	},
	".nok change" : function(el) {
		el.removeClass("nok");
	},
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
