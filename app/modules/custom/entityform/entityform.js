/**
 * Implements hook_menu().
 */
function entityform_menu() {
    try {
        var items = {};

        items['entityform/%'] = {
            title: 'Новый запрос',
            page_callback: 'entityform_view',
            page_arguments: [1]
        };
        items['entityform/add/%'] = {
            title: 'Новая форма',
            title_callback: 'entityform_add_page_by_type_title',
            title_arguments: [2],
            page_callback: 'entityform_add_page_by_type',
            page_arguments: [2],
            options: { reloadPage: true }
        };

        return items;
    }
    catch (error) {
        console.log('entityform_menu - ' + error);
    }
}

/**
 * ------------------------------------------------ Страница запроса ---------------------------------------------------
 */
function entityform_view(eid)
{
    return '<h3>Запрос получен</h3>' +
        '<p>Ваш запрос зарегистрирован под номером ' + eid + '.</p>' +
        '<p>Наш специалист в ближайшее время свяжется с Вами по указанным в форме контактным данным.</p>'
}

/**
 * ------------------------------------------------ Создание нового запроса --------------------------------------------
 */

/**
 * Title call back function for entityform/add/[type].
 * по аналогии с node/add/[type]
 * @param {Function} callback
 * @param {String} type
 * @return {Object}
 */
function entityform_add_page_by_type_title(callback, type)
{
    try {
        // console.log('entityform_add_page_by_type_title');
        var title = drupalgap.content_types_list[type].name;
        return callback.call(null, title);
    }
    catch (error) { console.log('entityform_add_page_by_type_title - ' + error); }
}

/**
 * Page call back function for entityform/add/[type].
 * по аналогии с node_add_page_by_type
 * @param {String} type
 * @return {Object}
 */
function entityform_add_page_by_type(type)
{
    try {
        return drupalgap_get_form('entityform_edit', {'type': type});
    }
    catch (error) { console.log('entityform_add_page_by_type - ' + error); }
}

/**
 * The entityform edit form.
 * по аналогии с node_edit
 * @param {Object} form
 * @param {Object} form_state
 * @param {Object} entityform
 * @return {Object}
 */
function entityform_edit(form, form_state, entityform)
{
    try {
        console.log('entityform_edit');

        // Setup form defaults.
        form.entity_type = 'entityform';
        form.bundle = entityform.type;

        // Add the entity's core fields to the form.
        entityform_add_core_fields_to_form('entityform', entityform.type, form, entityform);

        // Add the fields for this content type to the form.
        drupalgap_field_info_instances_add_to_form('entityform', entityform.type, form, entityform);

        // Add submit to form.
        form.elements.submit = {
            'type': 'submit',
            'value': t('Save')
        };

        // Add cancel button to form.
        form.buttons['cancel'] = drupalgap_form_cancel_button();

        return form;
    }
    catch (error) { console.log('entityform_edit - ' + error); }
}

/**
 * The entityform edit form's submit function.
 * по аналогии с node_edit_submit
 * @param {Object} form
 * @param {Object} form_state
 */
function entityform_edit_submit(form, form_state)
{
    try {
        console.log('entityform_edit_submit - ');
        var entityform = drupalgap_entity_build_from_form_state(form, form_state);
        // сменим идентификатор языка с ru на und
        // иначе значения не будут присвоены
        $.each(entityform, function(index, item){
            if (item['ru'] != undefined) {
                // для термина таксономии
                if (form.elements[index].type == 'taxonomy_term_reference' ||
                    form.elements[index].field_info_instance.widget.type == 'options_select') {
                    entityform[index]['und'] = [];
                    entityform[index]['und'][0] = item['ru'];
                }
                // остальные поля
                else {
                    entityform[index]['und'] = item['ru'];
                }
                delete entityform[index]['ru'];
            }
        });
        drupalgap_entity_form_submit(form, form_state, entityform);
    }
    catch (error) { console.log('entityform_edit_submit - ' + error); }
}

