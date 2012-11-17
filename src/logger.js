/**
 * User: Pavel Reznikov <pashka.reznikov@gmail.com>
 * Created: 3/11/12
 *
 * Id: $Id$
 */

var Logger = {};
(function (context, $) {
    if (!window.console)
        window.console = {};
    if (!window.console.log)
        window.console.log = function () {};

    context.debug = function (msg) {
        window.console.log(msg);
    };

    context.logRequest = function (params) {
        var type = params.type || 'GET';
        if (params.data)
            Logger.debug('--> Request: ' + type + ' ' + params.url + ' ' + params.data);
        else
            Logger.debug('--> Request: ' + type + ' ' + params.url);
    };

    context.logResponse = function (params, data) {
        Logger.debug('<-- Response: ' + JSON.stringify(data));
    };

    context.logForm = function (url, data, opts) {
        Logger.debug('Form: ' + opts.method + ' ' + url + ' ' + $.param(data));
    };
})(Logger, jQuery);
