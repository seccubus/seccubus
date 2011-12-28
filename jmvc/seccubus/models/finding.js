steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Finding
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend finding services.  
 */
$.Model('Seccubus.Models.Finding',
/* @Static */
{
	defaults : {
		matchScans	: null,
	},
	findAll: "/findings.json",
  	findOne : "/findings/{id}.json", 
  	create : "/findings.json",
 	update : "/findings/{id}.json",
  	destroy : "/findings/{id}.json"
},
/* @Prototype */
{
	// This function returns true is 
	isMatch	: function(filter) {
		match = true;
		if ( filter.scans ) {
			match = false;
			for(i=0;(! match ) && i < filter.scans.length;i++) {
				match = ( this.scanId == filter.scans[i]);
			}
		}
		return match;
	},
	asHTML : function(property) {
		if ( this.attr(property) ) {
			var newval = this.attr(property);
			// Basic HTML encode
			newval = $('<div/>').text(newval).html();
			// Replace \n with <br>
			newval = newval.replace(/\n/g,"<br>");
			// Basic HTML decode
			//newval = $('<div/>').html(newval).text();

			return(newval);
		}
	}
}); // Model

})  // Steal
