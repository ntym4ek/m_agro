/**
 * Webform module eXtensions
 */

/**
 * Implements hook_menu().
 */
function x_webform_menu()
{
    var items = {};
    items['surveys'] = {
        title: 'Опросы',
        page_callback: 'x_webform_list_page'
    };

    return items;
}

function x_webform_form_alter(form, form_state, form_id)
{
    console.log('x_webform_form_alter - ');
    try {
        // todo текстовым полям прописать заголовки
        if (form_id === "webform_form") {
            for (var name in form.elements) {
                if (!form.elements.hasOwnProperty(name)) { continue; }
                if (form.elements[name].title === "" && form.elements[name].component !== undefined) {
                    form.elements[name].title = form.elements[name].component.name;
                }
            }
            form.elements.submit.value = "Отправить";
            form.elements.submit.options.attributes.class = "clr-btn-blue ui-btn-raised";
        }
    }
    catch (error) { console.log('x_webform_form_alter - ' + error); }
}

/**
 * ----------------------------------------------- Список опросов ------------------------------------------------------
 */
function x_webform_list_page()
{
    return {
        'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">' },
        'list': {
            theme: 'view',
            path: 'surveys.json',
            row_callback: 'x_webform_list_page_row'
        },
        'suffix': { markup: '</div></div>' }
    };
}

function x_webform_list_page_row(view, row)
{
    try {
        return theme('content_card', {
            item: {
                img: {src: row.img.src},
                link: {url: 'node/' + row.nid},
                title: row.title
            }
        });
    }
    catch (error) { console.log('x_webform_list_page_row - ' + error); }
}

/**
 * Implements hook_node_page_view_alter_TYPE().
 */
function x_webform_node_page_view_alter_webform(node, options)
{
    // console.log('x_webform_node_page_view_alter_webform - ');
    try {
        delete(node.field_wf_category);
        delete(node.field_promo_image);
        delete(node.field_textfield_1);
        drupalgap_entity_render_content('node', node);
        var content = {
            'prefix': { markup: '<div class="row"><div class="col-xs-12 col-sm-10 col-sm-offset-1">' },
            'suffix': { markup: '</div></div>' },
            'header': '<div class="content-header"><h2>' + node.title + '</h2></div>'
        };
        content['questions'] = {
            markup: '<div class="questions">' +
                        node.content +
                    '</div>'
        };
        options.success(content);

        var components = node.webform.components,
            conditionals = node.webform.conditionals,
            form_name = "edit-webform-form-node-" + node.webform.nid;
        // цикл по условиям формы, собрать всё в массивы
        $.each(conditionals, function(index_c, condition) {
            // цикл по правилам условия
            var rules = [];
            $.each(condition.rules, function(index_r, rule){
                if (rule.source_type === "component") {
                    rules.push({
                        cid: index_c,
                        element: "select",
                        operator: rule.operator,
                        source_name: form_name + "-" + components[rule.source].form_key,
                        value: rule.value
                    });
                }
            });
            // цикл по действиям
            var actions = [];
            $.each(condition.actions, function (index_a, action) {
                actions.push({
                    form_id: "webform_form_node_" + node.webform.nid,
                    form_name: form_name,
                    target_name: components[action.target].form_key,
                    target: action.target,
                    required: !!Number(components[action.target].required),
                    action: action.action
                });
            });
            _checkActionElement(rules, actions);
        });
    }
    catch (error) { console.log('x_webform_node_page_view_alter_webform - ' + error); }
}

function _checkActionElement(rules, actions)
{
    try {
        var rules_ok = true;
        // проверить
        $.each(rules, function(index_r, rule){
            if (rule.element === "select") {
                if (rule.operator === "equal") {
                    if (!$("#" + rule.source_name + "_" + rule.value).is(":checked")) {
                        rules_ok = false;
                    }
                }

                // однократно повесить обработчик на изменение элемента
                // для каждого из условий (rule.cid) и каждого правила (index_r)
                var el_id = "input[name=" + rule.source_name + "]";
                var el_class = "el-" + rule.cid + "-" + index_r + "-processed";
                if (!$(el_id).hasClass(el_class)) {
                    $(el_id).addClass(el_class).data("rules", rules).data("actions", actions).change(function () {
                        _checkActionElement($(el_id).data("rules"), $(el_id).data("actions"));
                    });
                }
            }
        });

        $.each(actions, function(index_a, action) {
            // действие Показа/Скрытия элемента
            if (action.action === "show" || action.action === "hide") {
                if (rules_ok === (action.action === "show")) {
                    // показать элемент и восстановить состояние атрибута required
                    _setFieldRequired(action.form_id, action.target_name, action.required && 1);
                    $(".field-name-" + action.target_name.replace(/_/g, "-")).show();
                } else {
                    _setFieldRequired(action.form_id, action.target_name, !(action.required && 1));
                    $(".field-name-" + action.target_name.replace(/_/g, "-")).hide();
                }
            }
            if (action.action === "require") {
                if (rules_ok) {
                    _setFieldRequired(action.form_id, action.target_name, true);
                } else {
                    _setFieldRequired(action.form_id, action.target_name, action.required);
                }
            }
        });
    }
    catch (error) { console.log('_checkActionElement - ' + error); }
}

// сброс/установка атрибута required для заданного элемента
function _setFieldRequired(form_id, element_name, state)
{
    try {
        var form = drupalgap_form_local_storage_load(form_id);
        form.elements[element_name].required = state;
        drupalgap_form_local_storage_save(form);
    }
    catch (error) { console.log('_setFieldRequired - ' + error); }
}