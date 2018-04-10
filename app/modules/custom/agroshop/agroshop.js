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
            page_callback: 'agro_catalog_page'
        };
        items['agro-products/%'] = {
            title: 'Препараты',
            page_callback: 'agro_products_page'
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


// список категорий
function agro_catalog_page() {
    try {
        var content = {};
        content['agroshop_list'] = {
            theme: 'view',
            format: 'ul',
            path: 'agro-catalog.json',
            row_callback: 'agro_catalog_page_row'
        };
        return content;
    }
    catch (error) { console.log('agro_catalog_page - ' + error); }
}

function agro_catalog_page_row(view, row) {
    try {
        var html = '';
        // вернуть html код строки любой категории, кроме "Все продукты"
        if (row.tid !== 50) {
            var title = '<h2>' + row.name + '</h2>';
            html = l(title, 'agro-products/' + row.tid, {
                'attributes': {
                    'style': "background: linear-gradient(to right, #" + row.color + " 0, #" + row.color + " 40px, rgba(255,255,255,0) 40px), url('" + row.img.src + "') 0 0 no-repeat; background-size: cover;",
                    'class': 'catalog-item'
                }
            });
        }
        return html;
    }
    catch (error) { console.log('agro_catalog_page_row - ' + error); }
}

// страница О компании
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


// список товаров категории
function agro_products_page() {
    try {
        // Grab the collection from the path.
        var category_tid = arg(1);
        if (!category_tid) { category_tid = 'all'; }
        category_tid = encodeURIComponent(category_tid);

        var content = {};
        content['agroshop_list'] = {
            theme: 'view',
            format: 'ul',
            path: 'agro.json/' + category_tid,
            row_callback: 'agro_products_page_row',
            empty_callback: 'agro_products_page_empty'
        };
        return content;
    }
    catch (error) { console.log('agroshop_list_page - ' + error); }
}

function agro_products_page_row(view, row) {
    try {
        var image_path = row.img.src;
        var image = theme('image', { path: image_path });
        var title = '<div class="title">' + row.title + '</div>';
        var descr = '<div class="descr">' + row.descr + '</div>';
        var html = l(image + title + descr, 'node/' + row.nid, {
            attributes: {
                class: 'product-item ui-btn-icon-right ui-icon-carat-r'
            },
            reloadPage: true
        });

        var image = theme('image', { path: row.img.src });
        var html = l(
            image +
            '<h2>' + row.title + '</h2>' +
            '<p>' + row.descr + '</p>',
            'node/' + row.nid, {
                attributes: {
                    class: 'product-item'
                },
                reloadPage: true
            }
        );
        return html;
        //return '<div class="b1"><a href="' + 'node/' + row.nid + '">' + image + '</a></div><div class="b2">' +html+ '</div>';
    }
    catch (error) { console.log('agroshop_list_page_row - ' + error); }
}

function agro_products_page_empty(view) {
    try {
        return "Добавить товары";
    }
    catch (error) { console.log('agroshop_list_page_empty - ' + error); }
}

// страница подробного описания препарата
// добавить в форму и вывести поля из Product Variants
function agroshop_form_alter(form, form_state) {
    try {
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
                var elements = {};

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
                var elements = {};
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
 * Implements hook_deviceready().
 * позволяет менять элемкны отрендеренных страницы
 */
function agroshop_deviceready() {
    try {
        // страница завершения заказа (Checkout Complete)
            // Меняем заголовок
        drupalgap.menu_links['checkout/complete/%'].title = 'Заказ оформлен';
            // меняем content pageshow callback на свой
        drupalgap.menu_links['checkout/complete/%'].pageshow = 'agroshop_commerce_checkout_complete_view_pageshow';
            // обновлять корзину каждый раз
        drupalgap.menu_links['cart'].options.reloadPage = true;

    }
    catch (error) { console.log('agroshop_deviceready - ' + error); }
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

        // если пользователь авторизован, вывести кнопку заказа
        //dpm('user!!! - ' + Drupal.user.uid);
        // if (Drupal.user.uid != 0) {
        //     html += theme('button_link', {
        //         text: 'Заказать',
        //         path: 'checkout/' + variables.order.order_id,
        //         options: {
        //             attributes: {
        //                 'data-icon': 'check',
        //                 'data-theme': 'b'
        //             }
        //         }
        //     });
        // }
        // // если аноним - кнопки входа/регистрации
        // else {
        //     // после входа или регистрации вернуться в корзину
        //     drupalgap.settings.front = 'cart';
        //     html += '<div style="text-align: center;">Для оформления заказа необходимо</div>';
        //     html += theme('button_link', {
        //         text: 'Войти / Зарегистрироваться',
        //         path: 'user/login',
        //         options: {
        //             attributes: {
        //                 'data-icon': 'user',
        //                 'data-theme': 'b'
        //             }
        //         }
        //     });
        // }

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


/**
 * Implements hook_node_page_view_alter_TYPE().
 * изменение отрендеренной ноды
 */
function agroshop_node_page_view_alter_product_agro(node, options) {
    try {
        // выведем контент без title
        options.success(node.content);
    }
    catch (error) { console.log('agroshop_node_page_view_alter_product_agro - ' + error); }
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
        blocks['menu_panel_block_button'] = {
            delta: 'menu_panel_block_button',
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
                    'data-display': 'overlay' // overlay, reveal or push
                };
                if (Drupal.user.uid == 0) {
                    var items = [
                        bl(t('Main'), 'catalog', {attributes: {'data-icon': 'home'}}),
                        bl(t('About us'), 'about-us', {attributes: {'data-icon': 'info'}}),
                        bl('Выйти из приложения', '#', { attributes: { 'data-icon': 'close', onclick: '_drupalgap_back_exit(1);'}})
                        // bl(t('Register'), 'user/register', {attributes: {'data-icon': 'plus'}}),
                        // bl(t('Login'), 'user/login', {attributes: {'data-icon': 'lock'}}),
                    ];
                } else {
                    var items = [
                        bl(t('Main'), 'catalog', {attributes: {'data-icon': 'home'}}),
                        bl(t('About us'), 'about-us', {attributes: {'data-icon': 'info'}}),
                        bl('Выйти из приложения', '#', { attributes: { 'data-icon': 'close', onclick: '_drupalgap_back_exit(1);'}})
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

            // The button to open the menu.
            case 'menu_panel_block_button':
                content = bl('Open panel', '#' + drupalgap_panel_id('menu_panel_block'), {
                    attributes: {
                        'data-icon': 'bars',
                        'data-iconpos': 'notext',
                        'class': 'ui-btn-left my_panel_block_button_icon'
                    }
                });
                // Attach a swipe listener for the menu.
                var page_id = drupalgap_get_page_id();
                content += drupalgap_jqm_page_event_script_code({
                    page_id: page_id,
                    jqm_page_event: 'pageshow',
                    jqm_page_event_callback: 'agroshop_menu_panel_block_swiperight',
                    jqm_page_event_args: JSON.stringify({
                        page_id: page_id
                    })
                });
                break;
        }
        return content;
    }
    catch (error) { console.log('agroshop_block_view - ' + error); }
}

/**
 *  menu swipe right callback function
 */
function agroshop_menu_panel_block_swiperight(options) {
    try {
        $('#' + options.page_id).on('swiperight', function(event) {
            $('#' + options.page_id + ' .region_header .my_panel_block_button_icon').click();
        });
    }
    catch (error) { console.log('my_panel_block_swiperight - ' + error); }
}

// установить имя пользователя равным его email
function agroshop_user_register_form_submit(form, form_state) {
    form_state.values.name = form_state.values.mail;
    //dpm(form_state);
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