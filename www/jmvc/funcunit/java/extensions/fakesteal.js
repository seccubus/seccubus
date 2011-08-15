steal = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] == "function") {
            arguments[i](jQuery);
        }
    }

    return steal;
};

steal.then = steal;

steal.dev = function () { };