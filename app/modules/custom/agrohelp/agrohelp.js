/**
 * Implements hook_menu().
 */
function agrohelp_menu() {
    try {
        var items = {};
        items['agrohelp'] = {
            title: 'Агропомощь',
            page_callback: 'drupalgap_get_form',
            page_arguments: ['agrohelp_form'],
        };
        items['autocomplete_region'] = {
            title: 'Autocomplete',
            page_callback: 'autocomplete_region'
        };

        return items;
    }
    catch (error) {
        console.log('agrohelp_menu - ' + error);
    }
}



/**
 * ------------------------------------------------ Autocomplete -------------------------------------------------------
 */


/**
 * ------------------------------------------------ форма Агропомощи ---------------------------------------------------
 */
function agrohelp_form(form, form_state)
{
    //
    // form.elements.collaps = {
    //         type: 'collapsible',
    //         header: 'Hello',
    //         // content: '<p>Hi!</p>',
    //         attributes: {
    //             'data-collapsed': 'false'
    //         }
    // };

    // используем автокомплит на Entity Index, так как нужны все значения словаря
    form.elements['autocomplete_region'] = {
        type: 'autocomplete',
        // title: 'Регион',
        remote: true,
        custom: true,
        handler: 'index',
        entity_type: 'taxonomy_term',
        vid: 29, /* optional vocabulary id filter */
        value: 'tid',
        label: 'name',
        filter: 'name',
        attributes: {
            id: 'autocomplete-region',
            'data-enhanced': true,
            // 'data-inset': 'false',
            'data-filter-placeholder': 'Регион'
        },
        prefix: '<h3>О себе</h3>'
    };

    form.elements['company'] = {
        type: 'textfield',
        title: 'Компания',
        title_placeholder: true,
        required: true
    };

    form.elements['name'] = {
        type: 'textfield',
        title: 'ФИО',
        title_placeholder: true,
        required: true
    };

    form.elements['phone'] = {
        type: 'textfield',
        title: 'Телефон',
        title_placeholder: true,
        required: true
    };

    form.elements['email'] = {
        type: 'textfield',
        title: 'E-Mail',
        title_placeholder: true,
        required: true
    };

    // используем автокомплит с собственным обработчиком запросов,
    // так как нужны не любые ноды, а типа main_cultures
    // для этого на стороне сервера в модуле chibs будет функция chibs_autocomplete_cultures
    form.elements['autocomplete_culture'] = {
        type: 'autocomplete',
        // title: 'Культура',
        remote: true,
        custom: true,
        path: 'autocomplete-culture',
        value: 'nid',
        label: 'title',
        filter: 'title',
        params: 'limit=5',
        attributes: {
            id: 'autocomplete-culture',
            'data-enhanced': true,
            'data-filter-placeholder': 'Культура'
        },
        prefix: '<h3>Нужна помощь</h3>'
    };

    // используем автокомплит на Entity Index, так как нужны все значения словаря
    form.elements['autocomplete_phase'] = {
        type: 'autocomplete',
        remote: true,
        custom: true,
        handler: 'index',
        entity_type: 'taxonomy_term',
        vid: 20, /* optional vocabulary id filter */
        value: 'tid',
        label: 'name',
        filter: 'name',
        attributes: {
            id: 'autocomplete-phase',
            'data-enhanced': true,
            // 'data-inset': 'false',
            'data-filter-placeholder': 'Фаза роста'
        }
    };

    // Buttons
    form.elements['submit'] = {
        type: 'submit',
        value: 'Отправить'
    };

    return form;
}

function agrohelp_form_submit()
{
    // установка полей
    var submission = {
        type: 'contact_us',
        field_contact_name: { und: { 0: { value: 'Барсук' }}},
        field_phone:        { und: { 0: { value: '2-22-22' }}}
    };

    // отправка Запроса Агропомощи на сайт
    agrohelp_entityform_submission_create({
        data: JSON.stringify(submission),
        success:function(result) {
            alert('success');
        },
        error:function(xhr, status, message) {
            try {
                if (options.error) { options.error(xhr, status, message); }
            }
            catch (error) { console.log('agrohelp_entityform_submission_create - error - ' + error); }
        }
    });
}

/**
 * ------------------------------------------------ Entityform Submission ----------------------------------------------
 */

/**
 * создание Entityform Submission через Services
 */
function agrohelp_entityform_submission_create(options) {
    try {
        // в правах пользователям нужно разрешить создание и редактирование customer_profile_shipping
        options.method = 'POST';
        options.path = 'entityform_submission';
        options.service = 'entityform_submission';
        options.resource = 'create';
        options.entity_type = 'entityform';
        Drupal.services.call(options);
    }
    catch (error) { console.log('agrohelp_entityform_submission_create - ' + error); }
}