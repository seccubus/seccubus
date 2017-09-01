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
    "jquery/dom/form_params",
    "seccubus/models",
    "seccubus/severity/select"
).then(
    "./views/init.ejs",
    function($){

    /**
     * @class Seccubus.Issue.Create
     * @parent Issue
     * @inherits jQuery.Controller
     * Generates an dialog to show/create one or more issues
     *
     * Story
     * -----
     *  As a user I would like to be able to have a detailed view and create
     *  posibility for issues
     */
    $.Controller("Seccubus.Issue.Create",
    /** @Static */
    {
        /*
         * @attribute options
         * Object that contains the options
         */
        defaults : {
            /* @attribute options.workspace
             * Id of the current workspace
             */
            workspace : -1,
            /*
             * @attribute findings
             * Array of findings to link to new issue
             */
            findings : [],
            /*
             * @attribute options.onClear
             * Funciton that is called when the form is cleared, e.g. to
             * disable a modal display
             */
            onClear : function () { }
        }
    },
    /** @Prototype */
    {
        init : function(){
            this.updateView();
        },
        updateView : function() {
            if ( this.options.workspace == -1 ) {
                console.warn("Seccubus.Issues.Create : Workspace not set");
            } else {
                this.element.html(
                    this.view(
                        "init",
                        [],
                        {
                            findings : this.options.findings
                        }
                    )
                );
                $("#createIssueSeverity").seccubus_severity_select();
            }
        },
        ".createSetStatus click" : function(el,ev) {
            ev.preventDefault();

            var newState = $(el).attr("newstatus");
            var param = this.element.formParams();

            // Check form
            var ok = true;
            var elements = [];
            if ( param.name == "" ) {
                elements.push("#createIssueName");
                ok = false;
            }
            if ( param.severity == -1 ) {
                elements.push("#createIssueSeverity");
                ok = false;
            }

            if ( ok ) {
                console.log(this.options);
                var issue = new Seccubus.Models.Issue(param);
                issue.attr("status", newState);
                issue.attr("workspace", this.options.workspace);
                issue.attr("findings_add", []);
                for ( i=0;i < this.options.findings.length;i++) {
                    issue.attr("findings_add").push(this.options.findings[i].id);
                }
                issue.save(this.callback("saved"));
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
            this.element.animate({left : "+=10"},100);
            this.element.animate({left : "-=20"},100);
            this.element.animate({left : "+=20"},100);
            this.element.animate({left : "-=20"},100);
            this.element.animate({left : "+=20"},100);
            this.element.animate({left : "-=10"},100);
            this.element.css({position : "relative"});
        },
        ".cancel click" : function() {
            this.clearAll();
        },
        saved : function(){
            this.clearAll();
        },
        clearAll : function() {
            this.element.find("[type=submit]").val("Create scan");
            this.element[0].reset()
            $(".nok").removeClass("nok");
            this.options.onClear();
        },
        "{Seccubus.Models.Issue} updated" : function(Issue, ev, issue) {
            this.updateView();
        },
        // Autoclear nok status
        ".nok change" : function(el) {
            el.removeClass("nok");
        },
        /*
         * Update, overloaded to reder the control after and update even
         */
        update : function(options) {
            this._super(options);
            this.updateView();
        }
    });

});
