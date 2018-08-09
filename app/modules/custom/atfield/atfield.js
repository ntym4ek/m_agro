/**
 * Implements hook_menu().
 */
function atfield_menu() {
    try {
        var items = {};
        items['atfield'] = {
            title: 'Препараты в поле',
            page_callback: 'atfield_page',
            pageshow: 'atfield_page_pageshow'
        };

        return items;
    }
    catch (error) {
        console.log('atfield_menu - ' + error);
    }
}

/**
 * callback function
 * страница представителей
 */
function atfield_page()
{
    try {
        console.log('atfield_page - ');

        var content = {};
        content['list'] = {
            theme: 'jqm_item_list',
            format_attributes: {
                'data-inset': 'true'
            },
            items: [],
            attributes: {
                'id': 'atfield_listing_items'
            }
        };
        return content;
    }
    catch (error) {
        console.log('atfield_page - ' + error);
    }
}

/**
 * The pageshow callback for the atfield listing page.
 */
function atfield_page_pageshow() {
    try {
        // Grab some recent content and display it.
        views_datasource_get_view_result(
            'source/atfield.json', {
                success: function(content) {
                    console.log('atfield_page_pageshow - ');
                    // преобразуем массив сезонов в массив выводимых карточек
                    var atfield_html = [];
                    for (var index in content.atfield) {
                        atfield_html.push(atfield_get_card(content.atfield[index]));
                    }

                    // выводим
                    drupalgap_item_list_populate('#atfield_listing_items', atfield_html);
                }
            }
        );
    }
    catch (error) { console.log('atfield_page_pageshow - ' + error); }
}

function atfield_get_card(item)
{
    var photo = theme('image', {path: item.image_thumb});

    // список препаратов
    var preps = [];
    for (var index in item.preps) {
        preps.push(l(item.preps[index], 'node/' + index));
    }

    // ссылка на подробное описание
    var atfield_button = l('Подробнее', 'atfield/' + item.sid, {
        attributes: {
            class: 'ui-btn ui-mini ui-btn-inline ui-btn-raised waves-effect waves-button clr-warning'
        }
    });

    return  '<div class="nd2-card">' +
                '<div class="card-title">' +
                    '<h4 class="card-primary-title">' + item.region + '</h4>' +
                    '<h4 class="card-subtitle">' + item.farm + '</h4>' +
                '</div>' +
                '<div class="card-media">' +
                    photo +
                '</div>' +
                '<div class="card-supporting-text has-action">' +
                    '<h4>' + item.culture + '</h4>' +
                    'Обработка препаратами: ' + preps.join('; ') + '<br />' +
                '</div>' +
                '<div class="card-action">' +
                    '<div class="row between-xs">' +
                        '<div class="col-xs-6">' +
                            '<div class="box footer">' +
                                item.footer +
                            '</div>' +
                        '</div>' +
                        '<div class="col-xs-6 align-right">' +
                            '<div class="box">' +
                                atfield_button +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
}