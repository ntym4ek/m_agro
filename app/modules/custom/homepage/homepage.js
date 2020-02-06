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
        html +=     '<div class="icon1">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/prot-cat.png">' +
                            '</div>' +
                        '</div>' +
                        '<div class="r-title">Средства защиты<br />растений</div>', 'prot-cat');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="icon2">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/fert-cat.png">' +
                            '</div>' +
                        '</div>' +
                        '<div class="r-title">Минеральные<br />удобрения</div>', 'fert-products');
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
        // loader по умолчанию был отключен для статической заставки при загрузке приложения
        drupalgap_loader_enable(true);

        // инициализация кнопки скроллинга к началу страницы
        $(document).on("scrollstop", function() {
            if ($(this).scrollTop() > 0) {
                $('#to-the-top').fadeIn();
            } else {
                $('#to-the-top').fadeOut();
            }
        });
        $('#to-the-top').click(function () {
            $('body,html').animate({
                scrollTop: 0
            }, 400);
            return false;
        });


        var html = '';

        html += '<div class="router">';
        html +=   '<img data-animate="true" class="pr-balloon b1 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/h1.png" />';
        html +=   '<img data-animate="true" class="pr-balloon b2 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/h2.png" />';

        html +=   '<div class="row">';
        html +=     '<div class="icon1">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/catalog.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b3 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/b1.png" />' +
                        '</div>' +
                        '<div class="r-title">Каталог</div>', 'catalog');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="icon2">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/protection.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b4 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/b2.png" />' +
                        '</div>' +
                        '<div class="r-title">Системы защиты</div>', 'protection');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="icon3">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/agrohelp.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b5 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/b3.png" />' +
                            '<img data-animate="true" class="pr-balloon b5_1 slide-up" src="' + drupalgap_get_path('module', 'homepage') + '/images/b31.png" />' +
                        '</div>' +
                        '<div class="r-title">Агропомощь</div>', 'agrohelp');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="icon4">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/calc.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b6 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/b4.png" />' +
                            '<img data-animate="true" class="pr-balloon b6_1 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/b41.png" />' +
                            '</div>' +
                        '<div class="r-title">Калькулятор</div>', 'calc');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="icon5">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/field.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b7 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/b5.png" />' +
                            '</div>' +
                        '<div class="r-title">Препараты в поле</div>', 'atfield');
        html +=       '</div>';
        html +=     '</div>';
        html +=     '<div class="icon6">';
        html +=       '<div class="route">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/representatives.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b8 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/b6.png" />' +
                        '</div>' +
                        '<div class="r-title">Контакты</div>', 'representatives');
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';

        html +=   '<div class="footer">';
        html +=     '<div class="row">';
        html +=       '<div class="col-xs-4">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                            '<img src="app/themes/agro/images/homepage/surveys.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b9 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/f1.png" />' +
                            '</div>', 'surveys', {attributes: {class: 'ui-link'}});
        html +=       '</div>';
        html +=       '<div class="col-xs-4">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/handbook.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b10 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/f2.png" />' +
                        '</div>', 'handbooks', {attributes: {class: 'ui-link'}});
        html +=       '</div>';
        html +=       '<div class="col-xs-4">';
        html +=         l('<div class="icon">' +
                            '<div class="waves-effect waves-button">' +
                                '<img src="app/themes/agro/images/homepage/agenda.png">' +
                            '</div>' +
                            '<img data-animate="true" class="pr-balloon b11 slide-down" src="' + drupalgap_get_path('module', 'homepage') + '/images/f3.png" />' +
                            '</div>', 'agenda', {attributes: {class: 'ui-link'}});
        html +=       '</div>';
        html +=     '</div>';
        html +=   '</div>';
        html +=   '<div class="overlay"></div>';
        html +=   '<div class="pr-actions">';
        html +=     '<button onclick="_balloon(-1);" class="ui-btn ui-btn-raised clr-btn-blue waves-effect waves-button">' + t('Skip') + '</button>';
        html +=     '<button onclick="_balloon(1);" class="ui-btn ui-btn-raised clr-btn-blue waves-effect waves-button">' + t('Next') + '</button>';
        html +=   '</div>';
        html += '</div>';


        html += drupalgap_jqm_page_event_script_code({
            page_id: drupalgap_get_page_id(),
            jqm_page_event: 'pageshow',
            jqm_page_event_callback: '_start()'
        });

        return html;
    }
    catch (error) { console.log('homepage_page - ' + error); }
}

function _start()
{
    // по готовности страницы меняем цвет статусбара
    if (typeof StatusBar !== 'undefined') {
        StatusBar.backgroundColorByName("white");
        StatusBar.styleDefault();
    }
    // и убираем загрузочный экран
    if (typeof navigator.splashscreen !== 'undefined') {
        navigator.splashscreen.hide();
    }

    _balloon(0);
}

function _balloon(delta)
{
    // we will show Presentation only once
    if (variable_get('presentation') || Drupal.settings.skip_start_help) {
        return;
    }

    // запретить переходить по ссылкам
    $('#homepage .overlay').addClass('active');

    if (delta == 0) {
        delta = 1;
        $('.pr-actions').addClass('processed');
        $('.pr-balloon').addClass('processed');
    }

   if (delta == -1 || bnum_curr > 10) {
       $('.b' + bnum_curr).removeClass('visible');
       $('.b' + bnum_curr + '_1').removeClass('visible');
       $('.pr-actions').removeClass('visible');
       setTimeout(function () {
           $('.pr-actions').removeClass('visible').removeClass('processed');
           $('.pr-balloon').removeClass('processed');
       }, 700);
       variable_set('presentation', true);
       $('#homepage .overlay').removeClass('active');
       return;
   }

    var bnum_next = bnum_curr + delta;
    var delay = bnum_curr ? 1 : 1000;
    $('.b' + bnum_curr).removeClass('visible');
    $('.b' + bnum_curr + '_1').removeClass('visible');
    if (bnum_curr == 8) $('.pr-actions').addClass('raised');
    setTimeout(function () {
        $('.b' + bnum_next).addClass('visible');
        $('.b' + bnum_curr + '_1').addClass('visible');
        if (bnum_next == 1) {
            $('.pr-actions').addClass('visible');
        }
    }, delay);

    bnum_curr = bnum_next;
}