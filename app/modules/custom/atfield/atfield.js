/**
 * Implements hook_menu().
 */
function atfield_menu() {
    try {
        var items = {};
        items['atfield'] = {
            title: 'Препараты в поле',
            page_callback: 'atfield_list_page',
            pageshow: 'atfield_list_page_pageshow'
        };
        items['atfield/%'] = {
            title: 'Препараты в поле',
            page_callback: 'atfield_page',
            page_arguments: [1],
            pageshow: 'atfield_page_pageshow'
        };

        return items;
    }
    catch (error) {
        console.log('atfield_menu - ' + error);
    }
}

/**
 * Implements hook_theme().
 * @return {Object}
 */
function atfield_theme() {
    return {
        atfield_season_page: {
            template: 'atfield-season-page'
        }
    };
}

/**
 * -------------------------------------- Список Препаратов в поле -----------------------------------------------------
 */

/**
 * callback function
 * страница списка Препаратов в поле
 */
function atfield_list_page()
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
function atfield_list_page_pageshow()
{
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

/**
 * возвращает html карточки
 */
function atfield_get_card(item)
{
    //console.log('atfield_get_card - ');
    var photo = theme('image', {path: item.image_thumb});
    photo = l(photo, 'atfield/' + item.sid);

    // список препаратов
    var preps = [];
    for (var index in item.preps) {
        preps.push(l(item.preps[index], 'node/' + index));
    }
    var preps_list = preps.join('; ');
    if (preps_list !== "") preps_list = 'не проводилась';

    var button = l('Подробнее', 'atfield/' + item.sid, {
        attributes: {
            class: 'ui-btn ui-mini ui-btn-inline ui-btn-raised waves-effect waves-button clr-warning'
        }
    });

    return  '<div class="nd2-card">' +
                '<div class="card-title">' +
                    '<h4 class="card-primary-title">' + item.region + '</h4>' +
                    '<h5 class="card-subtitle">' + item.farm + '</h5>' +
                '</div>' +
                '<div class="card-media">' +
                    photo +
                '</div>' +
                '<div class="card-supporting-text has-action">' +
                    '<h4>' + item.culture + '</h4>' +
                    'Обработка препаратами: ' + preps_list + '<br />' +
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
                                button +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
}

/**
 * -------------------------------------- Страница Препаратов в поле ---------------------------------------------------
 */

/**
 * The atfield page callback.
 */
function atfield_page(sid) {
    var content = {};

    var attributes = {
        id: atfield_page_container_id(sid),
        class: 'atfield'
    };
    content['container'] = {
        markup: '<div ' + drupalgap_attributes(attributes) + '></div>'
    };

    return content;
}

/**
 * The atfield pageshow event handler.
 */
function atfield_page_pageshow(sid)
{
    atfield_load(sid, {
        success: function(season) {

            var season_html = theme('atfield_season_page', {
                season: season
            });

            // Inject it into the container.
            var container_id =  atfield_page_container_id(sid);
            $('#' + container_id).html(season_html).trigger('create');

            // запустить действия, привязанные к событию pagebeforeshow (закладки)
            $(document).trigger("pagebeforeshow");
        }
    });
}

/**
 * Returns a unique html element id to use for an individual atfield div container.
 */
function atfield_page_container_id(sid) {
    return 'atfield-' + sid;
}

function atfield_load(sid, options) {
    try {
        options.method = 'GET';
        options.path = 'atfield/' + sid + '.json';
        options.service = 'atfield';
        options.resource = 'retrieve';
        Drupal.services.call(options);
    }
    catch (error) {
        console.log('atfield_load - ' + error);
    }
}

/**
 * -------------------------------------- Шаблоны ----------------------------------------------------------------------
 */
function theme_atfield_season_page(vars)
{
    try {
        console.log('theme_atfield_season_page - ');
        var html = '';

        // ДО обработки
        var before = vars.season.measurements.shift();
        html += '<div data-role="collapsible" data-inset="false" data-collapsed="false" class="before ui-collapsible-transparent">' +
                    '<h4>До обработки<i class="zmdi zmdi-caret-down" aria-hidden="true"></i></h4>';
        html +=     '<div class="atf-title">Поле ' + before.date + '</div>';
        html +=     theme('image', {path: before.image_field_thumb, fancybox: {image: before.image_field_full, title: before.comment}});
        html +=     '<div class="atf-comment">' + before.comment + '</div>';
        // ВО
        html +=     '<div class="atf-hobjects row">';
        $.each(before.hobjects, function(index, hobject) {
            let hobject_photo = drupalgap_image_path('public://default_images/noimage.png');
            if (hobject.photo !== '') hobject_photo = hobject.photo;
            let icon = ' zmdi-local-florist';
            if (hobject.type === 'pest') icon = ' zmdi-bug';
            if (hobject.type === 'disease') icon = ' zmdi-gesture';
            html +=     '<div class="col-xs-4">';
            html +=         theme('image', {path: hobject_photo, fancybox: {image: hobject_photo, title: hobject.name}});
            html +=         '<div class="atf-ho-title"><i class="zmdi' + icon + '"></i>' + hobject.name + '</div>';
            html +=     '</div>';
        });
        html +=     '</div>';
        // культура
        html +=     '<div class="atf-title">Культура ' + before.date + '</div>';
        html +=     theme('image', {path: before.image_culture_thumb, fancybox: {image: before.image_culture_full}});
        html +=     '<dl class="atf-info">';
        html +=         '<dt>Фаза роста: <dd>' + before.phase;
        html +=         '<dt>Состояние: <dd>' + before.condition;
        html +=     '</dl>';
        html += '</div>';

        // ПОСЛЕ обработки
        html += '<div data-role="collapsible" data-inset="false" data-collapsed="false" class="after ui-collapsible-transparent">' +
                    '<h4>После обработки<i class="zmdi zmdi-caret-down" aria-hidden="true"></i></h4>';
        // закладки
        html +=     '<ul id="before" data-role="nd2extTabs" data-swipe="true">';
        $.each(vars.season.measurements, function(index, measurement) {
            html +=     '<li data-tab="tab-m-' + index + '">' + measurement.days_after + '</li>';
        });
        html +=     '</ul>';

        if (vars.season.measurements.length > 0) {
        html +=     '<div data-role="nd2extTabs-container">';
            $.each(vars.season.measurements, function(index, measurement) {
                html +=     '<div data-tab="tab-m-' + index + '">';
                html +=         '<div class="atf-title">Поле ' + measurement.date + '</div>';
                html +=         theme('image', {path: measurement.image_field_thumb, fancybox: {image: measurement.image_field_full, title: measurement.comment}});
                html +=         '<div class="atf-comment">' + measurement.comment + '</div>';
                // ВО
                html +=         '<div class="atf-hobjects row">';
                $.each(measurement.hobjects, function(index, hobject) {
                    let hobject_photo = drupalgap_image_path('public://default_images/noimage.png');
                    if (hobject.photo !== '') hobject_photo = hobject.photo;
                    let icon = ' zmdi-local-florist';
                    if (hobject.type === 'pest') icon = ' zmdi-bug';
                    if (hobject.type === 'disease') icon = ' zmdi-gesture';
                    let ho_title = hobject.name;
                    ho_title += hobject.percent !== '' ? ' <span>( -' + hobject.percent + ' %)</span>' : '';
                    html +=         '<div class="col-xs-4">';
                    html +=             theme('image', {path: hobject_photo, fancybox: {image: hobject_photo, title: ho_title}});
                    html +=             '<div class="atf-ho-title"><i class="zmdi' + icon + '"></i>' + ho_title + '</div>';
                    html +=         '</div>';
                });
                html +=         '</div>';

                // культура
                html +=         '<div class="atf-title">Культура ' + measurement.date + '</div>';
                html +=         theme('image', {path: measurement.image_culture_thumb, fancybox: {image: measurement.image_culture_full}});
                html +=         '<dl class="atf-info">';
                html +=            '<dt>Фаза роста: <dd>' + measurement.phase;
                html +=            '<dt>Состояние: <dd>' + measurement.condition;
                html +=         '</dl>';
                html +=     '</div>';
            });
         }
        else {
            html += '<div class="empty">Замеры не проводились</div>';
        }
        html +=     '</div>';
        html += '</div>';

        // ПРОВЕДЕННЫЕ обработки
        html += '<div data-role="collapsible" data-inset="false" data-collapsed="false" class="processings ui-collapsible-transparent">' +
                    '<h4>Проведенные обработки<i class="zmdi zmdi-caret-down" aria-hidden="true"></i></h4>';
        if (vars.season.processings.length > 0) {
            html +=     '<ul id="after" data-role="nd2extTabs" data-swipe="true">';
            $.each(vars.season.processings, function(index, processing) {
                html +=     '<li data-tab="tab-p-' + index + '">';
                html +=         '<div class="r1">' + processing.date + '</div><div class="r2">' + processing.preparation + '</div>';
                html +=     '</li>';
            });
            html +=     '</ul>';

            html +=     '<div data-role="nd2extTabs-container">';
            $.each(vars.season.processings, function(index, processing) {
                let comment = 'Обработка ' + processing.date + ' в ' + processing.time;
                html +=     '<div data-tab="tab-p-' + index + '">';
                html +=         '<div class="atf-image-wr">';
                html +=             theme('image', {path: processing.image_thumb, fancybox: {image: processing.image_full, title: comment}});
                html +=             '<div class="atf-title">' + comment + '</div>';
                html +=         '</div>';
                html +=         '<dl class="atf-info">';
                html +=             '<dt>Расход раб. жидкости:<dd>' + processing.consumption + ' л/га';
                html +=             '<dt>Кислотность почвы:<dd>'    + processing.acidity;
                html +=             '<dt>Влажность почвы:<dd>'      + processing.humidity + ' %';
                html +=             '<dt>Температура, ночь:<dd>'    + processing.t_night + ' град. С';
                html +=             '<dt>Температура, день:<dd>'    + processing.t_day + ' град. С';
                html +=             '<dt>Скорость ветра:<dd>'       + processing.wind + ' м/с';
                html +=             '<dt>Осадки:<dd>'               + processing.precipitation;
                html +=             '<dt>Механизм внесения:<dd>'    + processing.mechanism;
                html +=         '</dl>';
                html +=         '<div class="atf-preparation">';
                html +=             '<div class="atf-prep-images">';
                html +=                 l(theme('image', {path: processing.image_prep_thumb}), processing.prep_link, {'attributes': {'class': 'atf-prep'}});
                if (processing.preparation2 !== '')
                    html +=             l(theme('image', {path: processing.image_prep_thumb2}), processing.prep_link2, {'attributes': {'class': 'atf-prep2'}});
                html +=             '</div>';
                html +=             '<div>';
                html +=                 l(processing.preparation, processing.prep_link);
                if (processing.preparation2 !== '')
                    html +=             ' + ' + l(processing.preparation, processing.prep_link);
                html +=                 '<br />';
                html +=                 '<span>';
                html +=                     processing.ingredients;
                if (processing.preparation2 !== '')
                    html +=                 '<br />' + processing.ingredients2;
                html +=                 '</span>';
                html +=             '</div>';
                html +=         '</div>';
                html +=     '</div>';
            });
        }
        else {
            html += '<div class="empty">Нет данных</div>';
        }
        html +=     '</div>';

        html += '</div>';

        // будем биндить на скролл, вероятность прогрузки изображений - 99%
        $(document).bind("scroll", function (event) {
            // найти все Табы
            $('body').find('[data-role="nd2extTabs"]').each(function(index){
                // просмотреть все закладки Таба и установить высоту контейнера
                var height = 0;
                $(this).next('[data-role="nd2extTabs-container"]').find('div[data-tab^="tab-"]').each(function(index){
                    height = height < $(this).height() ?  $(this).height() : height;
                });
                if (height > 0) $(this).next('[data-role="nd2extTabs-container"]').height(height);
            });
        });

        return html;
    }
    catch (error) {
        console.log('theme_atfield_season_page - ' + error);
    }
}