/*
 * Copyright 2017 Frank Breedijk, Steve Launius
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
 * @class Seccubus.Models.Status
 * @parent Status
 * @inherits jQuery.Model
 * This model deals with individual findings
 */
$.Model('Seccubus.Models.Status',
/* @Static */
{
	/*
	 * @function findAll
	 * This funciton gets all findings, it is the interface to 
	 * json/getFndings.pl
	 * @return {Deferred} Deferred with all findings in it
	 */
	findAll: api("getStatus.pl")
  	//findOne : api("/findings/{id}.json"), 
  	//create : api("/findings.json"),
 	//update : api("updateStatus.pl")
  	//destroy : api("/findings/{id}.json")
},
/* @Prototype */
{
}); // Model

})  // Steal