/**
 * Given an entity type, bundle name, form and entity, this will add the
 * entity's core fields to the form via the DrupalGap forms api.
 * по аналогии с drupalgap_form_add_core_fields_to_form
 * @param {String} entity_type
 * @param {String} bundle
 * @param {Object} form
 * @param {Object} entity
 */
function entityform_add_core_fields_to_form(entity_type, bundle,
                                                  form, entity)
{
    try {
        // Grab the core fields for this entity type and bundle.
        var fields = entityform_get_core_fields(entity_type, bundle);
        // Iterate over each core field in the entity and add it to the form. If
        // there is a value present in the entity, then set the field's form element
        // default value equal to the core field value.
        for (var name in fields) {
            if (!fields.hasOwnProperty(name)) { continue; }
            var field = fields[name];
            var default_value = field.default_value;
            if (entity && entity[name]) { default_value = entity[name]; }
            form.elements[name] = field;
            form.elements[name].default_value = default_value;
        }
    }
    catch (error) {
        console.log('entityform_add_core_fields_to_form - ' + error);
    }
}

/**
 * Given an entity type, this returns its core fields as forms api elements.
 * по аналогии с drupalgap_form_get_core_fields
 * @param {String} entity_type
 * @param {String} bundle
 * @return {Object}
 */
function entityform_get_core_fields(entity_type, bundle)
{
    try {
        var fields = {};
        switch (entity_type) {
            case 'entityform':
                fields.entityform_id = {
                    'type': 'hidden',
                    'required': false,
                    'default_value': ''
                };
                fields.type = {
                    'type': 'hidden',
                    'required': true,
                    'default_value': ''
                };
                fields.language = {
                    'type': 'hidden',
                    'required': true,
                    'default_value': 'und'
                };

                break;

            default:
                console.log('entityform_get_core_fields - entity type not supported yet (' + entity_type + ')');
                break;
        }
        return fields;
    }
    catch (error) { console.log('entityform_get_core_fields - ' + error); }
}

function entityform_primary_key()
{
    return 'entityform_id';
}

/**
 * Saves a entityform.
 * @param {Object} entityform
 * @param {Object} options
 */
function entityform_save(entityform, options) {
    try {
        services_resource_defaults(options, 'entityform', 'create');
        entity_create('entityform', entityform.type, entityform, options);
    }
    catch (error) { console.log('entityform_save - ' + error); }
}

/**
 * Implements hook_services_preprocess().
 */
function entityform_services_preprocess(options) {
    try {
        // Since the Entityform doesn't use a fully qualified namespace
        // prefix on their resources, we have to manually set the correct path for
        // the service resource calls.
        switch (options.service) {
            case 'entityform':
                options.path = options.path.replace('entityform', 'entity_entityform');
                options.service = options.service.replace('entityform', 'entity_entityform');
                break;
        }
    }
    catch (error) { console.log('entityform_services_preprocess - ' + error); }
}

/**
 * Implements hook_assemble_form_state_into_field().
 * @param {Object} entity_type
 * @param {String} bundle
 * @param {String} form_state_value
 * @param {Object} field
 * @param {Object} instance
 * @param {String} langcode
 * @param {Number} delta
 * @param {Object} field_key
 * @return {Object}
 */
function taxonomy_assemble_form_state_into_field(entity_type, bundle,
                                                 form_state_value, field, instance, langcode, delta, field_key) {
    try {
        console.log('taxonomy_assemble_form_state_into_field - ');
        var result = null;
        switch (instance.widget.type) {
            case 'taxonomy_autocomplete':
                field_key.use_wrapper = false;
                result = form_state_value;
                break;
            case 'options_select':
                field_key.value = 'tid';
                // field_key.use_delta = true;
                result = form_state_value;
                break;
        }
        return result;
    }
    catch (error) {
        console.log('taxonomy_assemble_form_state_into_field - ' + error);
    }
}