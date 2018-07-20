/**
 * Created by ntym on 18.08.2015.
 */

/**
 * Implements hook_menu().
 */
function agroshop_menu() {
    try {
        var items = {};
        items['catalog'] = {
            title: 'Каталог',
            page_callback: 'catalog_page'
        };
        items['products/%'] = {
            title: 'Препараты',
            title_callback: 'products_page_title_callback',
            page_callback: 'products_page'
        };
        items['about-us'] = {
            title: t('About us'),
            page_callback: 'about_us_page'
        };
        // перекрытие страницы checkout (commerce.js - 50 строка)
        items['checkout/%'] = {
            title: 'Заказ',
            page_callback: 'drupalgap_get_form',
            page_arguments: ['agroshop_commerce_checkout_view', 1]
        };
        return items;
    }
    catch (error) {
        console.log('agroshop_menu - ' + error);
    }
}

/**
 * Implements hook_deviceready().
 */
function agroshop_deviceready() {
    try {
        drupalgap.menu_links['node/%'].title_callback = 'agroshop_node_page_title';
        // drupalgap.menu_links['node/%'].title_arguments = 'agroshop_node_page_title';
    }
    catch (error) { console.log('agroshop_deviceready - ' + error); }
}

/**
 * Функция определения заголовка страницы на основе стандартного node_page_title
 * для продукции вместо заголовка выводим категорию
 */
function agroshop_node_page_title(callback, nid) {
    try {
        // Try to load the node title, then send it back to the given callback.
        var title = '';
        var node = node_load(nid, {
            success: function(node) {
                if (node) {
                    if (node.title) { title = node.title; }
                    if (node.type === 'product_agro') {
                        if (_GET('cname')) { title = _GET('cname') };
                        if (_GET('cid')) {
                            title = l(title, 'products/' + _GET('cid'));
                        }
                    }
                }

                callback.call(null, title);
            }
        });
    }
    catch (error) { console.log('node_page_title - ' + error); }
}

/**
 * ----------------------------------------------- Каталог -------------------------------------------------------------
 *
 */
function catalog_page() {
    try {
        var content = {};
        content['list'] = {
            theme: 'view',
            format_attributes: {
                'data-inset': 'true',
                'class': 'row'
            },
            path: 'agro-catalog.json',
            row_callback: 'catalog_page_row'
        };
        return content;
    }
    catch (error) { console.log('catalog_page - ' + error); }
}

function catalog_page_row(view, row) {
    try {
        var html = '';
        // вернуть html код строки любой категории, кроме "Все продукты"
        if (row.tid !== 50) {
            var content = '';
            content += '<div class="c-bkg" style="background: url(' + row.img.src + ') 0 0 no-repeat; background-size: cover;">';
            content +=   '<div class="c-icon"><img src="' + row.icon_img.src + '"></div>';
            content += '</div>';
            content += '<div class="c-title">' + row.name + '</div>';
            html = l(content, 'products/' + row.tid, {
                'attributes': {
                    'class': 'c-item col-xs-12 col-sm-6 wow fadeIn waves-effect waves-button'
                }
            });
        }

        return html;
    }
    catch (error) { console.log('catalog_page_row - ' + error); }
}


/**
 * ----------------------------------------------- Список препаратов ---------------------------------------------------
 *
 */

// заголовок страницы списка
function products_page_title_callback(callback, title) {
    try {
        var tid = arg(1);
        // асинхронно получаем термин по id и асинхронно обновляем заголовок
        taxonomy_term_load(tid, {
            success:function(term){
                callback.call(null, term.name);
            }
        });
    }
    catch (error) { console.log('products_page_title_callback - ' + error); }
}

// содержимое страницы
function products_page() {
    try {
        // Grab the collection from the path.
        var category_tid = arg(1);
        if (!category_tid) { category_tid = 'all'; }
        category_tid = encodeURIComponent(category_tid);

        var content = {};
        content['list'] = {
            theme: 'view',
            format_attributes: {
                'data-inset': 'true',
                'class': 'row'
            },
            path: 'agro.json/' + category_tid,
            row_callback: 'products_page_row',
            empty_callback: 'products_page_empty'
        };

        return content;
    }
    catch (error) { console.log('products_page - ' + error); }
}

