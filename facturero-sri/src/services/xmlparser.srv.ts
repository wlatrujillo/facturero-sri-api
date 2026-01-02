import { XMLParser } from "fast-xml-parser";
import { XMLBuilder } from "fast-xml-parser";


class XmlParserService {


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
        console.log("Parsing XML string:", xmlString);
        return this.parser.parse(xmlString);
    }

    parseJsonToXml(jsonObj: any): any {
        console.log("Parsing json:", jsonObj);
        return this.builder.build(jsonObj);
    }
}

export default XmlParserService;
