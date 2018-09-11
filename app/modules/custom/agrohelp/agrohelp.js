
/**
 * hook_services_preprocess
 */
function agrohelp_services_preprocess(options)
{
    try {
        // Увеличить количество возвращаемых терминов (по умолчанию всего 20)
        // к запросам таксономии добавить параметр pagesize
        // разрешить анонимам Perform unlimited index queries (иначе даже с параметром вернет всего 20)
        if (options.service === 'taxonomy_term' && options.resource === 'index') {
            options.path += '&pagesize=500';
        }

        // Для Регионов запросить только верхний уровень
        // дополнительное условие parent=0
        if (options.query !== undefined && options.query.parameters.vid !== undefined && options.query.parameters.vid === '29') {
            options.path += '&parameters[parent]=0';
        }

    }
    catch (error) { console.log('agrohelp_services_preprocess - ' + error); }
}

/**
 * ------------------------------------------------ Изменение формы ----------------------------------------------------
 *
 * todo заменить автокомплит на селект с фильтром
 * для этого можно заменить element.field_info_instance.widget.module на agro
 * и сформировать виджет через agro_field_widget_form
 * пока обойдёмся собственным валидатором с поясняющими сообщениями
 */

function agrohelp_form_alter(form, form_state, form_id, aux)
{
    try {
         // console.log('agrohelp_form_alter - ');
        if (form_id === 'entityform_edit' && form.bundle === 'agrohelp') {
            var lang = language_default();
            // изменить вывод формы запроса Агропомощи

            // todo извлечь поле с инструкциями из entityform type (drupalgap.content_types_list[bundle].data)
            var instruction = '<p>Если у Вас возникли затруднения с определением вредного объекта, будь то сорняк, вредитель или болезнь на Вашем участке или в поле, заполните форму ниже, чтобы наш специалист смог помочь.</p>'
                + '<p>Профессиональный агроном проверит полученные данные и ответит по одному из оставленных контактов.</p>';
            form.prefix = instruction;

            form.elements.field_f_region.prefix = '<h3>О себе</h3>';
            delete form.elements.field_f_region.title;
            form.elements.field_f_region[lang][0]['placeholder'] = 'Регион *';
            // form.elements.field_f_region[lang][0].options.attributes['data-native-menu'] = false;

            form.elements.field_company.title = form.elements.field_company.title + (form.elements.field_company.required?' *':'');
            form.elements.field_company.title_placeholder = true;

            form.elements.field_fullname.title = form.elements.field_fullname.title + (form.elements.field_fullname.required?' *':'');
            form.elements.field_fullname.title_placeholder = true;

            form.elements.field_phone.title = form.elements.field_phone.title + (form.elements.field_phone.required?' *':'');
            form.elements.field_phone.title_placeholder = true;

            form.elements.field_email.title = form.elements.field_email.title + ' *';
            form.elements.field_email.title_placeholder = true;

            form.elements.field_f_s_culture.prefix = '<h3>Нужна помощь!</h3>';
            delete form.elements.field_f_s_culture.title;
            form.elements.field_f_s_culture[lang][0]['placeholder'] = 'Культура *';
            // form.elements.field_f_s_culture[lang][0].options.attributes['data-native-menu'] = false;
            // рендер виджета переключаем на наш модуль
            // так как стандартной поддежки селекта для поля entityreference нет
            form.elements.field_f_s_culture.field_info_instance.widget.module = 'agrohelp';

            delete form.elements.field_f_s_m_phase_mc.title;
            form.elements.field_f_s_m_phase_mc[lang][0]['placeholder'] = 'Фаза культуры';
            // form.elements.field_f_s_m_phase_mc[lang][0].options.attributes['data-native-menu'] = false;

            form.elements.field_ho_type.prefix = '<h3>Не могу определить</h3>';
            form.elements.field_ho_type.title = form.elements.field_ho_type.title + (form.elements.field_ho_type.required?' *':'');
            form.elements.field_ho_type.title_placeholder = true;

            form.elements.field_pd_r_hobjects_comment.title = form.elements.field_pd_r_hobjects_comment.title + (form.elements.field_pd_r_hobjects_comment.required?' *':'');
            form.elements.field_pd_r_hobjects_comment.title_placeholder = true;

            form.elements.submit.value = 'Отправить';

            // свой валидатор
            // todo проверка полей с вменяемыми сообщениями при ошибке
            // заменить стандартный валидатор или убрать required и проверять самостоятельно
            form.validate.push('agrohelp_form_validate');
        }
    }
    catch (error) { console.log('agrohelp_form_alter - ' + error); }
}

/**
 * Custom validation handler for user login form.
 * проверяем поля самостоятельно, так как из-за отсутствия Меток
 * в сообщении обошибку выводится имя поля
 */
