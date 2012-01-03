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
	findAll: "json/getFindings.pl",
  	findOne : "/findings/{id}.json", 
  	create : "/findings.json",
 	update : "/findings/{id}.json",
  	destroy : "/findings/{id}.json"
},
/* @Prototype */
{
	// This function returns true is 
	isMatch	: function(filter,debug) {
		match = true;
		debug = ( typeof debug != "undefined" );
		if ( filter.scans ) {
			match = false;
			for(i=0;(! match ) && i < filter.scans.length;i++) {
				match = ( this.scanId == filter.scans[i]);
			}
			if( debug) { alert("scans: " + match) };
		}
		if ( match && typeof filter.status != 'undefined' ) {
			match = ( this.status == filter.status );
		}
		if ( match && typeof filter.host != 'undefined' && filter.host != "*" ) {
			var starpos = filter.host.indexOf("*");
			if ( starpos == -1 ) {
				match = ( this.host == filter.host );
			} else {
				match = ( filter.host.substring(0,starpos) == this.host.substring(0,starpos));
			}
		}
		if ( match && typeof filter.hostName != "undefined" && filter.hostName != "*" ) {
			match = ( this.hostName == filter.hostName );
		}
		if ( match && typeof filter.port != "undefined" && filter.port != "*" ) {
			match = ( this.port == filter.port );
		}
		if ( match && typeof filter.plugin != "undefined" && filter.plugin != "*" ) {
			match = ( this.plugin == filter.plugin );
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