function products_page_row(view, row) {
    try {
        console.log('products_page_row');
        var image = theme('image', { path: row.img.src });
        var icon = theme('image', { path: row.icon_img.src });

        var content = '';
        content += '<div class="p-box">';
        content +=   '<div class="p-image">' + image + '</div>';
        content +=   '<p>' + row.descr + '</p>';
        content +=   '<div class="p-icon">' + icon + '</div>';
        content += '</div>';
        content += '<div class="p-title">' + row.title + '</div>';

        return l(content, 'node/' + row.nid + '?cid=' + row.category_id + '&cname=' + row.category_name, {
                attributes: {
                    class: 'p-item col-xs-12 col-sm-6'
                },
                reloadPage: true
            }
        );
    }
    catch (error) { console.log('products_page_row - ' + error); }
}

function products_page_empty(view) {
    try {
        return "Препаратов не найдено";
    }
    catch (error) { console.log('products_page_empty - ' + error); }
}

/**
 * ----------------------------------------------- Препарат ------------------------------------------------------------
 *
 */

/**
 * Implements hook_node_page_view_alter_TYPE().
 * изменение страницы препарата
 */
function agroshop_node_page_view_alter_product_agro(node, options)
{
    try {
        var content = {};

        // выведем контент без title
        content['content'] = node.content;

        options.success(node.content);
    }
    catch (error) { console.log('agroshop_node_page_view_alter_product_agro - ' + error); }
}

/**
 * Implements hook_field_formatter_view().
 * рендер-функция для поля field_product с форматом отображения Rendered product
 * (по аналогии с форматом Форма добавления в корзину из commerce.js - commerce_cart_field_formatter_view)
 */
function commerce_product_reference_field_formatter_view(entity_type, entity, field,
                                            instance, langcode, items, display)
{
    try {
        var element = {};
        if (!empty(items)) {

            // Generate markup that will place an empty div placeholder and pageshow
            // handler that will dynamically inject the cart into the page.
            var markup =
                '<div id="' + commerce_cart_container_id(entity_type, entity.nid) + '"></div>' +
                drupalgap_jqm_page_event_script_code({
                    page_id: drupalgap_get_page_id(),
                    jqm_page_event: 'pageshow',
                    jqm_page_event_callback:
                        '_commerce_product_reference_field_formatter_view_pageshow',
                    jqm_page_event_args: JSON.stringify({
                        entity_type: entity_type,
                        entity_id: entity.nid
                    })
                });

            // Place the markup on delta zero of the element.
            element[0] = {
                markup: markup
            };
        }
        return element;
    }
    catch (error) {
        console.log('commerce_product_reference_field_formatter_view - ' + error);
    }
}

/**
 *
 */
