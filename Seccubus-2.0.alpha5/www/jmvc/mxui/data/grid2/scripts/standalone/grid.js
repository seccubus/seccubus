(function($){
		var div = $('<div id="out"><div style="height:200px;"></div></div>').css({
				position: "absolute",
				top: "0px",
				left: "0px",
				visibility: "hidden",
				width: "100px",
				height: "100px",
				overflow: "hidden"
			}).appendTo(document.body),
			inner = $(div[0].childNodes[0]),
			w1 = inner[0].offsetWidth,
			w2;

		div.css("overflow","scroll");
		//inner.css("width","100%"); //have to set this here for chrome
		var w2 = inner[0].offsetWidth;		
		if (w2 == w1) {
			inner.css("width", "100%"); //have to set this here for chrome
			w2 = inner[0].offsetWidth;
		}
		div.remove();
		(window.Mxui || (window.Mxui = {}) ).scrollbarWidth = w1 - w2;
})(jQuery);
(function( $ ) {
	/** 
	 * Grid is a plugin that provides a configurable data grid.  It accepts a 
	 * JavaScriptMVC Model as a parameter, using the Model API to get the data 
	 * that fills in the grid.  It supports paging through limit/offset parameters, 
	 * sorting, grouping, and customizeable layout.
	 * 
	 * @codestart
	    $(".grid").phui_filler().mxui_grid({
	        model: Resource,
	        limit: 100,
	        offset: 0
		})
	 * @codeend
	 * 
	 * # Params
	 *  
	 * Grid accepts an object of optional parameters.  
	 * 
	 * - *columns* 
	 * 
	 *  A list of column headers that will be displayed in this grid:
	 *  
	 *  @codestart
	 *  columns: {
	 *  	id: "ID",
	 *      title: "Title",
	 *      collection: "Collection",
	 *      mediaType: "Media Type"
	 *  }
	 *  @codeend
	 *  
	 *  The key of the key-value pair determines the internal name of the column, and the name of the attribute 
	 *  used from the model instances displayed (each model instance should have a mediaType attribute in the 
	 *  example above).  The value of the key-value is the column title displayed. 
	 *  
	 * - *limit*
	 * 
	 *  Used for pagination.  This is the number of items per page.  This is used to calculate offset and which page you're on.
	 *  
	 * - *offset*
	 * 
	 * Used internally for pagination.  Setting a non-zero offset means the first page loaded will start at whatever you set.
	 * 
	 * - *order*
	 * 
	 * An array that determines the initial sorting of the table.
	 * 
	 * @codestart
	 * order: ["name asc"]
	 * @codeend
	 * 
	 * This would sort the grid by name ascending.  A second value in the array would be passed to break sorting ties. 
	 * These values are sent to the service, which is assumed to have support for sorting.
	 * 
	 * - *model*
	 * 
	 * The Model class which will be used to request data for this grid.  This model is assumed to have 
	 * at least a findAll method and attributes that correspond to each column.  The service the model interacts with 
	 * is assumed to support ordering and limit/offset if paging is used.  You pass any model like this:
	 * 
	 * @codestart
	 * model: Resource
	 * @codeend
	 * 
	 * and define a findAll like this:
	 * 
	 * @codestart
	 * $.Model.extend("Resource",{
					findAll : function(params, success, error){
						$.ajax({
				            url: '/resource',
				            type: 'get',
				            dataType: 'json',
				            data: params,
				            success: this.callback(['wrapMany',success]),
							error: error,
				        })
					}
				},{})
		@codeend
	 *  
	 * - *hoverClass*
	 * 
	 * A class that is added to each table row element as it is moused over.
	 * 
	 * - *renderer*
	 * 
	 * Provide a renderer function to override what each row looks like.  By default gris/views/row.ejs is used.
	 * 
	 * - *render*
	 * 
	 * A key-value pair of column names and functions.  By default each column is rendered as whatever data 
	 * each model instance has for this attribute.  If a column name is listed in this 
	 * parameter, the function given is used to render the HTML for this attribute.  For example:
	 * 
	 * @codestart
	 * render: {
            icon: function (community) {
                if (community.isHot && community.hasNewPosts) {
                    return "<div class='communityfolder newhot' />"
                }
                if (community.isHot) return "<div class='communityfolder hot' />";
                if (community.hasNewPosts) return "<div class='communityfolder new' />";

                return "<div class='communityfolder topicfolder' />";
            },
            name: function (community) {
                return "<a href='#community/show&id=" + community.id + "'>" + community.name + "</a>"
            }
        }
	   @codeend
	   
	 * The icon columns would be rendered using the HTML generated in the icon function above.  Each 
	 * function is passed a model instance as a parameter. 
	 * 
	 * - *noItems*
	 * 
	 * The text rendered if there are no items to be shown in the grid.
	 * 
	 * - *params*
	 * 
	 * Extra parameters that are passed to each service request.  For example, if your grid contains data about 
	 * a certain forum with a forum ID that must be passed into each request, provide that here.
	 * 
	 * @codestart
	 * params: { forumId: forum.id }
	 * @codeend
	 * 
	 * # Events
	 * 
	 * The grid triggers jQuery synthetic events that can be used to notify you of changes of state in the grid.  
	 * 
	 * - *Resize*
	 * 
	 * Used when the columns need to be readjusted, such as after a row is replaced.
	 * 
	 * - *Paginate*
	 * 
	 * Paginators trigger a paginate event when a user clicks a page button (next or previous).  The 
	 * grid listens to these events to dispatch another request for more data.
	 * 
	 * - *Updating*
	 * 
	 * This event is triggered when the grid is requesting new data and about to reload itself.
	 * 
	 * - *Updated*
	 * 
	 * This event is triggered when all data has been found and the new grid has been rendered.
	 * 
	 * # Customizing style
	 * 
	 * To customize the style of a new grid (besides using your own CSS), you should use your own renderer and render 
	 * functions.  As described in the params section above, the renderer function is a method that renders each row.  
	 * To customize how a certain type of cell in the grid looks, add a render method for that cell. 
	 * 
	 * # Model Layer
	 * 
	 * Each grid is passed a single model class.  This model must provide a findAll method.  This findAll method is called 
	 * directly, and its assumed that the response will contain raw JSON data that will be turned into model instances, which 
	 * the grid renders as rows.
	 * 
	 * # Service Layer
	 * 
	 * The service layer will have to implement a REST service with parameters that match those of the grid.  If paging is used, 
	 * limit and offset will need to be supported.  For sorting, your service will accept an array of sort types.  The first item in 
	 * the array is the highest priority sort.  Each item contains a string with the field name and direction, like "name asc".
	 * 
	 * Any other parameters can be supported also, and these will need to be provided in the form of options.params.
	 * 
	 * # Filtering
	 * 
	 * To perform server side filtering on an existing grid control, use the update method.  You'll have to pass in any 
	 * parameters you want to use in your filtering, which will get passed directly through to your service request.  The 
	 * grid will then re-render itself with the results.  For example:
	 * 
	 * @codestart
	 * controller.update({params: {"mediatype": "audio"}})
	 * @codeend
	 * 
	 * # Pagination
	 * To build pagination into your grid, there is a grid pagination plugin, phui/grid/paginated.  Include 
	 * this plugin and pass in the grid and paginator you'll use: 
	 *     
	 * @codestart
    $(".grid").phui_filler().mxui_grid_paginated({
        paginatorType: Mxui.Paginator.Page,
        gridType: Mxui.Grid
	})
	 * @codeend
	 *
	 * This plugin simply renders a footer with pagination links and triggers 
	 * pagination events, which the grid uses to request more data and render the grid. 
	 * You can provide your own pagination by doing something similar:
	 * 
	 * @codestart
		var to = {
			offset: this.options.offset+ this.options.limit,
			count: this.options.count,
			limit: this.options.limit
		}
		this.element.trigger("paginate", to)
	 * @codeend
	 */
	$.Controller.extend("Mxui.Grid", {
		defaults: {
			columns: null,
			limit: null,
			offset: null,
			order: [],
			group: [],
			model: null,
			hoverClass: "hover",
			//paginatorType: Mxui.Paginator.Page,
			renderer: function( inst, options, i, items ) {
				return $.View("//mxui/grid/views/row", {
					item: inst,
					options: options,
					i: i,
					items: items
				})
			},
			noItems: "No Items Found."
		},
		listensTo: ["paginate"]

	}, {
		init: function() {
			//make the request ....
			//this.options.model.findAll(this.params(), this.callback('found'));
			this.element.addClass("grid")
			this.element.html("//mxui/grid/views/init", this);

			//save references to important internals to avoid queries
			this.cached = {
				body: this.element.children('.body'),
				header: this.element.children(".header"),
				footer: this.element.children(".footer")
			}
			this.cached.innerBody = this.cached.body.find('div.innerBody');
			this.cached.table = this.cached.body.find('table');
			this.cached.tbody = this.cached.body.find('tbody');
			this.cached.innerBody.mxui_filler({
				parent: this.element
			})
			this.findAll();
			//draw basic....
			this.widths = {};

			this.bind(this.cached.body.children().eq(0), "scroll", "bodyScroll")
			this.delegate(this.cached.header.find('tr'), "th", "mousemove", "th_mousemove");

			//

			//this.paginator().mixin(this.options.paginatorType);
			this.element.parent().trigger('resize');
		},
		windowresize: function() {
			var body = this.cached.body,
				header = this.cached.header,
				hideHead = header.is(':visible');
			body.hide();
			if ( hideHead ) {
				header.hide();
			}
			var footer = this.cached.footer.width(),
				scrollbarWidth = Mxui.scrollbarWidth;
			var table = body.find('table').width(footer > scrollbarWidth ? footer - scrollbarWidth : scrollbarWidth);
			body.children().eq(0).width(footer > scrollbarWidth ? footer : scrollbarWidth);
			header.width(footer > scrollbarWidth ? footer : scrollbarWidth);
			body.show();
			if ( hideHead ) {
				header.show();
			}
			if ( table.height() < body.height() ) {
				table.width(footer > 0 ? footer : scrollbarWidth)
			}
		},
		/**
		 * Listens for page events
		 * @param {Object} el
		 * @param {Object} ev
		 * @param {Object} data
		 */
		paginate: function( el, ev, data ) {
			if ( typeof data.offset == "number" && this.options.offset != data.offset ) {
				data.offset = Math.min(data.offset, Math.floor(this.options.count / this.options.limit) * this.options.limit)

				this.options.offset = data.offset;
				//update paginators
				this.findAll();
			}
		},
		".pagenumber keypress": function( el, ev ) {
			if ( ev.charCode && !/\d/.test(String.fromCharCode(ev.charCode)) ) {
				ev.preventDefault()
			}
		},
		".pageinput form submit": function( el, ev ) {
			ev.preventDefault();
			var page = parseInt(el.find('input').val(), 10) - 1,
				offset = page * this.options.limit;

			this.element.trigger("paginate", {
				offset: offset
			})
		},
		findAll: function() {
			this.element.trigger("updating")
			this.cached.tbody.html("<tr><td>Loading ...<td></tr>")
			this.options.model.findAll(this.params(), this.callback('found'));
		},
		found: function( items ) {
			this.options.count = items.count;
			if (!items.length ) {
				this.cached.header.hide();
				this.element.trigger("updated", {
					params: this.params(),
					items: items
				})
				var ib = this.cached.innerBody;
				this.cached.table.hide();
				ib.append("<div class='noitems'>" + this.options.noItems + "</div>")
				ib.trigger('resize');
				return;
			}


			if (!this.options.columns ) {
				var columns = (this.options.columns = {})
				$.each(this.options.model.attributes, function( name, type ) {
					if ( name != "id" ) columns[name] = $.String.capitalize(name)
				})
			}
			var body = this.cached.innerBody,
				table = this.cached.table,
				tbody = this.cached.tbody;
			table.children("col").remove();
			//draw column with set widths
			table.prepend('//mxui/grid/views/columns', {
				columns: this.options.columns,
				widths: this.widths,
				group: this.group
			})
			var tbody = tbody.html('//mxui/grid/views/body', {
				options: this.options,
				items: items
			})

			tbody.find("tr.spacing").children("th").each(function() {
				var $td = $(this),
					$spacer = $td.children().eq(0),
					width = $spacer.outerWidth(),
					height = $spacer.outerHeight();
				$td.css({
					padding: 0,
					margin: 0
				})
				$spacer.outerWidth(width + 2).css("float", "none").html("").height(1)
			})

			this.element.trigger("updated", {
				params: this.params(),
				items: items
			})

			//do columns ...
			this.cached.header.find("tr").html('//mxui/grid/views/header', this);
			tbody.trigger("resize")
			setTimeout(this.callback('sizeTitle'), 1)
		},
		sizeTitle: function() {
			var body = this.cached.body,
				firstWidths = this.cached.tbody.find("tr:first").children().map(function() {
					return $(this).outerWidth()
				}),
				header = this.cached.header,
				title = this.cached.header.find("th");


			for ( var i = 0; i < title.length - 1; i++ ) {
				title.eq(i).outerWidth(firstWidths[i]);
			}
			header.find("table").width(body.find("table").width() + 40) //extra padding for scrollbar
			this.titleSized = true;
		},
		/**
		 * This method is used to determine which parameters are passed to the model layer, and then to the service.
		 * This includes anything passed in as params in addition to order, offset, limit, group, and count.
		 */
		params: function() {
			return $.extend({}, this.options.params, {
				order: this.options.order,
				offset: this.options.offset,
				limit: this.options.limit,
				group: this.options.group,
				count: this.options.count
			})
		},
		resize: function() {
			this.cached.innerBody.height(0)
			if ( this.titleSized ) {
				setTimeout(this.callback('sizeTitle'), 1)
			} else {
				setTimeout(this.callback('windowresize'), 1)
			}
		},
		bodyScroll: function( el, ev ) {
			this.element.children(":first").scrollLeft(el.scrollLeft())
		},
		"th mouseenter": function( el ) {
			el.addClass("hover")
		},
		"th mouseleave": function( el ) {
			el.removeClass("hover")
		},
		"th click": function( el, ev ) {

			var attr = el[0].className.match(/([^ ]+)-column-header/)[1];
			var sort = el.hasClass("sort-asc") ? "desc" : "asc"
			//see if we might already have something with this
			var i = 0;
			while ( i < this.options.order.length ) {
				if ( this.options.order[i].indexOf(attr + " ") == 0 ) {
					this.options.order.splice(i, 1)
				} else {
					i++;
				}
			}
			if (!el.hasClass("sort-desc") ) { // otherwise reset this column's search
				this.options.order.unshift(attr + " " + sort)
			}
			this.findAll();
		},
		"th dragdown": function( el, ev, drag ) {
			if ( this.isMouseOnRight(el, ev, 2) ) {
				var resize = $("<div id='column-resizer'/>").appendTo(document.body).addClass("column-resizer");
				var offset = el.offset();

				resize.height(this.element.children(".body").outerHeight() + el.outerHeight()).outerWidth(el.outerWidth());
				resize.css(offset)
				ev.preventDefault();
				//prevent others from dragging
			} else {
				drag.cancel();
			}
		},
		"th dragmove": function( el, ev, drag ) {
			ev.preventDefault();
			var width = ev.vector().minus(el.offsetv()).left();

			if ( width > el.find("span:first").outerWidth() ) $("#column-resizer").width(width)
		},
		"th dragend": function( el, ev, drag ) {
			ev.preventDefault();
			var width = ev.vector().minus(el.offsetv()).left(),
				attr = el[0].className.match(/([^ ]+)-column-header/)[1],
				cg;
			if ( width > el.find("span:first").outerWidth() ) cg = this.element.find("col:eq(" + el.index() + ")").outerWidth(width)
			else {
				cg = this.element.find("col:eq(" + el.index() + ")").outerWidth(el.find("span:first").outerWidth())
			}
			this.widths[attr] = cg.width();
			setTimeout(this.callback('sizeTitle'), 1)
			$("#column-resizer").remove();
		},
		th_mousemove: function( el, ev ) {
			if ( this.isMouseOnRight(el, ev) ) {
				el.css("cursor", "e-resize")
			} else {
				el.css("cursor", "")
			}
		},
		isMouseOnRight: function( el, ev, extra ) {
			return el.offset().left + el.outerWidth() - 8 - (extra || 0) < ev.vector().left()
		},
		sortedClass: function( attr ) {
			var i = 0;
			for ( var i = 0; i < this.options.order.length; i++ ) {
				if ( this.options.order[i].indexOf(attr + " ") == 0 ) {
					return "sort-" + this.options.order[i].split(" ")[1]
				}
			}
			return "";
		},
		/**
		 * Used to replace the contents of one row with a more up to date model instance.
		 * @codestart
		 * this.find('.grid').controller(Mxui.Grid).replace(msgEl, message)
		 * @codeend
		 * @param {HTMLElement} el The tr element that is being updated
		 * @param {Object} message The new model instance to use for rendering the replacement row
		 */
		replace: function( el, message ) {
			var html = this._renderMessages([message]);
			el.replaceWith(html.join(''));
			this.element.trigger('resize');
		},
		/**
		 * Used to insert rows into an existing grid.  They are ad
		 * @param {HTMLElement} el The new rows are added after this element.
		 * @param {Array} messages The array of model instances.  Each instance is used to render a new row.
		 */
		insert: function( el, messages, fadeIn ) {
			var noitems = this.find('.noitems')
			if ( noitems.length ) {
				noitems.remove();
				this.cached.header.find("tr").html('//mxui/grid/views/header', this);
				var tbl = this.find('.innerBody table').show();
				return this.found(messages)
			}
			var html = this._renderMessages(messages),
				els = $(html.join(''));
			if ( el.length ) el.after(els);
			else {
				(tbl ? tbl.children('tbody') : this.find('.innerBody tbody')).html(els)
			}
			els.hide().fadeIn();
			this.windowresize();
			this.element.trigger('resize');
		},
		_renderMessages: function( items ) {
			var html = [],
				i, item;
			var options = $.extend(true, {}, this.options, {
				renderPartial: true
			})
			for ( i = 0; i < items.length; i++ ) {
				item = items[i]
				html.push(this.options.renderer(item, options, i, items))
			}
			return html;
		},
		/**
		 * This method is used to induce a reload of all the data in the grid.  You could use update to 
		 * perform filtering by passing additional params into the options.  For example:
		 * 
		 * @codestart
		 * controller.update({params: {"mediatype": "audio"}})
		 * @codeend
		 * 
		 * @param {Object} options any additional options passed in here will extend the controller's options object
		 */
		update: function( options ) {
			$.extend(this.options, options)
			this.findAll();
		},
		"tr mouseenter": function( el, ev ) {
			el.addClass(this.options.hoverClass);
		},
		"tr mouseleave": function( el, ev ) {
			el.removeClass(this.options.hoverClass);
		},
		destroy: function() {
			delete this.cached
			this._super()

		}
	})

})(jQuery)