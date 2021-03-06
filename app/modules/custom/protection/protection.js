// переменная для расчёта стоимости препаратов
var Area = 1;
var Program = {};
var Regions = {};

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
        var content = {
            'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-10 col-sm-offset-1">' },
            'list' : {
                theme: 'view',
                format_attributes: {
                    'data-inset': 'true'
                },
                path: 'protection-catalog.json',
                row_callback: 'protection_list_page_row'
            },
            'suffix': { markup: '</div></div>' }
        };
        return content;
    }
    catch (error) { console.log('protection_list_page - ' + error); }
}

function protection_list_page_row(view, row)
{
    try {
        var content = '';
        var icon = theme('image', {path: row.icon.src});

        content +=  '<div class="box">';
        content +=      '<div class="icon">' + icon + '</div>';
        content +=      '<div class="text">';
        content +=          '<div class="title">' + row.title + '</div>';
        content +=      '</div>';
        content +=  '</div>';

        return l(content, 'protection-system/' + row.nid, {
            'attributes': {
                'class': 'category-item wow fadeIn waves-effect waves-button',
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
    // console.log('theme_program_cat_page - ');
    try {
        var html = '';
        Area = program.header.area;
        Program = {
            'culture': program.header.title,
            'phase': program.header.phase ? program.header.phase : '',
            'area': Area,
            'seeding': program.header.seeding,
            'preparations': {},
            'hobjects': {},
            'cnt': 0
        };

        html += '<div class="content-header">';
        html += '<h2>' + program.header.title + (program.header.area ? '<span>, <span>' + program.header.area + ' га</span></span>': '') + '</h2>';
        if (program.header.phase) html += '<h3>' + program.header.phase + '</h3>';
        html += '<h4>' + program.header.description + '</h4>';
        if (program.header.pdf)
            html += '<a onclick="window.open(\'' + program.header.pdf + '\', \'_system\', \'location=yes\')" class="btn-download ui-btn ui-btn-inline ui-btn-fab ui-btn-raised clr-primary waves-effect waves-button"><i class="zmdi zmdi-download zmdi-hc-2x"></i></a>';
        html += '</div>';

        html += '<div class="row">';
        html +=     '<div class="col-xs-12 col-sm-10 col-sm-offset-1">';

        if (Area) {
            html += '<div class="select-all "><div>выбрать все препараты</div><div><select name="flip-all" id="flipper" data-role="slider" data-mini="true"><option value="off">Off</option><option value="on">On</option></select></div></div>';
        }

        if (program.categories) {
            $.each(program.categories, function (index, category) {
                var tid = category.tid;
                var image = theme('image', {path: category.bkg});
                var icon = theme('image', {path: category.icon});

                html += '<div class="list-item category-' + tid + '" data-role="collapsible" data-inset="false">';

                var attributes = Area ? 'id="cat-' + tid + '" data-cnt="0"' : '';

                html +=     '<h4 class="category-item waves-effect waves-button" ' + attributes + '>';
                html +=         '<div class="box">';
                html +=             '<div class="icon">' + icon + '</div>';
                html +=             '<div class="text">';
                html +=                 '<div class="title bkg-category">' + category.name + '</div>';
                if (Area) {
                    html +=             '<div class="cat-amount">' +
                                            '<div><h5 class="clr-category">НА ГЕКТАР</h5><p class="amount"></p></div>' +
                                            '<div><h5 class="clr-category">ВСЕГО</h5><p class="total"></p></div>' +
                                        '</div>';
                }
                html +=             '</div>';
                html +=             '<div class="folder"><i class="zmdi zmdi-unfold-more zmdi-hc-2x"></i></div>';
                html +=         '</div>';
                html +=     '</h4>';

                html += '<div>';

                // записать в Запрос ВО, для которых нет решения
                // для Протравителей и фунгицидов не дублирова
                Program.hobjects[tid == 71533 ? 16 : tid] = category.hobjects;

                if (category.stages) {
                    $.each(category.stages, function (num, stage) {
                        $.each(stage, function (duration, set) {
                            $.each(set, function (key, reglament) {

                                var icon = theme('image', {path: reglament.preparations.icon});
                                var title = reglament.preparations.title.split('|')[0];
                                var title_suffix = reglament.preparations.title.split('|')[1] !== undefined ? reglament.preparations.title.split('|')[1] : '';

                                // заполнение запроса
                                Program.preparations[reglament.preparations.id] = {
                                    title: reglament.preparations.title,
                                    status: 'off',
                                    items: {}
                                };

                                // содержимое бокса
                                var text = '';
                                if (!program.header.phase) {
                                    text += '<div class="period">' +
                                                '<div class="clr-category">Фаза культуры</div>';
                                    if (reglament.period.start.tid == reglament.period.end.tid) {
                                        text += reglament.period.start.name;
                                    } else {
                                        text += '<span>с</span>' + reglament.period.start.name + '<br />' +
                                                '<span>по</span>'+ reglament.period.end.name;
                                    }
                                    text += '</div>';
                                }
                                if (reglament.hobjects && reglament.hobjects.length) {
                                    text += '<div class="hobjects">' +
                                                '<div class="clr-category">Вредные объекты</div>' +
                                                reglament.hobjects +
                                            '</div>';
                                    Program.preparations[reglament.preparations.id].hobjects = reglament.hobjects;
                                }

                                var photos = [], prices = [], rates = [], rates_title_arr = [], rates_content_arr = [];
                                $.each(reglament.preparations['items'], function (key_p, preparation) {
                                    photos.push(theme('image', {path: preparation.photo}));
                                    prices.push(preparation.price);
                                    // rates.push(preparation.rate);

                                    Program.preparations[reglament.preparations.id].items[preparation.id] = {
                                        title: preparation.title,
                                        units: preparation.units,
                                        unit: preparation.unit
                                    };

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
                                        // если значений на слайдере всего два - уменьшить шаг
                                        if ((preparation.rate.to - preparation.rate.from)/step == 1) step = step/10;

                                        rates_title_arr.push(preparation.units);
                                        rate = '<input ' + (preparation.rate.from === preparation.rate.to ? 'disabled="disabled"' : '') + ' data-pid="' + preparation.id + '" type="range" name="slider-' + key + '-' + preparation.id + '-' + num + '" id="slider-' + key + '-' + preparation.id + '-' + num + '" value="' + preparation.rate.from + '" min="' + preparation.rate.from + '" max="' + preparation.rate.to + '" step="' + step + '" data-highlight="true">';
                                    }
                                    else {
                                        rate = preparation.rate.from + (preparation.rate.from === preparation.rate.to ? '' : ' - ' + preparation.rate.to) + ' ' + preparation.units;
                                    }
                                    rates_content_arr.push(rate);

                                });
                                
                                text += '<div class="rate">' +
                                            '<div class="clr-category">Норма расхода' + (rates_title_arr.length ? ', ' + rates_title_arr.join(' + ') : '') + '</div>';
                                if (program.header.area) {
                                    text += rates_content_arr.join('');
                                } else {
                                    text += rates_content_arr.join(' + ');
                                    text += '<br />';
                                }
                                text += '</div>';

                                var url = reglament.preparations.type == 'product_mix' ? null : 'node/' + reglament.preparations.id;

                                var product = '';
                                product +=  '<div class="product-item">';
                                product +=      '<div class="title' + (program.header.area ? ' has-switch' : '') + '">' +
                                                    '<span class="clr-category">' + l(title, url) + '</span> ' + title_suffix;
                                if (program.header.area) {
                                    product +=      '<select name="flip-' + key + '-' + num + '" id="flip-' + key + '-' + num + '" data-role="slider" data-cat="' + tid + '" data-id="' + reglament.preparations.id + '" data-price0="' + prices[0] + '" data-price1="' + prices[1] + '" data-mini="true"><option value="off">Off</option><option value="on">On</option></select>';
                                }
                                    product +=  '</div>';
                                product +=      '<div class="box">';
                                if (photos[1]) {
                                    product +=      '<div class="image">' + photos[0] + photos[1] + '</div>';
                                } else {
                                    product +=      '<div class="image">' + photos[0] + '</div>';
                                }
                                product +=          '<div class="text">';
                                product +=              reglament.preparations.ingredients ? '<div class="ingredients">' +  reglament.preparations.ingredients  + '</div>' : '';
                                product +=              text;
                                product +=          '</div>';
                                // product +=          '<div class="icon">' + icon + '</div>';
                                product +=      '</div>';

                                if (program.header.area) {
                                    product +=  '<div class="calculation">' +
                                                    '<div class="calc-wrapper"><div class="amountByItem"></div></div>' +
                                                '</div>';
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
                    jqm_page_event_callback: '_init_events'
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
            html +=  '</div>';
            html +=  '</div>';

            if (Area) {
                html += '<div class="row">';
                html +=     '<div class="col-xs-12 col-sm-10 col-sm-offset-1">';

                // итоговые суммы
                var icon = theme('image', { path: program.header.icon });
                html += '<div class="category-item calculation-total">';
                html +=     '<div class="box">';
                html +=         '<div class="icon">' + icon + '</div>';
                html +=         '<div class="text">';
                html +=             '<div class="title bkg-category">Итог по программе</div>';
                html +=             '<div id="prog-amount" class="cat-amount">' +
                                        '<div><h5>НА ГЕКТАР</h5><p class="amount">0 руб.</p></div>' +
                                        '<div><h5>ВСЕГО</h5><p class="total">0 руб.</p></div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<p>Указанные цены могут быть снижены. Для расчёта скидки свяжитесь с нашим представителем через форму ниже.</p>' +
                        '</div>';

                html +=     '</div>';
                html +=  '</div>';

                // связь с представителем
                // через action?
                html += '<div class="row">';
                html +=     '<div class="col-xs-12 col-sm-6 col-sm-offset-3">';
                html +=         '<div class="list-item calculation-send" data-inset="false">';
                html +=             drupalgap_render(drupalgap_get_form('send_request_form'));
                html +=         '</div>';
                html +=     '</div>';
                html +=  '</div>';

            }

        }
        else {
            html +=  '<div>Для культуры на данном этапе роста у нашей компании нет препаратов.</div>';
        }

        return html;
    }
    catch (error) { console.log('theme_program_cat_page - ' + error); }
}

/**
 * форма отправки Запроса
 */
function send_request_form(form, form_state)
{
    try {
        form.prefix = '<h3>Отправить заявку</h3><p>Заполните регион и укажите телефон или E-Mail.<br />Рассчитанная программа будет отправлена нашему региональному представителю и на указанный E-Mail.</p>';

        form.elements['region'] = {
            type: 'select',
            attributes: { 'data-native-menu': false },
            options: { '': 'Регион' },
            children: []
        };
        var options = {
            'page_id': drupalgap_get_page_id(drupalgap_path_get()),
            'jqm_page_event': 'pageshow',
            'jqm_page_event_callback': '_send_request_form_get_region_options'
        };
        form.elements['region'].children.push({ markup: drupalgap_jqm_page_event_script_code(options) });


        form.elements['phone'] = {
            title: 'Телефон',
            title_placeholder: true,
            type: 'tel',
            attributes: { 'data-clear-btn': true }
        };

        form.elements['name'] = {
            title: 'Имя',
            title_placeholder: true,
            type: 'textfield',
            attributes: { 'data-clear-btn': true }
        };

        form.elements['email'] = {
            title: 'E-Mail',
            title_placeholder: true,
            type: 'email',
            attributes: { 'data-clear-btn': true }
        };

        form.elements['submit'] = {
            type: 'submit',
            value: 'Отправить',
            attributes: {
                class: "ui-btn ui-btn-raised ui-mini clr-btn-blue waves-effect waves-button"
            }
        };

        return form;
    } catch (error) { console.log('send_request_form - ' + error); }
}

function send_request_form_validate(form, form_state)
{
    if (!Program.cnt) {
        drupalgap_form_set_error('', 'С помощью переключателей включите в заявку хотя бы один препарат.');
        return false;
    }
    if (!form_state.values['region']) {
        drupalgap_form_set_error('region', 'Укажите Ваш регион.');
        return false;
    }
    if (!form_state.values['phone'] && !form_state.values['email']) {
        drupalgap_form_set_error('phone', 'Укажите номер телефона или E-Mail.');
        return false;
    }
}

function send_request_form_submit(form, form_state)
{
    Program.region = Regions[form_state.values['region']];
    Program.name = form_state.values['name'] ? form_state.values['name'] : '';
    Program.phone = form_state.values['phone'];
    Program.email = form_state.values['email'];

    solution_send_request({
        data: JSON.stringify({ 'program' : Program }),
        success: function (response) {
            new $.nd2Toast({
                message : "Заявка отправлена",
                ttl : 3000
            });
        },
        error: function(xhr, textStatus, errorThrown) {
            new $.nd2Toast({
                message : "Ошибка. Попробуйте позже",
                ttl : 3000
            });
        }
    });
}

function solution_send_request(options)
{
    try {
        options.method = 'POST';
        options.path = 'reglaments/send_request.json';
        options.service = 'reglaments';
        options.resource = 'send_request';
        Drupal.services.call(options);
    }
    catch (error) { console.log('solution_send_request - ' + error); }
}

function _send_request_form_get_region_options()
{
    try {
        //console.log('_send_request_form_get_region_options - ');
        var query = {
            parameters: { vid: 29, parent: 0 },
            options: { orderby: { weight: 'asc', name: 'asc'}}
        };
        taxonomy_term_index(query, {
            success: function(terms) {
                if (terms.length == 0) { return; }
                var widget = $('#edit-send-request-form-region');

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
    catch (error) { console.log('_send_request_form_get_region_options - ' + error); }
}

/**
 * пересчёт всех включенных препаратов с выводом итогов по категориям и программе
 */
function recalculate(e)
{
     // console.log('recalculate');
    try {
        // нажат flip выбрать все
        if ($(e.target).attr('id') === 'flipper') {
            $('#solution_page [id^=flip-]').each(function (index, flip) {
                var state = $(e.target).val();
                if ($(flip).val() !== state) {
                    $(flip).val(state).slider('refresh');
                    _switch_flip(flip);
                }
            });
        } else {
            if ($(e.target).hasClass('ui-slider-switch')) {
                _switch_flip(e.target);
            }
        }

        var calc_arr = {};
        $('.product-item').each(function (key, item) {

            // обновить Запрос
            var id = $(item).find('[id^=flip-]').data('id');
            var tid = $(item).find('[id^=flip-]').data('cat');
            // посчитать стоимость
            var amountByItem = 0;
            if ($(item).find('[id^=flip-]').val() === 'on') {
                $(item).find('[id^=slider-]').each(function (index, slider) {
                    var price = $(item).find('[id^=flip-]').data('price' + index);
                    var rate = $(slider).val();
                    var pid = $(slider).data('pid');
                    amountByItem += amountByItem + rate * price;
                    // записать в Запрос
                    Program.preparations[id].items[pid].rate = rate;
                    Program.preparations[id].items[pid].amount = rate * price;
                });
                // для протравителей умножить на норму высева
                if (tid == 71533) { amountByItem = amountByItem * Program.seeding/1000; }
            }


            $(item).find('.amountByItem').html(accounting.formatNumber(amountByItem, 0, " ") + ' руб.' + ' x ' + Area + ' га = ' + accounting.formatNumber(amountByItem * Area, 0, " ") + ' руб.');

            var cat_id = $(item).closest('.list-item').find('.category-item').attr('id');
            if (!calc_arr[cat_id]) calc_arr[cat_id] = 0;
            if (!calc_arr.total) calc_arr.total = 0;
            calc_arr[cat_id] += amountByItem;
            calc_arr.total += amountByItem;
        });

        for (var index in calc_arr) {
            $('#' + index).find('.cat-amount .amount').html(accounting.formatNumber(calc_arr[index], 0, " ") + ' руб.');
            $('#' + index).find('.cat-amount .total').html(accounting.formatNumber(calc_arr[index] * Area, 0, " ") + ' руб.');
        }
        $('#prog-amount .amount').html(accounting.formatNumber(calc_arr.total, 0, " ") + ' руб.');
        $('#prog-amount .total').html(accounting.formatNumber(calc_arr.total * Area, 0, " ") + ' руб.');
        Program.total = calc_arr.total;
        if (calc_arr.total) {
            $('.calculation-total').addClass('is-active');
        } else {
            $('.calculation-total').removeClass('is-active');
        }

        if (calc_arr.total) $('.calculation-total > p').css('display', 'block');
        else                $('.calculation-total > p').css('display', 'none');
    }
    catch (error) { console.log('recalculate - ' + error); }
}

/**
 * переключить flip и показать/скрыть расчёты
 */
function _switch_flip(flip)
{
    try {
        var category = $(flip).closest('.list-item').find('.category-item');
        var cnt = $(category).data('cnt');
        var id = $(flip).data('id');
        if ($(flip).val() === 'on') {
            $(flip).closest('.product-item').find('.amountByItem').addClass('is-active');
            $(category).data('cnt', cnt + 1);
            if (!cnt) {
                $(category).addClass('is-active');
            }
            Program.cnt += 1;
        } else {
            // при отключении одного из flip отключить общий
            $('#flipper').val('off').slider('refresh');
            $(flip).closest('.product-item').find('.amountByItem').removeClass('is-active');
            cnt = cnt - 1;
            if (!cnt) {
                $(category).removeClass('is-active');
            }
            $(category).data('cnt', cnt);
            Program.cnt -= 1;
        }
        Program.preparations[id].status = $(flip).val();
    }
    catch (error) { console.log('_switch_flip - ' + error); }
}

/**
 * повесить события на элементы flip и slider
 */
function _init_events()
{
    try {
        var set_sliders = function() {
            $('[name^=flip-], [id^=slider-]').on('change', function(e) {
                recalculate(e);
            });
        };
        setTimeout(set_sliders, 100);

        $('.category-item').on('click', function() {
            var el = $(this).find('.folder');
            if ($(el).data('unfolded')) {
                $(this).removeClass('unfolded');
                $(el).data('unfolded', false).html('<i class="zmdi zmdi-unfold-more zmdi-hc-2x"></i>');
            } else {
                $(this).addClass('unfolded');
                $(el).data('unfolded', true).html('<i class="zmdi zmdi-unfold-less zmdi-hc-2x"></i>');
            }

        });
    }
    catch (error) { console.log('_init_events - ' + error); }
}