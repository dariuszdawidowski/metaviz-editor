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
        if (version != 3) {
            alert('Unknown file version!');
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
                        if (element.getAttribute('nodes')) packetAdd['nodes'] = JSON.parse(element.getAttribute('nodes'));
                        if (element.getAttribute('links')) packetAdd['links'] = JSON.parse(element.getAttribute('links'));
                        packets.push(packetAdd);
                        break;

                    case 'del':
                        let packetDel = {
                            action: 'del',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id
                        };
                        if (element.getAttribute('nodes')) packetDel['nodes'] = JSON.parse(element.getAttribute('nodes'));
                        if (element.getAttribute('links')) packetDel['links'] = JSON.parse(element.getAttribute('links'));
                        packets.push(packetDel);
                        break;

                    case 'move':
                        let packetMove = {
                            action: 'move',
                            timestamp: element.getAttribute('timestamp'),
                            session: session.id,
                            nodes: element.getAttribute('nodes').split(',')
                        };
                        if (element.getAttribute('offsetX')) packetMove['offset'] = {
                            x: parseInt(element.getAttribute('offsetX')),
                            y: parseInt(element.getAttribute('offsetY'))
                        };
                        if (element.getAttribute('positionX')) packetMove['position'] = {
                            x: parseInt(element.getAttribute('positionX')),
                            y: parseInt(element.getAttribute('positionY'))
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
                        for (const [key, value] of Object.entries(JSON.parse(element.getAttribute('data')))) {
                            data[key] = value.unescape();
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
        metaviz.editor.history.set(packets.sort((a, b) => a.timestamp - b.timestamp));
        metaviz.editor.history.recreate();
    }

}
