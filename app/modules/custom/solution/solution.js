var solution_data_array = {};

/**
 * Implements hook_menu().
 */
function solution_menu()
{
    return {
        solution : {
            title: 'Найти решение',
            page_callback: 'drupalgap_get_form',
            page_arguments: ['solution_form_page', false],
            options: {
                reloadPage:true
            }

        },
        calc : {
            title: 'Калькулятор',
            page_callback: 'drupalgap_get_form',
            page_arguments: ['solution_form_page', true],
            options: {
                reloadPage:true
            }

        },
        'solution-page': {
            title: 'Программа защиты',
            page_callback: 'solution_page',
            pageshow: 'solution_page_pageshow',
            options: {
                reloadPage:true
            }
        }
    }
}

/**
 * -------------------------------------- Страница Решения -------------------------------------------------------------
 */

/**
 * The callback страницы Найти решение.
 */
function solution_page(pid)
{
    var content = {};
    var attributes = {
        id: 'solution-page',
        class: 'protection-view'
    };
    content['container'] = {
        markup: '<div ' + drupalgap_attributes(attributes) + '></div>'
    };

    return content;
}

/**
 * The ageshow event handler страницы Найти решение.
 */
function solution_page_pageshow()
{
    try {
        //console.log('solution_page_pageshow - ');
        solution_load({
            data: JSON.stringify({ 'parameters' : solution_data_array }),
            success: function (solution) {
                var html = theme('program_cat_page', solution);
                $('#solution-page').html(html).trigger('create');
            }
        });
    }
    catch (error) { console.log('solution_page_pageshow - ' + error); }
}

function solution_load(options)
{
    try {
        options.method = 'POST';
        options.path = 'reglaments/get_protection_system.json';
        options.service = 'reglaments';
        options.resource = 'get_protection_system';
        Drupal.services.call(options);
    }
    catch (error) { console.log('solution_load - ' + error); }
}

/**
 * ----------------------------------------------- Форма с фильтрами ---------------------------------------------------
 */
function solution_form_page(form, form_state, calculator)
{
    try {
        // console.log('solution_form_page');

        form.prefix = '<h5>Заполните форму ниже и мы поможем подобрать решение для защиты Вашего поля и увеличения урожайности культуры';

        if (typeof calculator === 'undefined') calculator = false;
        if (calculator) {
            form.prefix += ' и расчитать его стоимость';
        }

        form.prefix += '.</h5>';

        form.elements['calculator'] = {
            type: 'hidden',
            value: calculator
        };

        /* ----------------------------------- Культура --------------------------------------------------------------*/
        form.elements['culture'] = {
            type: 'select',
            prefix: '<h3>Моя культура</h3>',
            attributes: {
                onchange: "_solution_form_culture_onchange('#edit-solution-form-page-culture');",
                'data-native-menu': 'false'
            },
            options: { '': 'Культура' },
            children: []
        };
        var options = {
            'page_id': drupalgap_get_page_id(drupalgap_path_get()),
            'jqm_page_event': 'pageshow',
            'jqm_page_event_callback': '_solution_form_get_culture_options'
        };
        form.elements['culture'].children.push({ markup: drupalgap_jqm_page_event_script_code(options) });

        /* ----------------------------------- Фаза ------------------------------------------------------------------*/
        form.elements['phase'] = {
            type: 'select'
        };

        /* ----------------------------------- Площадь ---------------------------------------------------------------*/
        if (calculator) {
            form.elements['area'] = {
                title: 'Площадь посева, га',
                title_placeholder: true,
                type: 'textfield'
            };
            form.elements['are1'] = {
                title: 'Площадь посева, га',
                title_placeholder: true,
                type: 'textfield'
            };
        }

        /* ----------------------------------- Вредители -------------------------------------------------------------*/
        form.elements['weeds'] = {
            type: 'select',
            prefix: '<h3 class="hobjects">Моя проблема</h3>',
            attributes: {
                'data-native-menu': 'false',
                'multiple': 'multiple'
            }
        };
        form.elements['pests'] = {
            type: 'select',
            attributes: {
                'data-native-menu': 'false',
                'multiple': 'multiple'
            }
        };
        form.elements['diseases'] = {
            type: 'select',
            attributes: {
                'data-native-menu': 'false',
                'multiple': 'multiple'
            }
        };


        form.elements['desiccants'] = {
            title: 'добавить десиканты',
            type: 'checkbox',
            attributes: {
                checked: 'checked'
            },
            prefix: '<h3 class="hobjects">Дополнительно</h3>',
        };
        form.elements['fertilizers'] = {
            title: 'добавить удобрения',
            type: 'checkbox',
            attributes: {
                checked: 'checked'
            }
        };


        form.elements['submit'] = {
            type: 'submit',
            value: 'Найти решение',
            attributes: {
                class: "ui-btn ui-btn-raised ui-mini clr-warning"
            }
        };

        return form;
    }
    catch (error) { console.log('solution_form_page - ' + error); }
}