function _commerce_product_reference_field_formatter_view_pageshow(options) {
    try {
        var entity_type = options.entity_type;
        var entity_id = options.entity_id;
        // Load the product display.
        commerce_product_display_load(entity_id, {
            success: function(pd) {
                dpm(pd);
                console.log('_commerce_product_reference_field_formatter_view_pageshow');
                // сформировать страницу
                // var form_html = drupalgap_get_form('commerce_cart_add_to_cart_form', pd);
                var html = '';
                var pid = Object.keys(pd.field_product_entities)[0];

                // цена
                var price = 'Цена на рассмотрении';
                if (pd.field_product_entities[pid].commerce_price['amount'] != 0) {
                    price = pd.field_product_entities[pid].commerce_price_formatted;
                }

                // единица измерения препарата
                var unit_name = pd.field_pd_units_entities[pd.field_pd_units].field_tax_short_name;

                // brand_style
                var tid = Object.keys(pd.field_pd_category_entities)[0];
                var brand_style = ' style="color: #' + pd.field_pd_category_entities[tid].field_color + '"';

                // изображение
                var image_src = pd.field_product_entities[pid].field_p_images_url[0];
                var image = theme('image', {path: image_src});

                // норма расхода
                var consumption = '';
                if (pd.field_pd_consumption_rate != undefined) {
                    var from = accounting.formatNumber(parseFloat(pd.field_pd_consumption_rate.from), 2, " ");
                    var to = accounting.formatNumber(parseFloat(pd.field_pd_consumption_rate.to), 2, " ");
                    consumption = from + '-' + to + ' ' + unit_name + '/га';
                }

                // стоимость обработки
                var cost = 0;
                var price_per_unit = '';
                if (pd.field_pd_consumption_rate != undefined && pd.field_pd_price_per_unit != undefined) {
                    price_per_unit = pd.field_pd_price_per_unit['amount'] / 100;
                    from = accounting.formatNumber(parseFloat(pd.field_pd_consumption_rate.from) * price_per_unit, 0, " ");
                    to = accounting.formatNumber(parseFloat(pd.field_pd_consumption_rate.to) * price_per_unit, 0, " ");
                    cost = from + '-' + to + ' руб./га';
                }

                // препаративная форма
                var prep_form = '';
                if (pd.field_pd_formulation_entities != undefined) {
                    prep_form = pd.field_pd_formulation_entities[pd.field_pd_formulation].name;
                }

                // действующие вещества
                var ingredients = '';
                if (pd.field_pd_active_ingredients_entities != undefined) {
                    $.each(pd.field_pd_active_ingredients_entities, function (index, ingredient) {
                        if (ingredient.field_pd_ai_active_ingredient_entities != undefined) {
                            var name = ingredient.field_pd_ai_active_ingredient_entities[ingredient.field_pd_ai_active_ingredient].name;
                            var conc = ingredient.field_pd_ai_concentration;
                            ingredients += name + ', ' + conc + ' г/' + unit_name + '\n\r';
                        }
                    });
                }

                // описание
                var description = '';

                var body = pd.body.safe_value;
                ba = body.split('<h4>');
                var collapsed = '  data-collapsed="false"';
                $.each(ba, function(index, b_item) {
                    if (b_item != '') {
                        ba2 = b_item.split('</h4>');
                        ba2[0] = ba2[0].replace(/:/, '');
                        description += '<div data-role="collapsible" data-inset="false"' + collapsed +'><h4' + brand_style + '>' + ba2[0] + '<i class="zmdi zmdi-caret-down" aria-hidden="true"></i></h4>' + ba2[1] + '</div>';
                        collapsed = '';
                    }
                });

                // сертификат
                var sertificates = '';
                $.each(pd.field_pd_certificate_url, function(index, sert_src) {
                    sertificates += theme('image', {path: sert_src})
                });

                // сертификат
                var files = '';
                $.each(pd.field_file_attachments, function(index, file) {
                    var file_info = file.filename + ', ' + accounting.formatNumber(file.filesize/1024, 2, " ") + 'KB';
                    var file_url = pd.field_file_attachments_url[index];
                    files += '<div class="nd2-card file-card card-media-right card-media-small">';
                    files +=     '<div class="card-media">';
                    files +=         '<img src="app/themes/agro/images/icons/file_sheet.png">';
                    files +=     '</div>';
                    files +=     '<div class="card-title has-supporting-text">';
                    files +=         '<h3 class="card-primary-title">' + file.description + '</h3>';
                    files +=         '<h5 class="card-subtitle">' + file_info + '</h5>';
                    files +=     '</div>';
                    files +=    '<div class="card-action">';
                    files +=        '<div class="row between-xs">';
                    files +=             '<div class="col-xs-12">';
                    files +=                '<div class="box">';
                    files +=                    '<a href="' + file_url + '" class="ui-btn ui-mini ui-btn-inline ui-btn-raised clr-primary waves-effect waves-button">Скачать</a>';
                    // files +=                    '  ' + '<a href="#" class="ui-btn ui-mini ui-btn-inline ui-btn-raised clr-primary waves-effect waves-button">Открыть</a>';
                    files +=                 '</div>';
                    files +=             '</div>';
                    files +=        '</div>';
                    files +=     '</div>';
                    files += '</div>';
                });

                html  = '<div class="product">';
                html +=   '<div class="row">';
                html +=     '<div class="col-xs">';
                html +=     '<h2 class="p-title"' + brand_style + '>' + pd.title + '</h2>';
                html +=     '</div>';
                html +=   '</div>';
                html +=   '<div class="row">';
                html +=     '<div class="col-xs-5 col-sm-6">';
                html +=       '<div class="p-image">';
                html +=         image;
                html +=       '</div>';
                html +=     '</div>';
                html +=     '<div class="col-xs-7 col-sm-6">';
                html +=       '<div class="p-brief">';
                html +=         '<div class="row">';
                html +=           '<div class="col-xs p-price">' + price + '</div>';
                html +=         '</div>';
                if (consumption !== '') {
                    html += '<div class="row">';
                    html += '<div class="col-xs"' + brand_style + '>' + 'Норма расхода' + '</div>';
                    html += '<div class="col-xs">' + consumption + '</div>';
                    html += '</div>';
                }
                if (cost !== 0) {
                    html += '<div class="row">';
                    html += '<div class="col-xs"' + brand_style + '>' + 'Стоимость обработки' + '</div>';
                    html += '<div class="col-xs">' + cost + '</div>';
                    html += '</div>';
                }
                if (prep_form !== '') {
                    html += '<div class="row">';
                    html += '<div class="col-xs"' + brand_style + '>' + 'Препаративная форма' + '</div>';
                    html += '<div class="col-xs">' + prep_form + '</div>';
                    html += '</div>';
                }
                if (ingredients !== '') {
                    html += '<div class="row">';
                    html += '<div class="col-xs"' + brand_style + '>' + 'Действующие вещества' + '</div>';
                    html += '<div class="col-xs">' + ingredients + '</div>';
                    html += '</div>';
                }
                html +=       '</div>';
                html +=     '</div>';
                html +=   '</div>';
                html +=   '<div class="row">';
                // закладки
                html +=     '<ul data-role="nd2tabs" data-swipe="true" class="nd2Tabs"' + brand_style + '>';
                html +=       '<li data-tab="description" data-tab-active="true" class="nd2Tabs-nav-item nd2Tabs-active">Описание</li>';
                if (sertificates !== '') html += '<li data-tab="sertificates" class="nd2Tabs-nav-item">Сертификат</li>';
                if (files !== '')        html += '<li data-tab="files" class="nd2Tabs-nav-item">Файлы</li>';
                html +=     '</ul>';
                // панели закладок
                html +=   '<div class="nd2tabs-content ui-content wow fadeIn" data-inset="false" data-wow-delay="0.2s" style="visibility: visible; animation-delay: 0.2s; animation-name: fadeIn;">';
                html +=     '<div data-role="nd2tab" data-tab="description" class="nd2Tabs-content-tab p-description nd2Tab-active">' + description + '</div>';
                if (sertificates !== '') html += '<div data-role="nd2tab" data-tab="sertificates" class="nd2Tabs-content-tab">' + sertificates + '</div>';
                if (files !== '')        html += '<div data-role="nd2tab" data-tab="files" class="nd2Tabs-content-tab">' + files + '';
                html +=   '</div>';

                html += '</div>';

                $('#' + commerce_cart_container_id(entity_type, entity_id)).html(html).trigger('create');

                // запустить действия, привязанные к событию pagebeforeshow
                // здесь это нужно для привязки обработчиков на Закладки,
                // т.к. Закладки вставляются в DOM уже после показа страницы
                $(document).trigger("pagebeforeshow");
            }
        });
    }
    catch (error) {
        console.log('_commerce_product_reference_field_formatter_view_pageshow - ' + error);
    }
}



