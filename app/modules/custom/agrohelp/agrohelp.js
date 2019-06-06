/**
 * Implements hook_menu().
 */
function agrohelp_menu()
{
    var items = {};
    items['agrohelp'] = {
        title: 'Агропомощь',
        page_callback: 'agrohelp_page',
        pageshow: 'agrohelp_page_pageshow'
    };

    return items;
}


/**
 * -------------------------------------- Страница роутера Агропомощи --------------------------------------------------
 */

/**
 * callback function
 * страница выбора вида Агропомощи
 */
function agrohelp_page()
{
    try {
        return content = {
            'intro':  { markup: '<div class="content-header"><h4>Для получения консультации агронома, выберите удобный для Вас формат</h4></div>' },
            'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-8 col-sm-offset-2">'},
            // 'form': {
            //     markup: drupalgap_render(drupalgap_get_form('experts_filter_form'))
            // }, ''
            'list_prefix': { markup: '<h3>Консультация онлайн</h3>'},
            'list': {
                theme: 'jqm_item_list',
                format_attributes: {
                    'data-inset': 'true'
                },
                items: [],
                attributes: {
                    'id': 'experts_listing_items'
                }
            },
            'mid': {
                markup: '<p class="align-center">или</p><h3>Консультация офлайн</h3>'
            },
            'button' : {
                theme: 'button_link',
                text: 'Заполнить форму',
                attributes: {
                    class: 'ui-btn ui-btn-raised clr-btn-blue'
                },
                path: 'entityform/add/agrohelp'
            },
            'suffix': { markup: '</div></div>' }
        };
    }
    catch (error) { console.log('agrohelp_page - ' + error); }
}

/**
 * The pageshow callback for the Агропомощь page.
 */
function agrohelp_page_pageshow(region_id)
{
    // console.log('agrohelp_page_pageshow - ');

    try {
        var rid = region_id ? '/' + region_id : '';
        // Grab some recent content and display it.
        views_datasource_get_view_result(
            'source/experts' + rid, {
                success: function(content) {
                    // Extract the nodes into items, then drop them in the list.
                    var items = [];
                    var reps = content.representatives;

                    // сформировать массив выводимых представителей
                    // директора не выводим
                    if (reps.head) {
                        delete reps.head;
                        // сначала глава отдела продаж
                        items.push(reps.head2['sales_head']);
                        delete reps.head2['sales_head'];
                        // региональные менеджеры
                        for (var index in reps.head2) {
                            items.push(reps.head2[index]);
                        }
                        delete reps.head2;
                    }
                    for (var index in reps) {
                        if (!reps.hasOwnProperty(index)) { continue; }
                        var region = reps[index];
                        for (var index2 in region) {
                            items.push(region[index2]);
                        }
                    }

                    // преобразуем массив представителей в массив выводимых карточек
                    var items_html = [];
                    for (var index in items) {
                        items_html.push(representatives_get_card_html(index, items[index]));
                    }

                    // выводим
                    drupalgap_item_list_populate('#experts_listing_items', items_html);
                    // повторном заполнении списка
                    // высота контейнера (через style) не обновляется, активируем вручную
                    $.mobile.resetActivePageHeight();
                }
            }
        );

        if (!rid) {
            var query = {
                parameters: {vid: 29, parent: 0},
                options: {orderby: {weight: 'asc', name: 'asc'}}
            };
            taxonomy_term_index(query, {
                success: function (terms) {
                    if (terms.length == 0) { return; }
                    var widget = $('select.experts_filter');

                    var options = '';
                    for (var index in terms) {
                        options += '<option value="' + terms[index].tid + '">' + terms[index].name + '</option>';
                        Regions[terms[index].tid] = terms[index].name;
                    }
                    $(widget).append(options);
                    $(widget).selectmenu('refresh', true);
                }
            });
        }

    }
    catch (error) { console.log('agrohelp_page_pageshow - ' + error); }
}

/**
 * форма отправки Запроса
 */
function experts_filter_form(form, form_state)
{
    try {
        form.prefix = '<h3>Найти специалиста</h3><p class="font-small">Выберите регион, чтобы отфильтровать список</p>';
        form.options.attributes['class'] += 'experts-filter-form';

        form.elements['region'] = {
            type: 'select',
            attributes: {
                'data-native-menu': false,
                onchange: '_experts_filter_onchange(this)',
                class: 'experts_filter'
            },
            options: { '': 'Регион', 0: 'Все регионы' },
            children: []
        };

        return form;
    } catch (error) { console.log('experts_filter_form - ' + error); }
}

