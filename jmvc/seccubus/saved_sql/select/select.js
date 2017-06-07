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
    "jquery/controller/view",
    "seccubus/models"
).then(
    "./views/init.ejs",
    "./views/custsql.ejs",
    "./views/error.ejs",
    function($){

    /**
     * @class Seccubus.Custsql.Select
     * @parent Custsql
     * @inherits jQuery.Controller
     * Renders a control to select scans
     * @param {Object} options
     * Defines the options for this control
     */
    $.Controller("Seccubus.SavedSql.Select",
    /** @Static */
    {
        /*
         * @attribute options.workspace
         * Determines which workspaces is selected.
         * -1 (default value) means no workspace is selected
         */
        defaults : {

            /* attribute options.selected
             * Which options are selected now
             * Obj: key: scan_id, val: asset_id
             */
            items : [],

            /* attribute options.getItems
             * procedure which gives all updated items
             */
            getItems : function(items){}
        }
    },
    /** @Prototype */
    {
        /*
         * Initializes the controller by calling updateView
         */
        init : function(){
            this.updateView();
        },
        // This controller is (re)initialized if a Custsql object is destroyed
        "{Seccubus.Models.Custsql} destroyed" : function(Custsql, ev, asset) {
            this.updateView();
        },
        // This controller is (re)initialized if a Custsql object is created
        "{Seccubus.Models.Custsql} created" : function(Custsql, ev, asset){
            this.updateView();
        },
        // A the option is rerendered if a Custsql object is altered
        "{Seccubus.Models.Custsql} updated" : function(Custsql, ev, asset){
            asset.elements(this.element)
                  .html(this.view("asset", asset) );
        },

        // This controller fires on change
        ".SQLsSelector change" : function(el){
            alert("onChange");
        },
        /*
        * @function updateView
        * This function renders the entire controller
        *
        * If this.options.workspace == -1 the message "no workspace selected"
        * will be displayed
        */
        updateView : function() {
            Seccubus.Models.SavedSql.findAll( {},
                this.callback("dataReady")
            );
        },
        /*
        * @function dataReady
        * This is the callback functio that is used internally after the
        * findAll call in updateView
        * @param {Deferred} items
        * A deferred containing all scans
        */
        dataReady : function(items) {
            var options = {};
            items.unshift({id:"",name:"--select sql--"});
            $.map(items,function(item){
                options[item.id] = item.sql;
            });
            this.options.items = options;
            this.options.getItems(options);
            this.element.html(this.view(
                "init",
                items
            ));
        },
        /*
        * @function update
        * This overloads the standard update funciton to allways excute
        *  updateView then the control is updated
        * @param {Object} options
        * The options object
        */
        update : function(options){
            this._super(options);
            this.updateView();
        }
    });
});