/**
 * hook_services_preprocess
 */
function agroshop_services_preprocess(options)
{
    try {
        // для запроса информации о Препарате добавить параметр глубины (expand_entities=2),
        // чтобы получить термины таксономии в полях типа field_collection
        // (commerce_services из коробки не умеет работать с field_collection, см. README-AGRO.md)
        if (options.service === 'commerce_product_display' && options.resource === 'retrieve') {
            options.path += '&expand_entities=2';
        }
    }
    catch (error) {
        console.log('agroshop_services_preprocess - ' + error);
    }
}


// страница подробного описания препарата
// добавить в форму и вывести поля из Product Variants
function agroshop_form_alter(form, form_state) {
    try {
        var elements = {};
        switch(form.id) {
            case 'commerce_cart_add_to_cart_form':
                var arguments = form["arguments"];
                var pid = _commerce_product_display_product_id;
                var src = arguments[0].field_product_entities[pid].field_p_images_url[0];
                var price = arguments[0].field_product_entities[pid].commerce_price_formatted;
                var fprice = parseFloat(price);
                var descr = arguments[0].body.safe_value;

                // добавляем поля из product variants
                // чтобы поля выводились на странице в нужном порядке, переберем массив

                // если цена == 0 нужно вывести сообщение вместо неё и запретить добавление товара в корзину
                var mprice = 'Цена товара вскоре будет обновлена';
                if (fprice) mprice = '<div id="p_price"><b>Цена: </b>' + price + '</div>';
                elements.price = {
                    markup: mprice
                };

                // кнопка добавления в корзину
                elements.submit = form.elements.submit;
                if (!fprice) elements.submit.disabled = true;

                // изображение товара
                elements.image = {
                    markup: '<div id="p_image"><img src="' + src + '"/></div>'
                };

                // описание товара
                elements.descr = {
                    markup: '<div id="descr">' + descr + '</div>'
                };

                // тара товара
                elements.field_p_tare = form.elements.field_p_tare;

                form.elements = elements;

                // зададим значение по умолчанию
                for (var key in form.elements['field_p_tare']['ru'][0].options) break;
                form.elements['field_p_tare']['ru'][0]['value'] = key;

                break;
            case 'user_login_form':
                // добавить комментарий

                //elements.intro = {
                //    markup: '<div class="intro">Для работы с приложением необходимо войти под своей учетной записью или зарегистрироваться.</div>'
                //};
                elements.name = form.elements.name;
                elements.pass = form.elements.pass;
                elements.submit = form.elements.submit;
                //dpm(form.elements);
                form.elements = elements;

                // изменить подпись в поле Логин
                if (typeof drupalgap.site_settings.logintoboggan_login_with_email !== 'undefined' &&
                    drupalgap.site_settings.logintoboggan_login_with_email == "1" ) {
                    form.elements['name'].title = t('E-mail address');
                }
                break;
            case 'user_register_form':
                // убрать с формы регистрации Имя и при сабмите задать его значение равным Email
                form.elements['name'].type = 'hidden';
                form.elements['name'].required = false;
                form.submit.unshift('agroshop_user_register_form_submit');
                break;
        }
    }
    catch (error) {
        console.log('agroshop_form_commerce_cart_add_to_cart_form_alter - ' + error);
    }
}


