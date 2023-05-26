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

        const version = parseInt(xml.querySelector('mv > version').textContent);
        if (version != 4) {
            alert('Unsupported file version!');
            return;
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
                        if (element.getAttribute('node')) packetAdd['nodes'] = [{
                            id: element.getAttribute('node'),
                            type: element.getAttribute('type'),
                            x: parseInt(element.getAttribute('x')),
                            y: parseInt(element.getAttribute('y')),
                            w: parseInt(element.getAttribute('w')),
                            h: parseInt(element.getAttribute('h'))
                        }];
                        if (element.getAttribute('link')) packetAdd['links'] = [{
                            id: element.getAttribute('link'),
                            type: element.getAttribute('type'),
                            start: element.getAttribute('start'),
                            end: element.getAttribute('end')
                        }];
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
                        packets.push({
                            action: 'resize',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id,
                            nodes: element.getAttribute('nodes').split(','),
                            size: {
                                w: parseInt(element.getAttribute('w')),
                                h: parseInt(element.getAttribute('h'))
                            }
                        });
                        break;

                    case 'param':
                        let data = {};
                        for (const attr of Array.from(element.getAttributeNames()).filter(name => name.startsWith('data-'))) {
                            data[attr.slice(5)] = element.getAttribute(attr);
                        }
                        packets.push({
                            action: 'param',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id,
                            node: {id: element.getAttribute('node')},
                            data: data
                        });
                        break;

                }
            } // for j
        } // for i

        // Sort packets by timestamp
        packets.sort((a, b) => a.timestamp - b.timestamp);
        metaviz.editor.history.set(packets);
        metaviz.editor.history.recreate();
    }

}
