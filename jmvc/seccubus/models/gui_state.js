/*
 * Copyright 2013 Frank Breedijk
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
steal(	'jquery/model',
	function(){

/**
 * @class Seccubus.GuiState
 * @parent GuiState
 * @inherits jQuery.Model
 * This model tracks the generic state of the GUI. Since the GUI only lives in 
 * the users browser, there is no need to wrap any backend services.
 */
$.Model('Seccubus.GuiState',
/* @Static */
{
	defaults : {
	/*
	 * @attribute findStatus
	 * The Gui looks at all findings of a certain status. findStatus 
	 * determines which status this is.
	 */
		findStatus	: 1,
	/*
	 * @attribute workspace 
	 * Determines which workspace is 
	 * selected.
	 * - Default value: -1
	 * - Special value: -1 - No workspace is selected
	 */
		workspace	: -1,
	/*
	 * @attribute scans 
	 * Determines which scans are selected
	 * - Default value: null
	 * - Special value: null - No scans are selected
	 */
		scans		: null,
	/*
	 * @attribute host 
	 * Determines which host is filtered on
	 * - Default value: *
	 * - Special value: * - No host filtering
	 */
		host		: "*",
	/*
	 * @attribute hostName 
	 * Determines which hostName is filtered on
	 * - Default value: *
	 * - Special value: * - No hostName filtering
	 */
		hostName	: "*",
	/*
	 * @attribute port 
	 * Determines which port is filtered on
	 * - Default value: *
	 * - Special value: * - No port filtering
	 */
		port		: "*",
	/*
	 * @attribute plugin 
	 * Determines which plugin is filtered on
	 * - Default value: *
	 * - Special value: * - No plugin filtering
	 */
		plugin		: "*",
	/*
         * @attribute severity
         * Determines which severity is filtered on
         * - Default value: *
         * - Special value: * - No Severity specified
         */
		severity	: "*",
	/*
	 * @attribute finding
	 * Determines which string should occur in the the findings
	 * - Default value: *
	 * - Special value: * - Don't filter on finding
	 */
		finding		: "*",
	/* @attribute remark
	 * Determines whcih string should occur in the finding
	 * - default value: *
	 * - special value: * - Don't filter on remark
	 */
		remark		: "*"
	}
},
/* @Prototype */
{
	/*
	 * @function setFindStatus
	 * This function guards the findStatus property and ensures it is 
	 * set to a correct status
	 * @param {Integer} status
	 * New potential status
	 * @return {Integer} The sanitized status
	 */
	setFindStatus : function(status) {
		status = parseInt(status);
		if ( status >= 1 && (status ==99 || status <= 6 ) ) {
			return(status);
		} else {
			if ( ! this.findStatus ) {
				return 1;
			} 
		}
	},
	/*
	 * @function setWorkspace
	 * This function guards the workSpace property, it clears other 
	 * attributes if a new scan is seleced
	 * @param {Integer} ws
	 * The new workspace value
	 * @return {Integer} the new workspace value
	 */
	setWorkspace : function(ws) {
		if ( ws != this.workspace ) {
			this.attr("scans",null);
			this.attr("host","*");
			this.attr("hostName","*");
			this.attr("port","*");
			this.attr("plugin","*");
			this.attr("severity","*");
			this.attr("finding","*");
			this.attr("remark","*");
		}
		return(ws);
	}
}); // Model

})  // Steal