// перекрытие функции из commerce.js (строка 824)
// при смене атрибутов меняем цену и картинку
function _commerce_cart_attribute_change() {
    try {
        var pid = _commerce_product_display_get_current_product_id();
        _commerce_product_display_product_id = pid;
        $('#p_sku').html(_commerce_product_display['field_product_entities'][pid]['sku']);
        $('#p_price').html('<b>Цена: </b>' + _commerce_product_display['field_product_entities'][pid]['commerce_price_formatted']);
        $('#p_image').html('<img src="' + _commerce_product_display['field_product_entities'][pid]['field_p_images_url'][0] + '" />');
    }
    catch (error) { console.log('_commerce_cart_attribute_change - ' + error); }
}


/**
 * запрос профиля пользователя через Services
 */
//function agroshop_user_data_retreive(options) {
//    try {
//        var path = 'profile/135.json';
//        Drupal.services.call({
//            method: 'GET',
//            path: path,
//            service: 'profile',
//            resource: 'retrieve',
//            entity_type: 'commerce_customer_profile',
//            success: function(data) {
//                return data;
//            },
//            error: function(xhr, status, message) {
//                try {
//                    if (options.error) { options.error(xhr, status, message); }
//                }
//                catch (error) { console.log('agroshop_user_data_retreive - error - ' + error); }
//            }
//        });
//    }
//    catch (error) { console.log('agroshop_user_data_retreive - ' + error); }
//}

/**
 * создание профиля пользователя (commerce_customer_profile) через Services
 */
function agroshop_user_data_create(options) {
    try {
        // в правах пользователям нужно разрешить создание и редактирование customer_profile_shipping
        options.method = 'POST';
        options.path = 'profile';
        options.service = 'profile';
        options.resource = 'create';
        options.entity_type = 'commerce_customer_profile';
        Drupal.services.call(options);
    }
    catch (error) { console.log('agroshop_user_data_create - ' + error); }
}

/**
 * обновление заказа через Services
 */
function agroshop_order_update(options) {
    try {
        options.method = 'PUT';
        options.path = 'order/' + options.order_id,
        options.service = 'order';
        options.resource = 'update';
        Drupal.services.call(options);
    }
    catch (error) { console.log('agroshop_order_update - ' + error); }
}

/**
 * перекрытие страницы checkout (commerce.js - 244 строка)
 * запрашиваем данные пользователя
 */
function agroshop_commerce_checkout_view(form, form_state, order_id) {
    try {
        // Order ID
        form.elements['order_id'] = {
            type: 'hidden',
            default_value: order_id
        };
        form.elements['customer_surname'] = {
            type: 'textfield',
            title: 'Фамилия',
            title_placeholder: true,
            required: true
        };
        form.elements['customer_name'] = {
            type: 'textfield',
            title: 'Имя',
            title_placeholder: true,
            required: true
        };
        form.elements['customer_name2'] = {
            type: 'textfield',
            title: 'Отчество',
            title_placeholder: true
        };
        form.elements['customer_phone'] = {
            type: 'textfield',
            title: 'Телефон',
            title_placeholder: true,
            required: true
        };
        form.elements['customer_region'] = {
            type: 'textfield',
            title: 'Регион',
            title_placeholder: true,
            required: true
        };

        // Buttons
        form.elements['submit'] = {
            type: 'submit',
            value: 'Отправить заказ'
        };
        //form.buttons['cancel'] = drupalgap_form_cancel_button();

        return form;
    }
    catch (error) { console.log('commerce_checkout_view - ' + error); }
}

/**
 *  сохранение введенных данных покупателя в новом профиле и привязка к заказу
 */
