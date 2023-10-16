'use strict';
let utils = require("../utils");
let  myParser =require("../feedParser");

class feedItems {
    constructor(elementSource,url,category) {
        this.url = url;
        this.elementSource = elementSource;
        this.frontendImage = "/logos/"+this.elementSource+".svg";
        this.elements = [];
        this.category = category;
    }

    async getItems() {

            this.elements = await myParser.parseMedia(this.url)
            return utils.feedNormalizerMedia(this.elements, this.elementSource,this.frontendImage,this.category)
    }
}

module.exports = feedItems;