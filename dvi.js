/* This is the Data View Interact library
 * Created to simplify MP activity
*/
var DVI  = ( function() {
	// Utility for IE array support:
	var indexOf = function(value) {
		if (typeof Array.prototype.indexOf === 'function') {
			indexOf = Array.prototype.indexOf;
		} else {
			indexOf = function(value) {
				var i = -1, index = -1;
				for (i = 0; i < this.length; i++) {
					if (this[i] === value) {
						index = i;
						break;
					}
				}
				return index;
			};
		}
		return indexOf.call(this, value);
	};
	/* Data prototype
	 * Used to create the data holding objects:
	 * Constructor:
	 *   new Data(set_func, args)
	 *   where "set_func" is the backend communication function, and "args"
	 *   are any necessary arguments for the set_func function.
	 *   Note: "set_func" could be any function to set the data.
	 * Interface:
	 * 	 Data.data = gives direct access to the data object or array
	 *   Data.get(callback) = returns callback with stored data or data retreived from backend
	 *   Data.update(callback) = force updates data stored in object or array. Offers callback
	 *   Data.change(set_fun, args) = a method to change the Data object set function and arguments
	 *   Data.current = a property used to check status of data 'yes', 'no', 'pending'
	 *   Data.addView(name, updateView) = a method to attach function to update a view when data loads
	 *   Data.hasView(name) = checks if view is attached by name
	 *   Data.removeView(name) = removes an attached view by name
	 *   Data.clearViews = removes all attached views
	*/
	var Data = function(set_func, args) {
		this.data = {};
		this.set_func = set_func;
		this.args = (args || []);
		this.callback = [];
		this.views = {};
		this.current = 'no';
	};

	Data.prototype = {
		set: function() {
			try {
				var self = this;
				// Call setCallback after retreiving data
				function setCallback(response) {
					if (response !== undefined && response !== null) {
						self.data = response;
						self.current = 'yes';
					} else {
						throw new Error("No response from server.");
					}
					self.loadCallback();
				}
				// Push the callback function into arguments array
				var arguments = [];
				for (var i = 0; i < this.args.length; i++) {
					arguments.push(this.args[i]);
				}
				arguments.push(setCallback);
				// Get and set the data 
				this.set_func.apply(null, arguments);
			} catch(e) {
				console.log("Data setting error: " + e.message);
			}
		},

		update: function(callback) {
			this.current = 'pending';
			if (callback && typeof callback === "function")
				this.callback.push(callback);

			this.set();
		},

		get: function(callback) {
			if (this.current == 'yes')
				callback(this.data);
			else if (this.current == 'pending')
				this.callback.push(callback);
			else
				this.update(callback);
		},

		change: function(set_func, args) {
			this.set_func = (set_func || this.set_func);
			this.args = (args || this.args);
			this.update();
		},

		addView: function(name, view) {
			this.views[name] = view;
			// Auto update view
			if (this.current == 'yes')
				view(this.data);
			else if (this.current == 'pending')
				; // do nothing
			else
				this.update();
		},

		hasView: function(name) {
			return this.views.hasOwnProperty(name);
		},

		removeView: function(name) {
			delete this.views[name];
		},

		clearViews: function() {
			this.views = {};
		},

		loadCallback: function() {
			if (this.current == 'yes') {
				for (var view in this.views) {
					if (this.views.hasOwnProperty(view)) {
						try {
							this.views[view](this.data);
						} catch(e) {
							console.log("Error updating view: " + e.message);
						}
					}
				}
				for (var i = 0; i < this.callback.length; i++) {
					try {
						this.callback[i](this.data);
					} catch(e) {
						console.log("Error with callback function: " + e.message);
					}
				}
				this.callback = [];
			} else {
				console.log("Error updating data: " + self.data);
			}
		}
	};

	/* View prototype
	 * Used to create objects to update UI
	 * Constructor:
	 *   new View(name, update, Data)
	     where "name" is the name of the View, update is a function that updates the view,
	     and Data is an optional Data object to attach (see data.js)
	 * Interface:
	 *   View.attach(Data) = attaches a Data Object to the View
	 *   View.detach() = detaches the currently attached Data object, if any
	 *   Note: there is no protection against attaching more than one Data object :(
	 *   View.load(data, callback) = runs the update function with the optional data argument,
	 *   or the updated Data object attached. "callback" called after view udpate function (optional)
	 *   View.reload(callback) = just like load, but no option to input data manually.
	 *	 "callback" called after view udpate function (optional)
	*/
	var View = function(name, update, Data) {
		this.name = name;
		this.update = update;
		this.Data = {};
		if (Data)
			this.attach(Data);
	}

	View.prototype = {
		attach: function(Data) {
			try {
				Data.addView(this.name, this.update);
				this.Data = Data;
			} catch(e) {
				console.log("Error attaching Data object: " + e.message);
			}
		},

		detach: function() {
			try {
				this.Data.removeView(this.name);
			} catch(e) {
				console.log("Error detaching Data object: " + e.message);
			}
			this.Data = {};
		},

		load: function(data, callback) {
			if (data !== undefined && data !== null) {
				this.update(data);
				if (typeof callback === "function")
					callback(data);
			} else if (this.Data !== undefined && this.Data.update !== undefined) {
				this.Data.update(callback);
			} else {
				console.log("Error updating " + this.name + " view. No Data.");
			}
		},

		reload: function(callback) {
			this.load(null, callback);
		}
	};

	/* Interact prototype
	 * Used to easily link Data updates to form inputs
	 * Constructor:
	 *   new Interact(input, format_func, Data, init)
	 *   where "input" is a reference to the input element interface, and 
	 *   "format_func" is optional and may be used to process the raw value
	 *   of the input element.
	 * Interface:
	 *   Interact.attach(Data, format_func) = attaches a Data object to change in the
	 *   event of this.input value change. format_func may modify input value.
	 *   Interact.detach(Data) = detaches the Data object.
	*/
	var Interact = function(input, Data, format_func, init) {
		this.id = "dvi_"+(new Date().getTime());
		this.input = input;
		this.Data = {};
		this.format = function() {}; // For non-jQuery
		this.handler = function() {}; // For non-jQuery
		if (format_func !== undefined && format_func !== null)
			this.format_func = format_func;
		else
			this.format_func = function(input) { return input; };
		if (Data) {
			init = init || false;
			this.attach(Data, this.format_func, init);
		}
	};

	Interact.prototype = {
		attach: function(Data, format_func, init) {
			this.format = format_func || this.format_func;
			init = init || false;
			var _this = this;
			this.handler = function() {
				// Make sure value is an array
				var value = _this.value();
				if (value instanceof Array)
					Data.change(null, value);
				else
					Data.change(null, [value]);
			};
			// Use jQuery if available
			if (typeof $ !== "undefined" && typeof $.fn.change === "function") {
				$(this.input).bind("change."+this.id, function() {
					var value = null;
					var type = $(this).prop('type');
					if (type == 'radio' || type == 'checkbox') {
						value = $(_this.input).filter(':checked').val();
					} else {
						value = $(this).val();
					}
					if (!$.isArray(value))
						value = [value];
					Data.change(null, _this.format(value));
				});
				// Initialize with current value
				if (init == true)
					$(this.input).trigger("change."+this.id);
			} else {
				console.log('DVI: jQuery not found.');
				// Cross browser add event function
				function addEvent(node, event, handler) {
					if (typeof node.addEventListener === "function")
						node.addEventListener(event, handler, false);
					else
						node.attachEvent("on"+event, handler);
				}
				if (indexOf.call(this.clicks, this.findType(this.input)) > 0) {
					addEvent(this.input, "click", this.handler);
				} else {
					addEvent(this.input, "keyup", this.handler);
				}
				// Initialize with current value
				if (init == true)
					Data.change(null, _this.value());
			}
		},

		detach: function(Data) {
			// Use jQuery if available
			if (typeof $ !== "undefined" && typeof $.fn.change === "function") {
				$(this.input).unbind("change."+this.id);
			} else {
				// Cross browser remove event function
				function removeEvent(node, event, handler) {
					if (typeof node.removeEventListener === "function")
						node.removeEventListener(event, handler, false);
					else
						node.detachEvent("on"+event, handler);
				}
				if (indexOf.call(this.clicks, this.findType(this.input)) > 0) {
					removeEvent(this.input, "click", this.handler);
				} else {
					removeEvent(this.input, "keyup", this.handler);
				}
				
			}
		},

		clicks: ["radio", "checkbox", "select-one", "select-multiple"],

		value: function() {
			return this.format(this.getValue(this.input));
		},

		getValue: function(el) {
			var _return = undefined;
			switch (this.findType(el)) {
				case "text":
					_return = el.value;
					break;
				case "hidden":
					_return = el.value;
					break;
				case "password":
					_return = el.value;
					break;
				case "textarea":
					_return = el.value;
					break;
				case "select-one":
					_return = el.options[el.selectedIndex].value;
					break;
				case "select-multiple":
					var value = new Array();
					for (var i = 0; i < el.options.length; i++) {
						if (el.options[i].selected)
							value.push(el.options[i].value);
					}
					_return = value;
					break;
				case "radio":
					var value = new Array();
					for (var i = 0; i < el.length; i++) {
						if (el[i].checked)
							value.push(el[i].value);
					}
					_return = value;
					break;
				case "checkbox":
					var value = new Array();
					for (var i = 0; i < el.length; i++) {
						if (el[i].checked)
							value.push(el[i].value);
					}
					_return = value;
					break;
				default:
					_return = el.value;
					break;
			}
			return _return;
		},

		findType: function(el) {
			if (el.length !== undefined) {
				if (el.type !== undefined) // a select field
					return el.type;
				else
					el = el[0];
			}
			var tagType = el.tagName.toLowerCase();

			if (tagType = "input")
				return el.type.toLowerCase();
			else
				return tagType;
		}
	};

	return {
		data: Data,
		view: View,
		interact: Interact
	};
})();