function agroshop_commerce_checkout_view_submit(form, form_state) {
    try {
        variable_set('commerce_checkout_form_state', form_state);
        var order_id = form_state.values['order_id'];

        // создаём профиль пользователя с полученными данными
        var profile = {
            type: 'shipping',
            uid : Drupal.user.uid,
            field_profile_surname:  { ru: { 0: { value: form_state.values['customer_surname'] }}},
            field_profile_name:     { ru: { 0: { value: form_state.values['customer_name'] }}},
            field_profile_name2:    { ru: { 0: { value: form_state.values['customer_name2'] }}},
            field_profile_phone:    { ru: { 0: { value: form_state.values['customer_phone'] }}},
            field_profile_region:   { ru: { 0: { value: form_state.values['customer_region'] }}}
        };
        agroshop_user_data_create({
            data: JSON.stringify(profile),
            success:function(result) {
                // в случае успешного создания профиля, привязываем его к заказу
                var ord = _commerce_order[order_id];
                var order = {};

                order['order_id'] = ord.order_id;
                order['type'] = ord.type;
                var items = {};
                $.each(ord.commerce_line_items, function(key, item) {
                    items[key] = { line_item_id: item };
                });
                order['commerce_line_items'] = {
                    und: items
                };
                order['commerce_order_total'] = {
                    und: { 0: ord.commerce_order_total }
                };
                order['commerce_customer_shipping'] = {
                    und: { 0: { profile_id: result['profile_id'] }}
                };
                agroshop_order_update({
                    order_id: order_id,
                    data: JSON.stringify(order),
                    success:function() {}
                });
            },
            error:function(xhr, status, message) {
                try {
                    if (options.error) { options.error(xhr, status, message); }
                }
                catch (error) { console.log('agroshop_user_data_create - error - ' + error); }
            }
        });

        drupalgap_goto('checkout/complete/' + order_id);
    }
    catch (error) { console.log('commerce_checkout_view_submit - ' + error); }
}

/**
 *
 */
function agroshop_commerce_checkout_complete_view_pageshow(order_id) {
    try {
        commerce_checkout_complete({
            data: { order_id: order_id },
            success: function(result) {
                var checkout_complete_html = '<div>Номер заказа: ' + order_id + '.<br/> Менеджер свяжется с Вами в ближайшее время.</div>';
                $('#commerce_checkout_complete_' + order_id).html(checkout_complete_html).trigger('create');
            }
        });
    }
    catch (error) {
        console.log('agroshop_commerce_checkout_complete_view_pageshow - ' + error);
    }
}



/*******************************
 *
 * THEMES
 * оформление контента
 *
 ******************************/

/**
 * Implements hook_locale() - локализация модуля
 */
function agroshop_locale() {
    return ['ru'];
}


/**
 * Theme a commerce cart. (темизация корзины, перекрытие функции из commerce.js с.1494)
 */
function theme_commerce_cart(variables) {
    try {
        // вернуть настройки после входа или регистрации
        drupalgap.settings.front = 'catalog';

        var html = '';

        // Determine how many line items are in the cart.
        var item_count = 0;
        if (variables.order.commerce_line_items) {
            item_count = variables.order.commerce_line_items.length;
        }
        if (item_count == 0) { return 'Вы не добавили ни одного препарата.'; }

        // Render each line item.
        var items = [];
        $.each(variables.order.commerce_line_items_entities, function(line_item_id, line_item) {
            var item = theme('commerce_cart_line_item', {
                line_item: line_item,
                order: variables.order
            });
            html += item;
        });


        // Render the order total and the buttons.
        html += theme('commerce_cart_total', { order: variables.order });

        // Return the rendered cart.
        return html;
    }
    catch (error) { console.log('theme_commerce_cart - ' + error); }
}

/**
 * Themes a commerce cart line item.
 */
