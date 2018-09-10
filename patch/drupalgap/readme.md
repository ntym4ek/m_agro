Патч autocomplete
Возможность задания атрибутов для элементов формы типа Autocomplete

Патч entityform
Правка функции _drupalgap_form_render_elements() для модуля entityform.js (custom).
По дефолту нет поддержки сущностей с различными bundle кроме стандартной node.
Из-за этого при добавлении поддержки entityform без дополнительной проверки возникает ошибка
'_drupalgap_form_render_elements - TypeError: Cannot read property 'entityform_id' of undefined'

Патч t_term_reference_placeholder
1. Возможность задать placeholder для taxonomy_term_reference поля. 
Пример: 
form.elements.field_f_region[lang][0]['placeholder'] = 'Регион *';
2. Убрано дублирование "- None -"
3. Передача атрибутов селекту вместо скрытого элемента.
Пример:  
form.elements.field_f_region[lang][0].options.attributes['data-native-menu'] = false;
Всплывающий попап для селекта