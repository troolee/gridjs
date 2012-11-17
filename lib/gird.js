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
var FormHelpers = {};
(function (FormHelpers, $) {

    FormHelpers.freeze = function (form, submitBtn) {
        FormHelpers.clear_form_errors();
        form = $(form);
        if (submitBtn) {
            submitBtn = $(submitBtn);
            if (submitBtn.val())
                submitBtn.data('_fhOriginalValue', submitBtn.val()).val('Please wait...');
            else
                submitBtn.data('_fhOriginalValue', submitBtn.html()).html('Please wait...');
            form.data('_fhClickedSubmitButton', submitBtn);
        }
        form.find('input, select, textarea, button, .btn').each(function (i, item) {
            item = $(item);
            item.data('_fhOriginalState', item.attr('disabled') ||  false).attr('disabled', true);
        });
    };

    FormHelpers.unfreeze = function (form) {
        form = $(form);
        var submitBtn = form.data('_fhClickedSubmitButton');
        if (submitBtn) {
            if (submitBtn.val())
                submitBtn.val(submitBtn.data('_fhOriginalValue'));
            else
                submitBtn.html(submitBtn.data('_fhOriginalValue'));
        }
        form.removeData('_fhClickedSubmitButton');
        form.find('input, select, textarea, button, .btn').each(function (i, item) {
            item = $(item);
            item.attr('disabled', item.data('_fhOriginalState') || false);
        });
        form.find('.error:first').find('input, select, textarea').focus();
    };

    FormHelpers.clear_form_errors = function (form) {
        form = $(form);
        form.find('.error').each(function (i, item) {
            item = $(item);
            item.removeClass('error');
            item.find('.error-details').addClass('hide').html('');
        });
    };

    FormHelpers.show_form_errors = function (form, errors) {
        form = $(form);
        FormHelpers.clear_form_errors(form);
        _.each(_.keys(errors), function (item) {
            var e = errors[item].join('<br>');
            form.find('.error-details[for="' + item + '"]').each(function (i, item) {
                item = $(item);
                item.html(e).removeClass('hide').parents('.control-group').addClass('error');
            });
        });
    };

    FormHelpers.clear = function (form) {
        $(form).find('input, select, textarea').each(function() {
            var t = this.type, tag = this.tagName.toLowerCase();
            if (t == 'text' || t == 'password' || tag == 'textarea') {
                this.value = '';
            }
            else if (t == 'checkbox' || t == 'radio') {
                this.checked = false;
            }
            else if (tag == 'select') {
                this.selectedIndex = -1;
            }
            $(this).blur();
        });
    };

    FormHelpers.postForm = function (url, data, opts) {
        opts = _.extend({
            method: 'POST'
        }, opts || {});

        Logger.logForm(url, data, opts);

        var form = $('<form />');

        form.attr('action', url).attr('method', opts.method);
        _.each(_.keys(data), function (k) {
            var input = $('<input type="hidden" />');
            input.attr('name', k);
            input.attr('value', data[k]);
            form.append(input);
        });

        form.submit();
    };
})(FormHelpers, jQuery);
/**
 * User: Pavel Reznikov <pashka.reznikov@gmail.com>
 * Created: 17/08/12
 *
 * Id: $Id$
 */

