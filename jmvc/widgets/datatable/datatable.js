steal( 
	'jquery/controller'
     ).then( 
	'jquery/jquery.js',
	'plugins/jquery.dataTables.js',
	function($){

/**
 * @class Widgets.Datatable
 * @parent Widgets
 * @inherits jQuery.Controller
 *
 * Purpose
 * =======
 * The Widgets.Datatable controller add the jQuery DataTable plugin to the first
 * tab element in the element it is called upon.
 */
$.Controller('Widgets.Datatable',
/** @Static */
{
	defaults : {},
},
/** @Prototype */
{
	/*
	 * @param {object} el The element the function is called upon
	 * @param {object} options The the options passed to the tablesort plugin
	 * See: http://datatables.net/examples/basic_init/zero_config.html for 
	 * more information
	 */
	init : function( el, options ){
		$(el).children('table:first').dataTable(options);
	}
})

});
