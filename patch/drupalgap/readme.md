1. Патч autocomplete
Возможность задания атрибутов для элементов формы типа Autocomplete

2. Патч entityform
Правка функции _drupalgap_form_render_elements() для модуля entityform.js (custom).
По дефолту нет поддержки сущностей с различными bundle кроме стандартной node.
Из-за этого при добавлении поддержки entityform без дополнительной проверки возникает ошибка
'_drupalgap_form_render_elements - TypeError: Cannot read property 'entityform_id' of undefined'

3. Патч t_term_reference_placeholder
- Возможность задать placeholder для taxonomy_term_reference поля. 
Пример: 
form.elements.field_f_region[lang][0]['placeholder'] = 'Регион *';
- Убрано дублирование "- None -"
- Передача атрибутов селекту вместо скрытого элемента.
Пример:  
form.elements.field_f_region[lang][0].options.attributes['data-native-menu'] = false;
Всплывающий попап для селекта

4. Патч file_upload_loader
Загрузка файла на сервер с отображением лоадера.
Изначально загрузка файла выполнялась с async: false, что блокировало отрисовку ранее выполненного кода, 
отвечающего за отображение лоадера. Точно также alert блокирует отрисовку.
(https://javascript.ru/forum/events/74726-kak-rabotaet-alert.html#post491709)
Меняем async на true (необходимы исследования о последствиях асинхронной загрузки).