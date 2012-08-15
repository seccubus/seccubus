module("api8b test", { 
	setup: function(){
        S.open("//mxui/combobox/api8b.html");
	}
})

/*
 *  8. Combobox api tests:
 *  
 *  8k Tests that if enableNoSelection(value) is called with a value == null and the combobox has showNoSelection option == true
 *  then a "No Selection" item is made hidden.
 *    
 *  8m Tests that if enableNoSelection(value) is called with a value != null and the combobox has showNoSelection option == true
 *  then a "No Selection" item can be clicked by the user making the input box empty.
 */

/*
 *  8k Tests that if enableNoSelection(value) is called with a value == null and the combobox has showNoSelection option == true
 *  then a "No Selection" item is made hidden. 
 */
test("8k Tests that if enableNoSelection(value) is called with a value == null and the combobox has showNoSelection option == true then the 'No Selection' item is made hidden.", function() {
	
	S("#combobox8k").exists();
	S("#enableNoSelection").exists();
	
	S("#combobox8k").visible();
	S("#enableNoSelection").visible();	
	
	S("#combobox8k").find("input[type=text]").click();
	
	// let the dropdown open with full height
	S("#combobox8k_dropdown").visible();
	S("#combobox8k_dropdown .dropdown_6").visible();	
	
	S("#combobox8k_dropdown .dropdown_0").visible();
		
	S("#disableNoSelection").click();
	
	S("#combobox8k_dropdown .dropdown_0").invisible();	
});

/*
 *  8m Tests that if enableNoSelection(value) is called with a value != null and the combobox has showNoSelection option == true
 *  then the "No Selection" item can be clicked by the user making the input box empty. 
 */
test("8m Tests that if enableNoSelection(value) is called with a value != null and the combobox has showNoSelection option == true then the 'No Selection' item can be clicked by the user making the input box empty.", function() {
	
	S("#combobox8k").exists();
	S("#enableNoSelection").exists();
	
	S("#combobox8k").visible();
	S("#enableNoSelection").visible();	
		
	S("#enableNoSelection").click();
	
	S("#combobox8k").find("input[type=text]").click();
	
	S("#combobox8k_dropdown").visible();
	S("#combobox8k_dropdown .dropdown_6").visible();
	S("#combobox8k_dropdown .dropdown_0").visible();
	
	S("#combobox8k_dropdown .dropdown_0").click();
	
	S("#combobox8k_log").click();
	
	S("#combobox8k").find("input[type=text]").val("Click for options");
	
});
