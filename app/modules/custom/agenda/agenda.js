/**
 * Implements hook_menu().
 */
function agenda_menu() {
    try {
        var items = {};
        items['agenda'] = {
            title: 'Афиша',
            page_callback: 'agenda_page'
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
function agenda_page()
{
    try {
        var content = {};
        content['list'] = {
            theme: 'view',
            format_attributes: {
                'data-inset': 'true',
                'class': 'row'
            },
            path: 'agenda.json',
            row_callback: 'agenda_page_row',
            empty_callback: 'agenda_page_empty'
        };

        return content;
    }
    catch (error) { console.log('agenda_page - ' + error); }
}

function agenda_page_row(view, row) {
    try {
        // console.log('agenda_page_row');
        var image = theme('image', { path: row.img.src });

        var content = '' +
        '<div class="nd2-card">' +
            '<div class="card-media">' +
                image +
                '<div class="card-media-overlay with-background">' +
                    '<div class="card-title has-supporting-text">' +
                        '<h3 class="card-primary-title">' + row.title + '</h3>' +
                        '<h5 class="card-subtitle">' + row.place + '</h5>' +
                    '</div>' +
                    '<div class="card-supporting-text has-title">' +
                        row.date_start + ' - ' + row.date_end +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        return l(content, 'node/' + row.nid, {
                attributes: {
                    class: 'col-xs-12 col-sm-6 wow fadeIn waves-effect waves-button',
                    'data-wow-delay': '0.2s'
                },
                reloadPage: true
            }
        );
    }
    catch (error) { console.log('agenda_page_row - ' + error); }
}

function agenda_page_empty(view)
{
    try {
        return "Событий не найдено";
    }
    catch (error) { console.log('agenda_page_empty - ' + error); }
}

/**
 * Implements hook_node_page_view_alter_TYPE().
 */
function agenda_node_page_view_alter_agenda(node, options)
{
    console.log('agenda_node_page_view_alter_agenda - ');
    try {
        var content = {};
        content['title'] = {
            markup: '<h2>' + node.title + '</h2>'
        };
        content['image'] = {
            theme: 'image',
            path: drupalgap_image_path(node.field_promo_image['und'][0]['uri'])
        };

        var dates = '01.02.2018 - 02.03.2018';
        content['info'] = {
            markup: '<div class="row">' +
                        '<div class="col-xs">' + node.field_location['und'][0]['value'] + '</div>' +
                        '<div class="col-xs">' + dates + '</div>' +
                    '</div>'
        };
        content['description'] = {
            markup: '<div class="description">' +
                        node.body['ru'][0]['safe_value'] +
                    '</div>'
        };

        options.success(content);
    }
    catch (error) { console.log('agenda_node_page_view_alter_agenda - ' + error); }
}