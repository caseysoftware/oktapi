//datatable the way brian wanted...
saasure.Widget.Datatable = function(){
    var self = this;
    var dtable;

    function create(container, dtableOpt, searchContainer){
        dtableOpt.sDom='<"H"lr>t<"F"ip>';

        dtable=$(container).dataTable(dtableOpt);

        searchContainer[0].innerHTML="<span class='input-fix rounded-15'><label class='inline-label-rounded inline-label'>Search</label><input type='text' class='text-field-default rounded-15' /></span>";

        var searchBox=$(searchContainer[0].childNodes[0].childNodes[1]);
        saasure.inlineLabel(searchBox);
        searchBox.keyup(function(){
            dtable.fnFilter(searchBox.val());
        });

        return dtable;
    }

    /*
     * Public functions
     */
    this.create=create;

};