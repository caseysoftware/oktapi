/**
 * Search widget for people lists.  Provides a dropdown of various "filter-by" options
 *
 * Usage: in your JSP, include the markup with
 *
 * <c:set var="userSearchPrefix" value="CHANGEME" />
 * <%@ include file="/WEB-INF/jsp/admin/people/user_search_widget.jsp" %>
 *
 * In your page setup, include code like this:
 *
 * var userList = new saasure.Widget.UserList();
 * var userSearch = new saasure.Widget.UserSearch("CHANGEME");
 *
 * var opt = userList.initTableOpt();
 * opt.urlParam = userSearch.urlParam;
 * opt.searchByApp = true;
 *
 * dtable = $('.data-grid').dataTable(opt);
 * userSearch.init(dtable, opt);
 *
 * where CHANGEME is a prefix unique throughout the codebase that
 * ensures the ids loaded onto the page are unique.
 *
 */
saasure.Widget.UserSearch = function(prefix) {
    var self = this;
    var defaultDetailedOptions = {
      minChars: 1,
      width: 348,
      autoFill: true
    };
    var options = {
        searchByUser: true,
        searchByApp: false,
        searchByGroup: false,

        userCallback: defaultUserCallback,
        appCallback: defaultAppCallback,
        groupCallback: defaultGroupCallback,

        userInlineText: null,
        appInlineText: null,
        groupInlineText: null,

        defaultMode: "person",
        selectAllButtonShowing: true,
        dropDownhide: false,
        addButton: false,

        userDetailedOptions: {}
    };
    var mode = null;
    var selectedUserId = null;
    var selectedAppId = null;
    var selectedGroupId = null;
    var dataTable = null;
    var autoUsersParams;

    function _(locator) {
        return $("#" + prefix + "-" + locator);
    }

    function defaultUserCallback(event, data, formatted) {
        selectedUserId = data ? data[1] : null;
        dataTable.fnFilter("");
        filterSelected();
    }

    function defaultAppCallback(event, data, formatted) {
        selectedAppId = data ? data[1] : null;
        dataTable.fnFilter("");
        filterSelected();
    }

    function defaultGroupCallback(event, data, formatted) {
        selectedGroupId = data ? data[1] : null;
        dataTable.fnFilter("");
        filterSelected();
    }

    function clearAndFocus() {
        searchMode(mode, true);
        dataTable.fnFilter("");
    }

    function searchMode(type, doFocus) {
        mode = type;
        selectedUserId = selectedAppId = selectedGroupId = null;

        $.each(["person", "app", "group"], function(idx, elm) {
            var search = _(elm + "-search");
            if (elm == type) {
                var searchBox = search.find("input");
                search.show();
                searchBox.val("");
                if (doFocus) {
                    searchBox.focus();
                }
            } else {
                search.hide();
            }
        });
    }

    function urlParam() {
        var ret = {};
        if (options.urlParam) {
            ret = options.urlParam();
        }
        if (mode == "person" && selectedUserId) {
            ret.restrictToUserIds = [ selectedUserId ];
        } else if (mode == "group" && selectedGroupId) {
            ret.groupId = selectedGroupId;
        } else if (mode == "app" && selectedAppId) {
            ret.instanceId = selectedAppId;
        }
        return ret;
    }

    function filterSelected() {
        saasure.util.fireEvent(self, "filterSelected", {
            mode: mode,
            selectedUserId: selectedUserId,
            selectedGroupId: selectedGroupId,
            selectedAppId: selectedAppId
        });
    }

    function isObject(o) {
      return !!o && Object.prototype.toString.call(o) === '[object Object]';
    }

    function extendObject(defaults, inputs) {
      // Only allow Object and ignore others like string, array, etc..
      var o = isObject(inputs) ? inputs : {};
      return $.extend(defaults, o);
    }

    function includeInactiveUsers(inactiveUsers) {
        var personInput = _("person-search input");
        if (inactiveUsers) {
            personInput.oktaUserWithInactiveAuto(autoUsersParams);
        } else {
            personInput.oktaUserAuto(autoUsersParams);
        }
    }

    function init(dTable, opt) {
        dataTable = dTable;
        $.extend(options, opt);
        opt.urlParam = urlParam;

        mode = options.defaultMode;

        if (options.searchByUser) {
            _("search-by-person").live("click", function() {
                searchMode("person", false);
                _("user-search-by-icon").removeClass("app-16-gray group-16").addClass("person-16-gray");
            });
            var personInput = _("person-search input");
            saasure.inlineLabel(personInput);
            _("search-by-person").show();
            _("user-search-dropdown").show();
            autoUsersParams = {
                noInlineLabel: false,
                detailedOptions: extendObject(defaultDetailedOptions, options.userDetailedOptions),
                resultCallback: options.userCallback
            };
            personInput.oktaUserAuto(autoUsersParams);

            if (options.userInlineText) {
                _("person-search-input-label").text(options.userInlineText);
            }
        }

        if (options.searchByApp) {
            _("search-by-app").live("click", function() {
                searchMode("app", false);
                _("user-search-by-icon").removeClass("group-16 person-16-gray").addClass("app-16-gray");
            });
            _("search-by-app").show();
            _("user-search-dropdown").show();
            _("app-search input").oktaActiveInstanceAutoComplete({
                noInlineLabel: false,
                detailedOptions: { minChars: 1, width: 348, autoFill: true },
                resultCallback: options.appCallback
            });

            if (options.appInlineText) {
                _("app-search-input-label").text(options.appInlineText);
            }
        }

        if (options.searchByGroup) {
            _("search-by-group").live("click", function() {
                searchMode("group", false);
                _("user-search-by-icon").removeClass("app-16-gray person-16-gray").addClass("group-16");
            });
            if (options.dropDownhide) {
                //remove dropdown, add an image.
                _("user-search-dropdown").hide();
                _("group-search").find("span").removeClass("rounded-left-15").addClass("rounded-15");

            }
            else {
                _("user-search-dropdown").show();
            }

            if (options.addButton) {
                _("gray-magnify-icon").hide();
                _("green-add-search-icon").show();
            }

            _("search-by-group").show();
            var groupSearchInput = _("group-search-input");
            saasure.inlineLabel(groupSearchInput);

            groupSearchInput.oktaGroupAutoComplete({
                noInlineLabel: false,
                detailedOptions: { minChars: 1, width: 348, autoFill: true },
                resultCallback: options.groupCallback
            });

            if (options.groupInlineText) {
                _("group-search-input-label").text(options.groupInlineText);
            }
        }

        if (!options.selectAllButtonShowing) {
            _("user-search div.user-search-select-all").hide();
            _("user-search-dropdown div.user-search-filter").addClass("rounded-right-12");
            _("user-search-dropdown div.user-search-filter a.user-search-button span.group-16").addClass("display-none");
        }

        searchMode(mode, false);
        _("user-search-by-icon").addClass(mode + "-16-gray");

        var dd = new saasure.Widget.DropDown();
        dd.create();
    }

    this.init = init;
    this.urlParam = urlParam;
    this.clearAndFocus = clearAndFocus;
    this.includeInactiveUsers = includeInactiveUsers;
    this.options = {
        events:{ filterSelected: null }
    };

    return this;
};
