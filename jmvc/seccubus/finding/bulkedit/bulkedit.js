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
	defaults : {}
},
/** @Prototype */
{
	init : function(){
		this.element.html(this.view());
	},
	submit : function(el, ev) {
		ev.preventDefault();
		this.element.find('[type=submit]').val('Updating...');
		var findings = $(".selectFinding[checked=checked] ").closest(".finding").models();
		//txt = "";
		//for(var a in findings) {
		//	txt = txt + a + ": " + findings[a] + "\n--\n";
		//}
		//alert(txt);
		findings.update({ name : "bla"},this.callback('saved'));
		//findings.update(el.formParams(),this.callback('saved'));
	},
	saved : function() {
		this.element.find('[type=submit]').val('Update');
		this.element[0].reset();
	}
})

});
