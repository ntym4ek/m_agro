
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
        title: 'Категории системы',
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
        let content = '';
        let image = theme('image', { path: row.bkg.src });

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
        program_load(pid, {
            success: function (program) {
                var html = theme('program_cat_page', program);
                $('#protection-' + pid).html(html).trigger('create');
            }
        });
    }
    catch (error) { console.log('protection_page_pageshow - ' + error); }
}

function program_load(pid, options)
{
    try {
        options.method = 'GET';
        options.path = 'protection-program/' + pid + '.json';
        options.service = 'protection-program';
        options.resource = 'retrieve';
        Drupal.services.call(options);
    }
    catch (error) { console.log('program_load - ' + error); }
}

function theme_program_cat_page(program)
{
    try {
        //console.log('theme_program_cat_page - ');
        let html = '';

        html += '<h2>' + program.header.title + '</h2>';
        html += '<h4>' + program.header.description + '</h4>';
        html += '<a onclick="window.open(\'' + program.header.pdf + '\', \'_system\', \'location=yes\')" class="btn-download ui-btn ui-btn-inline ui-btn-fab ui-btn-raised clr-primary waves-effect waves-button"><i class="zmdi zmdi-download zmd-2x"></i></a>';

        html += '<div class="row">';
        $.each(program.categories, function(index, category) {
            let tid = category.tid;
            let image = theme('image', { path: category.bkg });
            let icon = theme('image', { path: category.icon });

            html += '<div class="list-item col-xs-12 col-sm-6 category-' + tid + '" data-role="collapsible" data-inset="false">';

            html +=     '<h4 class="category-item wow fadeIn waves-effect waves-button" data-wow-delay="0.2s">';
            html +=         '<div class="box">';
            html +=             image;
            html +=             '<div class="icon">' + icon + '</div>';
            html +=         '</div>';
            html +=         '<div class="title">' + category.name + '</div>';
            html +=     '</h4>';

            html +=     '<div>';
            $.each(category.stages, function(num, stage) {
            $.each(stage, function(duration, set) {
            $.each(set, function(key, reglament) {
                let photo = theme('image', { path: reglament.preparation.photo });
                let icon = theme('image', { path: reglament.preparation.icon });
                let title = reglament.preparation.title.split('|')[0];
                let title_suffix = reglament.preparation.title.split('|')[1] !== undefined ? reglament.preparation.title.split('|')[1] : '';

                let text = '';
                text += reglament.preparation.ingredients ? reglament.preparation.ingredients + '<br />' : '';
                text += '<span class="period clr-category">Фаза культуры</span><br />' + (reglament.period.start.tid == reglament.period.end.tid ? reglament.period.start.name : reglament.period.start.name + ' - <span>' + reglament.period.end.name) + '</span><br />';
                text += '<span class="rate clr-category">Норма расхода</span><br />' + (reglament.preparation.rate.from == reglament.preparation.rate.to ? reglament.preparation.rate.from : reglament.preparation.rate.from + ' - ' + reglament.preparation.rate.to) + ' ' + reglament.preparation.rate.unit + '<br />';

                let product = '';
                product +=     '<div class="box">';
                product +=         '<div class="image">' + photo + '</div>';
                product +=         '<p class="description font-small">' + text + '</p>';
                product +=         '<div class="icon">' + icon + '</div>';
                product +=     '</div>';
                product +=     '<div class="title"><span class="clr-category">' + title + '</span> ' + title_suffix + '</div>';

                html += l(product, 'node/' + reglament.preparation.id, {
                        attributes: {
                            class: 'product-item wow fadeIn waves-effect waves-button',
                            'data-wow-delay': '0.2s'
                        },
                    }
                );
            });
            });
            });
            html +=     '</div>';
            html +=  '</div>';
        });
        html +=  '</div>';

        return html;
    }
    catch (error) { console.log('theme_program_cat_page - ' + error); }
}

