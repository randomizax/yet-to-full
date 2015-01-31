// ==UserScript==
// @id             iitc-plugin-yet-to-full@randomizax
// @name           IITC plugin: Show L8 Resonators Needed
// @category       Layer
// @version        0.1.7.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Show L8 Resonators Needed.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

@@PLUGINSTART@@

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
    guid: guid
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
  for (var guid in portalPoints) {
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

@@PLUGINEND@@
