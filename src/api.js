/**
 * User: Pavel Reznikov <pashka.reznikov@gmail.com>
 * Created: 3/11/12
 *
 * Id: $Id$
 */

var Api = {};
(function (Api, $) {

    Api.settings = {
        api_prefix: '/api/'
    };

    Api.init = function (settings) {
        Api.settings = _.extend(Api.settings, settings);
    };

    Api.ajax = function(params) {
        Logger.logRequest(params);
        var success = params.success || function (data) {};
        params = _.extend(_.clone(params), {
            success: function (data) {
                Logger.logResponse(params, data);
                success(data);
            }
        });
        return $.ajax(params);
    };

    Api.getApiUrl = function(url, params) {
        var p = _.extend(params || {},  {
            _dc: (Math.random() * 10000000000).toFixed(0)
        });
        url += (url.indexOf('?') == -1 ? '?' : '&') + $.param(p);
        return Api.settings.api_prefix + url;
    };

    Api.post = function (url, data, opts) {
        return Api.ajax(_.extend({
            type: 'POST',
            url: Api.getApiUrl(url),
            data: JSON.stringify(data)
        }, opts));
    };

    Api.put = function (url, data, opts) {
        return Api.ajax(_.extend({
            type: 'PUT',
            url: Api.getApiUrl(url),
            data: JSON.stringify(data)
        }, opts));
    };

    Api.get = function (url, opts) {
        return Api.ajax(_.extend({
            type: 'GET',
            url: Api.getApiUrl(url, opts.params)
        }, opts));
    };

    Api.del = function (url, data, opts) {
        return Api.ajax(_.extend({
            type: 'DELETE',
            url: Api.getApiUrl(url),
            data: JSON.stringify(data)
        }, opts));
    };

})(Api, jQuery);
