    //style injector
    var getStyleInjector = function() {
        var stylesheet = null;
        return {
            insertRule:function(selector,rules)
            {
                if(!this.stylesheet){
                    var context = document,stylesheet;
                    context.getElementsByTagName('head')[0].appendChild(context.createElement('style'));
                    this.stylesheet=context.styleSheets[context.styleSheets.length-1];
                }
                for(var i=0;i<selector.length;++i){
                    this.stylesheet.addRule(selector[i], rules);
                }
            }
        };
    };
