steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/controller/view',
	'seccubus/models'
).then(	
	'./views/init.ejs',
	'./views/error.ejs',
function($){

/**
 * @class Seccubus.Notification.Table
 * @parent Notification
 * @inherits jQuery.Controller
 */
$.Controller('Seccubus.Notification.Table',
/** @Static */
{
	/*
	 * @attribute options
	 * Object holding all options in it's attributes
	 */
	defaults : {
		/*
		 * @attribute options.scan
		 * The selected scan. -1 (default) means on scan selected.
		 */
		scan : -1,
		/*
		 * @attribute options.onEdit
		 * This function is triggered with an edit link is clicked
		 */
		onEdit : function(not) {
			alert("Seccubus.Notification.Table: no edit function specified for notification id: " + sc.id );
		}
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	/*
	 * This function renders the control
	 */
	updateView : function() {
		if ( this.options.scan  == -1 ) {
			console.warn("Seccubus.Notification.Table: scan is not set");
			this.element.html(
				this.view(
					'error',
					{
						message : "Please select a scan to start"
					}
				)
			);
		} else {
			this.element.html(
				this.view(
					'init',
					Seccubus.Models.Notification.findAll({
						scanId		: this.options.scan
					})
				)
			);
		}
	},
	".edit click" : function(el,ev) {
		ev.preventDefault();
		var not = el.closest('.notification').model();
		this.options.onEdit(not);
	},
	".destroy click" : function(el, ev) {
		ev.preventDefault();
		if(confirm("Are you sure you want to delete this notification?")){
			el.closest(".notification").model().destroy();
		}
	},
	"{Seccubus.Models.Notification} destroyed" : function(Notification, ev, notification) {
		this.updateView();
	},
	"{Seccubus.Models.Notification} created" : function(Notification, ev, notification){
		this.updateView();
	},
	"{Seccubus.Models.Notification} updated" : function(Notification, ev, notification){
		notification.elements(this.element).html(this.view('notification', notification) );
	},
	/* 
	 * Update is overloaded to render the control on each update to the 
	 * control
	 */
	update : function(options) {
		this._super(options);
		this.updateView();
	}
})

});
