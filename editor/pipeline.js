/***************************************************************************************************
 *                                                                                                 *
 *      ---||----     -O-     Metaviz Pipeline                                                     *
 *     / --||--  |    | |     Exchange data between nodes.                                         *
 *     | |     |  ----   --|  MIT License                                                          *
 *  |--/ /     \-----------|  (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.               *
 *  |----                                                                                          *
 **************************************************************************************************/

/*

Pipeline stream:

{
    text: <string>,  // String cummulative layer: adds text with spaces
    calc: <number>,  // Calculation layer: add numbers
    func: <string>   // Function to eval
}

*/

class MetavizStream {

    constructor() {
        // Parsed variables
        this.variables = {};

        // String stream
        this.text = '';

        // Math stream
        this.calc = 0;

        // API stream
        this.sender = null;
        this.func = '';
        this.params = [];

        // Output format (e.g. for file extension)
        this.format = null;

        // Mimetype
        this.mime = null;
    }

    /**
     * Add data to stream
     */

    add(data) {
        if ('variables' in data) this.variables = Object.assign({}, this.variables, data.variables);
        if ('text' in data) {
            this.text += this.parse(data.text);
            this.mime = 'text/plain';
            this.format = 'txt';
        }
        if ('calc' in data) {
            this.calc += data.calc;
            this.mime = 'application/calc';
            this.format = 'txt';
        }
        if ('func' in data) {
            this.sender = data.sender;
            this.func = data.func;
            this.params = data.params;
            this.mime = 'api';
            this.format = 'txt';
        }
    }

    /**
     * Set data in stream
     */

    set(data) {
        if ('variables' in data) this.variables = data.variables;
        if ('text' in data) {
            this.text = this.parse(data.text);
            this.mime = 'text/plain';
            this.format = 'txt';
        }
        if ('calc' in data) {
            this.calc = data.calc;
            this.mime = 'application/calc';
            this.format = 'txt';
        }
    }

    /**
     * Parse for variable declarations
     */

    parseVariableDeclarations(text) {
        const regex = /(\$\w+)\s?=\s?'(.+)'/gm;
        const parsed = regex.exec(text);
        if (parsed) {
            this.variables[parsed[1]] = parsed[2];
            text = text.replace(parsed[0], '');
        }
        return text;
    }

    /**
     * Parse variables
     */

    parseVariables(text) {
        for (const [variable, value] of Object.entries(this.variables)) {
            text = text.replaceAll('\\' + variable, value);
        }
        return text;
    }

    /**
     * Parse
     */

    parse(text) {
        // $variable=value
        text = this.parseVariableDeclarations(text);
        // $variable
        text = this.parseVariables(text);
        // Detect whitespace only
        if (!(/\S/.test(text))) return '';
        // Return text
        return text;
    }

}
