/**
 * Implements hook_menu().
 */
function representatives_menu() {
    try {
        var items = {};
        items['representatives'] = {
            title: 'Представители',
            page_callback: 'representatives_page',
            pageshow: 'representatives_page_pageshow'
        };

        return items;
    }
    catch (error) {
        console.log('representatives_menu - ' + error);
    }
}

/**
 * callback function
 * страница представителей
 */
function representatives_page()
{
    try {
        console.log('representatives_page - ');

        var content = {};
        content['list'] = {
            theme: 'jqm_item_list',
            format_attributes: {
                'data-inset': 'true'
            },
            items: [],
            attributes: {
                'id': 'representatives_listing_items'
            }
        };
        return content;
    }
    catch (error) {
        console.log('representatives_page - ' + error);
    }
}

/**
 * The pageshow callback for the representatives listing page.
 */
function representatives_page_pageshow() {
    try {
        // Grab some recent content and display it.
        views_datasource_get_view_result(
            'source/representatives', {
                success: function(content) {
                    // Extract the nodes into items, then drop them in the list.
                    var items = [];
                    var reps = content.representatives;

                    // сформировать массив выводимых представителей
                    // директора не выводим
                    delete reps.head;
                    // сначала глава отдела продаж
                    items.push(reps.head2['sales_head']); delete reps.head2['sales_head'];
                    // региональные менеджеры
                    for (var index in reps.head2) {
                        items.push(reps.head2[index]);
                    }
                    delete reps.head2;
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
                        items_html.push(representatives_get_card(items[index]));
                    }

                    // выводим
                    drupalgap_item_list_populate('#representatives_listing_items', items_html);
                }
            }
        );
    }
    catch (error) { console.log('node_page_pageshow - ' + error); }
}

function representatives_get_card(item)
{
    var name = item.surname + '<br />' + item.name + ' ' + item.name2;

    var photo = theme('image', {path: Drupal.settings.site_path + item.photo});

    var regions = [];
    if (typeof item.regions !== 'undefined') {
        for(index in item.regions) { regions.push(item.regions[index]); }
    }

    var phones = [];
    if (typeof item.phones !== 'undefined') {
        for(index in item.phones) {
            var call = item.phones[index];
            call = call.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/ /g, '');
            phones.push('<a href="tel:' + call + '" class="ui-btn ui-mini ui-btn-raised waves-effect waves-button"><i class="zmdi zmdi-phone"></i> ' + item.phones[index] + '</a>');
        }
    }

    var emails = [];
    if (typeof item.emails !== 'undefined') {
        for(index in item.emails) {
            emails.push('<a href="mailto:' + item.emails[index] + '" class="ui-btn ui-mini ui-btn-raised waves-effect waves-button"><i class="zmdi zmdi-email"></i> ' + item.emails[index] + '</a>');
        }
    }


    return '<div class="nd2-card card-media-right card-media-small">' +
                '<div class="card-media">' +
                    photo +
                '</div>' +
                '<div class="card-title has-supporting-text">' +
                    '<h4 class="card-primary-title">' + name + '</h4>' +
                    '<h5 class="card-subtitle font-small">' + item.office + '</h5>' +
                '</div>' +
                '<div class="card-supporting-text has-action has-title">' + regions.join(', ') + '</div>' +
                '<div class="card-action">' +
                    '<div class="row between-xs">' +
                        '<div class="col-xs-6">' +
                            '<div class="box">' + phones.join('') + '</div>' +
                        '</div>' +
                        '<div class="col-xs-6">' +
                            '<div class="box">' + emails.join('') + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
}