/*
 * Copyright 2013 Frank Breedijk, Steve Launius
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
steal('jquery/model','jquery/model/list', function(){

/**
 * @class Seccubus.Models.Finding
 * @parent Finding
 * @inherits jQuery.Model
 * This model deals with individual findings
 */
$.Model('Seccubus.Models.Finding',
/* @Static */
{
	/*
	 * @function findAll
	 * This funciton gets all findings, it is the interface to 
	 * json/getFndings.pl
	 * @return {Deferred} Deferred with all findings in it
	 */
	findAll: "POST json/getFindings.pl",
  	//findOne : "/findings/{id}.json", 
  	//create : "/findings.json",
	/*
	 * @function update
	 * This function updates a single finding, it is the interface to
	 * json/updateFinding.pl
	 * @return {Object} the updated object or an error
	 */
 	update : "POST json/updateFinding.pl"
  	//destroy : "/findings/{id}.json"
},
/* @Prototype */
{
	/*
	 * This function returns true if the finding matches the criteria 
	 * in the filter object
	 * @param {Object} filter
	 * Object containing the filter settings
	 * @param {Boolean) debug
	 * Turns debugging on
	 * @return {Boolean} True if this finding matches the filter
	 */
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
		if ( match && typeof filter.severity != "undefined" && filter.severity != "*" ) {
			match = ( this.severity == filter.severity );
		}
		if ( match && typeof filter.finding != "undefined" && filter.finding != "" ) {
			var re = new RegExp(filter.finding,"i");
			match = ! ( this.find.match(re) == null );
		}
		if ( match && typeof filter.remark != "undefined" && filter.remark != "" ) {
			if ( this.remark == null ) {
				match = false;
			} else {
				var re = new RegExp(filter.remark,"i");
				match = ! ( this.remark.match(re) == null );
			}
		}
		return match;
	},
	/*
	 * This function returns an object property as HTML. It does the 
	 * following conversions:
	 * - \n to <br>
	 * More will be added in the future, e.g.:
	 * - http:// to <a href=...
	 * - CVE entries
	 */
	asHTML : function(property,len) {
		if ( this.attr(property) ) {
			var newval = this.attr(property);
			if ( len ) {
				newval = newval.substr(0,len);
			}
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

/**
 * @class Seccubus.Models.Finding.List
 * @parent Seccubus.Models.Finding
 * @inherits jQuery.Model.List
 * List dealing with multiple findings
 */
$.Model.List('Seccubus.Models.Finding.List', {
/* @Static */
	/*
	 * @function update
	 * This function deals with updating multiple findings in one go it 
	 * wraps the json.updateFindings.pl API
	 */
	update : "POST json/updateFindings.pl"
},{
/* @Prototype */
}); // Model list

})  // Steal
