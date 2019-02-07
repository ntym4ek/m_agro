/**
 * Implements hook_menu().
 */
function agenda_menu() {
    try {
        var items = {};
        items['agenda'] = {
            title: 'Афиша',
            page_callback: 'agenda_list_page'
        };

        return items;
    }
    catch (error) {
        console.log('agenda_menu - ' + error);
    }
}


/**
 * ----------------------------------------------- Список мероприятий --------------------------------------------------
 *
 */

// содержимое страницы
function agenda_list_page()
{
    try {
        var content = {};
        content['list'] = {
            theme: 'view',
            format: 'ul',
            format_attributes: {
                // 'data-inset': 'true',
                // 'class': 'row'
            },
            path: 'agenda.json',
            row_callback: 'agenda_list_page_row',
            empty_callback: 'agenda_list_page_empty'
        };

        return content;
    }
    catch (error) { console.log('agenda_page - ' + error); }
}

function agenda_list_page_row(view, row) {
    try {
        // console.log('agenda_page_row');
        var image = theme('image', { path: row.img.src });
        image = l(image, 'node/' + row.nid);

        var over = '' +
            '<div class="card-media-overlay with-background">' +
                '<div class="card-title has-supporting-text">' +
                    '<h3 class="card-primary-title">' + row.title + '</h3>' +
                    '<h5 class="card-subtitle">' + row.place + '</h5>' +
                '</div>' +
                '<div class="card-supporting-text has-title">' +
                    row.date_start + ' - ' + row.date_end +
                '</div>' +
            '</div>';
        over = l(over, 'node/' + row.nid);

        var content = '' +
        '<div class="nd2-card">' +
            '<div class="card-media">' +
                image +
                over +
            '</div>' +
        '</div>';

        return content;
    }
    catch (error) { console.log('agenda_page_row - ' + error); }
}

function agenda_list_page_empty(view)
{
    try {
        return "Событий не найдено";
    }
    catch (error) { console.log('agenda_page_empty - ' + error); }
}

/**
 * ----------------------------------------------- Страница мероприятия ------------------------------------------------
 *
 */
/**
 * Implements hook_node_page_view_alter_TYPE().
 * рендер ноды вместо стандартного agro_node_tpl_html
 */
function agenda_node_page_view_alter_agenda(node, options)
{
    console.log('agenda_node_page_view_alter_agenda - ');
    try {
        var content = {};
        content['title'] = {
            markup: '<h2>' + node.title + '</h2>'
        };
        content['subtitle'] = {
            markup: '<h4>' + node.body['ru'][0]['summary'] + '</h4>'
        };
        content['image'] = {
            theme: 'image',
            path: drupalgap_image_path(node.field_promo_image['und'][0]['uri'])
        };

        var dates = unixToDate(node.field_period['und'][0]['value']) + ' - ' + unixToDate(node.field_period['und'][0]['value2']);
        content['image-info'] = {
            markup: '<div class="image-info">' +
                        '<div class="row">' +
                            '<div class="col-xs"><div class="box location">' + node.field_location['und'][0]['value'] + '</div></div>' +
                            '<div class="col-xs"><div class="box period">' + dates + '</div></div>' +
                        '</div>' +
                    '</div>'
        };
        content['description'] = {
            markup: '<div class="description">' +
                        node.body['ru'][0]['safe_value'] +
                    '</div>'
        };

        var days = Math.floor(node.field_period['und'][0]['value2'] - node.field_period['und'][0]['value'])/3600/24 + 1;
        content['form'] = {
            markup: drupalgap_get_form('registration_form', node.nid, days)
        };

        options.success(content);
    }
    catch (error) { console.log('agenda_node_page_view_alter_agenda - ' + error); }
}

function registration_form(form, form_state, nid, days)
{
    try {
        form.prefix = '<h3>Запланировать встречу</h3>' +
            '<p class="font-small">Наш представитель получит уведомление и свяжется в Вами.</p>';

        form.elements['nid'] = {
            type: 'hidden',
            value: nid
        };
        form.elements['reg_sure'] = {
            type: 'select',
            options: { '0': 'Точно пойду', '1': 'Возможно пойду' }
        };

        var date_options = {};
        var date_array = ['Выберите день', 'Первый день', 'Второй день', 'Третий день', 'Четвертый день', 'Пятый день', 'Шестой день'];
        for (var i = 0; i <= days; i++) {
            date_options[i] = date_array[i];
        }
        form.elements['date_select'] = {
            type: 'select',
            options: date_options
        };

        form.elements['phone'] = {
            title: 'Телефон',
            title_placeholder: true,
            type: 'tel',
            attributes: { 'data-clear-btn': true }
        };

        form.elements['company'] = {
            title: 'Компания',
            title_placeholder: true,
            type: 'textfield',
            attributes: { 'data-clear-btn': true }
        };

        form.elements['profile_post'] = {
            title: 'Должность',
            title_placeholder: true,
            type: 'textfield',
            attributes: { 'data-clear-btn': true }
        };

        form.elements['fullname'] = {
            title: 'Имя',
            title_placeholder: true,
            type: 'textfield',
            attributes: { 'data-clear-btn': true }
        };

        form.elements['contact_message'] = {
            title: 'Можно оставить сообщение',
            title_placeholder: true,
            type: 'textarea'
        };

        form.elements['submit'] = {
            type: 'submit',
            value: 'Отправить',
            attributes: {
                class: "ui-btn ui-btn-raised ui-mini clr-btn-blue waves-effect waves-button"
            }
        };

        return form;
    } catch (error) { console.log('registration_form - ' + error); }
}

function registration_form_validate(form, form_state)
{
    if (!form_state.values['phone'] && !form_state.values['email']) {
        drupalgap_form_set_error('phone', 'Укажите номер телефона');
        return false;
    }
}

function registration_form_submit(form, form_state)
{
    console.log('registration_form_submit - ');
    try {
        var registration = form_state['values'];
        registration_create({
            data: JSON.stringify({ 'registration' : registration }),
            success: function (response) {
                if (response.success) {
                    new $.nd2Toast({
                        message : 'Заявка зарегистрирована.',
                        ttl : 3000
                    });
                } else {
                    new $.nd2Toast({
                        message : response.message,
                        ttl : 3000
                    });
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                new $.nd2Toast({
                    message : errorThrown,
                    ttl : 3000
                });
            }
        });
    }
    catch (error) { console.log('registration_form_submit - ' + error); }
}

function registration_create(options)
{
    try {
        options.method = 'POST';
        options.path = 'registration.json';
        options.service = 'registration';
        options.resource = 'create';
        Drupal.services.call(options);
    }
    catch (error) { console.log('registration_create - ' + error); }
}