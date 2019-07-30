var bnum_curr = 0;

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
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/prot-cat.png">' +
                            '</div>' +
                        '</div>' +
                        '<div class="r-title">Средства защиты растений</div>', 'prot-cat');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs-12">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/fert-cat.png">' +
                            '</div>' +
                        '</div>' +
                        '<div class="r-title">Минеральные удобрения</div>', 'fert-products');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html += '</div>';

        return html;
    }
    catch (error) { console.log('catalog_page - ' + error); }
}

/**
 * ----------------------------------------------- Cтартовая страница --------------------------------------------------
 */
function homepage_page()
{
    try {
        var html = '';

        html += '<div class="router">';
        html +=   '<img data-animate="true" class="pr-balloon b1 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/1.png" />';
        html +=   '<img data-animate="true" class="pr-balloon b2 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/2.png" />';

        html +=   '<div class="row">';
        html +=     '<div class="col-xs-12">';
        html +=       '<div class="logo">';
        // html +=           '<a onclick="javascript:window.open(\'https://kccc.ru\', \'_system\', \'location=yes\');"><img src="app/themes/agro/images/homepage/logo.png"></a>';
        html +=           l('<img src="app/themes/agro/images/homepage/logo.png">', 'node/8659');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';


        html +=   '<div class="row">';
        html +=     '<div class="col-xs-6 col-md-4">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/catalog.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b3 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/3.png" />' +
                        '</div>' +
                        '<div class="r-title">Каталог</div>', 'catalog');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs-6 col-md-4">';
        html +=       '<div class="route">';
        // html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/protection.png"></div><div class="r-title">Системы защиты<img data-animate="true" class="pr-balloon b4 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/4.png" /></div>', 'protection');
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/protection.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b4 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/4.png" />' +
                        '</div>' +
                        '<div class="r-title">Системы защиты</div>', 'protection');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs-6 col-md-4">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/agrohelp.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b5 slide-down hidden-md hidden-lg" src="' + drupalgap_get_path('module', 'homepage') + '/images/5.png" />' +
                            '<img data-animate="true" class="pr-balloon b5_1 slide-up hidden-xs hidden-sm" src="' + drupalgap_get_path('module', 'homepage') + '/images/51.png" />' +
                        '</div>' +
                        '<div class="r-title">Агропомощь</div>', 'agrohelp');
        // html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/agrohelp.png"></div><div class="r-title">Агропомощь</div>', 'agrohelp');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs-6 col-md-5 col-md-offset-1">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/calc.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b6 slide-down hidden-md hidden-lg" src="' + drupalgap_get_path('module', 'homepage') + '/images/6.png" />' +
                            '<img data-animate="true" class="pr-balloon b6_1 slide-down hidden-xs hidden-sm" src="' + drupalgap_get_path('module', 'homepage') + '/images/61.png" />' +
                            '</div>' +
                        '<div class="r-title">Калькулятор</div>', 'calc');
        // html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/solution.png"></div><div class="r-title">Калькулятор</div>', 'calc');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="col-xs-12 col-md-5">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/field.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b7 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/7.png" />' +
                            '</div>' +
                        '<div class="r-title">Препараты в поле</div>', 'atfield');

        // html +=         '<img data-animate="true" class="pr-balloon b7 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/7.png" />';
        // html +=          l('<div class="waves-effect waves-button"><img src="app/themes/agro/images/homepage/field.png"></div><div class="r-title">Препараты в поле</div>', 'atfield');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="footer">';
        html +=     '<div class="row">';
        html +=       '<div class="col-xs-3">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/handbook.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b8 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/8.png" />' +
                        '</div>', 'handbooks', {attributes: {class: 'ui-link'}});
        html +=       '</div>';
        html +=       '<div class="col-xs-3">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/agenda.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b9 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/9.png" />' +
                            '</div>', 'agenda', {attributes: {class: 'ui-link'}});
        html +=       '</div>';
        html +=       '<div class="col-xs-3">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/representatives.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b10 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/10.png" />' +
                            '</div>', 'representatives', {attributes: {class: 'ui-linkd'}});
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="pr-actions">';
        html +=     '<button onclick="_balloon(-1);" class="ui-btn ui-btn-raised clr-btn-blue waves-effect waves-button">' + t('Skip') + '</button>';
        html +=     '<button onclick="_balloon(1);" class="ui-btn ui-btn-raised clr-btn-blue waves-effect waves-button">' + t('Next') + '</button>';
        html +=   '</div>';
        html += '</div>';


        html += drupalgap_jqm_page_event_script_code({
            page_id: drupalgap_get_page_id(),
            jqm_page_event: 'pageshow',
            jqm_page_event_callback: '_balloon(0)'
        });

        return html;
    }
    catch (error) { console.log('homepage_page - ' + error); }
}

function _balloon(delta)
{
    // we will show Presentation only once
    if (variable_get('presentation') || Drupal.settings.skip_start_help) {
        return;
    }

    if (delta == 0) {
        delta = 1;
        $('.pr-actions').addClass('processed');
        $('.pr-balloon').addClass('processed');
    }

   if (delta == -1 || bnum_curr > 9) {
       $('.b' + bnum_curr).removeClass('visible');
       $('.b' + bnum_curr + '_1').removeClass('visible');
       $('.pr-actions').removeClass('visible');
       setTimeout(function () {
           $('.pr-actions').removeClass('visible').removeClass('processed');
           $('.pr-balloon').removeClass('processed');
       }, 700);
       variable_set('presentation', true);
       return;
   }

    var bnum_next = bnum_curr + delta;
    var delay = bnum_curr ? 1 : 1000;
    $('.b' + bnum_curr).removeClass('visible');
    $('.b' + bnum_curr + '_1').removeClass('visible');
    if (bnum_curr == 7) $('.pr-actions').addClass('raised');
    setTimeout(function () {
        $('.b' + bnum_next).addClass('visible');
        $('.b' + bnum_curr + '_1').addClass('visible');
        if (bnum_next == 1) {
            $('.pr-actions').addClass('visible');
        }
    }, delay);

    bnum_curr = bnum_next;
}