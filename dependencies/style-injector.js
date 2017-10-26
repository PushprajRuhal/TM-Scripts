    //style injector
    var getStyleInjector = function(markImportant) {
        var stylesheet = null;
        var important = /((?:^|;)[\w-:\s\(\),\.%]+?(?!important))(?=;|$)/gi;
        var shouldMarkImportant = markImportant | false;
        return {
            insertRule:function(selector, rules, markImportant)
            {
                if(!this.stylesheet){
                    var context = document,stylesheet;
                    context.getElementsByTagName('head')[0].appendChild(context.createElement('style'));
                    this.stylesheet=context.styleSheets[context.styleSheets.length-1];
                }
                if(markImportant | shouldMarkImportant){
                    rules = rules.replace(important,"$1 !important");
                }
                for(var i=0;i<selector.length;++i){
                    this.stylesheet.addRule(selector[i], rules);
                }
            }
        };
    };
