
/**
 * Implements hook_menu().
 */
function protection_menu()
{
    var items = {};
    items['protection'] = {
        title: 'Системы защиты',
        page_callback: 'protection_page'
    };
    return items;
}

/**
 * ----------------------------------------------- Каталог СЗ ----------------------------------------------------------
 */
function protection_page()
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
            row_callback: 'protection_page_row'
        };
        return content;
    }
    catch (error) { console.log('protection_page - ' + error); }
}

function protection_page_row(view, row)
{
    try {
        let content = '';
        let image = theme('image', { path: row.bkg.src });

        content +=  '<div class="c-bkg">';
        content +=      image;
        content +=      '<div class="c-icon"><img src="' + row.icon.src + '"></div>';
        content +=  '</div>';
        content +=  '<div class="c-title">' + row.title + '</div>';

        return l(content, 'protection-system/' + row.nid, {
            'attributes': {
                'class': 'c-item col-xs-12 col-sm-6 wow fadeIn waves-effect waves-button',
                'data-wow-delay': '0.2s'
            }
        });

    }
    catch (error) { console.log('protection_page_row - ' + error); }
}