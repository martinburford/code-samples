/* global assert, sinon */

var events = require('chameleon-events');

describe('Header (orientation change)', function(){
  var header = require('../js/header.js');
  var clock;
  var headerObj;

  // Define re-usable markup snippets
  before(function(){
    headerObj = document.createElement('header');
    headerObj.classList.add('mod-header');
    headerObj.innerHTML = '<div class="primary"><a href="/" id="logo"></a><a class="icon" href="#" id="hamburger">Load mobile navigation<span></span></a><nav class="primary"><section><ul data-level="1"><li><a href="/news/">News</a></li><li><a href="/football/">Football</a></li><li><a href="/3am/">Celebs</a></li><li><a href="/politics/">Politics</a></li><li><a href="/tv/">TV &amp; Film</a></li><li><a href="/sport/">Sport</a></li><li><a href="/weird-news/">Weird News</a></li></ul></section></nav><div class="social-sites"><ul><li><a class="icon facebook" href="https://www.facebook.com/dailymirror/" data-provider="facebook">Facebook</a></li><li><a class="icon twitter" href="https://twitter.com/DailyMirror" data-provider="twitter">Twitter</a></li><li><a class="icon pinterest" href="[TBC]" data-provider="pinterest">Pinterest</a></li><li><a class="icon instagram" href="https://www.instagram.com/dailymirror/" data-provider="instagram">Instagram</a></li></ul></div></div><nav class="secondary" data-smooth-scroll="data-smooth-scroll"><section><ul data-level="1"><li><a href="/offers/">Offers</a></li><li><a href="/fantasy/">Fantasy</a></li><li><a href="/bingo/">Bingo</a></li><li><a href="/dating/">Dating</a></li><li><a href="/jobs/">Jobs</a></li><li><a href="/buysell/">BuySell</a></li><li><a href="/competition/">Competition</a></li><li><a href="/horoscopes/">Horoscopes</a></li></ul></section></nav><nav class="footer"></nav>';
    document.body.appendChild(headerObj);
  });

  beforeEach(function(){
    clock = sinon.useFakeTimers();
  });

  afterEach(function(){
    clock.restore();
  });

  // Force window.orientation to be supported
  window.orientation = true;

  it('Initialization stores the correct DOM nodes for future reference', function(){
    // Initialize the header module
    header.init();

    var storedPrimaryNavigation = header.options.domElements.primaryNavigationNode;
    var storedSecondaryNavigation = header.options.domElements.secondaryNavigationNode;

    assert.equal(storedPrimaryNavigation.querySelectorAll('li').length, 7);
    assert.equal(storedSecondaryNavigation.querySelectorAll('li').length, 8);
  });

  it('Force orientation change to (tablet) portrait to check switching of navigation item locations', function(){
    var primaryNavigationItems;
    var secondaryNavigationItems;

    // Set the window to a portrait resolution/width
    window.innerWidth = 728;
    events.fire(window,'orientationchange');

    // Allow the (1ms) debounce routine to fire 100% before asserting against the functionality it performs
    clock.tick(1);

    primaryNavigationItems = document.querySelectorAll('.mod-header nav.primary li');
    secondaryNavigationItems = document.querySelectorAll('.mod-header nav.secondary li');

    // Check to see that the primary navigation links have been moved into the secondary navigation bar
    assert.equal(secondaryNavigationItems[0].querySelector('a').innerText, 'News');
  });

  it('Force orientation change to (tablet) landscape (from portrait) whilst the #header-dropdown menu is expanded', function(){
    var headerDropdownObj;
    headerDropdownObj = document.getElementById('header-dropdown');

    // Check that the #header-dropdown element is currently closed
    assert.equal(headerDropdownObj.classList.contains('active'), false);

    // Expand the #header-dropdown, by clicking the hamburger icon
    var hamburgerObj = document.getElementById('hamburger');
    hamburgerObj.click();

    // Check that the #header-dropdown element is now open
    assert.equal(headerDropdownObj.classList.contains('active'), true);

    // Set the window to a (tablet) landscape resolution/width
    window.innerWidth = 1024;
    events.fire(window,'orientationchange');

    // Allow the (1ms) debounce routine to fire 100% before asserting against the functionality it performs
    clock.tick(1);

    // Since the breakpoint is now set to tabletLandscapeUpwards, the #header-dropdown DOM element should be removed from the DOM
    headerDropdownObj = document.getElementById('header-dropdown');
    assert.equal(headerDropdownObj, null);
  });  
});