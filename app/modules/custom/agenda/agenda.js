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
                'class': 'row'
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
    //console.log('agenda_node_page_view_alter_agenda - ');
    try {
        var content = {};
        content['prefix'] = {
            markup: '<div class="agenda">'
        };
        content['title'] = {
            markup: '<h2>' + node.title + '</h2>'
        };
        content['image'] = {
            theme: 'image',
            path: drupalgap_image_path(node.field_promo_image['und'][0]['uri'])
        };

        var dates = unixToDate(node.field_period['und'][0]['value']) + ' - ' + unixToDate(node.field_period['und'][0]['value2']);
        content['info'] = {
            markup: '<div class="info">' +
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
        content['suffix'] = {
            markup: '</div>'
        };

        options.success(content);
    }
    catch (error) { console.log('agenda_node_page_view_alter_agenda - ' + error); }
}