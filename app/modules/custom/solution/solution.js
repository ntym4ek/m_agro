/**
 * Implements hook_menu().
 */
function solution_menu()
{
    return {
        solution : {
            title: 'Найти решение',
            page_callback: 'drupalgap_get_form',
            page_arguments: ['solution_form_page']
        }
    };
}


/**
 * ----------------------------------------------- Форма с фильтрами ---------------------------------------------------
 */
function solution_form_page(form, form_state)
{
    try {
        form.elements['culture'] = {
            type: 'select',
            options: {
                '': 'Культура',
                0: 'No',
                1: 'Yes',
                2: 'Maybe So',
                3: 'Maybe So',
                4: 'Maybe So',
                5: 'Maybe So',
                6: 'No',
                7: 'Yes',
                8: 'Maybe So',
                9: 'Maybe So',
                10: 'Maybe So',
                11: 'Maybe So',
                12: 'Maybe So',
                13: 'No',
                14: 'Yes',
                15: 'Maybe So',
                16: 'Maybe So',
                17: 'Maybe So',
                attributes: {
                    'data-native-menu': 'false',
                    'multiple': 'multiple'
                }
            },
            // default_value: 1,
            required: true,
            prefix: '<h3>Что лечим?</h3>'
        };
        form.elements['submit'] = {
            type: 'submit',
            value: 'Say Hello'
        };

        return form;
    }
    catch (error) { console.log('solution_form_page - ' + error); }
}