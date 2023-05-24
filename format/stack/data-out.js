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
        xml += `  <version>4</version>\n`;
        xml += `  <id>${metaviz.editor.id}</id>\n`;
        xml += `  <name>${metaviz.editor.name}</name>\n`;
        xml += `  <history>\n`;
        history.forEach((packet, index) => {

            // Packet copy
            let p = { ...packet };

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
                        p.nodes.forEach(node => {
                            xml += `      <add timestamp="${p.timestamp}" node="${node.id}" type="${node.type}" x="${node.x}" y="${node.y}" w="${node.w}" h="${node.h}"${this.dataStrip(p.data)}/>\n`;
                        });
                    if (('links' in p) && p.links.length)
                        p.links.forEach(link => {
                            xml += `      <add timestamp='${p.timestamp}' link='${link.id}' start='${link.start}' end='${link.end}'/>\n`;
                        });
                    break;

                case 'del':
                    if (('nodes' in p) && p.nodes.length)
                        xml += `      <del timestamp='${p.timestamp}' nodes='${p.nodes.join(",")}'/>\n`;
                    if (('links' in p) && p.links.length)
                        xml += `      <del timestamp='${p.timestamp}' links='${p.links.join(",")}'/>\n`;
                    break;

                case 'move':
                    if ('offset' in p)
                        xml += `      <move timestamp='${p.timestamp}' nodes='${p.nodes.join(",")}' offset-x='${p.offset.x}' offset-y='${p.offset.y}'/>\n`;
                    if ('position' in p)
                        xml += `      <move timestamp='${p.timestamp}' nodes='${p.nodes.join(",")}' position-x='${p.position.x}' position-y='${p.position.y}'/>\n`;
                    break;

                case 'resize':
                    xml += `      <resize timestamp='${p.timestamp}' nodes='${p.nodes.join(",")}' w='${p.size.w}' h='${p.size.h}'/>\n`;
                    break;

                case 'param':
                    xml += `      <param timestamp='${p.timestamp}' node='${p.node.id}'${this.dataStrip(p.data)}/>\n`;
                    break;

            }

        });
        xml += `    </session>\n`;
        xml += `  </history>\n`;
        xml += `</mv>\n`;
        return xml;
    }

    dataStrip(data) {
        let str = '';
        if (data) for (const [key, value] of Object.entries(data)) {
            str += ` data-${key}="${value.escape()}"`;
        }
        return str;
    }

}