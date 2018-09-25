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
                        items_html.push(representatives_get_card(index, items[index]));
                    }

                    // выводим
                    drupalgap_item_list_populate('#representatives_listing_items', items_html);
                }
            }
        );
    }
    catch (error) { console.log('node_page_pageshow - ' + error); }
}

/**
 * возвращает html карточки
 */
function representatives_get_card(delta, item)
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
            // var button_link = bl(', , { InAppBrowser: true, });
            var button_link = bl('<i class="zmdi zmdi-phone"></i>&nbsp;&nbsp;' + item.phones[index], null, {
                attributes: {
                    class: 'ui-btn ui-mini ui-btn-raised waves-effect waves-button' ,
                    onclick: "window.open('" + "tel:" + call + "', '_system', 'location=yes')"
                }
            });
            phones.push(button_link);
        }
    }

    var emails = [];
    if (typeof item.emails !== 'undefined') {
        for(index in item.emails) {
            // var button_link = bl('<i class="zmdi zmdi-email"></i>&nbsp;&nbsp;' + item.emails[index], 'mailto:' + item.emails[index], { InAppBrowser: true, attributes: { class: 'ui-btn ui-mini ui-btn-raised waves-effect waves-button' }});
            var button_link = bl('<i class="zmdi zmdi-email"></i>&nbsp;&nbsp;' + item.emails[index], null, {
                attributes: {
                    class: 'ui-btn ui-mini ui-btn-raised waves-effect waves-button' ,
                    onclick: "window.open('mailto:" + item.emails[index] + "', '_system', 'location=yes')"
                }
            });
            emails.push(button_link);
        }
    }

    return '<div class="nd2-card card-media-right card-media-small">' +
                '<div class="card-media">' +
                    photo +
                '</div>' +
                '<div class="card-title has-supporting-text">' +
                    '<h4 class="card-primary-title">' + name + '</h4>' +
                    '<h5 class="card-subtitle">' + item.office + '</h5>' +
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