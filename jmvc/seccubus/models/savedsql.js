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
steal('jquery/model', function(){

/**
 * @class Seccubus.Models.Asset
 * @parent Asset
 * @inherits jQuery.Model
 * Wraps backend assets services.  
 */
$.Model('Seccubus.Models.savedsql',
/* @Static */
{
	/*
	 * @function findAll
	 * @param {Object} params
	 * Parameters of the API call
	 * @param {Function} success
	 * Callback funciton in case of success
	 * @param {Function} error
	 * Callback function in case of error
	 * @return {Deferred} A deferred Assets (Asset.Table)
	 */
	findAll : function(params,success,error){
		return $.ajax({
			url	: "json/getSavedSQL.pl",
			type	: "POST",
			dataType: "json savedsql.models",
			data	: params,
			success	: success,
			error	: error
		});
	},
	create	: "POST json/saveSQL.pl"
  	// Not implemented
	//findOne	: "/scans/{id}.json", 
 	
	// update	: "POST json/updateAsset.pl",
	// destroy	: "POST json/deleteAsset.pl"
  	// Not implemented yet
	//destroy	: "/scans/{id}.json"
},
/* @Prototype */
{});

});
