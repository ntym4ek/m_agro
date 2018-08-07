/**
 * Implements hook_menu().
 */
function homepage_menu() {
    try {
        var items = {};
        items['homepage'] = {
            title: 'Стартовая',
            page_callback: 'homepage_page'
        };

        return items;
    }
    catch (error) {
        console.log('homepage_menu - ' + error);
    }
}

// стартовая страница
function homepage_page() {
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
        html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/protection.png"></div><div class="r-title">Система защиты</div>', 'protection', {
                            attributes: {
                                class: 'ui-disabled'
                            }
                        });
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
        html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/solution.png"></div><div class="r-title">Найти решение</div>', 'solution', {
                            attributes: {
                                class: 'ui-disabled'
                            }
                        });
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="row">';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/field.png"></div><div class="r-title">Препараты в поле</div>', 'field', {
                            attributes: {
                                class: 'ui-disabled'
                            }
                        });
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="footer ui-footer-fixed">';
        html +=     '<div class="row">';
        html +=       '<div class="col-xs-3">';
        html +=         l('<img src="app/themes/agro/images/homepage/calc.png">', 'calc', {
                            attributes: {
                                class: 'ui-btn ui-btn-fab waves-effect waves-button ui-disabled'
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