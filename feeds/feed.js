'use strict';
let utils = require("../utils");
let  myParser =require("../feedParser");
let mongoWrapper = require("../db/mongoWrapper")

class feedItems {
    constructor(elementSource,url,category,isActive,maxElementsCache) {
        this.url = url;
        this.elementSource = elementSource;
        this.frontendImage = "/logos/"+this.elementSource+".svg";
        this.elements = [];
        this.category = category;
        this.isActive = isActive;
        this.maxElementsCache = maxElementsCache
    }


    async parseItems(){
        this.elements = await myParser.parseMedia(this.url)
        let feedsNormalized = utils.feedNormalizerMedia(this.elements, this.elementSource,this.frontendImage,this.category)
        this.storeNews(feedsNormalized)

    }

    async getItems(filter) {
        if (!filter){
            filter = {source : this.elementSource}
        }else{
            filter.source = this.elementSource
        }
        return {
            source: this.elementSource,
            category: this.category,
            allFeeds: await this.getNews(filter),
            frontEndImage: this.frontendImage,
            hasNewElements: false,
            maxElementsCache:this.maxElementsCache
        }
    }

     storeNews(newsArray){
            mongoWrapper.storeNewsByArray(newsArray)
    }

    async getNews(filter){
        return await mongoWrapper.getNewsByFilter(filter)
    }
}

module.exports = feedItems;