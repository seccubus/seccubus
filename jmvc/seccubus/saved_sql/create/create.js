/*
 * Copyright 2017 Petr, Frank Breedijk
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
steal(
    "jquery/controller",
	"jquery/view/ejs",
	"jquery/dom/form_params",
	"jquery/controller/view",
	"seccubus/models"
).then(
    "./views/init.ejs",
	function($){
    /**
     * @class Seccubus.Asset.Create
     * @parent Asset
     * @inherits jQuery.Controller
     * Generates a dialog to save SQL
     *
     * Warning
     * =======
     * This code is unfished
     *
     * Story
     * -----
     * As a user I would like to be able tot save SQL from the GUI
     */
     $.Controller("Seccubus.SavedSql.Create",
    /** @Static */
    {
		/*
		 * @attribute options
		 * Object that contains the options
		 */
		defaults : {
			/*
			 * @attribute options.sql
			 * SQL which save
			 */
			sql : " ",
			/*
			 * @attribute options.onClear
			 * Funciton that is called when the form is cleared, e.g. to
			 * disable a modal display
			 */
			onClear : function () { },
			/*
			 * @attribute options.afterSave
			 * Funciton that is called save done
			 * disable a modal display
			 */
			afterSave : function() { console.warn("afterSave not defined"); }
		}
    },
    /** @Prototype */
    {
		init : function(){
			this.element.html(this.view());
		},
		submit : function(el, ev){
			ev.preventDefault();
			var params = el.formParams();
			var elements = [];
			var ok = true;
			if(params.name == ""){
				ok = false;
				elements.push("#newSQLName");
			}
			params.sql = this.options.sql;
			if ( ok ) {
				this.element.find("[type=submit]").val("Creating...")
				new Seccubus.Models.SavedSql(params).save(this.callback("saved"));
			} else {
				this.nok(elements);
			}
		},
		nok : function(elements) {
			this.element.children(".nok").removeClass("nok");
			for(i=0;i<elements.length;i++) {
				$(elements[i]).addClass("nok");
			}
			this.element.css({position : "absolute"});
			this.element.animate({left : "+=20"},100);
			this.element.animate({left : "-=20"},100);
			this.element.animate({left : "+=20"},100);
			this.element.animate({left : "-=20"},100);
			this.element.animate({left : "+=20"},100);
			this.element.animate({left : "-=20"},100);
			this.element.css({position : "relative"});
		},
		".cancel click" : function() {
			this.clearAll();
		},
		saved : function(){
			this.clearAll();
			this.options.afterSave();
		},
		clearAll : function() {
			this.element.find("[type=submit]").val("save SQL");
			this.element[0].reset()
			$(".nok").removeClass("nok");
			this.options.onClear();
		},
		".nok change" : function(el) {
			el.removeClass("nok");
		}
    })
});
