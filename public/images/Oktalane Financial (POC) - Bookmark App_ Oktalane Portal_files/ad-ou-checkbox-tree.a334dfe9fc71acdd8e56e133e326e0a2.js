var CheckBoxTreeController=function(){

    function checkBoxTreeOnClickHandler(ouTreeNode) {
        if (ouTreeNode.attr('value') && ouTreeNode.prop('checked')) {
            ouTreeNode.parents("ul#orgunittree").find("input.useroutreenode:checked").prop('checked', false);
            ouTreeNode.parents("ul#orgunittree").find("input.groupoutreenode:checked").prop('checked', false);
            ouTreeNode.parents("ul#orgunittree").find("input.tree-element-chosen").removeClass('tree-element-chosen');
            ouTreeNode.addClass('tree-element-chosen');
            ouTreeNode.prop('checked', true);
            ouTreeNode.parents("form").find(".text-targetOU").attr("value", ouTreeNode.attr('value'));
        } else {
            ouTreeNode.removeClass('tree-element-chosen');
            ouTreeNode.parents("form").find(".text-targetOU").attr("value", "");
        }
    }

    function treeResizerOnClickHandler(button, wrap) {
        if(wrap.hasClass("ad-target-ou-tree-wrap-full")){
            button.text("Show more");
            wrap.removeClass("ad-target-ou-tree-wrap-full");
        } else {
            button.text("Show less");
            wrap.addClass("ad-target-ou-tree-wrap-full");
        }
    }

    this.init=function(id){
        // display help text for this tree
        $("div#org-unit-help-text").show();

        var treeDiv = $("div#" + id + "-ad-target-ou");

        treeDiv.find('ul#orgunittree').collapsibleCheckboxTree(options = {
            checkParents : false,  // When checking a box, all parents are checked
            checkChildren : false, // When checking a box, all children are checked
            uncheckChildren : false, // When unchecking a box, all children are unchecked (Default: true)
            initialState : 'expand',  // Options - 'expand' (fully expanded), 'collapse' (fully collapsed) or default
            uncheckChildrenCollapse: false
        });


        //only enable OUs the user imports from
        if (treeDiv.find("span#selected-OU").length) {
            treeDiv.find("input.useroutreenode").prop('disabled', true)
            treeDiv.find("span#selected-OU").each(function() {
                var nodeSelector = treeDiv.find("input.useroutreenode[value=\"" + saasure.util.escapeSelector($(this).text()) + "\"]");
                nodeSelector.prop('disabled', false);
                nodeSelector.parent("li").find("input[type='checkbox']").prop('disabled', false);
            });
        }

        //check the box for the selected target OU; this happens when editing properties
        var selectedOU = treeDiv.parents("form").find("input.text-targetOU").first();
        if (selectedOU.val()) {
            var selectedOUNode = "input.useroutreenode[value=\"" + saasure.util.escapeSelector(selectedOU.val()) + "\"]";
            if (!$(selectedOUNode).prop('disabled')) {
                $(selectedOUNode).prop('checked', true);
            }
        }

        //required so that AjaxForms.bind_events doesn't clear the checkbox
        treeDiv.parents("form").addClass("ajax-form-no-reset");

        treeDiv.find('input.useroutreenode').live('click', function () {
            changed=true;
            checkBoxTreeOnClickHandler($(this));
        });

        $("#" + id + "-orgunittree-resizer").live('click', function(e) {
            e.preventDefault();
            treeResizerOnClickHandler($(this), treeDiv);
        });
    }
};

