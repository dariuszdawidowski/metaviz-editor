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

        // Mimetype
        const mimetype = xml.querySelector('mv > mimetype').textContent;
        if (mimetype != 'text/mvstack+xml') {
            alert('Unsupported file type!');
            return;
        }

        // Version check 6..4
        const version = parseInt(xml.querySelector('mv > version').textContent);
        if (version > 6 || version < 4) {
            alert('Unsupported file version!');
            return;
        }

        const packets = [];

        const getPacket = (nodeID) => {
            for (let p = 0; p < packets.length; p++) {
                if (packets[p].action == 'add' && 'nodes' in packets[p]) {
                    for (let n = 0; n < packets[p].nodes.length; n++) {
                        if (packets[p].nodes[n].id == nodeID) {
                            return packets[p].nodes[n];
                        }
                    }
                }
            }
            return null;
        };

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
                        element.getAttribute('nodes').split(',').forEach((nodeID) => {
                            const node = getPacket(nodeID);
                            if (node) {
                                node.w = parseInt(element.getAttribute('w'));
                                node.h = parseInt(element.getAttribute('h'));
                            }
                        });
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