function solution_form_page_validate(form, form_state)
{
    if (form_state.values['calculator'] && !form_state.values['area']) {
        drupalgap_form_set_error('area', 'Для расчёта стоимости необходимо задать площадь посева.');
        return false;
    }
    if (form_state.values['phase'] == null && form_state.values['weeds'] == null && form_state.values['pests'] == null && form_state.values['diseases'] == null) {
        drupalgap_form_set_error('phase', 'Задайте Фазу культуры и/или Вредный объекты.');
    }
}

function solution_form_page_submit(form, form_state)
{
    solution_data_array = {};
    solution_data_array['culture_id']   = form_state.values['culture'];
    solution_data_array['phase_id']     = form_state.values['phase'] ? form_state.values['phase'] : 0;
    if (form_state.values['calculator'])  solution_data_array['area'] = form_state.values['area'];
    if (form_state.values['weeds'])       solution_data_array['weeds_arr'] = form_state.values['weeds'];
    if (form_state.values['pests'])       solution_data_array['pests_arr'] = form_state.values['pests'];
    if (form_state.values['diseases'])    solution_data_array['diseases_arr'] = form_state.values['diseases'];
    solution_data_array['desiccants']   = form_state.values['desiccants'] ? form_state.values['desiccants'] : 0;
    solution_data_array['fertilizers']  = form_state.values['fertilizers'] ? form_state.values['fertilizers'] : 0;

    drupalgap_goto('solution-page');
}

function _solution_form_get_culture_options()
{
    try {
        //console.log('_solution_form_get_culture_options - ');

        views_datasource_get_view_result(
            'source/reglaments/cultures',
            { success: function (data) {
                    if (data.items.length == 0) { return; }

                    var widget = $('#edit-solution-form-page-culture');

                    var options = '';
                    for (var index in data.items) {
                        options += '<option value="' + data.items[index].nid + '">' + data.items[index].title + '</option>';
                    }
                    $(widget).append(options);
                    $(widget).selectmenu('refresh', true);
                }
            }
        );
    }
    catch (error) { console.log('_solution_form_get_culture_options - ' + error); }
}

function _solution_form_culture_onchange(culture_id_tag)
{
    try {
        //console.log('_solution_form_culture_onchange - ');

        /* ----------------------------------- Фаза ------------------------------------------------------------------*/
        var culture_id = $(culture_id_tag).val();

        views_datasource_get_view_result(
            'source/reglaments/phases/' + culture_id,
            { success: function (data) {
                    if (data.items.length == 0) { return; }

                    var widget = $('#edit-solution-form-page-phase');

                    var options = '<option value="">Фаза культуры</option>';
                    for (var index in data.items) {
                        options += '<option value="' + data.items[index].tid + '">' + data.items[index].name + '</option>';
                    }
                    $(widget).html(options);

                    $(widget).selectmenu('refresh', true);
                    $(widget).closest('.form-item').css('display', 'block');
                    $('.field-name-area').css('display', 'block');
                }
            }
        );

        /* ----------------------------------- Вредители -------------------------------------------------------------*/
        views_datasource_get_view_result(
            'source/reglaments/weeds',
            { success: function (data) {
                    if (data.items.length == 0) { return; }

                    var widget = $('#edit-solution-form-page-weeds');

                    var options = '<option value="">Сорное растение</option>';
                    for (var index in data.items) {
                        options += '<option value="' + data.items[index].nid + '">' + data.items[index].title + '</option>';
                    }
                    $(widget).html(options);

                    $(widget).selectmenu('refresh', true);
                    $('h3.hobjects').css('display', 'block');
                    $(widget).closest('.form-item').css('display', 'block');
                }
            }
        );
        views_datasource_get_view_result(
            'source/reglaments/pests/' + culture_id,
            { success: function (data) {
                    if (data.items.length == 0) { return; }

                    var widget = $('#edit-solution-form-page-pests');

                    var options = '<option value="">Вредитель</option>';
                    for (var index in data.items) {
                        options += '<option value="' + data.items[index].nid + '">' + data.items[index].title + '</option>';
                    }
                    $(widget).html(options);

                    $(widget).selectmenu('refresh', true);
                    $(widget).closest('.form-item').css('display', 'block');
                }
            }
        );
        views_datasource_get_view_result(
            'source/reglaments/diseases/' + culture_id,
            { success: function (data) {
                    if (data.items.length == 0) { return; }

                    var widget = $('#edit-solution-form-page-diseases');

                    var options = '<option value="">Болезнь</option>';
                    for (var index in data.items) {
                        options += '<option value="' + data.items[index].nid + '">' + data.items[index].title + '</option>';
                    }
                    $(widget).html(options);
                    $(widget).selectmenu('refresh', true);
                    $(widget).closest('.form-item').css('display', 'block');
                    $('.field-name-desiccants').css('display', 'block');
                    $('.field-name-fertilizers').css('display', 'block');
                    $('.field-name-submit').css('display', 'block');
                }
            }
        );
    }
    catch (error) { console.log('_solution_form_culture_onchange - ' + error); }
}

