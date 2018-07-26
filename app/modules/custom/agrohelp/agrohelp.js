/**
 * Implements hook_menu().
 */
function agrohelp_menu() {
    try {
        var items = {};
        items['agrohelp'] = {
            title: 'Агропомощь',
            page_callback: 'drupalgap_get_form',
            page_arguments: ['agrohelp_form']
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
function agrohelp_form_alter(form, form_state, form_id, aux)
{
    try {
        // console.log('agrohelp_form_alter - ');
        if (form_id === 'entityform_edit' && form.bundle === 'agrohelp') {
            var lang = language_default();
            // todo извлечь поле с инструкциями из entityform type (drupalgap.content_types_list[bundle].data)
            var instruction = '<p>Если у Вас возникли затруднения с определением вредного объекта, будь то сорняк, вредитель или болезнь на Вашем участке или в поле, заполните форму ниже, чтобы наш специалист смог помочь.</p>'
                + '<p>Профессиональный агроном проверит полученные данные и ответит по одному из оставленных контактов.</p>';
            form.prefix = instruction;

            form.elements.field_region_er.prefix = '<h3>О себе</h3>';
            delete form.elements.field_region_er.title;
            form.elements.field_region_er[lang][0]['options']['attributes']['data-filter-placeholder'] = 'Регион' + (form.elements.field_region_er.required?' *':'');

            form.elements.field_company.title = form.elements.field_company.title + (form.elements.field_company.required?' *':'');
            form.elements.field_company.title_placeholder = true;

            form.elements.field_fullname.title = form.elements.field_fullname.title + (form.elements.field_fullname.required?' *':'');
            form.elements.field_fullname.title_placeholder = true;

            form.elements.field_phone.title = form.elements.field_phone.title + (form.elements.field_phone.required?' *':'');
            form.elements.field_phone.title_placeholder = true;

            form.elements.field_email.title = form.elements.field_email.title + (form.elements.field_email.required?' *':'');
            form.elements.field_email.title_placeholder = true;

            form.elements.field_f_s_culture.prefix = '<h3>Нужна помощь!</h3>';
            delete form.elements.field_f_s_culture.title;
            form.elements.field_f_s_culture[lang][0]['options']['attributes']['data-filter-placeholder'] = 'Культура' + (form.elements.field_f_s_culture.required?' *':'');

            delete form.elements.field_plant_processing_stage_er.title;
            form.elements.field_plant_processing_stage_er[lang][0]['options']['attributes']['data-filter-placeholder'] = 'Фаза культуры' + (form.elements.field_plant_processing_stage_er.required?' *':'');

            // form.elements.field_image.prefix = '<h3>Не могу определить</h3>';
        }
    }
    catch (error) {
        console.log('agrohelp_form_alter - ' + error);
    }
}



function agrohelp_form(form, form_state)
{
    // todo сформировать форму автоматически по аналогии с node/%/edit

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

    form.elements['image'] = {
        type: 'image',
        title: 'Фото',
        required: true
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
