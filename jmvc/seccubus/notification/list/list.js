steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'seccubus/models' )
.then( './views/init.ejs', 
       './views/notification.ejs', 
       function($){

/**
 * @class Seccubus.Notification.List
 * @parent index
 * @inherits jQuery.Controller
 * Lists notifications and lets you destroy them.
 */
$.Controller('Seccubus.Notification.List',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	init : function(){
		this.element.html(this.view('init',Seccubus.Models.Notification.findAll()) )
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.notification').model().destroy();
		}
	},
	"{Seccubus.Models.Notification} destroyed" : function(Notification, ev, notification) {
		notification.elements(this.element).remove();
	},
	"{Seccubus.Models.Notification} created" : function(Notification, ev, notification){
		this.element.append(this.view('init', [notification]))
	},
	"{Seccubus.Models.Notification} updated" : function(Notification, ev, notification){
		notification.elements(this.element)
		      .html(this.view('notification', notification) );
	}
});

});