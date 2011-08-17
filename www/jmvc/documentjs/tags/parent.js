steal.then(function() {
	(function() {
		var waiting = {}

		/**
		 * @class DocumentJS.tags.parent
		 * @tag documentation
		 * @parent DocumentJS.tags 
		 * 
		 * Says under which parent the current type should be located.
		 * 
		 * ###Example:
		 * 
		 * @codestart
		 * /**
		 *  * @constructor jQuery.Drag
		 *  * @parent specialevents
		 *  * ...
		 *  *|
		 *  $.Drag = function(){}
		 * @codeend
		 * 
		 * ###End Result:
		 * 
		 * @image jmvc/images/parent_tag_example.png
		 */
		DocumentJS.tags.parent = {
			add: function( line ) {
				var m = line.match(/^\s*@parent\s*([\w\.\/\$]*)\s*([\w]*)/)
				var name = m[1],
					Class = DocumentJS.Page,
					inst = DocumentJS.objects[name]

					if (!inst ) {
						inst = DocumentJS.objects[name] = {
							name: name
						}
					}
					if (!this.parents ) {
						this.parents = [];
					}
					this.parents.push(inst.name);

				if (!inst.children ) {
					inst.children = [];
				}
				inst.children.push(this.name)
			}
		};

	})();
})