function agrohelp_form_validate(form, form_state) {
    // Prevent the joker from logging in.
    if (form_state.values.field_f_region['ru'][0] == '') {
        drupalgap_form_set_error('field_f_region', 'Укажите Ваш регион.');
        return;
    }
    if (form_state.values.field_email['ru'][0] == '') {
        drupalgap_form_set_error('field_email', 'Некорректно заполнено поле E-Mail.');
        return;
    }
    if (form_state.values.field_f_s_culture['ru'][0] == '') {
        drupalgap_form_set_error('field_f_s_culture', 'Выберите культуру.');
        return;
    }
    if (form_state.values.field_f_s_m_phase_mc['ru'][0] == '') {
        drupalgap_form_set_error('field_f_s_m_phase_mc', 'Выберите фазу развития культуры.');
        return;
    }
    if (form_state.values.field_image['ru'][0] == '') {
        drupalgap_form_set_error('field_image', 'Добавьте фото вредного объекта.');
        return;
    }
}

/**
 * свой обработчик виджетов с поддержкой виджета Селект для полей типа entityreference
 * Для включения поддержки полем нужно изменить модуль, обрабатывающий виджет
 * Пример:  form.elements.field_f_s_culture.field_info_instance.widget.module = 'agrohelp';
 */
function agrohelp_field_widget_form(form, form_state, field, instance, langcode, items, delta, element) {
    try {
        // console.log('agrohelp_field_widget_form - ');
        switch (element.type) {
            case 'entityreference':
                // Change the item type to a hidden input.
                items[delta].type = 'hidden';

                var widget_type = false;
                if (instance.widget.type == 'options_select') {
                    widget_type = 'select';
                }
                else {
                    console.log(
                        'WARNING: agrohelp_field_widget_form() - ' + instance.widget.type +
                        ' not yet supported for ' + element.type + ' form elements!'
                    );
                    return false;
                }
                var widget_id = items[delta].id + '-' + widget_type;
                // If the select list is required, add a 'Select' option and set
                // it as the default.  If it is optional, place a "none" option
                // for the user to choose from.
                var text = '- ' + t('None') + ' -';
                // возможность задать placeholder
                if (items[delta].placeholder) {
                    text = items[delta].placeholder;
                }
                else {
                    if (items[delta].required) {
                        text = '- ' + t('Select a value') + ' -';
                    }
                }
                items[delta].children.push({
                    type: widget_type,
                    attributes: {
                        id: widget_id,
                        onchange: "_theme_entityreference_onchange(this, '" +
                            items[delta].id +
                            "');"
                    },
                    options: { '': text }
                });
                // передать заданные атрибуты селекту
                for(key in items[delta].options.attributes) {
                    if (key !== 'id' && key !== 'onchange') {
                        items[delta].children[0].attributes[key] = items[delta].options.attributes[key];
                        delete items[delta].options.attributes[key];
                    }
                }
                // Attach a pageshow handler to the current page that will load the
                // terms into the widget.
                var path = entityreference_autocomplete_path(element.field_info_field);

                var options = {
                    'page_id': drupalgap_get_page_id(drupalgap_path_get()),
                    'jqm_page_event': 'pageshow',
                    'jqm_page_event_callback': '_theme_entityreference_load_items',
                    'jqm_page_event_args': JSON.stringify({
                        'path': path,
                        'widget_id': widget_id
                    })
                };
                // Pass the field name so the page event handler can be called for
                // each item.
                items[delta].children.push({
                    markup: drupalgap_jqm_page_event_script_code(
                        options,
                        field.field_name
                    )
                });
                break;
            default:
                var msg = 'agrohelp_field_widget_form - unknown widget type: ' + element.type;
                console.log(msg);
                break;
        }
    }
    catch (error) { console.log('agrohelp_field_widget_form - ' + error); }
}

// Used to hold onto the entityreference items once they've been loaded into a widget, keyed by
// the form element's id, this allows (views exposed filters particularly) forms
// to easily retrieve the items after they've been fetch from the server.
var _entityreference_items = {};

function _theme_entityreference_load_items(options) {
    try {
        // console.log('_theme_entityreference_load_items - ');

        // todo при текущих требованиях к полю можно воспользоваться entity_index
        views_datasource_get_view_result(options.path, {
            success: function (items) {
                if (items.length == 0) { return; }

                // As we iterate over the terms, we'll set them aside in a JSON
                // object so they can be used later.
                _entityreference_items[options.element_id] = { };

                // Grab the widget.
                var widget = $('#' + options.widget_id);

                // Place each term in the widget as an option, and set the option
                // aside.
                for (var index in items['nodes']) {
                    if (!items['nodes'].hasOwnProperty(index)) { continue; }
                    var item = items['nodes'][index]['node'];
                    var option = '<option value="' + item.nid + '">' + item.title + '</option>';
                    $(widget).append(option);
                    _entityreference_items[options.element_id][item.nid] = item.title;
                }

                // Refresh the select list.
                $(widget).selectmenu('refresh', true);
            }
        });
    }
    catch (error) { console.log('_theme_entityreference_load_items - ' + error); }
}

/**
 * An internal function used by a taxonomy term reference field widget to
 * detect changes on it and populate the hidden field that holds the tid in the
 * form.
 * @param {Object} input
 * @param {String} id
 */
function _theme_entityreference_onchange(input, id) {
    try {
        $('#' + id).val($(input).val());
    }
    catch (error) { console.log('_theme_entityreference_onchange - ' + error); }
}