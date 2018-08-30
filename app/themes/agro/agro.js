/**
 * Implements DrupalGap's template_info() hook.
 */
function agro_info() {
    try {
        var theme = {
            name: 'agro',
            regions: {
                header: {
                    attributes: {
                        'data-role': 'header',
                        'data-position': 'fixed',
                        'data-wow-delay': '0.2s',
                        class: "wow fadeInDown"
                    }
                },
                content: {
                    attributes: {
                        'class': 'ui-content',
                        'role': 'main'
                    }
                },
                footer: {
                    attributes: {
                        'data-role': 'footer',
                        'data-position': 'fixed',
                        'data-theme': 'b'
                    }
                }
            }
        };

        return theme;
    }
    catch (error) { drupalgap_error(error); }
}

/**
 * Implements hook_TYPE_tpl_html().
 */
function agro_page_tpl_html() {
    return '<div {:drupalgap_page_attributes:}>' +
        '{:header:}' +
        '{:content:}' +
        '</div>';
}

/**
 * Implements hook_TYPE_tpl_html().
 */
function agro_node_tpl_html() {
    return '<h2>{:title:}</h2>' +
        '<div>{:content:}</div>';
}

/**
 * Implements hook_TYPE_tpl_html().
 */
function agro_user_profile_tpl_html() {
    return '<h2>{:name:}</h2>' +
        '<div>{:created:}</div>' +
        '<div class="user-picture">{:picture:}</div>' +
        '<div>{:content:}</div>';
}

/**
 * Themes radio buttons.
 * @param {Object} variables
 * @return {String}
 */
function agro_radios(variables) {
    try {
        // console.log('agro_radios - ');
        var radios = '';
        if (variables.options) {
            variables.attributes.type = 'radio';
            // Determine an id prefix to use.
            var id = 'radio';
            if (variables.attributes.id) {
                id = variables.attributes.id;
                delete variables.attributes.id;
            }
            // Set the radio name equal to the id if one doesn't exist.
            if (!variables.attributes.name) {
                variables.attributes.name = id;
            }
            // Init a delta value so each radio button can have a unique id.
            var delta = 0;
            for (var value in variables.options) {
                if (!variables.options.hasOwnProperty(value)) { continue; }
                var label = variables.options[value];
                if (value == 'attributes') { continue; } // Skip the attributes.
                var checked = '';
                if (variables.value && variables.value == value) {
                    checked = ' checked="checked" ';
                }
                var input_id = id + '_' + delta.toString();
                var input_label =
                    '<label for="' + input_id + '">' + label + '</label>';
                radios += '<input id="' + input_id + '" value="' + value + '" ' +
                    drupalgap_attributes(variables.attributes) +
                    checked + ' />' + input_label;
                delta++;
            }
        }
        return '<div data-role="controlgroup" data-type="horizontal">' + radios + '</div>';
    }
    catch (error) { console.log('agro_radios - ' + error); }
}

/**
 * Implementation of theme_image().
 * @param {Object} variables
 * @return {String}
 */
function agro_image(variables) {
    try {

        // Turn the path, alt and title into attributes if they are present.
        if (variables.path) { variables.attributes.src = variables.path; }
        // if (variables.path) { variables.attributes.src = 'https://storge.pic2.me/upload/652/5b85ae8b64d00.jpg'; }
        if (variables.alt) { variables.attributes.alt = variables.alt; }
        if (variables.title) { variables.attributes.title = variables.title; }

        // показать изо только после загрузки
        variables.attributes.onload = "$(this).css('visibility', 'visible'); $(this).parent().css('background', 'none');";

        // Render the image.
        var image = '<img ' + drupalgap_attributes(variables.attributes) + ' />';

        if (variables.fancybox !== undefined && variables.fancybox.image !== undefined) {
            let caption = variables.fancybox.title !== undefined ? variables.fancybox.title : '';
            image = '<a href="' + variables.fancybox.image + '" data-fancybox="gallery" data-caption="' + caption + '">' + image + '</a>';
        }

        // обёртка для отображения процесса загрузки
        image = '<div class="image-loader">' + image + '</div>';

        return image;
    }
    catch (error) { console.log('agro_image - ' + error); }
}

