/**
 * Implements hook_menu().
 */
function handbooks_menu() 
{
    var items = {};
    items['handbooks'] = {
        title: 'Справочники',
        page_callback: 'handbooks_list_page'
    };
    items['handbook/%'] = {
        title: 'Справочники',
        title_callback: 'handbooks_content_list_page_title_callback',
        page_callback: 'handbooks_content_list_page',
        page_arguments: [1]
    };

    return items;
}


/**
 * ----------------------------------------------- Список справочников ----------------------------------------------
 */
function handbooks_list_page()
{
    return {
        'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">' },
        'list': {
            theme: 'view',
            path: 'handbooks.json',
            row_callback: 'handbooks_list_page_row'
        },
        'suffix': { markup: '</div></div>' }
    };
}

function handbooks_list_page_row(view, row)
{
    try {
        return theme('catalog_item', {
            item: {
                title: row.name,
                icon: row.icon_img.src,
                link: {
                    url: row.url + '?title=' + row.name
                }
            }});
    }
    catch (error) { console.log('handbooks_list_page_row - ' + error); }
}


/**
 * ----------------------------------------------- Список содержимого --------------------------------------------------
 */

function handbooks_content_list_page_title_callback(callback)
{
    try {
        title = _GET('title');
        callback.call(null, title);
    }
    catch (error) { console.log('handbooks_content_list_page_title_callback - ' + error); }
}

// содержимое страницы
function handbooks_content_list_page()
{
    try {
        var addon = '',
            type = arg(1);

        switch(type) {
            case 'weeds':
                type = 'weed';
                break;
            case 'pests':
                type = 'pest';
                break;
            case 'diseases':
                type = 'disease';
                break;
            case 'cultures':
                type = 'main_cultures';
                break;
            case 'active-substances':
                type = 'active_substances';
                addon = '_terms';
                break;
            case 'terms':
                addon = '_terms';
                break;
        }

        var content = {};
        content['list'] = {
            theme: 'view',
            format: 'ul',
            path: 'handbook' + addon + '.json/' + type,
            row_callback: 'handbooks_content_list_page_row'
        };

        return content;
    }
    catch (error) { console.log('handbooks_content_list_page - ' + error); }
}

function handbooks_content_list_page_row(view, row) {
    try {
        if (row.nid !== undefined) {
            return theme('content_card', {
                item: {
                    img: {src: row.img.src},
                    link: {url: 'node/' + row.nid},
                    title: row.title,
                    subtitle: row.subtitle
                }
            });
        }
        if (row.tid !== undefined) {
            return theme('term_card', {
                item: {
                    title: row.title,
                    subtitle: row.subtitle,
                    description: row.description
                }
            });
        }
    }
    catch (error) { console.log('handbooks_content_list_page_row - ' + error); }
}

/**
 * ----------------------------------------------- Страница справочника ------------------------------------------------
 *
 */
/**
 * Implements hook_node_page_view_alter_TYPE().
 */
function handbooks_node_page_view_alter_weed(node, options)
{
    return handbooks_node_page_view_alter_handbook(node, options);
}
function handbooks_node_page_view_alter_pest(node, options)
{
    return handbooks_node_page_view_alter_handbook(node, options);
}
function handbooks_node_page_view_alter_disease(node, options)
{
    return handbooks_node_page_view_alter_handbook(node, options);
}
function handbooks_node_page_view_alter_main_cultures(node, options)
{
    return handbooks_node_page_view_alter_handbook(node, options);
}

// общий для справочников шаблон
function handbooks_node_page_view_alter_handbook(node, options)
{
    try {
        var summary = '',
            body = '';
        if (node.body['ru'] != undefined) {
            summary = node.body['ru'][0]['summary'];
            body = node.body['ru'][0]['safe_value'];
        }
        if (node.body['und'] != undefined) {
            summary = node.body['und'][0]['summary'];
            body = node.body['und'][0]['safe_value'];
        }

        var content = {
            'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-10 col-sm-offset-1">' },
            'suffix': { markup: '</div></div>' },
            'header': '<div class="content-header"><h2>' + node.title + '</h2><h4>' + summary + '</h4></div>'
        };
        content['image'] = {
            theme: 'image',
            path: drupalgap_image_path(node.field_promo_image['und'][0]['uri'])
        };

        content['description'] = {
            markup: '<div class="description">' +
                        body +
                    '</div>'
        };


        options.success(content);
    }
    catch (error) { console.log('handbooks_node_page_view_alter_handbooks - ' + error); }
}
