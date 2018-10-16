// переменная для расчёта стоимости препаратов
var area = 1;

/**
 * Implements hook_menu().
 */
function protection_menu()
{
    var items = {};
    items['protection'] = {
        title: 'Системы защиты',
        page_callback: 'protection_list_page'
    };
    items['protection-system/%'] = {
        title: 'Программа защиты',
        page_callback: 'protection_page',
        page_arguments: [1],
        pageshow: 'protection_page_pageshow'
    };

    return items;
}

/**
 * ----------------------------------------------- Каталог СЗ ----------------------------------------------------------
 */
function protection_list_page()
{
    try {
        var content = {};
        content['list'] = {
            theme: 'view',
            format_attributes: {
                'data-inset': 'true',
                'class': 'row'
            },
            path: 'protection-catalog.json',
            row_callback: 'protection_list_page_row'
        };
        return content;
    }
    catch (error) { console.log('protection_list_page - ' + error); }
}

function protection_list_page_row(view, row)
{
    try {
        var content = '';
        var image = theme('image', { path: row.bkg.src });

        content +=  '<div class="box">';
        content +=      image;
        content +=      '<div class="icon"><img src="' + row.icon.src + '"></div>';
        content +=  '</div>';
        content +=  '<div class="title">' + row.title + '</div>';

        return l(content, 'protection-system/' + row.nid, {
            'attributes': {
                'class': 'category-item col-xs-12 col-sm-6 wow fadeIn waves-effect waves-button',
                'data-wow-delay': '0.2s'
            }
        });

    }
    catch (error) { console.log('protection_list_page_row - ' + error); }
}

/**
 * -------------------------------------- Страница Категорий программы -------------------------------------------------
 */

/**
 * The protection program categories page callback.
 */
function protection_page(pid)
{
    var content = {};
    var attributes = {
        id: 'protection-' + pid,
        class: 'protection-view'
    };
    content['container'] = {
        markup: '<div ' + drupalgap_attributes(attributes) + '></div>'
    };

    return content;
}

/**
 * The protection program categories pageshow event handler.
 */
function protection_page_pageshow(pid)
{
    try {
        // console.log('protection_page_pageshow - ');
        var parameters = {
            'program_id' : pid
        };

        program_load({
            data: JSON.stringify({ 'parameters' : parameters }),
            success: function (program) {
                var html = theme('program_cat_page', program);
                $('#protection-' + pid).html(html).trigger('create');
            }
        });
    }
    catch (error) { console.log('protection_page_pageshow - ' + error); }
}

function program_load(options)
{
    try {
        options.method = 'POST';
        options.path = 'reglaments/get_protection_system.json';
        options.service = 'reglaments';
        options.resource = 'get_protection_system';
        Drupal.services.call(options);
    }
    catch (error) { console.log('program_load - ' + error); }
}

