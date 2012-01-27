steal(	'jquery/controller',
	'jquery/view/ejs',
	'jquery/dom/form_params',
	'jquery/controller/view',
	'seccubus/models',
	'seccubus/scanner/select'
).then(	'./views/init.ejs',
	function($){

/**
 * @class Seccubus.Scan.Edit
 * @parent Scan
 * @inherits jQuery.Controller
 * Generates a dialog to edit a scan
 *
 * Warning
 * =======
 * This code is unfished
 *
 * Story
 * -----
 * As a user I would like to be able to edit scans from the GUI
 */
$.Controller('Seccubus.Scan.Edit',
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
		/* attribute options.scan
		 * Scan object that needs to be edited
		 */
		scan : null
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
				this.options.scan
			)
		);
		$('#newScanScanner').seccubus_scanner_select({
			helpHere : '#newScanHelp',
			selected : this.options.scan.scanner
		});
	},
	submit : function(el, ev){
		ev.preventDefault();

		var params = el.formParams();
		if ( params.scanner == 'other' ) {
			params.scanner = params.otherScanner;
		}
		var ok = true;
		var elements = [];
		if ( params.name == '' ) {
			elements.push("#newScanName");
			ok = false;
		}
		if ( params.scanner == '' || params.scanner == 'none' ) {
			elements.push("#newScanScanner", "#newScanOtherScanner");
			ok = false;
		}
		if ( params.parameters == '' ) {
			elements.push("#newScanParam");
			ok = false;
		}
		if ( params.targets == '' ) {
			elements.push("#newScanTargets");
			ok = false;
		}
		if ( this.options.workspace == -1 ) {
			alert("Error: workspace is not set");
			ok = false;
		}
		if ( ok ) {
			this.element.find('[type=submit]').val('Creating...')
			params.workspaceId = this.options.workspace;
			new Seccubus.Models.Scan(params).save(this.callback('saved'));
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
		this.element.find('[type=submit]').val('Update');
		this.element[0].reset()
		$(".nok").removeClass("nok");
		this.options.onClear();
	},
	"#newScanScanner change" : function() {
		alert($('#newScanScanner').val());
		if ( $('#newScanScanner').val() == null || $('#newScanScanner').val() == 'other'  ) {
			$('#newScanOtherScannerRow').show();
		} else {
			$('#newScanOtherScannerRow').hide();
		}
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
