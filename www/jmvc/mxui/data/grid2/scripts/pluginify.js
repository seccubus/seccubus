load('steal/rhino/rhino.js')

steal('//steal/build/pluginify/pluginify', function(s){
	steal.build.pluginify("mxui/grid",{
		nojquery: true,
		destination: "mxui/grid/scripts/standalone/grid.js",
		exclude : ["jquery","filler.js"]
	})
})

steal('//steal/build/pluginify/pluginify', function(s){
	steal.build.pluginify("mxui/filler",{
		nojquery: true,
		destination: "mxui/grid/scripts/standalone/filler.js",
		exclude : ["jquery"]
	})
})
/*
steal('//steal/build/pluginify/pluginify', function(s){
	steal.build.pluginify("mxui/resizable",{
		nojquery: true,
		destination: "mxui/grid/scripts/standalone/resizable.js",
	})
})*/