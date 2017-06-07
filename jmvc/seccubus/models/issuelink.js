/*
 * Copyright 2017 Frank Breedijk
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
 * @class Seccubus.Models.Issue
 * @parent Issue
 * @inherits jQuery.Model
 * This model deals with individual issues
 */
$.Model('Seccubus.Models.Issuelink',
/* @Static */
{
	/*
	 * @function findAll
	 * This funciton gets all issues, it is the interface to
	 * json/getFndings.pl
	 * @return {Deferred} Deferred with all issues in it
	 */
    findAll: api("workspace/{workspace}/findings"),
  	//findOne : "/issues/{id}.json",
  	//create : "/issues.json",
	/*
	 * @function update
	 * This function updates a single issue, it is the interface to
	 * json/updateIssue.pl
	 * @return {Object} the updated object or an error
	 */
    update  : updateApi("workspace/{workspace}/issue/{id}")
 	//destroy : "POST json/updateIssue.pl"
},
/* @Prototype */
{

}); // Model


})  // Steal
