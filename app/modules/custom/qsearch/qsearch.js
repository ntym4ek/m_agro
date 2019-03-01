/**
 * Implements hook_menu().
 */
function qsearch_menu() {
    try {
        var items = {};
        items['qsearch'] = {
            title: 'Быстрый поиск',
            page_callback: 'qsearch_page',
            pageshow: 'qsearch_page_pageshow',
            options:{
                reloadPage: true
            }
        };

        return items;
    }
    catch (error) {
        console.log('qsearch_menu - ' + error);
    }
}

/**
 * hook_drupalgap_back
 */
function qsearch_drupalgap_back(from, to)
{
    // при возврате на страницу отсутствует список, нужно обновить его
    if (to == "qsearch") {
        // очистить поле ввода
        $(".ui-input-search input").val("");
        $('#qsearch_autocomplete_input-list').filterable('refresh');
    }
}


/**
 * callback function
 * страница со списком и полем ввода
 */
function qsearch_page()
{
    try {
        var content = {
            'prefix':   { markup: '<div class="row"><div class="col-xs-12 col-sm-8 col-sm-offset-2">'},
            'intro':    { markup: '<div class="content-header"><h4>Быстрый поиск препарата по наименованию и действующему веществу</h4></div>'},
            'qsearch':  { markup: '<div id="qsearch-wrapper"></div>' },
            'suffix':   { markup: '</div></div>' }
        };

        return content;
    }
    catch (error) { console.log('qsearch_page - ' + error); }
}


/**
 * callback function
 */
function qsearch_page_pageshow()
{
    try {
        // console.log('qsearch_page_pageshow - ');
        var path = 'source/qsearch';
        var items = window.localStorage.getItem(path);
        if (items) {
            items = JSON.parse(items);
            // вывести на страницу
            _show_qsearch_list(items);
        } else {
            views_datasource_get_view_result(path, {
                success: function (content) {
                    var items = [];
                    var cats = content.preparations;

                    // заполнить список
                    for (var index_c in cats) {
                        if (!cats.hasOwnProperty(index_c)) {
                            continue;
                        }
                        var cat = cats[index_c];
                        var item = {
                            label: '<span style="color: #' + cat.color + '">' + cat.name + '</span>',
                            attributes: {
                                'data-role': "list-divider",
                                'class': "ui-li-divider ui-bar-inherit"
                            }
                        };
                        items.push(item);
                        for (var index_p in cat.items) {
                            var prep = cat.items[index_p];
                            var item = {
                                label: '<div  class="title" style="color: #' + cat.color + '">' + prep.title + '</div><div class="subtitle">' + prep.ingredients + '</div>',
                                value: prep.nid
                            };
                            items.push(item);
                        }
                    }

                    // сохраняем результат локально, чтобы потом не дёргать с сервера
                    // todo каким-то образом обновлять периодически
                    if (items) window.localStorage.setItem(path, JSON.stringify(items));

                    // вывести на страницу
                    _show_qsearch_list(items);
                }
            });
        }
    }
    catch (error) { console.log('qsearch_page_pageshow - ' + error); }
}


function _show_qsearch_list(items)
{
    var content = {
        'qsearch_autocomplete': {
            theme: 'autocomplete',
            items: items,
            attributes: {
                id: 'qsearch_autocomplete_input',
                'data-inset': false,
                'data-filter-reveal': false,
                'data-filter-placeholder': 'Начните набирать...'
            },
            'item_onclick': 'qsearch_autocomplete_item_onclick'
        }
    };

    $("#qsearch-wrapper").html(drupalgap_render(content));
    $('#qsearch_autocomplete_input-list').listview().filterable();

    // $(".ui-input-search input").focus();
}

function qsearch_autocomplete_item_onclick(id, item)
{
    var nid = $('#' + id).val();
    if (nid) {
        // вставить только название препарата
        $(".ui-input-search input").val($(item).find(".title").html());
        // переход по клику на препарат
        drupalgap_goto('node/' + nid);
    }
}