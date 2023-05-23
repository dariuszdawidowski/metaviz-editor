/**
 * MetavizStack Encoder
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

class MetavizOutStack {

    /**
     * Convert objects to data
     */

    serialize(history) {
        let lastSession = null;
        let numSession = 0;
        let xml = `<mv>\n`;
        xml += `  <format>MetavizStack</format>\n`;
        xml += `  <version>3</version>\n`;
        xml += `  <id>${metaviz.editor.id}</id>\n`;
        xml += `  <name>${metaviz.editor.name}</name>\n`;
        xml += `  <history>\n`;
        history.forEach((packet, index) => {

            // Packet (clean unwanted data)
            let p = { ...packet };
            if ('prev' in p) delete p['prev'];
            if ('positionPrev' in p) delete p['positionPrev'];
            if ('sizePrev' in p) delete p['sizePrev'];
            if ('parentPrev' in p) delete p['parentPrev'];
            if ('namePrev' in p) delete p['namePrev'];
            if ('nodes' in p) {
                for (const node of p.nodes) {
                    delete node['locked'];
                    delete node['zindex'];
                }
            }

            // Session ID for pseudo-user
            if (!('session' in p)) p['session'] = metaviz.user.id;
            if (p.session != lastSession) {
                if (lastSession != null) xml += `    </session>\n`;
                xml += `    <session id="${p.session}">\n`;
                lastSession = p.session;
                numSession ++;
            }

            // Convert action packets
            switch (p.action) {

                case 'add':
                    if (('nodes' in p) && p.nodes.length)
                        xml += `      <add timestamp='${p.timestamp}' nodes='${JSON.stringify(p.nodes)}'/>\n`;
                    if (('links' in p) && p.links.length)
                        xml += `      <add timestamp='${p.timestamp}' links='${JSON.stringify(p.links)}'/>\n`;
                    break;

                case 'del':
                    if (('nodes' in p) && p.nodes.length)
                        xml += `      <del timestamp='${p.timestamp}' nodes='${JSON.stringify(p.nodes)}'/>\n`;
                    if (('links' in p) && p.links.length)
                        xml += `      <del timestamp='${p.timestamp}' links='${JSON.stringify(p.links)}'/>\n`;
                    break;

                case 'move':
                    if ('offset' in p)
                        xml += `      <move timestamp='${p.timestamp}' nodes='${p.nodes.join(",")}' offsetX='${p.offset.x}' offsetY='${p.offset.y}'/>\n`;
                    if ('position' in p)
                        xml += `      <move timestamp='${p.timestamp}' nodes='${p.nodes.join(",")}' positionX='${p.position.x}' positionY='${p.position.y}'/>\n`;
                    break;

                case 'resize':
                    xml += `      <resize timestamp='${p.timestamp}' nodes='${p.nodes.join(",")}' w='${p.size.w}' h='${p.size.h}'/>\n`;
                    break;

                case 'param':
                    let data = {};
                    for (const [key, value] of Object.entries(p.data)) {
                        data[key] = value.escape();
                    }
                    xml += `      <param timestamp='${p.timestamp}' node='${p.node.id}' data='${JSON.stringify(data)}'/>\n`;
                    break;

            }

        });
        xml += `    </session>\n`;
        xml += `  </history>\n`;
        xml += `</mv>\n`;
        return xml;
    }

}