steal( 'jquery/controller','jquery/view/ejs' )
	.then( './views/init.ejs', function($){

/**
 * @class Seccubus.Report.ByFinding
 */
$.Controller('Seccubus.Report.ByFinding',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	init : function(){
		this.element.html("//seccubus/report/by_finding/views/init.ejs",{
			message: "Hello World"
		});
	}
})

});