function theme_program_cat_page(program)
{
    try {
         //console.log('theme_program_cat_page - ');
        var html = '';
        area = program.header.area;

        html += '<h2>' + program.header.title + (program.header.area ? '<span>, <span>' + program.header.area + ' га</span></span>': '') + '</h2>';
        if (program.header.phase) html += '<h3>' + program.header.phase + '</h3>';
        html += '<h4>' + program.header.description + '</h4>';
        if (program.header.pdf)
            html += '<a onclick="window.open(\'' + program.header.pdf + '\', \'_system\', \'location=yes\')" class="btn-download ui-btn ui-btn-inline ui-btn-fab ui-btn-raised clr-primary waves-effect waves-button"><i class="zmdi zmdi-download zmd-2x"></i></a>';

        if (area) {
            html += '<div class="select-all"><div>выбрать все препараты</div><div><select name="flip-all" id="flipper" data-role="slider" data-mini="true"><option value="off">Off</option><option value="on">On</option></select></div></div>';
        }

        html += '<div class="row">';
        if (program.categories) {
            $.each(program.categories, function (index, category) {
                var tid = category.tid;
                var image = theme('image', {path: category.bkg});
                var icon = theme('image', {path: category.icon});

                html += '<div class="list-item col-xs-12 col-sm-6 category-' + tid + '" data-role="collapsible" data-inset="false">';

                html += '<h4 class="category-item wow fadeIn waves-effect waves-button" data-wow-delay="0.2s" id="cat-' + tid + '" data-cnt="0">';
                html += '<div class="box">';
                html += image;
                if (area) html += '<div class="amountByCat">' +
                    '<div><h5 class="clr-category">НА ГЕКТАР</h5><p class="amount"></p></div>' +
                    '<div><h5 class="clr-category">ВСЕГО</h5><p class="total"></p></div>' +
                    '</div>';
                html += '<div class="icon">' + icon + '</div>';
                html += '</div>';
                html += '<div class="title">' + category.name + '</div>';
                html += '</h4>';

                html += '<div>';

                if (category.stages) {
                    $.each(category.stages, function (num, stage) {
                        $.each(stage, function (duration, set) {
                            $.each(set, function (key, reglament) {

                                var icon = theme('image', {path: reglament.preparations.icon});
                                var title = reglament.preparations.title.split('|')[0];
                                var title_suffix = reglament.preparations.title.split('|')[1] !== undefined ? reglament.preparations.title.split('|')[1] : '';

                                // содержимое бокса
                                var text = '';
                                text += reglament.preparations.ingredients ? reglament.preparations.ingredients + '<br />' : '';
                                if (!program.header.phase) text += '<span class="period clr-category">Фаза культуры</span><br />' + (reglament.period.start.tid == reglament.period.end.tid ? reglament.period.start.name : reglament.period.start.name + ' - <span>' + reglament.period.end.name) + '</span><br />';
                                if (reglament.hobjects && reglament.hobjects.length) text += '<span class="hobjects clr-category">Вредные объекты</span><br />' + reglament.hobjects + '<br />';

                                var photos = [], prices = [], rates = [], rates_title_arr = [], rates_content_arr = [];
                                $.each(reglament.preparations['items'], function (key_p, preparation) {
                                    photos.push(theme('image', {path: preparation.photo}));
                                    prices.push(preparation.price);
                                    // rates.push(preparation.rate);

                                    var rate = '';
                                    if (program.header.area) {
                                        // определить шаг, по кол-ву знаков после запятой
                                        var step = 1;
                                        var count = 0;
                                        if (String(preparation.rate.from).split('.')[1]) {
                                            count = String(preparation.rate.from).split('.')[1].length;
                                            step = 1 / Math.pow(10, count);
                                        }
                                        if (String(preparation.rate.to).split('.')[1]) {
                                            count = String(preparation.rate.to).split('.')[1].length;
                                            step = 1 / Math.pow(10, count) < step ? 1 / Math.pow(10, count) : step;
                                        }

                                        rates_title_arr.push(preparation.units);
                                        rate = '<input ' + (preparation.rate.from === preparation.rate.to ? 'disabled="disabled"' : '') + ' type="range" name="slider-' + key + '-' + preparation.id + '-' + num + '" id="slider-' + key + '-' + preparation.id + '-' + num + '" value="' + preparation.rate.from + '" min="' + preparation.rate.from + '" max="' + preparation.rate.to + '" step="' + step + '" data-highlight="true">';
                                    }
                                    else {
                                        rate = preparation.rate.from + (preparation.rate.from === preparation.rate.to ? '' : ' - ' + preparation.rate.to) + ' ' + preparation.units;
                                    }
                                    rates_content_arr.push(rate);

                                });
                                text += '<span class="rate clr-category">Норма расхода' + (rates_title_arr.length ? ', ' + rates_title_arr.join(' + ') : '') + '</span><br />';
                                if (program.header.area) {
                                    text += rates_content_arr.join('');
                                } else {
                                    text += rates_content_arr.join(' + ');
                                    text += '<br />';
                                }

                                var url = reglament.preparations.type == 'product_mix' ? null : 'node/' + reglament.preparations.id;

                                var product = '<div class="product-item">';
                                product += '<div class="title"><span class="clr-category">' + l(title, url) + '</span> ' + title_suffix + '</div>';
                                product += '<div class="box">';
                                product += '<div class="image">' + photos[0] + '</div>';
                                if (photos[1]) product += '<div class="image1">' + photos[1] + '</div>';
                                product += '<p class="description font-small">' + text + '</p>';
                                product += '</div>';

                                if (program.header.area) {
                                    product +=  '<div class="calculation">' +
                                                '<div class="calc-wrapper"><div class="amountByItem"></div></div>' +
                                                '<select name="flip-' + key + '-' + num + '" id="flip-' + key + '-' + num + '" data-role="slider" data-price0="' + prices[0] + '" data-price1="' + prices[1] + '" data-mini="true"><option value="off">Off</option><option value="on">On</option></select>' +
                                                '</div>';
                                } else {
                                    product += '<div class="icon">' + icon + '</div>';
                                }
                                product += '</div>';

                                html += product;
                            });
                        });
                    });
                }

                // повесить обработчики на элементы управления расчётом
                html += drupalgap_jqm_page_event_script_code({
                    page_id: drupalgap_get_page_id(),
                    jqm_page_event: 'pageshow',
                    jqm_page_event_callback: '_set_sliders_event'
                });

                // вывести неизлечимые ВО
                if (category.hobjects) {
                    var phase = program.header.phase ? ' на этапе "' + program.header.phase + '"' : '';
                    html += 'По препаратам против вредных объектов ' + category.hobjects + '' + phase;
                    html += ' свяжитесь с нашими специалистами на странице ' + l('Представителей', 'representatives');
                }
                html += '</div>';
                html += '</div>';
            });

            if (area) {
                html += '<div class="list-item col-xs-12 col-sm-6 category-calculation">';
                html += '<h4 >Итог по программе</h4>';
                html += '<div class="amountByProgram">' +
                    '<div><h5>НА ГЕКТАР</h5><p class="amount">0 руб.</p></div>' +
                    '<div><h5>ВСЕГО</h5><p class="total">0 руб.</p></div>' +
                    '</div></div>';
            }

        }
        else {
            html +=  '<div class="col-xs-12">Для культуры на данном этапе роста у нашей компании нет препаратов.</div>';
        }
        html +=  '</div>';

        return html;
    }
    catch (error) { console.log('theme_program_cat_page - ' + error); }
}

