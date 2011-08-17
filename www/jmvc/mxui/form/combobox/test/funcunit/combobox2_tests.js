module("combobox2 test", { 
	setup: function(){
        S.open("//mxui/combobox/combobox2.html");
	}
})

/*
 *  Combobox positioning tests:
 *  
 *  1. Combobox appended to document
 *  2. Combobox appended to <div> - <div> is not positioned
 *  3. Combobox appended to <div> - <div> is positioned (absolute)
 *  4. Combobox appended to iframe
 *  5. Combobox appended to <div> inside iframe - <div> is not positioned
 *  6. Combobox appended to <div> inside iframe - <div> is positioned (absolute)
 */

/*
 *  1. Tests if dropdown opens in the correct position if
 *  the combobox is appended to the document.
 */
test("Test if dropdown opens in the correct position - combobox appended to the document.", function() {
	
	S("#combobox1").exists();
	
	var comboOuterHeight = S("#combobox1").outerHeight(),
		comboOffset = S("#combobox1").offset(),
		comboBottom = comboOffset.top + comboOuterHeight;
		
	S("#combobox1").find("input[type=text]").click();
	S("#combobox1_dropdown").visible();
	S("#combobox1_dropdown").offset( function(offset) {
		return offset.top === comboBottom;
	});
	
});

/*
 *  2. Tests if dropdown opens in the correct position if
 *  the combobox is appended to a non-positioned <div>.
 */
test("Test if dropdown opens in the correct position - combobox appended to non-positioned &lt;div&gt;.", function() {
	
	S("#combobox2").exists();
	
	var comboOuterHeight = S("#combobox2").outerHeight(),
		comboOffset = S("#combobox2").offset(),
		comboBottom = comboOffset.top + comboOuterHeight;
		
	S("#combobox2").find("input[type=text]").click();
	S("#combobox2_dropdown").visible();
	S("#combobox2_dropdown").offset( function(offset) {
		return offset.top === comboBottom;
	});
	
});

/*
 *  3. Tests if dropdown opens in the correct position if
 *  the combobox is appended to a positioned (absolute) <div>.
 */
test("Tests if dropdown opens in the correct position - combobox appended to positioned (absolute) &lt;div&gt;.", function() {
	
	S("#combobox3").exists();
	
	var comboOuterHeight = S("#combobox3").outerHeight(),
		comboOffset = S("#combobox3").offset(),
		comboBottom = comboOffset.top + comboOuterHeight;
		
	S("#combobox3").find("input[type=text]").click();
	S("#combobox3_dropdown").visible();
	S("#combobox3_dropdown").offset( function(offset) {
		return offset.top === comboBottom;
	});
	
});

/*
 *  4. Tests if dropdown opens in the correct position if
 *  its appended to an iframe.
 */
test("Tests if dropdown opens in the correct position - combobox appended to an iframe.", function() {
	
	S("#combobox1", 0).exists();
	
	var comboOuterHeight = S("#combobox1", 0).outerHeight(),
		comboOffset = S("#combobox1", 0).offset(),
		comboBottom = comboOffset.top + comboOuterHeight;
		
	S("#combobox1", 0).find("input[type=text]").click();
	S("#combobox1_dropdown", 0).visible();
	S("#combobox1_dropdown", 0).offset( function(offset) {
		return offset.top === comboBottom;
	});
	
});

/*
 *  5. Tests if dropdowns opens in correct position if 
 *  its appended to <div> inside iframe - <div> is not positioned
 */
test("Tests if dropdown opens in the correct position - combobox appended to &lt;div&gt; inside an iframe - &lt;div&gt; is not positioned.", function() {
	
	S("#combobox2", 0).exists();
	
	var comboOuterHeight = S("#combobox2", 0).outerHeight(),
		comboOffset = S("#combobox2", 0).offset(),
		comboBottom = comboOffset.top + comboOuterHeight;
		
	S("#combobox2", 0).find("input[type=text]").click();
	S("#combobox2_dropdown", 0).visible();
	S("#combobox2_dropdown", 0).offset( function(offset) {
		return offset.top === comboBottom;
	});
	
});

/*
 *  6. Tests if dropdowns opens in correct position if
 *  it appends to <div> and <div> is positioned (absolute).
 */
test("Tests if dropdown opens in the correct position - combobox appended to &lt;div&gt; inside an iframe - &lt;div&gt; is not positioned.", function() {
	
	S("#combobox3", 0).exists();
	
	var comboOuterHeight = S("#combobox3", 0).outerHeight(),
		comboOffset = S("#combobox3", 0).offset(),
		comboBottom = comboOffset.top + comboOuterHeight;
		
	S("#combobox3", 0).find("input[type=text]").click();
	S("#combobox3_dropdown", 0).visible();
	S("#combobox3_dropdown", 0).offset( function(offset) {
		return offset.top === comboBottom;
	});
	
});

