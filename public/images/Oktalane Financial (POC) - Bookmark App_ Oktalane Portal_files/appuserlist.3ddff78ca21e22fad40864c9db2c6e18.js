/**
 * AppUser list datatable.
 */
saasure.Widget.AppUserList = function() {
    var self = this;
    var rootElement;

    function formatAppUserName(obj, tr, td, index) {
        var tdElm = $(td);
        var fullname = obj.user.profile.firstName + " " + obj.user.profile.lastName;
        var fullnameLink = '<a class="convert-fullname" target="_blank" href="/admin/user/profile/view/' + saasure.util.escapeHtml(obj.user.id)+ '" >' + saasure.util.escapeHtml(fullname) + '</a>';
        var username = saasure.util.escapeHtml(obj.userName);
        tdElm.html(fullnameLink + "<br><span class='convert-username'>" + username + "<span>");
        tr.id = "appuserlist-" + saasure.util.escapeHtml(obj.id);
    }

    function formatUserGroup(obj, tr, td, index) {
        var tdElm = $(td);
        var groupName = saasure.util.escapeHtml(obj.userGroup.name);
        var groupNameLink = '<a href="/admin/group/' + obj.userGroup.id + '" >' + groupName + '</a>';
        var description = obj.userGroup.description == undefined ? "" : saasure.util.escapeHtml(obj.userGroup.description);
        tdElm.html(groupNameLink + "<br><span class='convert-username'>" + description + "<span>");
    }

    function initTableOpt() {

        return (new saasure.DataTables()).serverSide({
            sPaginationType: 'full_numbers',
            iDisplayLength: 50,
            aaSorting: [[ 0, 'asc' ]],
            sWrapper: 'form-content-wrap',
            aoColumns: [
                // visible / sortable columns
                { sName: "userName", sTitle: "Person &amp; Username", sWidth: "60%", sClass: "person-name-username", sOrderBy: "userName"},
                { sName: "userGroup.name", sTitle: "Group",sWidth: "40%", sClass: "person-status", sOrderBy: "userGroup" },
                // non-visible items
                { sName: "userGroup.description", bVisible: false },
                { sName: "user.profile", bVisible: false },
                { sName: "user.id", bVisible: false },
                { sName: "userGroup.id", bVisible: false },
                { sName: "id", bVisible: false }
            ],
            bJQueryUI: true,
            bAutoWidth: false,
            sAjaxSource: "/admin/appusers/find-convertible",
            aFormatters: {
                "userName":formatAppUserName,
                "userGroup.name":formatUserGroup
            }
        });
    }

    /*
     * Public functions
     */
    this.initTableOpt = initTableOpt;
};