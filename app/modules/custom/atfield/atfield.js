var atfield_region = null;
var atfield_culture = null;

/**
 * Implements hook_menu().
 */
function atfield_menu()
{
    var items = {};
    items['atfield'] = {
        title: 'Препараты в поле',
        page_callback: 'atfield_list_page',
        pageshow: 'atfield_list_page_pageshow',
    };
    items['atfield/%'] = {
        title: 'Препараты в поле',
        page_callback: 'atfield_page',
        page_arguments: [1],
        pageshow: 'atfield_page_pageshow'
    };

    return items;
}

/**
 * -------------------------------------- Список Препаратов в поле -----------------------------------------------------
 */

// содержимое страницы
function atfield_list_page()
{
    try {
        var content = {};

        content.filter_r = {
            theme: 'atfield_filter',
            attributes: { class: 'region-filter' },
            default_value: atfield_region
        };
        content.filter_c = {
            theme: 'atfield_filter',
            attributes: { class: 'culture-filter' },
            default_value: atfield_culture
        };
        content.container = {
            markup: '<div id="atfield-container"></div>'
        };

        return content;
    }
    catch (error) { console.log('atfield_list_page - ' + error); }
}

function atfield_list_page_pageshow()
{
    console.log('atfield_list_page_pageshow - ');
    try {
        var content = {};

        // Build a Views Render Array with contextual filter.
        content.results = {
            theme: 'view',
            path: 'source/atfield.json/' + atfield_region + '/' + atfield_culture,
            format: 'ul',
            row_callback: 'atfield_list_page_row',
            empty_callback: 'atfield_list_page_empty'
        };

        // заполняем фильтр значениями только при инициализации
        views_datasource_get_view_result(
            'source/atfield-filters.json/' + atfield_region + '/' + atfield_culture, {
                success: function(result) {

                    if (result.length === 0) return;
                    var widget_r = $('select.region-filter');
                    var widget_c = $('select.culture-filter');

                    var options_r = '<option value="0">Все регионы</option>';
                    for (var index in result.regions) {
                        options_r += '<option value="' + index + '">' + result.regions[index] + '</option>';
                    }
                    $(widget_r).html(options_r);
                    $(widget_r).val(atfield_region == null ? 0 : atfield_region).attr('selected', true).siblings('option').removeAttr('selected');
                    $(widget_r).selectmenu('refresh', true);


                    var options_c = '<option value="0">Все культуры</option>';
                    for (var index in result.cultures) {
                        options_c += '<option value="' + index + '">' + result.cultures[index] + '</option>';
                    }
                    $(widget_c).html(options_c);
                    $(widget_c).val(atfield_culture == null ? 0 : atfield_culture).attr('selected', true).siblings('option').removeAttr('selected');
                    $(widget_c).selectmenu('refresh', true);
                }
            }
        );
        // Inject the rendered content into our div.
        $('#atfield-container').html(
            drupalgap_render(content)
        ).trigger('create');
    }
    catch (error) { console.log('atfield_list_page_pageshow - ' + error); }
}

function atfield_list_page_row(view, row, variables)
{
    // console.log('atfield_list_page_row');
    try {
        return atfield_get_card(row);
    }
    catch (error) { console.log('atfield_list_page_row - ' + error); }
}

function atfield_list_page_empty(view)
{
    return t('No content found.');
}

function atfield_filter_onchange(select)
{
    if (select.className == 'region-filter') atfield_region = select.value;
    if (select.className == 'culture-filter') atfield_culture = select.value;
    atfield_list_page_pageshow();
}

