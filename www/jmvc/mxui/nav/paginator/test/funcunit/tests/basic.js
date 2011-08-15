module("paginator test")

test("Copy Test", function(){
        S.open("paginator.html");
		S("#typehere").type("javascriptmvc")
		
		S("#seewhatyoutyped").text(function(val){
			equals(val, "typed javascriptmvc","typing");
		})
		S("#copy").click();
		S("#seewhatyoutyped").text(function(val){
			equals(val, "copied javascriptmvc","copy");
		})

})