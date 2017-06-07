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
steal(
    "jquery/controller",
    "jquery/view/ejs",
    "jquery/controller/view",
    "seccubus/models"
).then(
    "./views/init.ejs",
    "./views/workspace.ejs",
    "./views/no_workspaces.ejs",
    function($){

        /**
         * @class Seccubus.Workspace.Select
         * @parent Workspace
         * @inherits jQuery.Controller
         * Builds a dropdown selector of workspaces
         */
        $.Controller(
            "Seccubus.Workspace.Select",
            /** @Static */
            {
                defaults : {}
            },
            /** @Prototype */
            {
                /* This funciton calls updateView to render the control
                 */
                init : function(el, fn){
                    this.updateView();
                },
                // (re-)Render on delete
                "{Seccubus.Models.Workspace} destroyed" : function(Workspace, ev, workspace) {
                    this.updateView();
                },
                // (re-)Render on create
                "{Seccubus.Models.Workspace} created" : function(Workspace, ev, workspace){
                    this.updateView();
                },
                // Apend on update
                "{Seccubus.Models.Workspace} updated" : function(Workspace, ev, workspace){
                    workspace.elements(this.element)
                          .html(this.view('workspace', workspace) );
                },
                /*
                 * This fuction rerenders the entire control with data from findAll
                 */
                updateView : function() {
                    this.element.html(
                        this.view(
                            'init',
                            Seccubus.Models.Workspace.findAll()
                        )
                    );
                }

            }
        ); // Controller
    }
); // Steal