function recalculate(e)
{
    console.log('recalculate');
    try {
        // нажат выбрать все
        if ($(e.target).attr('id') === 'flipper') {
            $('#solution_page [id^=flip-]').each(function (index, flip) {
                console.log($(flip).attr('id'));
                var state = $(e.target).val();
                $(flip).val(state).slider('refresh');
                _switch_flip(flip);
            });
        } else {
            if ($(e.target).hasClass('ui-slider-switch')) {
                _switch_flip(e.target);
            }
        }
        // показать/убрать расчёты

        var calc_arr = {};
        $('.product-item').each(function (key, item) {
            if ($(item).find('[id^=flip-]').val() === 'on') {
                var amountByItem = 0;
                $(item).find('[id^=slider-]').each(function (index, slider) {
                    var rate = $(slider).val();
                    var price = $(item).find('[id^=flip-]').data('price' + index);
                    amountByItem += amountByItem + rate * price;
                });

                $(item).find('.amountByItem').html(accounting.formatNumber(amountByItem, 0, " ") + ' руб.' + ' x ' + area + ' га = ' + accounting.formatNumber(amountByItem * area, 0, " ") + ' руб.');

                var cat_id = $(item).closest('.list-item').find('.category-item').attr('id');
                if (!calc_arr[cat_id]) calc_arr[cat_id] = 0;
                if (!calc_arr.total) calc_arr.total = 0;
                calc_arr[cat_id] += amountByItem;
                calc_arr.total += amountByItem;
            }
        });

        for (var index in calc_arr) {
            $('#' + index).find('.amountByCat .amount').html(accounting.formatNumber(calc_arr[index], 0, " ") + ' руб.');
            $('#' + index).find('.amountByCat .total').html(accounting.formatNumber(calc_arr[index] * area, 0, " ") + ' руб.');
        }
        $('.amountByProgram .amount').html(accounting.formatNumber(calc_arr.total, 0, " ") + ' руб.');
        $('.amountByProgram .total').html(accounting.formatNumber(calc_arr.total * area, 0, " ") + ' руб.');
    }
    catch (error) { console.log('recalculate - ' + error); }
}

// переключить flip и показать/скрыть расчёты
function _switch_flip(flip)
{
    try {
        var category = $(flip).closest('.list-item').find('.category-item');
        var cnt = $(category).data('cnt');
        if ($(flip).val() === 'on') {
            $(flip).closest('.product-item').find('.amountByItem').addClass('is-active');
            $(category).data('cnt', cnt + 1);
            if (!cnt) {
                $(category).find('.image-loader').addClass('is-active');
            }
        } else {
            $(flip).closest('.product-item').find('.amountByItem').removeClass('is-active');
            cnt = cnt - 1;
            if (!cnt) {
                $(category).find('.image-loader').removeClass('is-active');
            }
            $(category).data('cnt', cnt);
        }
    }
    catch (error) { console.log('_switch_flip - ' + error); }
}

function _set_sliders_event()
{
    try {
        var set_events = function() {
            $('[name^=flip-], [id^=slider-]').on('change', function(e) {
                recalculate(e);
            });
        };
        setTimeout(set_events, 100);
    }
    catch (error) { console.log('_set_sliders_event - ' + error); }
}