/**
 * MetavizStack Decoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizInStack {

    /**
     * Recreate history stack to nodes & links
     */

    deserialize(xml, args = {}) {

        metaviz.editor.id = xml.querySelector('mv > id').textContent;

        const packets = [];

        const history = xml.querySelector('mv > history');
        for (let i = 0; i < history.children.length; i++) {
            const element = history.children[i];
            switch (element.tagName) {
                case 'add':
                    let packetAdd = {
                        action: 'add',
                        timestamp: element.getAttribute('timestamp')
                    }
                    if (element.getAttribute('nodes')) packetAdd['nodes'] = JSON.parse(element.getAttribute('nodes'));
                    if (element.getAttribute('links')) packetAdd['links'] = JSON.parse(element.getAttribute('links'));
                    packets.push(packetAdd);
                    break;
                case 'del':
                    let packetDel = {
                        action: 'del',
                        timestamp: element.getAttribute('timestamp')
                    }
                    if (element.getAttribute('nodes')) packetDel['nodes'] = JSON.parse(element.getAttribute('nodes'));
                    if (element.getAttribute('links')) packetDel['links'] = JSON.parse(element.getAttribute('links'));
                    packets.push(packetDel);
                    break;
                case 'move':
                    let packetMove = {
                        action: 'move',
                        timestamp: element.getAttribute('timestamp'),
                        nodes: element.getAttribute('nodes').split(',')
                    }
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
                        action: 'move',
                        timestamp: element.getAttribute('timestamp'),
                        nodes: JSON.parse(element.getAttribute('nodes')),
                        size: {
                            w: parseInt(element.getAttribute('w')),
                            h: parseInt(element.getAttribute('h'))
                        }
                    });
                    break;
                case 'param':
                    packets.push({
                        action: 'param',
                        timestamp: element.getAttribute('timestamp'),
                        node: {id: element.getAttribute('node')},
                        data: JSON.parse(element.getAttribute('data'))
                    });
                    break;
            }
        }
        metaviz.editor.history.set(packets.sort((a, b) => a.timestamp - b.timestamp));
        metaviz.editor.history.recreate();
    }

}
