// bootstrap component
import {Col} from 'react-bootstrap'

import React, {useEffect} from 'react'

// urbantkmap.js
import {Environment, MapView as WebMap, DataLoader } from '../../urbantk-map/ts/dist/urbantkmap';

// for jupyter python
import {MapView as JupyterMap} from '../../utilities/urbantkmap.iife.js';

// jquery
import $ from 'jquery';

// mapview css
import './MapView.css';

// enables sending images to cave
import {initializeConnection} from '../../caveSupport/sendToUnity.js';

import {paramsMapView} from '../../params.js';

import {D3App} from './D3App';

import { FaChartBar, FaEdit, FaRegTrashAlt } from "react-icons/fa";

var app: any;

// Mapview Application Class
class App {
  _map: WebMap;
  constructor(div: any, d3App: D3App | null = null, linkedContainerGenerator: any | null = null, cameraUpdateCallback: any | null = null) {
    const mapDiv = document.querySelector(div);

    if(d3App){
      this._map = new WebMap(mapDiv, d3App, linkedContainerGenerator, cameraUpdateCallback);
    }else{
      this._map = new WebMap(mapDiv);
    }

  }

  run(data:any) {

    this._map.initMapView(data).then(() => {
      this._map.render();
    });
    
    initializeConnection(this._map);
  }

  setCamera(camera: {position: number[], direction: {right: number[], lookAt: number[], up: number[]}}) {
    this._map.setCamera(camera);
  }

}

// MapViewer parameter types
type mapViewDataProps = {
  dataToView: any,
  divWidth: number,
  frontEndMode?: string, //web is the default
  data?: any,
  d3App?: D3App,
  linkedContainerGenerator?: any,
  cameraUpdateCallback?: any,
  inputId?: string
}

class MapConfig {
  public static frontEndMode: string | undefined;
  public static d3App: D3App | undefined;
  public static linkedContainerGenerator: any;
  public static cameraUpdateCallback: any;
}

export const createAndRunMap = () => {

  $('#map').empty();
  // let d3app = new D3App('#svg_element', '#'+screenPlotSvgId, plotCollectionList);

  app = new App('#map', MapConfig.d3App, MapConfig.linkedContainerGenerator, MapConfig.cameraUpdateCallback);
      
  let port;

  if(MapConfig.frontEndMode == 'vr'){
    port = '3001';
  }else{
    port = '3000';
  }

  // Serves data files to the map
  Environment.setEnvironment({backend: 'http://'+paramsMapView.environmentIP+':'+port+'/', dataFolder:paramsMapView.environmentDataFolder});
  // index.json is a file containing the descrition of map layers
  const url = `${Environment.backend}/${Environment.dataFolder}/grammar.json`;
  DataLoader.getJsonData(url).then(data => {
      app.run(data);
  });
}

export const MapViewer = ({dataToView, divWidth, frontEndMode, data, d3App, linkedContainerGenerator, cameraUpdateCallback, inputId}:mapViewDataProps) => {

  MapConfig.frontEndMode = frontEndMode;
  MapConfig.d3App = d3App;
  MapConfig.linkedContainerGenerator = linkedContainerGenerator;
  MapConfig.cameraUpdateCallback = cameraUpdateCallback;

  useEffect(()=> {
      $('#map').empty();

      // this line checks whether we are rendering the map
      // in browser or in jupyter notebook
      if(dataToView === 'none'){ //render map to jupyter notebook

        // get the div
        // var el = document.getElementById('map')!;

        // create new instance of Mapview from urbanktk.iife.js - jupyter
        // let map = new JupyterMap(el, false);

        app = new App('#map');
        app.run(data);

        // render the map in jupyter
        // map.initMapView(data);

        // map.addLayer(data);

      }else{
        // createAndRunMap();
      }   

  }, [dataToView, data])

  return(
    <React.Fragment>
      <Col md={divWidth} style={{padding: 0}}>
          <div id='map'>
          </div>
          <input type="text" id={inputId} name="searchBar" placeholder='Search place' style={{position: "absolute", left: ((12-divWidth)/12)*window.innerWidth+((divWidth/12)*window.innerWidth/2)-225, top: window.innerHeight-80}}></input>
      </Col>
      <div id='svg_div'>
        <svg id='svg_element' xmlns="http://www.w3.org/2000/svg" style={{"display": "none"}}>
        </svg>
      </div>
    </React.Fragment>
  )
}

export const setCameraPosMap = (camera: {position: number[], direction: {right: number[], lookAt: number[], up: number[]}}) => {
  app.setCamera(camera);
}