function _experts_filter_onchange(select)
{
    agrohelp_page_pageshow($(select).val());
}

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
 * data-native-menu: false подключает кастомный селект во всплывающем окне от JQM
 * (form.elements.field_f_region[lang][0].options.attributes['data-native-menu'] = false;)
 * Это работает в браузере и не работает в приложении.
 * Если опций в селекте больше чем на один экран, попап открывается как отдельная страница
 * и после выбора опции или закрытия окна из DOM исчезает вся форма.
 * https://github.com/signalpoint/DrupalGap/issues/941
 */

function agrohelp_form_alter(form, form_state, form_id, aux)
{
    try {
            console.log('agrohelp_form_alter - ');
        if (form_id === 'entityform_edit' && form.bundle === 'agrohelp') {
            var lang = language_default();
            // изменить вывод формы запроса Агропомощи

            // todo извлечь поле с инструкциями из entityform type (drupalgap.content_types_list[bundle].data)
            var intro = '<div class="content-header"><h4>Если у Вас возникли затруднения с определением вредного объекта, будь то сорняк, вредитель или болезнь на Вашем участке или в поле, заполните форму ниже, чтобы наш специалист смог помочь.'
                    + '<br />Наш научный консультант проверит полученные данные и ответит по одному из оставленных контактов.</h4></div>';
            var content_prefix = '<div class="row"><div class="col-xs-12 col-sm-8 col-sm-offset-2">';
            form.prefix = '</div>' + intro + content_prefix + '<div>';

            form.elements.field_f_region.prefix = '<h3 style="margin-top: 0;">О себе</h3>';
            delete form.elements.field_f_region.title;
            form.elements.field_f_region[lang][0].placeholder = 'Регион *';
            form.elements.field_f_region[lang][0].options.attributes['data-native-menu'] = false;

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
            form.elements.field_f_s_culture[lang][0].options.attributes['data-native-menu'] = false;
            // формирование рендер массива виджета переключаем на наш модуль
            // так как стандартной поддежки селекта для поля entityreference нет
            form.elements.field_f_s_culture.field_info_instance.widget.module = 'agrohelp';

            delete form.elements.field_f_s_m_phase_mc.title;
            form.elements.field_f_s_m_phase_mc[lang][0]['placeholder'] = 'Фаза культуры';
            form.elements.field_f_s_m_phase_mc[lang][0].options.attributes['data-native-menu'] = false;


            form.elements.field_ho_type.prefix = '<h3>Не могу определить</h3>';
            form.elements.field_ho_type.title = form.elements.field_ho_type.title + (form.elements.field_ho_type.required?' *':'');
            form.elements.field_ho_type.title_placeholder = true;

            form.elements.field_pd_r_hobjects_comment.title = form.elements.field_pd_r_hobjects_comment.title + (form.elements.field_pd_r_hobjects_comment.required?' *':'');
            form.elements.field_pd_r_hobjects_comment.title_placeholder = true;

            form.elements.submit.options.attributes.class = 'ui-mini clr-btn-blue';
            form.elements.submit.value = 'Отправить';

            var content_suffix = '</div></div>';
            form.suffix = '</div>' + content_suffix + '<div>';

            // заменить стандартный валидатор и проверять самостоятельно
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
 * Добавляем поддержку Селекта для полей типа entityreference
 * Для включения поддержки полем нужно изменить модуль, обрабатывающий виджет
 * Пример:  form.elements.field_f_s_culture.field_info_instance.widget.module = 'agrohelp';
 */
function agrohelp_field_widget_form(form, form_state, field, instance, langcode, items, delta, element) {
    try {
         console.log('agrohelp_field_widget_form - ');
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
                // Attach a pageshow handler to the current page that will load the entities into the widget.
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
                // Pass the field name so the page event handler can be called for each item.
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

function _theme_entityreference_load_items(options) {
    try {
        // console.log('_theme_entityreference_load_items - ');

        // todo при текущих требованиях к полю можно воспользоваться entity_index
        views_datasource_get_view_result(options.path, {
            success: function (items) {
                if (items.length == 0) { return; }

                // Grab the widget.
                var widget = $('#' + options.widget_id);

                // Place each term in the widget as an option, and set the option
                // aside.
                for (var index in items['nodes']) {
                    if (!items['nodes'].hasOwnProperty(index)) { continue; }
                    var item = items['nodes'][index]['node'];
                    var option = '<option value="' + item.nid + '">' + item.title + '</option>';
                    $(widget).append(option);
                }

                // Refresh the select list.
                $(widget).selectmenu('refresh', true);
            }
        });
    }
    catch (error) { console.log('_theme_entityreference_load_items - ' + error); }
}

/**
 * An internal function used by a entityreference field widget to
 * detect changes on it and populate the hidden field that holds the id in the
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