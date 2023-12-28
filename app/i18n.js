/**
 * Internationalization
 * (c) 2023 Dariusz Dawidowski, All Rights Reserved.
 */

const i18n = {

    // Detect language
    language: window.navigator.language.substring(0, 2),

    // Polski
    pl: {
        'add node': 'dodaj obiekt',
        'edit selection': 'edytuj wybrane',
        'node options': 'opcje obiektu',
        'no options': 'brak opcji',
        'node local options': 'lokalne opcje obiektu',
        'node functions': 'funkcje obiektu',
        'lock movement': 'zablokuj ruch',
        'lock content': 'zablokuj treść',
        'lock delete': 'zablokuj kasowanie',
        'link': 'połącz',
        'unlink': 'odłącz',
        'sort': 'sortuj',
        'align horizontal': 'wyrównaj w poziomie',
        'align vertical': 'wyrównaj w pionie',
        'move to foreground': 'odsuń w tło',
        'move to background': 'wysuń na przód',
        'reset translations': 'resetuj pozycję',
        'navigation': 'nawigacja',
        'file': 'plik',
        'file operations': 'operacje na pliku',
        'new': 'nowy',
        'open': 'otwórz',
        'save': 'zapisz',
        'export to svg': 'eksportuj do SVG',
        'centre': 'wycentruj',
        'undo': 'cofnij',
        'redo': 'ponów',
        'cut': 'wytnij',
        'copy': 'kopiuj',
        'paste': 'wklej',
        'duplicate': 'duplikuj',
        'select all': 'wybierz wszystko',
        'select all nodes': 'wybierz wszystko',
        'select all text': 'wybierz cały tekst',
        'delete': 'kasuj',
        'settings': 'ustawienia',
        'project settings': 'ustawienia projektu',
        'board name': 'nazwa tablicy',
        'local settings': 'ustawienia lokalne',
        'primal pointer device': 'główne urządzenie sterujące',
        'primary device: touchpad': 'urządzenie sterujące: gładzik',
        'primary device: mouse': 'urządzenie sterujące: mysz',
        'click on board': 'klik na tablicy',
        'click on board: pan view': 'klik na tablicy: przesuń widok',
        'click on board: selection': 'klik na tablicy: selekcja',
        'helpers': 'wspomaganie',
        'auto-align': 'auto-wyrównanie',
        'theme': 'motyw',
        'look & feel': 'Wygląd',
        'select color theme': 'Wybierz wariant kolorystyczny',
        'iron': 'żelazny',
        'covellite': 'kowelinowy',
        'help': 'pomoc',
        'github page': 'strona GitHub',
        'submit issue': 'zgłoś problem',
        'default nodes': 'domyślne obiekty',
        'style': 'styl',
        'font': 'czcionka',
    },

    // Esperanto
    eo: {
        'add node': 'aldonu nodon',
        'edit selection': 'redakti elekton',
        'node options': 'nodaj opcioj',
        'no options': 'neniuj elektoj',
        'node local options': 'nodaj lokaj opcioj',
        'node functions': 'nodaj funkcioj',
        'lock movement': 'seruro movado',
        'lock content': 'ŝlosi enhavon',
        'lock delete': 'ŝlosi forigi',
        'link': 'ligu',
        'unlink': 'malligi',
        'sort': 'ordigi',
        'align horizontal': 'vicigi horizontale',
        'align vertical': 'vicigi vertikalan',
        'move to foreground': 'movi al malfono',
        'move to background': 'movi al fono',
        'reset translations': 'restarigi tradukojn',
        'navigation': 'navigado',
        'file': 'dosiero',
        'file operations': 'dosiero operacioj',
        'new': 'nova',
        'open': 'malfermi',
        'save': 'konservi',
        'export to svg': 'eksporti al SVG',
        'centre': 'centro',
        'undo': 'malfari',
        'redo': 'refari',
        'cut': 'tranĉi',
        'copy': 'kopio',
        'paste': 'pasti',
        'duplicate': 'duobligi',
        'select all': 'elekti ĉiujn',
        'select all nodes': 'elektu ĉiujn nodojn',
        'select all text': 'elektu tutan tekston',
        'delete': 'forigi',
        'settings': 'agordojn',
        'project settings': 'projektaj agordoj',
        'board name': 'nomo de la estraro',
        'local settings': 'lokaj agordoj',
        'primal pointer device': 'pramontrila aparato',
        'primary device: touchpad': 'ĉefa aparato: tuŝpadrono',
        'primary device: mouse': 'ĉefa aparato: muso',
        'click on board': 'klaku sur la tabulo',
        'click on board: pan view': 'klaku sur la tabulo: pano vido',
        'click on board: selection': 'klaku sur la tabulo: elekto',
        'helpers': 'helpantoj',
        'auto-align': 'aŭtomate vicigi',
        'theme': 'temo',
        'look & feel': 'rigardu',
        'select color theme': 'elektu kolortemon',
        'iron': 'fero',
        'covellite': 'covellite',
        'help': 'helpo',
        'github page': 'GitHub-paĝo',
        'submit issue': 'raporti problemon',
        'default nodes': 'default nodes',
        'style': 'stilo',
        'font': 'tiparo',
    },

};

/**
 * Get text
 */

function _(src) {

    // Check capital letters to determine style formatting
    const capital = {
        first: (src.length > 0 && src[0] === src[0].toUpperCase()) ? true : false,
        second: (src.length > 1 && src[1] === src[1].toUpperCase()) ? true : false,
    };
    const uppercase = (capital.first && capital.second) ? true : false;
    const capitalize = (capital.first && !capital.second) ? true : false;

    // Get text
    const dst = (src.toLowerCase() in i18n[i18n.language]) ? i18n[i18n.language][src.toLowerCase()] : src

    // Return transalted
    if (uppercase) return dst.toUpperCase();
    if (capitalize) return dst.capitalize();
    return dst;
}