function theme_commerce_cart_line_item(variables) {
    try {
        var id = 'commerce_cart_line_item_quantity_' + variables.line_item.line_item_id;
        var attributes = {
            type: 'text',
            id: id,
            value: Math.floor(variables.line_item.quantity),
            line_item_id: variables.line_item.line_item_id,
            'data-wrapper-class': 'controlgroup-textinput ui-btn',
            onblur: 'commerce_cart_button_update_click(' + variables.order.order_id + ')'
        };

        var html = '<div class="line-item ui-corner-all custom-corners">'+

                '<div class="ui-bar ui-bar-a">'+
                    '<h3>' + variables.line_item.line_item_title + '</h3>'+
                    '<a href="#" class="ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all" onclick = "_commerce_cart_line_item_remove(' + variables.order.order_id + ', ' + variables.line_item.line_item_id + ');">No text</a>'+
                '</div>'+
                '<div class="ui-body ui-body-a">'+
                    '<div class="group" data-role="controlgroup" data-type="horizontal" data-mini="true">'+
                        '<button class="name">Цена:</button>'+
                        '<button>' + variables.line_item.commerce_unit_price_formatted + '</button>'+
                    '</div>'+
                    '<div class="group" data-role="controlgroup" data-type="horizontal" data-mini="true">'+
                        '<button class="name">Количество:</button>'+
                        '<button onclick = "_agroshop_cart_qty_update(\'dec\',' + variables.line_item.line_item_id + ',' + variables.order.order_id + ');" class="ui-btn ui-corner-all ui-icon-carat-d ui-btn-icon-notext">Icon only</button>'+
                        '<input ' +  drupalgap_attributes(attributes) + ' />'+
                        '<button onclick = "_agroshop_cart_qty_update(\'inc\',' + variables.line_item.line_item_id + ',' + variables.order.order_id + ');"'+'class="ui-btn ui-corner-all ui-icon-carat-u ui-btn-icon-notext">Icon only</button>'+
                    '</div>'+
                    '<div class="group" data-role="controlgroup" data-type="horizontal" data-mini="true">'+
                        '<button class="name">Всего:</button>'+
                        '<button>' + variables.line_item.commerce_total_formatted + '</button>'+
                    '</div>'+
                '</div>'+
            '</div>';

        return html;
    }
    catch (error) { console.log('theme_commerce_cart_line_item - ' + error); }
}

/*
* изменить значение поля "Количество" и обновить корзину
*/
function _agroshop_cart_qty_update(op, item_id, order_id){
    var val = $('#commerce_cart_line_item_quantity_' + item_id).val();
    if (op == 'inc') $('#commerce_cart_line_item_quantity_' + item_id).val(++val);
    else if (val>1) $('#commerce_cart_line_item_quantity_' + item_id).val(--val);

    commerce_cart_button_update_click(order_id);
}




/***********************************
 *
 * Slide menu
 *
 **********************************/

/**
 * Implements hook_block_info().
 */
function agroshop_block_info() {
    try {
        var blocks = {};
        blocks['menu_panel_block'] = {
            delta: 'menu_panel_block',
            module: 'agroshop'
        };
        blocks['agro_title'] = {
            delta: 'agro_title',
            module: 'agroshop'
        };
        blocks['menu_block_button_left'] = {
            delta: 'menu_block_button_left',
            module: 'agroshop'
        };
        blocks['menu_block_button_right'] = {
            delta: 'menu_block_button_right',
            module: 'agroshop'
        };

        return blocks;
    }
    catch (error) { console.log('agroshop_block_info - ' + error); }
}

/**
 * Implements hook_block_view().
 */
