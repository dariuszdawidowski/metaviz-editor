/**
 * MetavizStack Decoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizInStack {

    /**
     * Recreate history stack to nodes & links
     */

    deserialize(xml, args = {}) {

        metaviz.editor.setBoardID(xml.querySelector('mv > id').textContent);
        metaviz.editor.setBoardName(xml.querySelector('mv > name').textContent);

        // Version check v6..v4
        const version = parseInt(xml.querySelector('mv > version').textContent);
        if (version > 6 || version < 4) {
            alert('Unsupported file version!');
            return;
        }

        // Mimetype v5+
        if (version >= 5) {
            const mimetype = xml.querySelector('mv > mimetype')?.textContent;
            if (mimetype && mimetype != 'text/mvstack+xml') {
                alert('Unsupported file type!');
                return;
            }
        }

        const packets = [];

        const history = xml.querySelector('mv > history');

        for (let i = 0; i < history.children.length; i++) {
            const session = history.children[i];

            for (let j = 0; j < session.children.length; j++) {
                const element = session.children[j];
                switch (element.tagName) {

                    case 'add':
                        let packetAdd = {
                            action: 'add',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id
                        };
                        let dataAdd = {};
                        for (const attr of Array.from(element.getAttributeNames()).filter(name => name.startsWith('param-'))) {
                            dataAdd[attr.slice(6)] = element.getAttribute(attr);
                        }
                        // < v5 compatibility
                        for (const attr of Array.from(element.getAttributeNames()).filter(name => name.startsWith('data-'))) {
                            dataAdd[attr.slice(5)] = element.getAttribute(attr);
                        }
                        if (element.getAttribute('node')) {
                            packetAdd['nodes'] = [{
                                id: element.getAttribute('node'),
                                type: element.getAttribute('type'),
                                x: parseInt(element.getAttribute('x')),
                                y: parseInt(element.getAttribute('y')),
                                w: parseInt(element.getAttribute('w')),
                                h: parseInt(element.getAttribute('h')),
                                params: dataAdd
                            }];
                        }
                        if (element.getAttribute('link')) {
                            packetAdd['links'] = [{
                                id: element.getAttribute('link'),
                                type: element.getAttribute('type'),
                                start: element.getAttribute('start'),
                                end: element.getAttribute('end')
                            }];
                        }
                        packets.push(packetAdd);
                        break;

                    case 'del':
                        let packetDel = {
                            action: 'del',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id
                        };
                        if (element.getAttribute('nodes')) packetDel['nodes'] = element.getAttribute('nodes').split(',');
                        if (element.getAttribute('links')) packetDel['links'] = element.getAttribute('links').split(',');
                        packets.push(packetDel);
                        break;

                    case 'move':
                        let packetMove = {
                            action: 'move',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id,
                            nodes: element.getAttribute('nodes').split(',')
                        };
                        if (element.getAttribute('offset-x')) packetMove['offset'] = {
                            x: parseInt(element.getAttribute('offset-x')),
                            y: parseInt(element.getAttribute('offset-y'))
                        };
                        if (element.getAttribute('position-x')) packetMove['position'] = {
                            x: parseInt(element.getAttribute('position-x')),
                            y: parseInt(element.getAttribute('position-y'))
                        };
                        packets.push(packetMove);
                        break;

                    case 'resize':
                        const packetResize = {
                            action: 'resize',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id,
                            nodes: element.getAttribute('nodes').split(','),
                            size: {
                                w: parseInt(element.getAttribute('w')),
                                h: parseInt(element.getAttribute('h'))
                            }
                        };
                        packets.push(packetResize);
                        break;

                    case 'param':
                        let params = {};
                        for (const attr of Array.from(element.getAttributeNames()).filter(name => name.startsWith('param-'))) {
                            params[attr.slice(6)] = element.getAttribute(attr);
                        }
                        // < v5 compatibility
                        for (const attr of Array.from(element.getAttributeNames()).filter(name => name.startsWith('data-'))) {
                            params[attr.slice(5)] = element.getAttribute(attr);
                        }
                        packets.push({
                            action: 'param',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id,
                            node: {id: element.getAttribute('node')},
                            params: params
                        });
                        break;

                }
            } // for j
        } // for i

        // Sort packets by timestamp
        packets.sort((a, b) => a.timestamp - b.timestamp);

        // Recreate history
        metaviz.editor.history.set(packets);
        metaviz.editor.history.recreate();
    }

}