function theme_atfield_filter(variables)
{
    return theme('select', {
        default_value: variables.default_value,
        options: variables.options,
        attributes: {
            onchange: 'atfield_filter_onchange(this)',
            class: variables.attributes.class,
        }
    });
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
    if (preps_list === "") preps_list = 'не проводилась';

    var button = l('Подробнее', 'atfield/' + item.sid, {
        attributes: {
            class: 'ui-btn ui-mini ui-btn-inline ui-btn-raised waves-effect waves-button clr-warning'
        }
    });

    return  '<div class="nd2-card">' +
                '<div class="card-title">' +
                    '<h4 class="card-primary-title">' + l(item.region, 'atfield/' + item.sid) + '</h4>' +
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
function atfield_page(sid)
{
    var content = {};

    var attributes = {
        id: 'atfield-' + sid,
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
    try {
        atfield_load(sid, {
            success: function (season) {
                var season_html = theme('atfield_season_page', season);
                $('#atfield-' + sid).html(season_html).trigger('create');

                // запустить действия, привязанные к событию pagebeforeshow (закладки)
                $(document).trigger("pagebeforeshow");
            }
        });
    }
    catch (error) { console.log('atfield_page_pageshow - ' + error); }
}

function atfield_load(sid, options)
{
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
function theme_atfield_season_page(season)
{
    try {
        // console.log('theme_atfield_season_page - ');
        var html = '';

        // об авторе

        html += '<div class="atf-header">';
        html +=     '<h2>' + season.culture + '</h2>';
        html +=     '<h4>' + season.region + '</h4>';
        html +=     '<h5>' + season.farm + '</h5>';
        html +=     '<div class="atf-author">';
        html +=         '<div class="atf-photo">';
        html +=             theme('image', {path: season.author.photo});
        html +=         '</div>';
        html +=         '<div class="atf-text">';
        html +=             '<h4>' + season.author.full_name + '</h4>';
        html +=             '<h5>' + season.author.post + '</h5>';
        html +=         '</div>';
        html +=     '</div>';
        html += '</div>';

        html += '<div class="row">';
        html += '<div class="col-xs-12 col-sm-10 col-sm-offset-1">';

        // ДО обработки
        var before = season.measurements.shift();
        html += '<div data-role="collapsible" data-inset="false" data-collapsed="false" class="before">' +
                    '<h4>До обработки<i class="zmdi zmdi-caret-down" aria-hidden="true"></i></h4>';
        html +=     '<div class="atf-title">Поле ' + before.date + '</div>';
        html +=     theme('image', {path: before.image_field_thumb, fancybox: {image: before.image_field_full, title: before.comment}});
        html +=     '<div class="atf-comment">' + before.comment + '</div>';
        // ВО
        html +=     '<div class="atf-hobjects row">';
        $.each(before.hobjects, function(index, hobject) {
            var hobject_photo = drupalgap_image_path('public://default_images/noimage.png');
            if (hobject.photo !== '') hobject_photo = hobject.photo;
            var icon = ' zmdi-local-florist';
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
        html += '<div data-role="collapsible" data-inset="false" data-collapsed="false" class="after">' +
                    '<h4>После обработки<i class="zmdi zmdi-caret-down" aria-hidden="true"></i></h4>';
        // закладки
        html +=     '<ul id="before" data-role="nd2extTabs" data-swipe="true">';
        $.each(season.measurements, function(index, measurement) {
            html +=     '<li data-tab="tab-m-' + index + '">' + measurement.days_after + '</li>';
        });
        html +=     '</ul>';

        if (season.measurements.length > 0) {
        html +=     '<div data-role="nd2extTabs-container">';
            $.each(season.measurements, function(index, measurement) {
                html +=     '<div data-tab="tab-m-' + index + '">';
                html +=         '<div class="atf-title">Поле ' + measurement.date + '</div>';
                html +=         theme('image', {path: measurement.image_field_thumb, fancybox: {image: measurement.image_field_full, title: measurement.comment}});
                html +=         '<div class="atf-comment">' + measurement.comment + '</div>';
                // ВО
                html +=         '<div class="atf-hobjects row">';
                $.each(measurement.hobjects, function(index, hobject) {
                    var hobject_photo = drupalgap_image_path('public://default_images/noimage.png');
                    if (hobject.photo !== '') hobject_photo = hobject.photo;
                    var icon = ' zmdi-local-florist';
                    if (hobject.type === 'pest') icon = ' zmdi-bug';
                    if (hobject.type === 'disease') icon = ' zmdi-gesture';
                    var ho_title = hobject.name;
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
        html += '<div data-role="collapsible" data-inset="false" data-collapsed="false" class="processings">' +
                    '<h4>Проведенные обработки<i class="zmdi zmdi-caret-down" aria-hidden="true"></i></h4>';
        if (season.processings.length > 0) {
            html +=     '<ul id="after" data-role="nd2extTabs" data-swipe="true">';
            $.each(season.processings, function(index, processing) {
                var preparations = processing.preparation + (processing.preparation2 !== '' ? ' + ' + processing.preparation2 : '');
                html +=     '<li data-tab="tab-p-' + index + '">';
                html +=         '<div class="r1">' + processing.date + '</div><div class="r2">' + preparations + '</div>';
                html +=     '</li>';
            });
            html +=     '</ul>';

            html +=     '<div data-role="nd2extTabs-container">';
            $.each(season.processings, function(index, processing) {
                var comment = 'Обработка ' + processing.date + ' в ' + processing.time;
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
                html +=                 l(theme('image', {path: processing.image_prep_thumb}), 'node/' + processing.prep_nid, {'attributes': {'class': 'atf-prep'}});
                if (processing.preparation2 !== '')
                    html +=             l(theme('image', {path: processing.image_prep_thumb2}), 'node/' + processing.prep_nid2, {'attributes': {'class': 'atf-prep2'}});
                html +=             '</div>';
                html +=             '<div>';
                html +=                 l(processing.preparation, 'node/' + processing.prep_nid);
                if (processing.preparation2 !== '')
                    html +=             ' + ' + l(processing.preparation2, 'node/' + processing.prep_nid2);
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
        html += '</div>';
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