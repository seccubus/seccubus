module("funcunit-syn integration")


test("Type and slow Click", function(){
	S.open("//funcunit/test/myapp.html", null, 10000);
	
	S("#typehere").type("javascriptmvc", function(){
		equals(S("#seewhatyoutyped").text(), "typed javascriptmvc","typing");
	})
	
	S("#copy").click(function(){
		equals(S("#seewhatyoutyped").text(), "copied javascriptmvc","copy");
	});
})

test("Nested actions", function(){
	S.open("//funcunit/test/myapp.html", null, 10000);
	
	S("#typehere").exists(function(){
		this.type("javascriptmvc", function(){
			equals(S("#seewhatyoutyped").text(), "typed javascriptmvc","typing");
		})
		S("#copy").click(function(){
			equals(S("#seewhatyoutyped").text(), "copied javascriptmvc","copy");
		});
	})
})

test("Move To", function(){
	S.open("//funcunit/test/drag.html", null, 10000);
	S("#start").move("#end")
	S("#typer").visible().type("javascriptmvc",function(){
		equals(S("#typer").val(), "javascriptmvc","move test worked correctly");
	})

})

test("Drag To", function(){
	S.open("//funcunit/test/drag.html", null, 10000);
	S("#drag").drag("#drop")
	S("#clicker").click(function(){
		equals(S(".status").text(), "dragged", 'drag worked correctly')
	})

})

test("RightClick", function(){
	S.open("//funcunit/test/myapp.html", null, 10000);
	S("#rightclick").rightClick()
	S(".rightclickResult").text("Right Clicked")

})