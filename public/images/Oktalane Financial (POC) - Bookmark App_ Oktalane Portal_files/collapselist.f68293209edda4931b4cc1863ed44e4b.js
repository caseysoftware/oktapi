saasure.Widget.CollapseList = function(){
    var self = this;
    var rootElement;

    var template ="<h4><a href='#' class='x-collapse-list'>{{tmpl title}}</a></h4><div class='wrap rounded-4'><ul class='bullets'>{{each list}}<li><span>${disp}</span></li>{{/each}}</ul></div>";

    var compiledTemplate = $.template(template);


    //data -> [{title:"",list:[{disp:""}]},...]
    function create(elm, data){
        rootElement = $(elm);
        rootElement.html("");
        var result=$.tmpl(compiledTemplate,data);

        result.find(".x-collapse-list").click(function(e){
            var elm=$(e.target).closest("a");
            elm.parent().next().toggle();
        });

        result.appendTo(rootElement);


    }


    /*
     * Public functions
     */
    this.create = create;
}
