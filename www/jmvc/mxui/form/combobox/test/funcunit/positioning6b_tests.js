module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning6b.html");
	}
})

/*
 *  6. Combobox positioning tests - Combobox appended to scrollable element:
 *  
 *  6a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  6b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  6c Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  6d Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  6b Tests that if the element can be positioned with scrolling greater than min height, 
 *  the dropdown opens bellow with height equal the space available. 
 */
test("6b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.", function() {
	
	S("#combobox6b").exists();
	
	S("#combobox6b").visible();	
	
	var comboOffset = S("#combobox6b").offset(),
		comboTop = comboOffset.top,
		comboBottom = comboTop + S("#combobox6b").outerHeight(),
		containerOuterHeight = S("#container").outerHeight(),
		containerBottom = S("#container").offset().top + containerOuterHeight;
		
	S("#combobox6b").find("input[type=text]").click();
	
	S("#combobox6b_dropdown").visible();	
			
	// make sure the dropdown position is right	
	S("#combobox6b_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(comboBottom - dropTop) < 1;
	});
	
	// make sure dropdown height fits space available bellow
	S("#combobox6b_dropdown").outerHeight( function(outerHeight) {
		var spaceAvailableBellow = containerBottom - comboBottom;		
		return Math.abs(outerHeight - spaceAvailableBellow) <= 1;
	} );
	
});


