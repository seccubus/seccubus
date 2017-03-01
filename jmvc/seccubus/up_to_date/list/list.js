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
steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'seccubus/models' )
.then( './views/init.ejs', 
       './views/up_to_date.ejs', 
       function($){

/**
 * @class Seccubus.UpToDate.List
 * @parent UpToDate
 * @inherits jQuery.Controller
 * c$Renders a list that shows if Seccubus is up to date
 */
$.Controller('Seccubus.UpToDate.List',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	/**
	 * The init function displays the list by rendern the list/init.ejs view
	 * with data obtained by calling the findAll funciton of the UpToDate 
	 * model
	 */
	init : function(){
		this.element.html(this.view('init',Seccubus.Models.UpToDate.findAll()) );
	}
});

});
