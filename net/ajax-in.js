/**
 * Metaviz Ajax Loader
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 * (c) 2020-2024 Metaviz Sp. z o.o., All Rights Reserved.
 */

class MetavizInAjax {

    /**
     * Receive data packet
     */

    recv(args = {}) {

        const { params = {'fetch': 'MetavizJSON'}, server = metaviz.url.data, cors = false } = args;

        // Not allowed in local mode
        if (!metaviz.agent.server && !cors) {
            logging.error('Ajax GET not allowed in file mode');
            return null;
        }
        
        // Promise
        const promise = new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', server + '?' + dictToUri(params), true);

            // Received data
            request.onload = (event) => {
                // Unauthorized: reload page
                if (request.status == 401) window.location.reload();
                // OK
                resolve(request.responseText);
            };

            // Error
            request.onerror = (event) => {
                // Unauthorized: reload page
                if (request.status == 401) window.location.reload();
                // OK
                resolve('error');
            };

            // CORS
            if (cors) {
                request.setRequestHeader('Access-Control-Allow-Origin', window.location.origin);
                request.setRequestHeader('Access-Control-Allow-Method', 'GET');
            }

            // Actual send
            request.send();
        });
        return promise;
    }

}
