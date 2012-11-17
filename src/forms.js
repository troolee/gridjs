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