function agroshop_block_view(delta, region) {
    try {
        var content = '';
        switch (delta) {

            // The slide menu (aka panel).
            case 'menu_panel_block':
                var attrs = {
                    id: drupalgap_panel_id(delta),
                    'data-role': 'panel',
                    'data-position': 'left', // left or right
                    'data-display': 'overlay', // overlay, reveal or push
                    'data-position-fixed': 'true'
                };
                if (Drupal.user.uid === 0) {
                    var items = [
                        bl(t('Main'), 'catalog', {attributes: {'data-icon': 'home'}}),
                        bl(t('About us'), 'about-us', {attributes: {'data-icon': 'info'}}),
                        bl('Выйти из приложения', '#', { attributes: { 'data-icon': 'back', onclick: '_drupalgap_back_exit(1);'}})
                        // bl(t('Register'), 'user/register', {attributes: {'data-icon': 'plus'}}),
                        // bl(t('Login'), 'user/login', {attributes: {'data-icon': 'lock'}}),
                    ];
                } else {
                    var items = [
                        bl(t('Main'), 'catalog', {attributes: {'data-icon': 'home'}}),
                        bl(t('About us'), 'about-us', {attributes: {'data-icon': 'info'}}),
                        bl('Выйти из приложения', '#', { attributes: { 'data-icon': 'back', onclick: '_drupalgap_back_exit(1);'}})
                        // bl(t('My account'), 'user', {attributes: {'data-icon': 'user'}}),
                        // bl(t('Logout'), 'user/logout', {attributes: {'data-icon': 'delete'}})
                    ];
                }
                content += '<div ' + drupalgap_attributes(attrs) + '>' +
                '<!-- panel content goes here -->' +
                '<div class="menu_logo">'+
                    '<img src="app/themes/opie/images/logo.jpg" />'+
                    '<p>ООО Торговый Дом</p>' +
                    '<p>Кирово-Чепецкая<br />Химическая Компания</p>'+
                '</div>'+
                theme('jqm_item_list', { items: items }) +
                '</div><!-- /panel -->';
                break;

            // левая кнопка в Header
            case 'menu_block_button_left':
                // представители на домашней
                if (drupalgap_path_get() == drupalgap.settings.front) {
                    content += bl('', '#', {
                        attributes: {
                            class: 'ui-btn ui-btn-left zmdi zmdi-accounts-alt wow fadeIn',
                            'data-wow-delay': '0.8s',
                            onclick: "javascript:drupalgap_goto('representatives');"
                        }
                    });
                }
                // Домой на остальных
                else {
                    content = bl('', '#' + drupalgap_panel_id('menu_panel_block'), {
                        attributes: {
                            class: 'ui-btn ui-btn-left zmdi zmdi-home wow fadeIn',
                            'data-wow-delay': '0.8s',
                            onclick: "javascript:drupalgap_goto('homepage');"
                        }
                    });
                }
                break;

                // правая кнопка в Header
            case 'menu_block_button_right':
                // настройки на Homepage
                if (drupalgap_path_get() == drupalgap.settings.front) {
                    content += bl("", '#', {
                        attributes: {
                            class: 'ui-btn ui-btn-right zmdi zmdi-settings wow fadeIn',
                            'data-wow-delay': '0.8s',
                            onclick: "javascript:drupalgap_goto('settings');"
                        }
                    });
                // назад на остальных
                } else {
                    content += bl('', '#', {
                        attributes: {
                            class: 'ui-btn ui-btn-right ui-btn-right zmdi zmdi-mail-reply wow fadeIn waves-effect waves-button',
                            'data-wow-delay': '0.8s',
                            onclick: 'javascript:drupalgap_back();'
                        }
                    });
                }
                break;

                // формируем свой заголовок в Header в зависимости от страницы
            case 'agro_title':
                if (drupalgap_path_get() == drupalgap.settings.front) {
                    content = '<h1 class="page-title page-title-image">' + theme('image', { path: 'app/themes/agro/images/homepage/logo-g.png' }) + '</h1>';
                } else {
                    var title_id = system_title_block_id(drupalgap_path_get());
                    content += '<h1 id="' + title_id + '" class="page-title"></h1>';
                }
                break;

        }
        return content;
    }
    catch (error) { console.log('agroshop_block_view - ' + error); }
}


/**
 *   перекрытие стандартной функции commerce.js (ст. 220)
 *   вывод сообщения для анонимов без добавленных товаров
 */
function commerce_cart_view_pageshow() {
    try {
        commerce_cart_index(null, {
            success: function(result) {
                if (result.length != 0) {
                    $.each(result, function(order_id, order) {
                        // Set aside the order so it can be used later without fetching
                        // it again.
                        _commerce_order[order_id] = order;
                        // Theme the cart and render it on the page.
                        var html = theme('commerce_cart', { order: order });
                        $('#commerce_cart').html(html).trigger('create');
                        return false; // Process only one cart.
                    });
                } else {
                    // добавить сообщение в корзине
                    var html = 'Вы не добавили ни одного препарата.';
                    $('#commerce_cart').html(html).trigger('create');
                }
            }
        });
    }
    catch (error) { console.log('covered! commerce_cart_view_pageshow - ' + error); }
}


/**
 * ----------------------------------------------- О компании ----------------------------------------------------------
 *
 */
function about_us_page() {
    try {
        var html = '<p>Мы являемся российским производителем эффективных химических средств защиты растений и жидких минеральных удобрений для всего цикла сельскохозяйственного производства с момента обработки семян и до сбора урожая.</p>'
            + '<p>Компания успешно работает на российском рынке средств защиты растений уже более 15 лет и имеет торговую сеть более чем в 50 регионах страны.</p>'
            + '<p>Движущая сила компании - внедрение новых технологий и постоянное совершенствование системы контроля и качества продукции, которая одобрена зарубежными партнерами.</p>';

        html += '<p>Производство расположено в городе Кирово-Чепецк Кировская области</p>';
        html += '<p>Подробную информацию о компании, представителях и продукции можно найти на нашем сайте</p>'
            + bl('https://kccc.ru', null, {
                attributes: {
                    onclick: "window.open('https://kccc.ru', '_system', 'location=yes')"
                }
            });

        return html;
    }
    catch (error) { console.log('about_us_page - ' + error); }
}