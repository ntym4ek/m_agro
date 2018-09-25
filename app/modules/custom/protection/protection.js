
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
        // console.log('theme_program_cat_page - ');
        var html = '';

        html += '<h2>' + program.header.title + '</h2>';
        if (program.header.phase) html += '<h3>' + program.header.phase + '</h3>';
        html += '<h4>' + program.header.description + '</h4>';
        if (program.header.pdf)
            html += '<a onclick="window.open(\'' + program.header.pdf + '\', \'_system\', \'location=yes\')" class="btn-download ui-btn ui-btn-inline ui-btn-fab ui-btn-raised clr-primary waves-effect waves-button"><i class="zmdi zmdi-download zmd-2x"></i></a>';

        html += '<div class="row">';
        if (program.categories) {
            $.each(program.categories, function (index, category) {
                var tid = category.tid;
                var image = theme('image', {path: category.bkg});
                var icon = theme('image', {path: category.icon});

                html += '<div class="list-item col-xs-12 col-sm-6 category-' + tid + '" data-role="collapsible" data-inset="false">';

                html += '<h4 class="category-item wow fadeIn waves-effect waves-button" data-wow-delay="0.2s">';
                html += '<div class="box">';
                html += image;
                html += '<div class="icon">' + icon + '</div>';
                html += '</div>';
                html += '<div class="title">' + category.name + '</div>';
                html += '</h4>';

                html += '<div>';

                if (category.stages) {
                    $.each(category.stages, function (num, stage) {
                        $.each(stage, function (duration, set) {
                            $.each(set, function (key, reglament) {
                                var photo0 = theme('image', {path: reglament.preparation.photo[0]});
                                var photo1 = theme('image', {path: reglament.preparation.photo[1]});
                                var icon = theme('image', {path: reglament.preparation.icon});
                                var title = reglament.preparation.title.split('|')[0];
                                var title_suffix = reglament.preparation.title.split('|')[1] !== undefined ? reglament.preparation.title.split('|')[1] : '';

                                // норма расхода
                                var from = reglament.preparation.rates[0].from;
                                var to = reglament.preparation.rates[0].to;
                                var unit = reglament.preparation.rates[0].unit;
                                var rate = from + (from == to ? '' : ' - ' + to) + ' ' + unit;
                                if (reglament.preparation.rates[1] !== undefined) {
                                    var from1 = reglament.preparation.rates[1].from;
                                    var to1 = reglament.preparation.rates[1].to;
                                    var unit1 = reglament.preparation.rates[1].unit;
                                    rate += ' + ' + from1 + (from1 === to1 ? '' : ' - ' + to1) + ' ' + unit1;
                                }

                                var text = '';
                                text += reglament.preparation.ingredients ? reglament.preparation.ingredients + '<br />' : '';
                                if (!program.header.phase) text += '<span class="period clr-category">Фаза культуры</span><br />' + (reglament.period.start.tid == reglament.period.end.tid ? reglament.period.start.name : reglament.period.start.name + ' - <span>' + reglament.period.end.name) + '</span><br />';
                                if (reglament.hobjects && reglament.hobjects.length) text += '<span class="hobjects clr-category">Вредные объекты</span><br />' + reglament.hobjects + '<br />';
                                text += '<span class="rate clr-category">Норма расхода</span><br />' + rate + '<br />';

                                var product = '';
                                product += '<div class="title"><span class="clr-category">' + title + '</span> ' + title_suffix + '</div>';
                                product += '<div class="box">';
                                product += '<div class="image">' + photo0 + '</div>';
                                product += '<div class="image1">' + photo1 + '</div>';
                                product += '<p class="description font-small">' + text + '</p>';
                                product += '<div class="icon">' + icon + '</div>';
                                product += '</div>';

                                var url = reglament.preparation.type == 'product_mix' ? null : 'node/' + reglament.preparation.id;
                                html += l(product, url, {
                                        attributes: {
                                            class: 'product-item wow fadeIn waves-effect waves-button',
                                            'data-wow-delay': '0.2s'
                                        },
                                    }
                                );
                            });
                        });
                    });
                } else {
                    if (category.hobjects) {
                        var phase = program.header.phase ? ' на этапе "' + program.header.phase + '"' : '';
                        html += 'По препаратам против вредного объекта "' + category.hobjects + '"' + phase;
                        html += ' свяжитесь с нашими специалистами на странице ' + l('Представителей', 'representatives');
                    }
                }
                html += '</div>';
                html += '</div>';
            });
        }
        else {
            html +=  '<div class="col-xs-12">Для культуры на данном этапе роста у нашей компании нет препаратов.</div>';
        }
        html +=  '</div>';

        return html;
    }
    catch (error) { console.log('theme_program_cat_page - ' + error); }
}

