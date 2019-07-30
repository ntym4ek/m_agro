/**
 * Webform module eXtensions
 */

/**
 * hook_form_alter()
 */
function x_webform_form_alter(form, form_state, form_id)
{
    console.log('x_webform_form_alter - ');
    try {
        if (form_id === "webform_form") {

        }
    } catch (error) { console.log('x_webform_form_alter - ' + error); }
}

/**
 * Implements hook_node_page_view_alter_TYPE().
 */
function x_webform_node_page_view_alter_webform(node, options)
{
    console.log('x_webform_node_page_view_alter_webform - ');
    try {
        drupalgap_set_title("Опрос");
        var content = {
            'theme': 'node',
            'node': node,
            // @todo - this is a core field and should by fetched from entity.js
            'title': { markup: "Опрос" },
            'content': { markup: node.content }
        };
        options.success(content);
    }
    catch (error) { console.log('x_webform_node_page_view_alter_webform - ' + error); }
}