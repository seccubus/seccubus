steal( 'jquery/controller','jquery/view/ejs' )
	.then( './views/init.ejs', function($){

/**
 * @class Seccubus.Report.Open
 */
$.Controller('Seccubus.Report.Open',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	init : function(){
		this.element.html("//seccubus/report/open/views/init.ejs",{
			message: "Hello World"
		});
	}
})

});