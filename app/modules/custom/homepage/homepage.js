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
        html +=         l('<img src="app/themes/agro/images/homepage/catalog.png"><div class="r-title">Каталог</div>', 'catalog');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<img src="app/themes/agro/images/homepage/protection.png"><div class="r-title">Система защиты</div>', 'protection-system');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="row">';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<img src="app/themes/agro/images/homepage/agrohelp.png"><div class="r-title">Агропомощь</div>', 'entityform/add/agrohelp');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<img src="app/themes/agro/images/homepage/solution.png"><div class="r-title">Найти решение</div>', 'sollution');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="row">';
        html +=     '<div class="col-xs">';
        html +=       '<div class="route">';
        html +=          l('<img src="app/themes/agro/images/homepage/before_after.png"><div class="r-title">Препараты в поле</div>', 'at-field');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html += '</div>';

        return html;
    }
    catch (error) { console.log('homepage_page - ' + error); }
}