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
 * @class Seccubus.Models.Workspace
 * @parent Workspace
 * @inherits jQuery.Model
 * Wraps backend workspace services.  
 */
$.Model('Seccubus.Models.Workspace',
/* @Static */
{
  	create : api("createWorkspace.pl"),
	findAll: api("getWorkspaces.pl"),
	//findOne: api("getWorkspace.pl"),
	update : api("updateWorkspace.pl")
	//destroy : api("/workspaces/{id}.json")
},
/* @Prototype */
{});

})