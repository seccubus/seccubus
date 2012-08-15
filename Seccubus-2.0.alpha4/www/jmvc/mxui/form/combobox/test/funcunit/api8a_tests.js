module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/api8a.html");
	}
})

/*
 *  8. Combobox api tests:
 *  
 *  8a Tests that if a value is set using .val(value) api the combobox input shows the text corresponding to that value.
 *  8b Test that if we call .val() with no arguments the current item value is returned.
 *  8c Tests that if a value is set using .selectItem(value) api the combobox input shows the text corresponding to that value.
 *  8d Tests that if .getItem(value) api is called on with a value passed to it the combobox it returns the corresponding item object.
 *  8e Tests that if .getItems() api is called on combobox all combobox items are returned.
 *  8f Tests that if .query(text) api is called the items values whose text matches the passed parameter are returned.
 *  8g Tests that if .clearSelection() api is called combobox's current selection is cleared from input box and set to null.
 *  8h Tests that if .hideItem(value) api is called the item corresponding to the passed value is now hidden. 
 *  8i Tests that if .showItem(value) api is called the item corresponding to the passed value is now visible.
 *  8j Tests that if .disable(value) api is called the item corresponding value can't be selected by clicking on it.
 *  8l Tests that if .enable(value) api is called the item corresponding value can be selected by clicking on it.
 */

/*
 *  8a Tests that if a value is set using .val() api
 *  the combobox input shows the text corresponding to that value. 
 */
test("8a Tests that if a value is set using .val() api the combobox input shows the text corresponding to that value.", function() {
	
	S("#combobox8a").exists();
	S("#fixture8a").exists();
	S("#setVal").exists();
	
	S("#combobox8a").visible();
	S("#fixture8a").visible();
	S("#setVal").visible();	
		
	S("#fixture8a").type("[home]3");
	S("#setVal").click();
	
	S("#combobox8a_log").html(/3/);
	
	S("#combobox8a").find("input[type=text]").val(function(text){
		return /item3/.test(text);
	});
	
});

/*
 *  8b Test that if we call .val() with no arguments the current item value is returned.
 */
test("8b Test that if we call .val() with no arguments the current item value is returned.", function() {
	
	S("#combobox8a").exists();
	S("#combobox8a").visible();
	
	S("#fixture8a").type("[home]5");
	S("#setVal").click();	
	
	S("#getVal").click();
	
	S("#combobox8b_log").html(/5/);
	
});

/*
 *  8c Tests that if a value is set using .selectItem() api 
 *  the combobox input shows the text corresponding to that value. 
 */
test("8c Tests that if a value is set using .selectItem() api the combobox input shows the text corresponding to that value.", function() {
	
	S("#combobox8a").exists();
	S("#fixture8a").exists();
	S("#selectItem").exists();
	
	S("#combobox8a").visible();
	S("#fixture8a").visible();
	S("#selectItem").visible();	
		
	S("#fixture8a").type("[home]4");
	S("#selectItem").click();
	
	S("#combobox8a_log").html(/4/);
	
	S("#combobox8a").find("input[type=text]").val(function(text){
		return /item4/.test(text);
	});
	
});

/*
 *  8d Tests that if .getItem() api is called on with a value passed to it 
 *  the combobox it returns the corresponding item object.
 */
test("8d Tests that if .getItem() api is called on with a value passed to it the combobox it returns the corresponding item object.", function() {
	
	S("#combobox8a").exists();
	S("#combobox8a").visible();
	
	S("#fixture8a").type("[home]2");	
	
	S("#getItem").click();
	
	S("#combobox8b_log").html(/item2/);	
});

/*
 *  8e Tests that if .getItems() api is called on combobox all combobox items are returned. 
 */
test("8e Tests that if .getItems() api is called on combobox all combobox items are returned.", function() {
	
	S("#combobox8a").exists();
	S("#combobox8a").visible();	
	
	S("#getItems").click();
	
	S("#combobox8b_log").html(/item0,item1,item2,item3,item4,item5/);	
});

/*
 *  8f Tests that if .query(text) api is called 
 *  the items values whose text matches the passed parameter are returned. 
 */
test("8f Tests that if .query(text) api is called the items values whose text matches the passed parameter are returned.", function() {
	
	S("#combobox8a").exists();
	S("#combobox8a").visible();	
	
	S("#fixture8a").type("[home]item");	
	
	S("#query").click();
	
	S("#combobox8b_log").html(/0,1,2,3,4,5/);	
});

/*
 *  8g Tests that if .clearSelection() api is called 
 *  combobox's current selection is cleared from input box and set to null. 
 */
test("8g Tests that if .clearSelection() api is called combobox's current selection is cleared from input box and set to null.", function() {
	
	S("#combobox8a").exists();
	S("#combobox8a").visible();		
	
	S("#fixture8a").type("[home]2");
	S("#selectItem").click();	
	
	S("#clearSelection").click();
	
	S("#combobox8a").find("input[type=text]").val("");
	
	S("#combobox8b_log").html(/NULL/);	
});

/*
 *  8h Tests that if .hideItem(value) api is called 
 *  the item corresponding to the passed value is now hidden.
 */
test("8h Tests that if .hideItem(value) api is called the item corresponding to the passed value is now hidden.", function() {
	
	S("#combobox8a").exists();
	S("#combobox8a").visible();		
	
	S("#fixture8a").type("[home]4");
	S("#hideItem").click();	
	
	S("#combobox8a").find("input[type=text]").click();
	
	S("#combobox8a_dropdown").visible();
	S("#combobox8a_dropdown .dropdown_6").visible();
	S("#combobox8a_dropdown .dropdown_5").invisible();
});

/*
 *  8i Tests that if .showItem(value) api is called 
 *  the item corresponding to the passed value is now visible.
 */
test("8i Tests that if .showItem(value) api is called the item corresponding to the passed value is now visible.", function() {	
	//S("html").click();
	
	S("#showItem").click();	
	
	S("#combobox8a").find("input[type=text]").click();
	
	S("#combobox8a_dropdown").visible();
	S("#combobox8a_dropdown .dropdown_6").visible();
	S("#combobox8a_dropdown .dropdown_5").visible();
});

/*
 *  8j Tests that if .disable(value) api is called 
 *  the item corresponding value can't be selected by clicking on it.
 */
test("8j Tests that if .disable(value) api is called the item corresponding value can't be selected by clicking on it.", function() {	
	S("#combobox8a").exists();
	S("#combobox8a").visible();		
	
	S("#fixture8a").type("1");
	S("#disable").click();	
	
	S("#combobox8a").find("input[type=text]").click();
	
	// let the dropdown open with full height
	S("#combobox8a_dropdown").visible();
	S("#combobox8a_dropdown .dropdown_6").visible();
	
	S("#combobox8a_dropdown .dropdown_2").hasClass("disabled");	
});

/*
 * 8l Tests that if .enable(value) api is called 
 * the item corresponding value can be selected by clicking on it.
 */
test("8l Tests that if .enable(value) api is called the item corresponding value can be selected by clicking on it.", function() {	
	S("#combobox8a").exists();
	S("#combobox8a").visible();		
	
	S("#fixture8a").type("1");
	S("#enable").click();	
	
	S("#combobox8a").find("input[type=text]").click();
	
	// let the dropdown open with full height
	S("#combobox8a_dropdown").visible();
	S("#combobox8a_dropdown .dropdown_6").visible();
	
	S("#combobox8a_dropdown .dropdown_2").hasClass("disabled", false);		
});

