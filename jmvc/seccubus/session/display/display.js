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
    "jquery/dom/form_params",
    "jquery/controller/view",
    "seccubus/models"
).then(
    "./views/init.ejs",
	function($){
    /**
     * @class Seccubus.Session.Create
     * @parent Session
     * @inherits jQuery.Controller
     * Renders the content of a form to create a session and handles creation (login)
     */
    $.Controller("Seccubus.Session.Display",
    /** @Static */
    {
        /*
         * @attribute options
         * Object that contains all options
         */
        defaults : {
            /*
             * @attribute options.onChange
             * Function that is called when the session has changed
             */
            onChange   : function(s) {
                console.log("Seccubus.Session.Display: new session : ",s);
            },
            /*
             * @attribute options.session
             * Holds the actual session
             */
            session   : {}
        }
    },
    /** @Prototype */
    {
        /*
         * Redeners the form
         */
        init : function(){
            this.updateView();
        },
        /*
         * This function renders the control
         */
        updateView : function() {
            var s = Seccubus.Models.Session.findOne({},this.options.onChange);
            this.options.session = s;
            this.element.html(this.view('init', s,{ } ));
        },

        /*
         * This function is triggered when a form is submitted. It prevents the
         * default event, and uses the form parameters to create a new Session
         * @param {Object} el
         * The element that is submitted
         * @param {Object} ev
         * The submit event itself
         */
        submit : function(el, ev){
            ev.preventDefault();
            this.element.find("[type=submit]").val("Checking...");
            var param = el.formParams();
            new Seccubus.Models.Session(param).save(this.callback("saved"), this.callback("error"));
        },
        ".logout click" : function(el,ev) {
            ev.preventDefault();
            el.closest(".session").model().destroy({});
            alert("You have been logged out");
            this.options.onChange({username : "", isAdmin :  false, valid: false, message: "you have been logged out"});
            this.updateView();
        },
        /*
         * This function is the callback for the submit function. It is called
         * when the object was successfully created through the model
         * It calls clearAll to clear the form
         */
        saved : function(m){
            this.clearAll();
            this.options.onSuccess(m);
        },
        /*
         * This function is the error callback for the submit function. It is
         * called when the object was not successfully created through the model
         * It calls clearAll to clear the form
         */
        error : function(x){
            this.clearAll();
            this.options.onFailure(x);
        },
        /*
         * This function clears the form and calls the onClear function defined
         * in options.onClear
         */
        clearAll : function() {
            this.element.find("[type=submit]").val("Create");
            this.element[0].reset()
            this.element.find("[id=login_username]").focus();
        }
    });

});
