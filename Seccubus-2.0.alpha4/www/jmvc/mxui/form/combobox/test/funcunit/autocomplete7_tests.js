module("autocomplete7 test", { 
	setup: function(){
        S.open("//mxui/combobox/autocomplete7.html");
	}
})

/*
 * 7. Combobox autocomplete tests:
 *  
 *  7a Tests that if item with lowercase text is searched by keying the first character capitalized, the item shows up in the filtered list.
 *  7b Tests that if item is searched by keying an item's character other than first, the item does not show on the filtered list.
 *  7c Tests that if the item's text is more than one word, and if the second word's first character is typed, the item shows on the filtered list.
 */

/*
 *  7a Tests that if item with lowercase text is searched by keying the first character capitalized, 
 *  the item shows up in the filtered list.  
 */
test("7a Tests that if item with lowercase text is searched by keying the first character capitalized, the item shows up in the filtered list.", function() {
	
	S("#combobox7a").exists();
	
	S("#combobox7a").visible();
		
	S("#combobox7a").find("input[type=text]").type("[home]Item3");
	
	S("#combobox7a_dropdown").visible();
	
	// make sure dropdown's item3 is visible
	S("#combobox7a_dropdown:contains('item3 text3')").visible();		
	S("#combobox7a_dropdown:contains('No items available')").invisible();
	
});

/*
 *  7b Tests that if item is searched by keying an item's character other than first, 
 *  the item does not show on the filtered list.   
 */
test("7b Tests that if item is searched by keying an item's character other than first, the item does not show on the filtered list.", function() {
	
	S("#combobox7a").exists();
	
	S("#combobox7a").visible();
		
	S("#combobox7a").find("input[type=text]").type("[home]tem0");
	
	S("#combobox7a_dropdown").visible();
	
	// make sure dropdown's "No items available" is visible
	S("#combobox7a_dropdown:contains('No items available')").visible();

	
});

/*
 *  7c Tests that if the item's text is more than one word, 
 *  and if the second word's first character is typed, 
 *  the item shows on the filtered list.    
 */
test("7c Tests that if the item's text is more than one word, and if the second word's first character is typed, the item shows on the filtered list.", function() {
	
	S("#combobox7a").exists();
	
	S("#combobox7a").visible();
		
	S("#combobox7a").find("input[type=text]").type("[home]Text3");
	
	S("#combobox7a_dropdown").visible();
	
	// make sure dropdown's "No items available" is visible
	S("#combobox7a_dropdown:contains('item3 text3')").visible();
	S("#combobox7a_dropdown:contains('No items available')").invisible();

	
});
