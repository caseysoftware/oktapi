/* global $, _ */
function renderPersonaNav($navEl, current) {
  var personas = {
    Developer: {
      val: 'Developer',
      title: 'Developer',
      link: '/dev/console',
      icon: 'code-brackets-16'
    },
    IT: {
      val: 'IT',
      title: 'Classic UI',
      link: '/admin/dashboard',
      icon: 'configure-16'
    }
  };

  var currentNav = personas[current] || personas.IT;
  var navItems = _.reject(personas, function (persona) {
    return persona === currentNav;
  });

  var template = _.template('\
    <ul class="nav-persona"><li>\
      <a href="javascript:void(0)">\
        <span class="icon <%= current.icon%>-white"></span>\
        <%= current.title %>\
      </a>\
      <ul class="drop-nav">\
        <% for (var i=0; i < items.length; i++) { %>\
          <li>\
            <a data-persona="<%= items[i].val %>" href="#">\
              <span class="icon <%= items[i].icon %>"></span>\
              <%= items[i].title %>\
            </a>\
          </li>\
        <% } %>\
      </ul>\
    </li></ul>\
  ');

  $el = $(template({ current: currentNav, items: navItems }));
  $navEl.prepend($el);

  $el.find('ul.drop-nav a').click(function (e) {
    e.preventDefault();
    var selected = $(e.currentTarget).data('persona');
    var persona = _.find(navItems, function (item) {
      return item.val === selected;
    });
    $.cookie('persona', selected, { path: '/' });
    window.location.href = persona.link;
  });

  var $nav = $el.find('ul.drop-nav');
  $el.children().hoverIntent({
    interval: 30,
    timeout: 100,
    over: function () {
      $nav.show();
    },
    out: function () {
      $nav.hide();
    }
  });
}

$(document).ready(function () {
  // Persona Navigation switcher
  var persona = okta.settings && okta.settings.persona;
  if (_features && _features.indexOf('DEV_CONSOLE') > -1 && persona !== '') {
    renderPersonaNav($('#nav-account'), persona);
  }

  // Primary Navigation
  $('#nav-primary > li.top-menu a').each(function () {
    var id = '#' + $(this).attr('id');
    $(id).parent('li').hoverIntent({
      // sensitivity: 7, // number = sensitivity threshold (must be 1 or higher)
      interval: 30,   // number = milliseconds of polling interval
      over: function () {
        $(id + ' + ul').show();
      },
      timeout: 30,   // number = milliseconds delay before onMouseOut function call
      out: function () {
        $(id + ' + ul').hide();
      }
    });
  });
});
