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
 * @class Seccubus.Models.ConfigItem
 * @parent ConfigItem
 * @inherits jQuery.Model
 * Wraps backend config_item service.  
 * Since the ConfigTest api is read only, there is only one method findAll
 */
$.Model('Seccubus.Models.ConfigItem',
/* @Static */
{
	/**
	 * Finds the status of all configuration items
	 * @return array of ConfigTest hashes ( name, result, message )
	 *
	 * name - String, name of the configuration item
	 *
	 * result - String, result of the test OK/NOK
	 *
	 * message - String, message about the configuraiton item
	 */
	findAll: "json/ConfigTest.pl"
},
/* @Prototype */
{});

})
