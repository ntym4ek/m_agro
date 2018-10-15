/**
 * Implements hook_menu().
 */
function homepage_menu() 
{
    var items = {};
    items['homepage'] = {
        title: 'Стартовая',
        page_callback: 'homepage_page'
    };
    items['catalog'] = {
        title: 'Каталог',
        page_callback: 'catalog_page'
    };

    return items;
}


/**
 * ----------------------------------------------- Выбор каталога ------------------------------------------------------
 */
function catalog_page()
{
    try {
        var html = '';

        html += '<div class="router">';
        html +=   '<div class="row">';
        html +=     '<div class="col-xs-12">';
        html +=       '<div class="route">';
        html +=         l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/prot-cat.png"></div><div class="r-title">Средства защиты растений</div>', 'prot-cat');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs-12">';
        html +=       '<div class="route">';
        html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/fert-cat.png"></div><div class="r-title">Минеральные удобрения</div>', 'fert-products');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html += '</div>';

        return html;

    }
    catch (error) {
        console.log('catalog_page - ' + error);
    }
}

/**
 * ----------------------------------------------- Cтартовая страница --------------------------------------------------
 */
function homepage_page()
{
    try {
        var html = '';

        html += '<div class="router">';
        html +=   '<div class="row">';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=         l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/catalog.png"></div><div class="r-title">Каталог</div>', 'catalog');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/protection.png"></div><div class="r-title">Системы защиты</div>', 'protection');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="row">';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/agrohelp.png"></div><div class="r-title">Агропомощь</div>', 'entityform/add/agrohelp');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/solution.png"></div><div class="r-title">Найти решение</div>', 'solution');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="row">';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/field.png"></div><div class="r-title">Препараты в поле</div>', 'atfield');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="footer ui-footer-fixed">';
        html +=     '<div class="row">';
        html +=       '<div class="col-xs-3">';
        html +=         l('<img src="app/themes/agro/images/homepage/calc.png">', 'calc', {
                            attributes: {
                                class: 'ui-btn ui-btn-fab waves-effect waves-button'
                            }
                        });
        html +=       '</div>';
        html +=       '<div class="col-xs-3">';
        html +=         l('<img src="app/themes/agro/images/homepage/handbook.png">', 'handbook', {
                            attributes: {
                                class: 'ui-btn ui-btn-fab waves-effect waves-button ui-disabled'
                            }
                        });
        html +=       '</div>';
        html +=       '<div class="col-xs-3">';
        html +=         l('<img src="app/themes/agro/images/homepage/agenda.png">', 'agenda', {
                            attributes: {
                                class: 'ui-btn ui-btn-fab waves-effect waves-button'
                            }
                        });
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html += '</div>';

        return html;
    }
    catch (error) { console.log('homepage_page - ' + error); }
}