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
steal('jquery/model', function(){

/**
 * @class Seccubus.Severity
 * @parent Severity
 * @inherits jQuery.Model
 * Wraps backend severity services.  
 * Only has a findAll api
 */
$.Model('Seccubus.Models.Severity',
/* @Static */
{
	findAll: api("getSeverity.pl")
  	//findOne : "/severity/{id}.json", 
  	//create : "/severity.json",
 	//update : "/severity/{id}.json",
  	//destroy : "/severity/{id}.json"
},
/* @Prototype */
{});

})
