steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/dom/form_params',
	'seccubus/models'
).then( './views/init.ejs', 
	function($){

/**
 * @class Seccubus.Finding.Bulkedit
 */
$.Controller('Seccubus.Finding.Bulkedit',
/** @Static */
{
	defaults : {
		status	: 1,
		workspace : -1
	}
},
/** @Prototype */
{
	init : function(){
		this.updateView();
	},
	submit : function(el, ev) {
		ev.preventDefault();
		this.bulkUpdate();
	},
	".bulkSetStatus click" : function(el, ev) {
		ev.preventDefault();
		$(el).val("Saving...");
		var newStatus = $(el).attr("newStatus");
		$('#bulkEditStatus').val(newStatus);
		this.bulkUpdate();
	},
	bulkUpdate : function() {
		var findings = $(".selectFinding[checked=checked]").closest(".finding").models();
		var params = this.element.formParams();
		params.workspaceId = this.options.workspace;
		findings.update(params,this.callback('saved'));
	},
	saved : function() {
		this.element.find('[type=submit]').val('Update');
		this.element[0].reset();
		this.updateView();
	},
	"{Seccubus.Model.GuiState} updated" : function(state, event, task) {
		alert(state, event, task);
	},
	updateView : function() {
		this.element.html(this.view('init',{
			workspace 	: this.options.workspace,
			status		: this.options.status
		}));
	},
	update : function(options) {
		this._super(options);

		this.updateView();
	}
})

});
