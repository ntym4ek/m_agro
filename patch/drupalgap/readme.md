Патч autocomplete
Возможность задания атрибутов для элементов формы типа Autocomplete

Патч entityform
Правка функции _drupalgap_form_render_elements() для модуля entityform.js (custom).
По дефолту нет поддержки сущностей с различными bundle кроме стандартной node.
Из-за этого при добавлении поддержки entityform без дополнительной проверки возникает ошибка
'_drupalgap_form_render_elements - TypeError: Cannot read property 'entityform_id' of undefined'