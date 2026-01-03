import { XMLParser } from "fast-xml-parser";
import { XMLBuilder } from "fast-xml-parser";


export class XmlParser {


    private parser: XMLParser;
    private builder: XMLBuilder;

    constructor() {

        this.parser = new XMLParser();
    
        const builderOptions = {
            oneListGroup: true,
            format: false,
            ignoreAttributes: false,
            suppressEmptyNode: true,
            attributeNamePrefix: "@_"
        };

        this.builder = new XMLBuilder(builderOptions);

    }

    parseXmlToJson(xmlString: string): any {
        return this.parser.parse(xmlString);
    }

    parseJsonToXml(jsonObj: any): any {
        return this.builder.build(jsonObj);
    }
}
