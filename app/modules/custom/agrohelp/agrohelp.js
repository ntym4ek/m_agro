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
 * ------------------------------------------------ Изменение формы ----------------------------------------------------
 *
 * todo заменить автокомплит на селект с фильтром
 * для этого можно заменить element.field_info_instance.widget.module на agro
 * и сформировать виджет через agro_field_widget_form
 * пока обойдёмся собственным валидатором с поясняющими сообщениями
 */

function agrohelp_form_alter(form, form_state, form_id, aux)
{
    try {
         console.log('agrohelp_form_alter - ');
        if (form_id === 'entityform_edit' && form.bundle === 'agrohelp') {
            var lang = language_default();
            // изменить вывод формы запроса Агропомощи

            // todo извлечь поле с инструкциями из entityform type (drupalgap.content_types_list[bundle].data)
            var instruction = '<p>Если у Вас возникли затруднения с определением вредного объекта, будь то сорняк, вредитель или болезнь на Вашем участке или в поле, заполните форму ниже, чтобы наш специалист смог помочь.</p>'
                + '<p>Профессиональный агроном проверит полученные данные и ответит по одному из оставленных контактов.</p>';
            form.prefix = instruction;

            form.elements.field_region_er.prefix = '<h3>О себе</h3>';
            delete form.elements.field_region_er.title;
            form.elements.field_region_er[lang][0]['options']['attributes']['data-filter-placeholder'] = 'Регион *';

            form.elements.field_company.title = form.elements.field_company.title + (form.elements.field_company.required?' *':'');
            form.elements.field_company.title_placeholder = true;

            form.elements.field_fullname.title = form.elements.field_fullname.title + (form.elements.field_fullname.required?' *':'');
            form.elements.field_fullname.title_placeholder = true;

            form.elements.field_phone.title = form.elements.field_phone.title + (form.elements.field_phone.required?' *':'');
            form.elements.field_phone.title_placeholder = true;

            form.elements.field_email.title = form.elements.field_email.title + ' *';
            form.elements.field_email.title_placeholder = true;

            form.elements.field_f_s_culture.prefix = '<h3>Нужна помощь!</h3>';
            delete form.elements.field_f_s_culture.title;
            form.elements.field_f_s_culture[lang][0]['options']['attributes']['data-filter-placeholder'] = 'Культура *';

            delete form.elements.field_plant_processing_stage_er.title;
            form.elements.field_plant_processing_stage_er[lang][0]['options']['attributes']['data-filter-placeholder'] = 'Фаза культуры *';

            form.elements.field_ho_type.prefix = '<h3>Не могу определить</h3>';
            form.elements.field_ho_type.title = form.elements.field_ho_type.title + (form.elements.field_ho_type.required?' *':'');
            form.elements.field_ho_type.title_placeholder = true;

            form.elements.field_pd_r_hobjects_comment.title = form.elements.field_pd_r_hobjects_comment.title + (form.elements.field_pd_r_hobjects_comment.required?' *':'');
            form.elements.field_pd_r_hobjects_comment.title_placeholder = true;

            form.elements.submit.value = 'Отправить';

            // свой валидатор
            // todo проверка полей с вменяемыми сообщениями при ошибке
            // заменить стандартный валидатор или убрать required и проверять самостоятельно
            form.validate.push('agrohelp_form_validate');
        }
    }
    catch (error) {
        console.log('agrohelp_form_alter - ' + error);
    }
}

/**
 * Custom validation handler for user login form.
 * проверяем поля самостоятельно, так как из-за отсутствия Меток
 * в сообщении обошибку выводится имя поля
 */
function agrohelp_form_validate(form, form_state) {
    // Prevent the joker from logging in.
    if (form_state.values.field_region_er['ru'][0] == '') {
        drupalgap_form_set_error('field_region_er', 'Некорректное поле Регион. Начните набирать название и выберите из списка.');
        return;
    }
    if (form_state.values.field_email['ru'][0] == '') {
        drupalgap_form_set_error('field_email', 'Некорректно заполнено поле E-Mail.');
        return;
    }
    if (form_state.values.field_f_s_culture['ru'][0] == '') {
        drupalgap_form_set_error('field_f_s_culture', 'Некорректное поле Культура. Начните набирать название и выберите из списка.');
        return;
    }
    if (form_state.values.field_plant_processing_stage_er['ru'][0] == '') {
        drupalgap_form_set_error('field_plant_processing_stage_er', 'Некорректное поле Фаза культуры. Начните набирать название и выберите из списка.');
        return;
    }
    if (form_state.values.field_image['ru'][0] == '') {
        drupalgap_form_set_error('field_image', 'Добавьте фото вредного объекта.');
        return;
    }
}