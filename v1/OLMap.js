'use strict';

const map = Symbol();

class OLMap {
  constructor(params) {
    this[map] = new ol.Map({
      target: params["target"] || "olmap",
      renderer: ['canvas', 'dom'],
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            attributions: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>",
            url: params["tileUrl"] || "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
            projection: "EPSG:3857"
          })
        })
      ],
      overlays: [
        new ol.Overlay({
          element: document.getElementById("popup"),
          autoPan: {
            animation: {
              duration: 250,
            },
          },
        })
      ],
      controls: ol.control.defaults.defaults({
        attributionOptions: ({
          collapsible: false
        })
      }),
      view: new ol.View({
        projection: "EPSG:3857",
        center: this.transform(params["longitude"] || 136.22167, params["latitude"] || 36.06519),
        maxZoom: params["maxZoom"] || 18,
        minZoom: params["minZoom"] || 1,
        zoom: params["zoom"] || 12,
      })
    });

    // ポップアップ
    this[map].on('click', (event) => {
      const feature = this[map].forEachFeatureAtPixel(event.pixel,  (feature) => {
        return feature;
      });

      const overlay = this.getOverlay(undefined);
      overlay.setPosition(undefined);
      
      if (!feature) {
        return;
      }

      const content = document.getElementById('popup');
      const coordinate = event.coordinate;
      content.innerHTML = "<p>" + feature.get("content") + "</p>";
      overlay.setPosition(coordinate);
    });
  };

  get map() {
    return this[map];
  }

  addTileLayer(id, url) {
    this[map].addLayer(new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: url,
        projection: "EPSG:3857"
      }),
      properties: {
        id: id
      }
    }));
  }

  addVectorLayer(id) {
    this[map].addLayer(new ol.layer.Vector({
      source: new ol.source.Vector({
        projection: "EPSG:3857",
      }),
      properties: {
        id: id
      }
    }));
  }

  getLayer(id) {
    const layers = this[map].getLayers().array_;
    const layer = layers.find((layer) => {
      return layer.get("id") == id;
    });

    if (layer != undefined) {
      return layer;
    }

    return layers[0];
  }

  getOverlay(id) {
    const overlays = this[map].getOverlays().array_;
    const overlay = overlays.find((overlay) => {
      return overlay.get("id") == id;
    });

    if (overlay != undefined) {
      return overlay;
    }

    return overlays[0];
  }

  addMarker(layer, params = {}) {
    const feature = new ol.Feature({
      geometry: new ol.geom.Point(this.transform(params["longitude"], params["latitude"])),
      content: params["content"] || ""
    });
    feature.setStyle(new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        src: params["icon"] || "./v1/icon.png"
      })
    }));
    layer.getSource().addFeature(feature);
  }

  transform(longitude, latitude) {
    return ol.proj.transform([longitude, latitude], "EPSG:4326", "EPSG:3857");
  }

  setCenter(coordinate) {
    this[map].getView().setCenter(coordinate);
  }
}

export { OLMap };
