// ==UserScript==
// @id             iitc-plugin-yet-to-full@randomizax
// @name           IITC plugin: Show L8 Resonators Needed
// @category       Layer
// @version        2.0.0.20250420.45823
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://randomizax.github.io/yet-to-full/yet-to-full.meta.js
// @downloadURL    https://randomizax.github.io/yet-to-full/yet-to-full.user.js
// @description    [randomizax-2025-04-20-045823] Show L8 Resonators Needed.
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
// plugin_info.buildName = 'randomizax';
// plugin_info.dateTimeVersion = '20250420.45823';
// plugin_info.pluginId = 'yet-to-full';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.yetToFull = function() {
};

window.plugin.yetToFull.ICON_SIZE = 12;
window.plugin.yetToFull.MOBILE_SCALE = 1.5;

window.plugin.yetToFull.levelLayers = {};
window.plugin.yetToFull.levelLayerGroup = null;

window.plugin.yetToFull.setupCSS = function() {
  $("<style>")
    .prop("type", "text/css")
    .html(".plugin-yet-to-full {\
            font-size: 10px;\
            color: #FFFFBB;\
            font-family: monospace;\
            text-align: center;\
            text-shadow: 1px 0 0.5em black, -1px 0 0.5em black, 0 0 0.5em black;\
            pointer-events: none;\
            -webkit-text-size-adjust:none;\
          }")
  .appendTo("head");
}

window.plugin.yetToFull.removeLabel = function(guid) {
  var previousLayer = window.plugin.yetToFull.levelLayers[guid];
  if(previousLayer) {
    window.plugin.yetToFull.levelLayerGroup.removeLayer(previousLayer);
    delete plugin.yetToFull.levelLayers[guid];
  }
}

window.plugin.yetToFull.addLabel = function(guid) {
  if (!map.hasLayer(window.plugin.yetToFull.levelLayerGroup)) {
    return;
  }

  // remove old layer before updating
  window.plugin.yetToFull.removeLabel(guid);

  // count missing L8 resonators
  var p = window.portals[guid];
  if (!p) return;
  var latLng = p.getLatLng();
  var d = window.portalDetail.get(guid);
  if (!d) return;
  var yet = -8;
  for (var i in d.resonators) {
      if (d.resonators[i] && d.resonators[i].level == 8) {
          yet++;
      }
  }
  if (!((d.level == 7) ||
        (d.level <= 6 && yet >= -5)))
    return;
  var level = L.marker(latLng, {
    icon: L.divIcon({
      className: 'plugin-yet-to-full',
      iconSize: [window.plugin.yetToFull.ICON_SIZE * 2, window.plugin.yetToFull.ICON_SIZE],
      html: yet
      }),
    guid: guid,
    interactive: false
  });
  plugin.yetToFull.levelLayers[guid] = level;
  level.addTo(plugin.yetToFull.levelLayerGroup);
}

window.plugin.yetToFull.updatePortalLabels = function() {
  // as this is called every time layers are toggled, there's no point in doing it when the layer is off
  if (!map.hasLayer(window.plugin.yetToFull.levelLayerGroup)) {
    return;
  }
  var portalPoints = {};
  var count = 0;

  var displayBounds = map.getBounds();

  for (var guid in window.portals) {
    var p = window.portals[guid];
    if (p._map && displayBounds.contains(p.getLatLng())) {
      var point = map.project(p.getLatLng());
      portalPoints[guid] = point;
      count += 1;
    }
  }

  // and add those we do
  for (guid in portalPoints) {
    window.plugin.yetToFull.addLabel(guid);
  }
}

// as calculating portal marker visibility can take some time when there's lots of portals shown, we'll do it on
// a short timer. this way it doesn't get repeated so much
window.plugin.yetToFull.delayedUpdatePortalLabels = function(wait) {

  if (window.plugin.yetToFull.timer === undefined) {
    window.plugin.yetToFull.timer = setTimeout ( function() {
      window.plugin.yetToFull.timer = undefined;
      window.plugin.yetToFull.updatePortalLabels();
    }, wait*1000);

  }
}

var setup = function() {

  window.plugin.yetToFull.setupCSS();

  window.plugin.yetToFull.levelLayerGroup = new L.LayerGroup();
  window.addLayerGroup('L8 Resonators Needed', window.plugin.yetToFull.levelLayerGroup, true);

  window.addHook('requestFinished', function() { setTimeout(function(){window.plugin.yetToFull.delayedUpdatePortalLabels(3.0);},1); });
  window.addHook('mapDataRefreshEnd', function() { window.plugin.yetToFull.delayedUpdatePortalLabels(0.5); });
  window.map.on('overlayadd overlayremove', function() { setTimeout(function(){window.plugin.yetToFull.delayedUpdatePortalLabels(1.0);},1); });
  window.addHook('portalDetailsUpdated', function(ev) { window.plugin.yetToFull.addLabel(ev.guid); });

}

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


