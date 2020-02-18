/**
 * Implements hook_menu().
 */
function representatives_menu()
{
    var items = {};
    items['representatives'] = {
        title: 'Представители',
        page_callback: 'representatives_page',
        pageshow: 'representatives_page_pageshow'
    };

    return items;
}

/**
 * callback function
 * страница представителей
 */
function representatives_page()
{
    return {
        'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-8 col-sm-offset-2">'},
        'form': { markup: drupalgap_render(drupalgap_get_form('representatives_filter_form')) },
        'list': {
            theme: 'jqm_item_list',
            format_attributes: {
                'data-inset': 'true'
            },
            items: [],
            attributes: {
                'id': 'representatives_listing_items'
            }
        },
        'suffix': { markup: '</div></div>' }
    };
}

/**
 * The pageshow callback for the representatives listing page.
 */
function representatives_page_pageshow(region_id)
{
    try {
        // console.log('representatives_page_pageshow - ');

        var rid = region_id ? '/' + region_id : '';
        // Grab some recent content and display it.
        views_datasource_get_view_result(
            'source/representatives' + rid, {
                success: function(content) {
                    // Extract the nodes into items, then drop them in the list.
                    var items = [];
                    var sales = content.representatives;

                    // сформировать массив выводимых представителей
                    // региональные менеджеры
                    for (var index in sales.heads) {
                        items.push(sales.heads[index]);
                    }

                    for (var index in sales.reps) {
                        items.push(sales.reps[index]);
                    }

                    // преобразуем массив представителей в массив выводимых карточек
                    var items_html = [];
                    for (var index in items) {
                        items_html.push(representatives_get_card_html(index, items[index]));
                    }

                    // выводим
                    drupalgap_item_list_populate('#representatives_listing_items', items_html);
                    // подцепить обработчики для добавленного контента
                    $('#representatives_listing_items').trigger("create");

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
                    var widget = $('select.representatives_filter');

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
    catch (error) { console.log('representatives_page_pageshow - ' + error); }
}

/**
 * возвращает html карточки
 */
function representatives_get_card_html(delta, item)
{
    //console.log('representatives_get_card - ');

    var name = item.surname + '<br />' + item.name + ' ' + item.name2;

    var photo = theme('image', {path: Drupal.settings.site_path + item.photo});

    var regions = [];
    if (typeof item.regions !== 'undefined') {
        for(index in item.regions) { regions.push(item.regions[index].name); }
    }

    var whatsapp = '';
    if (item.expert) {
        var call = item.expert;
        call = call.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/ /g, '').replace(/\+/g, '');
        whatsapp = l(
            '<div class="icon">' +
                '<div class="waves-effect waves-button">' +
                    '<img src="app/themes/agro/images/buttons/whatsapp.png">' +
                '</div>' +
            '</div>',
            null,
            {
                attributes: {
                    class: 'ui-link',
                    onclick: "window.open('" + "https://wa.me/" + call + "', '_system', 'location=yes')"
                }
            }) + '<div class="title">' + item.expert + '</div>';
    }

    var phones = [];
    if (typeof item.phones !== 'undefined') {
        for(index in item.phones) {
            var call = item.phones[index];
            call = call.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/ /g, '');
            var icon = 'cell-phone';
            if (item.phones[index][0] === '8') icon = 'home-phone';
            var button_link = l(
                '<div class="icon">' +
                    '<div class="waves-effect waves-button">' +
                        '<img src="app/themes/agro/images/buttons/' + icon + '.png">' +
                    '</div>' +
                '</div>',
                null,
                {
                    attributes: {
                        class: 'ui-link',
                        onclick: "window.open('" + "tel:" + call + "', '_system', 'location=yes')"
                    }
                }) + '<div class="title">' + item.phones[index] + '</div>';
            phones.push('<div class="col-xs-4">' + button_link + '</div>');
        }
    }

    var emails = [];
    if (typeof item.emails !== 'undefined') {
        for(index in item.emails) {
            var button_link = l(
                '<div class="icon">' +
                    '<div class="waves-effect waves-button">' +
                        '<img src="app/themes/agro/images/buttons/mail.png">' +
                    '</div>' +
                '</div>',
                null,
                {
                    attributes: {
                        class: 'ui-link',
                        onclick: "window.open('mailto:" + item.emails[index] + "', '_system', 'location=yes')"
                    }
                }) + '<div class="title">' + item.emails[index] + '</div>';
            emails.push('<div class="col-xs-4">' + button_link + '</div>');
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
                (regions.length > 4 ?   '<div data-role="collapsible" class="ui-collapsible">' +
                                        '<h4 class="ui-collapsible-heading">Список регионов<i class="zmdi zmdi-caret-down" aria-hidden="true"></i></h4>' +
                                        '<div class="ui-collapsible-content ui-body-inherit card-supporting-text">' +
                                            regions.join(', ') +
                                        '</div>' +
                                    '</div>'
                    : '<div class="card-supporting-text has-action has-title">' + regions.join(', ') + '</div>') +
                '<div class="card-action">' +
                    '<div class="row between-xs">' +
                        (whatsapp ? '<div class="col-xs-4">' + whatsapp + '</div>' : '') +
                        phones.join('') +
                        emails.join('') +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
}

/**
 * форма отправки Запроса
 */
function representatives_filter_form(form, form_state)
{
    try {
        form.options.attributes['class'] += 'representatives-filter-form';

        form.elements['intro'] = {
            markup: '<h3>Найти представителя</h3><p>Выберите регион, чтобы отфильтровать список</p>'
        };
        form.elements['region'] = {
            type: 'select',
            attributes: {
                'data-native-menu': false,
                onchange: '_representatives_filter_onchange(this)',
                class: 'representatives_filter'
            },
            options: { '': 'Регион', 0: 'Все регионы' },
            children: []
        };

        return form;
    } catch (error) { console.log('representatives_filter_form - ' + error); }
}

function _representatives_filter_onchange(select)
{
    representatives_page_pageshow($(select).val());
}
