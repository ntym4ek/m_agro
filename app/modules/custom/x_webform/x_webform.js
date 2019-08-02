/**
 * Webform module eXtensions
 */

/**
 * Implements hook_menu().
 */
function x_webform_menu()
{
    var items = {};
    items['surveys'] = {
        title: 'Опросы',
        page_callback: 'x_webform_list_page'
    };

    return items;
}

/**
 * ----------------------------------------------- Список опросов ------------------------------------------------------
 */
function x_webform_list_page()
{
    return {
        'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">' },
        'list': {
            theme: 'view',
            path: 'surveys.json',
            row_callback: 'x_webform_list_page_row'
        },
        'suffix': { markup: '</div></div>' }
    };
}

function x_webform_list_page_row(view, row)
{
    try {
        return theme('content_card', {
            item: {
                img: {src: row.img.src},
                link: {url: 'node/' + row.nid},
                title: row.title
            }
        });
    }
    catch (error) { console.log('x_webform_list_page_row - ' + error); }
}

/**
 * Implements hook_node_page_view_alter_TYPE().
 */
function x_webform_node_page_view_alter_webform(node, options)
{
    // console.log('x_webform_node_page_view_alter_webform - ');
    try {
        delete(node.field_wf_category);
        delete(node.field_promo_image);
        delete(node.field_textfield_1);
        drupalgap_entity_render_content('node', node);
        var content = {
            'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-10 col-sm-offset-1">' },
            'suffix': { markup: '</div></div>' },
            'header': '<div class="content-header"><h2>' + node.title + '</h2></div>'
        };
        content['questions'] = {
            markup: '<div class="questions">' +
                        node.content +
                    '</div>'
        };
        options.success(content);
    }
    catch (error) { console.log('x_webform_node_page_view_alter_webform - ' + error); }
}