var Grid = {};
(function (Grid, $) {
    var GridTitle = function () {
        var self = this;
        self.title = ko.observable();
    };

    var ColumnController = function (controller, settings, column_opts) {
        var self = this;

        _.extend(column_opts, {
            visible: typeof column_opts.visible != 'undefined' ? column_opts.visible : true,
            sortable: typeof column_opts.sortable != 'undefined' ? column_opts.sortable : settings.sortable,
            sort_direction: typeof column_opts.sortable == 'string' ? column_opts.sortable : ''
        });

        if (column_opts.sortable) {
            column_opts.classes.push('sortable');
        }

        self.title = ko.observable(column_opts.title);
        self.classes = ko.observableArray(column_opts.classes);

        self.sort_direction = ko.observable(column_opts.sort_direction);

        self.class_ = ko.computed(function () {
            var c = [].concat(self.classes());
            if (self.sort_direction())
                c.push(self.sort_direction());
            return c.join(' ');
        });

        self.opts = ko.observable(column_opts);

        self.onclick = function (column, e) {
            if (!column.opts().sortable)
                return;
            _.each(controller.columns(), function (c) {
                if (c != column)
                    c.sort_direction('');
            });
            if (column.sort_direction() == 'asc')
                column.sort_direction('desc');
            else
                column.sort_direction('asc');

            controller.update_sort();
        };

        if (typeof column_opts.visible == 'boolean')
            self.visible = ko.observable(column_opts.visible);
        else
            self.visible = ko.computed(function () {
                return controller[column_opts.visible]();
            });
    };

    var prepareGrid = function (controller, settings, template_index) {
        template_index = template_index || 0;

        var toolbar = $('<div class="data-table-toolbar" />');

        var search_box = $('<div class="input-append"><input type="text" class="search-query input-medium"></div>');
        search_box.find('input').attr('data-bind', 'value: search, valueUpdate: "afterkeydown"');
        search_box.append('<button class="btn" type="button" data-bind="visible: has_search_query, click: remove_search"><i class="icon-remove"></i></button>');
        search_box.append('<button class="btn last" type="button" data-bind="click: on_search">Search</button>');
        toolbar.append(search_box);

        search_box.wrap('<div class="pull-right form-search">');

        toolbar.append('<div class="data-table-ajax-indicator pull-right" data-bind="visible: ajax">&nbsp;</div>');

        var tb = settings.container.find('.btn-toolbar');
        tb.remove();
        toolbar.append(tb);

        if (settings.show_toolbar) {
            settings.container.append(toolbar);
        }

        settings.container.find('.sub-toolbar .btn').addClass('btn-small');

        if (settings.content_template.size() == 0) {
            var table = $('<table data-bind="visible: has_items" />');
            table.addClass('table table-striped table-condensed data-table');

            var thead = $('<thead><tr data-bind="foreach: columns"><th data-bind="html: title, attr: {\'class\': class_}, visible: visible(), click: onclick"></tr></thead>');
            table.append(thead);

            var row = $('<tr data-bind="attr: {\'class\': $parent.row_class($data)}" />');
            _.each(settings.columns, function (item, index) {
                _.extend(item, {
                    index: index
                });

                var columnController = new ColumnController(controller, settings, item);
                controller.columns.push(columnController);

                settings.has_sortable_columns = settings.has_sortable_columns || item.sortable;

                var td = $('<td />');
                td.attr('data-bind', 'visible: $parent.columns()[' + index + '].visible()');
                row.append(td);

                if (item.content == null) {
                    if (item.checkbox) {
                        var c = '<label><input type="checkbox" data-bind="' + item.checkbox +  '"> <span data-bind="' + item.dataBind + '"></span></label>';
                        td.append(c);
                    }
                    else if (item.tooltip) {
                        var span = $('<span/>');
                        span.attr('data-bind', item.dataBind);
                        td.append(span);
                    }
                    else {
                        td.attr('data-bind', item.dataBind);
                    }
                }
                else {
                    td.html(item.content);
                }

                td.addClass(item.classes.join(' '));
            });

            if (settings.sortable || settings.has_sortable_columns) {
                table.addClass('sortable');
            }

            var tbody = $('<tbody data-bind="foreach: items" />');
            tbody.append(row);
            table.append(tbody);
            settings.container.append(table);
        }
        else {
            settings.content_template
                    .remove()
                    .removeClass('grid-content-template')
                    .addClass('grid-content');

            var template = $(settings.content_template[template_index]).clone();
            var bindTo = template;
            if (template.find('.grid-content-items').size())
                bindTo = template.find('.grid-content-items');
            bindTo.attr('data-bind', 'foreach: items');
            settings.container.append(template);
        }

        settings.container.append('<div class="no-items-found" data-bind="visible: no_items">No item found.</div>');
        settings.container.append('<div class="loading" data-bind="visible: loading">Loading...</div>');
        settings.container.append('<div class="pagination" data-bind="visible: has_pages"></div>');
    };

    var controller = function (opts) {
        var settings = {
            target: opts.target,
            url: opts.url,
            container: $('#'+opts.target),
            columns: opts.columns || [],
            extend: opts.extend || {},
            editable: opts.editable || false,
            params: opts.params || {},
            editor_controller: opts.editor_controller || null,
            item_controller: opts.item_controller || null,
            show_paginator: typeof opts.show_paginator != 'undefined' ? opts.show_paginator : true,
            show_toolbar: typeof opts.show_toolbar != 'undefined' ? opts.show_toolbar : true,
            search_throttle: opts.search_throttle || 400,
            sortable: opts.sortable || false,
            bind_to: opts.bind_to || []
        };
        settings.has_sortable_columns = settings.sortable;

        settings.content_template = settings.container.find('.grid-content-template').clone();
        settings.container.find('.grid-content-template').remove();

        var self = this;

        self.columns = ko.observableArray();

        self.setColumnVisibility = function (col, vis) {
            var predicate;
            if (typeof col == 'number')
                predicate = function (val) { return val.opts().index == col };
            else
                predicate = function (val) { return val.opts().name == col };

            _.each(self.columns(), function (item) {
                if (predicate(item)) {
                    Logger.debug(item);
                    item.visible(vis);
                }
            });
        };

        self.showColumn = function (col) { self.setColumnVisibility(col, true); };
        self.hideColumn = function (col) { self.setColumnVisibility(col, false); };

        self.url = ko.observable(settings.url);
        self.params = ko.observable(settings.params);

        self.update_params = function (p) {
            var r = ko.mapping.toJS(self.params());
            _.each(_.keys(p), function (k) {
                if (p[k] == null) {
                    if (_.has(r, k))
                        delete r[k];
                }
                else {
                    r[k] = p[k];
                }
            });
            var res = !_.isEqual(ko.mapping.toJS(self.params()), r);
            self.params(r);
            return res;
        };

        self.update_sort = function () {
            self.loadGrid();
        };

        self.get_order_by = function () {
            res = [];
            _.each(self.columns(), function (item) {
                var d = item.sort_direction();
                if (d) {
                    d = d == 'desc' ? '-' : '';
                    res.push(d + item.opts().name);
                }
            });
            return res;
        };


        self.search = ko.observable('');
        this.search_query = ko.computed(function () {
            return self.search()
        }).extend({ throttle: settings.search_throttle });
        this.has_search_query = ko.computed(function () {
            return Boolean(self.search_query());
        });

        this.on_search = function (val) {
            self.current_page(0);
            self.loadGrid();
        };

        var search_query_subscription = self.search_query.subscribe(self.on_search);
        self.set_search = function (v) {
            search_query_subscription.dispose();
            self.search(v);
            setTimeout(function () {
                search_query_subscription = self.search_query.subscribe(self.on_search);
            }, 1000);
        };
        this.clear_search = function () {
            search_query_subscription.dispose();
            self.search('');
            setTimeout(function () {
                search_query_subscription = self.search_query.subscribe(self.on_search);
            }, 1000);
        };

        this.remove_search = function () {
            self.clear_search();
            self.loadGrid();
            return false;
        };

        self.header = ko.observableArray([]);
        self.items = ko.observableArray([]);
        self.paginator = ko.observable();
        self.current_page = ko.observable();

        self.show_paginator = ko.observable(settings.show_paginator);

        self.has_pages = ko.computed(function () {
            if (!self.paginator())
                return false;
            return self.paginator().pages() > 0 && self.show_paginator();
        });

        self.loading = ko.observable(true);
        self.no_items = ko.computed(function () {
            return self.items().length == 0 && !self.loading();
        });
        self.has_items = ko.computed(function () {
            return self.items().length > 0 && !self.loading();
        });
        self.ajax = ko.observable(false);

        self.prev_page = function () {
            self.goto_page(self.paginator().page() - 1);
        };

        self.next_page = function () {
            self.goto_page(self.paginator().page() + 1);
        };

        self.goto_page = function (p) {
            if (p < 1 || p > self.paginator().pages())
                return;
            self.current_page(p);
            self.loadGrid();
        };

        self.row_class = function(item) {
            return "grid-row";
        };

        self.edit_mode = ko.observable(false);
        self.not_edit_mode = ko.computed(function () { return !self.edit_mode(); }, this);

        self.editingRow = null;
        self.editorRow = null;

        self.editorContent = settings.container.find('div.editor');
        self.editorContent.remove().removeClass('editor').attr('id', 'editor-content-' + (Math.random()*10000000).toFixed(0));

        self.on_cancel_button_clicked = function () {
            if (settings.editor_controller) {
                if (!(settings.editor_controller.on_cancel || function () { return true;} )()) {
                    return;
                }
            }
            self.cancel_edit();
        };

        self.cancel_edit = function () {
            if (self.editingRow) {
                self.editingRow.removeClass('edit-mode');
                self.editingRow = null;
            }
            if (self.editorRow) {
                self.editorRow.remove();
                self.editorRow = null;
            }
            self.edit_mode(false);
        };

        self.done_edit = function () {
            self.cancel_edit();
        };

        self.unfreeze_edit_form = function (errors) {
            FormHelpers.unfreeze(self.editorRow);
            if (errors) {
                FormHelpers.show_form_errors(self.editorRow, errors);
            }
            else {
                FormHelpers.clear_form_errors(self.editorRow);
            }
        };

        self.edit_item = function (obj, e) {
            self.cancel_edit();
            self.edit_mode(true);
            if (e) {
                self.editingRow = $(e.target).parents('tr').first();
                self.editingRow.addClass('edit-mode');
            }

            self.editorRow = $('<tr class="editor"><td colspan="' + settings.columns.length + '"></td></tr>');
            var td = self.editorRow.find('td');
            var container = $('<div class="editor-container"/>');
            container.append(self.editorContent);
            self.editorContent.show();
            td.append(container);
            var id = 'editor-' + (Math.random() * 1000000000).toFixed(0);
            td.append(
                    '<div class="form-actions" id="' + id + '">'+
                    '<button type="submit" class="btn btn-primary" data-bind="click: on_save_button_clicked">Save changes</button>'+
                    '<button type="button" class="btn" data-bind="click: on_cancel_button_clicked">Cancel</button>'+
                    '</div>');

            if (obj)
                self.editingRow.after(self.editorRow);
            else
                settings.container.find('tbody').prepend(self.editorRow);

            if (self.editorContent.find('form').hasClass('form-horizontal')) {
                td.find('.form-actions').addClass('form-horizontal-actions');
            }
            ko.applyBindings(self, document.getElementById(id));
            FormHelpers.clear_form_errors(self.editorRow);
            if (settings.editor_controller) {
                ko.cleanNode(document.getElementById(self.editorContent.attr('id')));
                ko.applyBindings(settings.editor_controller, document.getElementById(self.editorContent.attr('id')));

                (settings.editor_controller.on_before_edit || function () {})(obj);
            }
        };

        self.new_item = function (obj, e) {
            self.edit_item(null, null);
        };

        self.on_save_button_clicked = function (controller, e) {
            FormHelpers.freeze(self.editorRow, e.target);
            (settings.editor_controller.save || function () { FormHelpers.unfreeze(self.editorRow); })(self);
        };

        if (settings.editable) {
            settings.columns.push(Grid.columns.IconButton('pencil', '$parent.edit_item, enable: $parent.not_edit_mode', 'Edit Item', {sortable: false}));
        }

        settings.container.delegate('.pagination a', 'click', function () {
            var a = $(this);
            if (a.hasClass('prev-page')) {
                self.prev_page();
            }
            else if (a.hasClass('next-page')) {
                self.next_page();
            }
            else if (a.attr('data-page')) {
                self.goto_page(parseInt(a.attr('data-page')));
            }
            return false;
        });

        self.selectTemplate = function (template_index) {
            ko.cleanNode(settings.container.find('[data-bind="foreach: items"]')[0]);
            settings.container.find('.grid-content').remove();

            var template = $(settings.content_template[template_index]).clone();
            var bindTo = template;
            if (template.find('.grid-content-items').size())
                bindTo = template.find('.grid-content-items');
            bindTo.attr('data-bind', 'foreach: items');
            settings.container.find('.data-table-toolbar').after(template);

            ko.applyBindings(self, settings.container.find('.grid-content')[0]);
            self.on_grid_load();
        };

        self.selectTemplate0 = function () { self.selectTemplate(0); };
        self.selectTemplate1 = function () { self.selectTemplate(1); };
        self.selectTemplate2 = function () { self.selectTemplate(2); };
        self.selectTemplate3 = function () { self.selectTemplate(3); };
        self.selectTemplate4 = function () { self.selectTemplate(4); };

        self.on_grid_load = function () {};

        self.on_initialized = function () {
            self.loadGrid();
        };

        _.extend(this, settings.extend);
        if (_.has(settings.extend, '_get_fields')) {
            _.extend(this, settings.extend._get_fields.call(this));
        }

        var ItemController = settings.item_controller || function (data, controller) {
            this._controller = controller;
            ko.mapping.fromJS(data, {}, this);
        };

        prepareGrid(self, settings);

        ko.applyBindings(self, document.getElementById(settings.target));
        _.each(settings.bind_to, function (item) {
            _.each($(item), function (element) {
                ko.applyBindings(self, element);
            });
        });

        self.loadGrid = function (callback) {
            self.cancel_edit();

            callback = callback || function () {};
            self.ajax(true);
            var params = {};
            if (self.search()) {
                params.q = self.search();
            }
            if (self.current_page()) {
                params.p = self.current_page();
            }
            params.order_by = self.get_order_by();
            if (params.order_by && params.order_by.length) {
                params.order_by = params.order_by.join(',');
            }
            else
                delete params.order_by;

            _.each(_.keys(self.params() || {}), function (k) {
                var v = self.params()[k];
                if (v != null)
                    params[k] = v;
            });

            Api.get(self.url(), {
                params: params,
                success: function (data) {
                    ko.mapping.fromJS(data, {
                        items: {
                            create: function (opts) {
                                return new ItemController(opts.data, self);
                            }
                        }
                    }, self);
                    settings.container.find('[rel=tooltip]').tooltip();
                    self.loading(false);

                    var p = self.paginator();
                    if (p && p.pages()) {
                        var ul = $('<ul />'), li, i;
                        li = $('<li />');
                        if (p.page() == 1) {
                            li.addClass('disabled');
                        }
                        li.append('<a href="#" class="prev-page">Prev</a>');
                        ul.append(li);

                        var p1 = p.page() - 5, p2 = p.page() + 5;
                        if (p1 > 1) {
                            ul.append('<li><a href="#" data-page="1">1</a></li>');
                            ul.append('<li class="disabled"><a href="#">...</a></li>');
                            p1++;
                        }

                        for (i = p1; i < p.page(); ++i) {
                            if (i > 0) {
                                ul.append('<li><a href="#" data-page="' + i + '">' + i + '</a></li>');
                            }
                        }

                        ul.append('<li class="active"><a href="#" data-page="' + i + '">' + p.page() + '</a></li>');

                        if (p2 == p.pages()) {
                            p2--;
                        }
                        for (i = p.page() + 1; i < p2; ++i) {
                            if (i <= p.pages()) {
                                ul.append('<li><a href="#" data-page="' + i + '">' + i + '</a></li>');
                            }
                        }

                        if (p2 < p.pages()) {
                            ul.append('<li class="disabled"><a href="#">...</a></li>');
                            ul.append('<li><a href="#" data-page="' + p.pages() + '">' + p.pages() + '</a></li>');
                        }

                        li = $('<li />');
                        if (p.page() == p.pages()) {
                            li.addClass('disabled');
                        }
                        li.append('<a href="#" class="next-page">Next</a>');
                        ul.append(li);

                        settings.container.find('.pagination').html('<div class="pull-right">Found ' + p.items_count() + ' item(s)</div>');
                        settings.container.find('.pagination').append(ul);
                    }
                },
                complete: function () {
                    self.ajax(false);
                    callback.call(self);
                    self.on_grid_load();
                }
            });
        };

        settings.container.show();
        self.on_initialized();
    };

    Grid.create = function (opts) {
        return new controller(opts);
    };

    Grid.columns = {
        Column: function (bindType, name, title, classes, opts) {
            opts = opts || {};
            var bind_opts = opts.bind_opts || '';
            if (bind_opts)
                bind_opts = ', ' + bind_opts;
            var attrs = opts.attrs || {};
            if (opts.tooltip) {
                attrs['title'] = opts.tooltip;
                attrs['rel'] = '"tooltip"';
            }
            if (attrs) {
                bind_opts += ', attr: {' + _.map(_.keys(attrs), function (item) { return '\'' + item + '\': ' + attrs[item]; }).join(', ') + '}';
            }
            if (bindType != null)
                return _.extend({
                    dataBind: bindType + ': ' + name + bind_opts,
                    name: name,
                    content: null,
                    title: title || name,
                    classes: classes || [],
                    checkbox: null
                }, opts);
            else
                return _.extend({
                    dataBind: bindType + ': ' + name + bind_opts,
                    name: null,
                    content: name,
                    title: title,
                    classes: classes || [],
                    checkbox: null
                }, opts);
        },

        Id: function (name, title, opts) {
            return Grid.columns.Column('text', name, title, ['id'], opts);
        },

        String: function (name, title, opts) {
            if (_.has(opts || {}, 'maxlength'))
                return Grid.columns.Column('stripped_text', name, title, ['string'], _.extend({bind_opts: 'maxlength: ' + opts.maxlength}, opts));
            else
                return Grid.columns.Column('text', name, title, ['string'], opts);
        },

        Money: function (name, title, opts) {
            return Grid.columns.Column('money', name, title, ['money'], opts);
        },

        Percent: function (name, title, opts) {
            return Grid.columns.Column('percent', name, title, ['percent'], opts);
        },

        Qty: function (name, title, opts) {
            return Grid.columns.Column('qty', name, title, ['qty'], opts);
        },

        Date: function (name, title, opts) {
            return Grid.columns.Column('date', name, title, ['date'], opts);
        },

        DateTime: function (name, title, opts) {
            return Grid.columns.Column('datetime', name, title, ['datetime'], opts);
        },

        Checkbox: function (bind, title, opts) {
            opts = opts || {};
            var bind_opts = '';
            if (opts.bind_opts) {
                bind_opts += ', ' + opts.bind_opts;
            }
            return Grid.columns.Column(
                    null,
                    '<input type="checkbox" data-bind="checked: ' + bind + bind_opts + '" title="' + title + '">',
                    title,
                    ['custom', 'column-checkbox'],
                    opts
            );
        },

        Custom: function (content, title, opts) {
            return Grid.columns.Column(null, content, title, ['custom'], opts);
        },

        Url: function (name, title, opts) {
            opts = opts || {};
            var bind_opts = '';
            if (opts.bind_opts) {
                bind_opts += ', ' + opts.bind_opts;
            }
            var href = opts.href || name;
            return Grid.columns.Column(null, '<a data-bind="text: ' + name + ', attr: {\'href\': ' + href + '}' + bind_opts + '" target="_blank"></a>', title, ['custom'], opts);
        },

        Email: function (name, title, opts) {
            opts = opts || {};
            var bind_opts = '';
            if (opts.bind_opts) {
                bind_opts += ', ' + opts.bind_opts;
            }
            var href = opts.href || name;
            return Grid.columns.Column(null, '<a data-bind="email: ' + name + bind_opts + '" target="_blank"></a>', title, ['email', 'nowrap'], opts);
        },

        LocalUrl: function (name, title, opts) {
            opts = opts || {};
            var bind_opts = '';
            if (opts.bind_opts) {
                bind_opts += ', ' + opts.bind_opts;
            }
            var href = opts.href || name;
            return Grid.columns.Column(null, '<a data-bind="text: ' + name + ', attr: {\'href\': ' + href + '}' + bind_opts + '"></a>', title, ['custom'], opts);
        },

        IconButton: function(icon, bind, title, opts) {
            opts = opts || {};
            var bind_opts = '';
            if (opts.bind_opts) {
                bind_opts += ', ' + opts.bind_opts;
            }
            return Grid.columns.Column(
                    null,
                    '<button class="btn btn-small" data-bind="click: ' + bind + bind_opts + '" title="' + title + '"><i class="icon-' + icon + '"></i></btn>',
                    '&nbsp;',
                    ['custom', 'column-icon-button'],
                    opts
            );
        },

        Button: function(bind, title, opts) {
            opts = opts || {};
            var bind_opts = '';
            if (opts.bind_opts) {
                bind_opts += ', ' + opts.bind_opts;
            }
            var icon = '';
            if (opts.icon) {
                icon = '<i class="icon-' + opts.icon + '"></i> ';
            }
            return Grid.columns.Column(
                    null,
                    '<button class="btn btn-small" data-bind="click: ' + bind + bind_opts + '" title="' + title + '">' + icon + title + '</btn>',
                    '&nbsp;',
                    ['custom', 'column-button'],
                    opts
            );
        },

        Icon: function(icon, title, opts) {
            opts = opts || {};
            var bind_opts = '';
            if (opts.bind_opts) {
                bind_opts += ' data-bind="' + opts.bind_opts + '"';
            }
            return Grid.columns.Column(
                    null,
                    '<i class="icon-' + icon + '"' + bind_opts + 'title="' + title + '"></i>',
                    '&nbsp;',
                    ['custom', 'column-icon'],
                    opts
            );
        }
    };
})(Grid, jQuery);
