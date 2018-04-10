/**************|
 * Development |
 **************/

// Uncomment to clear the app's local storage cache each time the app loads.
// window.localStorage.clear();

// Set to true to see console.log() messages. Set to false when publishing app.
Drupal.settings.debug = false;

/****************************************|
 * Drupal Settings (provided by jDrupal) |
 ****************************************/

/* DRUPAL PATHS */

// Site Path (do not use a trailing slash)
// Drupal.settings.site_path = 'http://kccc.local'; // e.g. http://www.example.com
Drupal.settings.site_path = 'https://kccc.ru'; // e.g. http://www.example.com

// Default Services Endpoint Path
Drupal.settings.endpoint = 'drupalgap';

// Files Directory Paths (use one or the other)
Drupal.settings.file_public_path = 'sites/default/files';
//Drupal.settings.file_private_path = 'system/files';

// The Default Language Code
Drupal.settings.language_default = 'ru';

/* CACHING AND PERFORMANCE */

// Entity Caching
Drupal.settings.cache.entity = {

    /* Globals (will be used if not overwritten below) */
    enabled: true,
    expiration: 60, // # of seconds to cache, set to 0 to cache forever

    /* Entity types */
    entity_types: {

        /* Comments */
        /*comment: {
         bundles: {}
         },*/

        /* Files */
        /*file: {
         bundles: {}
         },*/

        /* Nodes */
        node: {

            /* Node Globals (will be used if not overwritten below) */
            enabled: true,
            expiration: 120,

            /* Content types (aka bundles) */
            bundles: {

                articles: {
                    expiration: 3600
                },
                page: {
                    enabled: true
                }

            }
        },

        /* Terms */
        /*taxonomy_term: {
         bundles: {}
         },*/

        /* Vocabularies */
        /*taxonomy_vocabulary: {
         bundles: {}
         },*/

        /* Users */
        /*user: {
         bundles: {}
         }*/

    }

};

/* Views Caching */

Drupal.settings.cache.views = {
    enabled: true,
    expiration: 3600
};

/*********************|
 * DrupalGap Settings |
 *********************/

// DrupalGap Mode (defaults to 'web-app')
//  'web-app' - use this mode to build a web application for a browser window
//  'phonegap' - use this mode to build a mobile application with phonegap
// drupalgap.settings.mode = 'web-app';
drupalgap.settings.mode = 'phonegap';

// Language Files - locale/[language-code].json
drupalgap.settings.locale = {
    /* es: { } */
    ru: {}
};

/*************|
 * Appearance |
 *************/

// App Title
drupalgap.settings.title = 'Агрохимия';

// App Front Page
drupalgap.settings.front = 'catalog';

// Theme
drupalgap.settings.theme = 'opie';

// Logo
drupalgap.settings.logo = '/app/themes/opie/images/logo.jpg';

// Offline Warning Message. Set to false to hide message.
drupalgap.settings.offline_message = 'No connection found!';

// Exit app message.
drupalgap.settings.exit_message = 'Закрыть приложение?';

// Loader Animations - http://demos.jquerymobile.com/1.4.0/loader/
drupalgap.settings.loader = {
    loading: {
        textVisible: false
    },
    saving: {
        textVisible: false
    },
    deleting: {
        textVisible: false
    }
};

/*****************************************|
 * Modules - http://drupalgap.org/node/74 |
 *****************************************/

/** Contributed Modules - www/app/modules **/

Drupal.modules.contrib['commerce'] = {};
//Drupal.modules.contrib['force_authentication'] = {};
Drupal.modules.contrib['logintoboggan'] = {};

/** Custom Modules - www/app/modules/custom **/

Drupal.modules.custom['agroshop'] = {};

/***************************************|
 * Menus - http://drupalgap.org/node/85 |
 ***************************************/
drupalgap.settings.menus = {}; // Do not remove this line.

// User Menu Anonymous

// Main Menu

/****************************************|
 * Blocks - http://drupalgap.org/node/83 |
 ****************************************/
drupalgap.settings.blocks = {}; // Do not remove this line.

// Easy Street 3 Theme Blocks
drupalgap.settings.blocks.opie = {
    header:{
        _prefix: {
            menu_panel_block: { }
        },
        title:{},
        menu_panel_block_button: {
        }
    },
    content:{
        messages: {},
        main:{}
    }
};

/****************************************************|
 * Region Menu Links - http://drupalgap.org/node/173 |
 ****************************************************/
drupalgap.settings.menus.regions = {}; // Do not remove this line.

// Header Region Links
drupalgap.settings.menus.regions['header'] = {
    links:[
        /* Корзина */
        {
            path: 'cart',
            options: {
                attributes: {
                    'class': 'ui-btn-right ui-link ui-btn ui-icon-shop ui-btn-icon-notext ui-shadow ui-corner-all',
                    'data-icon': 'shop'
                },
                reloadPage: true
            },
            pages: {
                value: ['cart'],
                mode: 'exclude'
            }
        }

    ]
};


/*********|
 * Camera |
 **********/
drupalgap.settings.camera = {
    quality: 50
};

/***********************|
 * Performance Settings |
 ***********************/
drupalgap.settings.cache = {}; // Do not remove this line.

// Theme Registry - Set to true to load the page.tpl.html contents from cache.
drupalgap.settings.cache.theme_registry = true;