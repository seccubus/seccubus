steal( 'jquery/controller','jquery/view/ejs' )
	.then( './views/init.ejs', function($){

/**
 * @class Seccubus.Report
 */
$.Controller('Seccubus.Report',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	init : function(){
		this.element.html("//seccubus/report/views/init.ejs",{
			message: "Hello World"
		});
	}
})

});