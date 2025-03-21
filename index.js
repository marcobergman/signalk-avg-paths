//https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md

module.exports = function (app) {
  var plugin = {};


  plugin.id = 'signalk-avg-paths';
  plugin.name = 'signalk-avg-paths';
  plugin.description = 'Calculate averages on sk-paths';

  plugin.start = function (options, restartPlugin) {
    // Here we put our plugin logic
    app.debug('Plugin started');


    const array_AWA = [];
    const array_TWD = [];
    const array_TWS = [];
    const array_GWA = [];
    const array_TWA = [];
    const array_HDG = [];
    const array_COG = [];
    var send        = 0
    const twoPi     = 2*3.141592654


    // Capture incoming delta, check for range and if below threshold send delta to server
    app.registerDeltaInputHandler((delta, next) => {
      delta.updates.forEach(update => {
		if (!(update.source !== undefined && update.source.talker === "AI") && update.values) { // don't process AIS messages
			update.values.forEach(pathValue => {
			 if(pathValue.path === "environment.wind.angleApparent") {

				//if(arr_AWA.length == 1){
				//  timeStart = Date.now()
				//}
				//if(arr_AWA.length == 11){
				//  timeDone = Date.now()
				//}
				//if(arr_AWA.length >= 11){
				//   app.debug('elapsed time: ' + (timeDone - timeStart)/1000);
				//}

				// wenn max length erreicht, hinten Element entfernen
				if(array_AWA.length >= options.smoothSamples){
				   array_AWA.pop()
				}
				// Neues Element vorne einfuegen
				array_AWA.unshift(pathValue.value)

				//app.debug('array ' + arr_AWA);

				var angleSin_sum = 0;
				var angleCos_sum = 0;
				var arrayLength = array_AWA.length
				for(var i = 0; i < arrayLength; i++) {
					angleSin_sum += Math.sin(array_AWA[i]);
					angleCos_sum += Math.cos(array_AWA[i]);
				}
				var smooth_angle = Math.atan2(angleSin_sum/arrayLength, angleCos_sum/arrayLength);

				//if( angleSin_sum < 0 ){
				//   smooth_angle += twoPi
				//}

				app.handleMessage('signalk-avg-paths', {
				  updates: [
					{
					values: [
					  {
						path: 'environment.wind.angleApparent_smooth',
						value: smooth_angle
					  }
					],
					meta: [
					  {
						path: 'environment.wind.angleApparent_smooth',
						value: {"units": "rad"}
					  }
					]
				   }
				  ]
				}) // handleMessage




			} else if(pathValue.path === "environment.wind.directionTrue") {  // path
				if(array_TWD.length >= options.smoothSamples){
				   array_TWD.pop()
				}
				array_TWD.unshift(pathValue.value)

				var angleSin_sum = 0;
				var angleCos_sum = 0;
				var arrayLength  = array_TWD.length
				for(var i = 0; i < arrayLength; i++) {
					angleSin_sum += Math.sin(array_TWD[i]);
					angleCos_sum += Math.cos(array_TWD[i]);
				}
				var smooth_angle = Math.atan2( angleSin_sum/arrayLength, angleCos_sum/arrayLength );

				if( angleSin_sum < 0 ){
				   smooth_angle += twoPi
				}

				// artificial wind angle for debugging
				smooth_angle += options.angleOffset /180.0*3.141592654

				if(smooth_angle > twoPi){ smooth_angle -= twoPi }

				var cardinal_directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W','WNW', 'NW', 'NNW', 'N']
				j = Math.round (smooth_angle / 2 / Math.PI * 16)
				
				cardinal_direction = cardinal_directions[j]

				app.handleMessage('signalk-avg-paths', {
				  updates: [
					{
					values: [
					  {
						path: 'environment.wind.directionTrue_smooth',
						value: smooth_angle
					  },
					  {
						path: 'environment.wind.directionCardinal_smooth',
						value: cardinal_direction
					  }
					],
					meta: [
					  {
						path: 'environment.wind.directionTrue_smooth',
						value: {"units": "rad"}
					  }
					]
				   }
				  ]
				}) // handleMessage}




			} else if(pathValue.path === "environment.wind.speedTrue") {  // path
				if(array_TWS.length >= options.smoothSamples){
				   array_TWS.pop()
				}
				array_TWS.unshift(pathValue.value)

				var tws_sum = 0;
				var arrayLength  = array_TWS.length
				for(var i = 0; i < arrayLength; i++) {
					tws_sum += array_TWS[i];
				}
				var true_wind_speed = tws_sum/arrayLength;

				var beaufort_scale = ['0', '1', '1', '1', '2', '2', '2', '3', '3', '3', '3', '4-', '4-', '4', '4', '4+', '4+', '5-', '5-', '5', '5+', '5+', '6-', '6-', '6', '6', '6+', '6+', '7-', '7-', '7', '7', '7+', '7+']
				j = Math.round (true_wind_speed * 3600 / 1852)
				
				if (j < beaufort_scale.length) {
					beaufort = beaufort_scale[j]
				} else {
					beaufort = ">7"
				}

				app.handleMessage('signalk-avg-paths', {
				  updates: [
					{
					values: [
					  {
						path: 'environment.wind.speedTrue_smooth',
						value: true_wind_speed
					  },
					  {
						path: 'environment.wind.beaufort_smooth',
						value: beaufort
					  }
					],
					meta: [
					  {
						path: 'environment.wind.speedTrue_smooth',
						value: {"units": "m/s"}
					  }
					]
				   }
				  ]
				}) // handleMessage}
				





			} else if(pathValue.path === "environment.wind.angleTrueGround") {  // path
				if(array_GWA.length >= options.smoothSamples){
				   array_GWA.pop()
				}
				array_GWA.unshift(pathValue.value)

				var angleSin_sum = 0;
				var angleCos_sum = 0;
				var arrayLength = array_GWA.length
				for(var i = 0; i < arrayLength; i++) {
					angleSin_sum += Math.sin(array_GWA[i]);
					angleCos_sum += Math.cos(array_GWA[i]);
				}
				var smooth_angle = Math.atan2(angleSin_sum/arrayLength, angleCos_sum/arrayLength);

				//if( angleSin_sum < 0 ){
				//   smooth_angle += twoPi
				//}

				app.handleMessage('signalk-avg-paths', {
				  updates: [
					{
					values: [
					  {
						path: 'environment.wind.angleTrueGround_smooth',
						value: smooth_angle
					  }
					],
					meta: [
					  {
						path: 'environment.wind.angleTrueGround_smooth',
						value: {"units": "rad"}
					  }
					]
				   }
				  ]
				}) // handleMessage}




			} else if(pathValue.path === "environment.wind.angleTrueWater") {  // path
				if(array_TWA.length >= options.smoothSamples){
				   array_TWA.pop()
				}
				array_TWA.unshift(pathValue.value)

				var angleSin_sum = 0;
				var angleCos_sum = 0;
				var arrayLength = array_TWA.length
				for(var i = 0; i < arrayLength; i++) {
					angleSin_sum += Math.sin(array_TWA[i]);
					angleCos_sum += Math.cos(array_TWA[i]);
				}
				var smooth_angle = Math.atan2(angleSin_sum/arrayLength, angleCos_sum/arrayLength);

				app.handleMessage('signalk-avg-paths', {
				  updates: [
					{
					values: [
					  {
						path: 'environment.wind.angleTrueWater_smooth',
						value: smooth_angle
					  }
					],
					meta: [
					  {
						path: 'environment.wind.angleTrueWater_smooth',
						value: {"units": "rad"}
					  }
					]
				   }
				  ]
				}) // handleMessage}




			} else if(pathValue.path === "navigation.headingTrue") {  // path
				if(array_HDG.length >= options.smoothSamples){
				   array_HDG.pop()
				}
				array_HDG.unshift(pathValue.value)
				
				var angleSin_sum = 0;
				var angleCos_sum = 0;
				var arrayLength = array_HDG.length
				for(var i = 0; i < arrayLength; i++) {
					angleSin_sum += Math.sin(array_HDG[i]);
					angleCos_sum += Math.cos(array_HDG[i]);
				}
				var smooth_angle = Math.atan2(angleSin_sum/arrayLength, angleCos_sum/arrayLength);

				if( angleSin_sum < 0 ){
				   smooth_angle += twoPi
				}

				app.handleMessage('signalk-avg-paths', {
				  updates: [
					{
					values: [
					  {
						path: 'navigation.headingTrue_smooth',
						value: smooth_angle
					  }
					],
					meta: [
					  {
						path: 'navigation.headingTrue_smooth',
						value: {"units": "rad"}
					  }
					]
				   }
				  ]
				}) // handleMessage}




			} else if(pathValue.path === "navigation.courseOverGroundTrue") {  // path
				if(array_COG.length >= options.smoothSamples){
				   array_COG.pop()
				}
				array_COG.unshift(pathValue.value)

				var angleSin_sum = 0;
				var angleCos_sum = 0;
				var arrayLength = array_COG.length
				for(var i = 0; i < arrayLength; i++) {
					angleSin_sum += Math.sin(array_COG[i]);
					angleCos_sum += Math.cos(array_COG[i]);
				}
				var smooth_angle = Math.atan2(angleSin_sum/arrayLength, angleCos_sum/arrayLength);

				if( angleSin_sum < 0 ){
				   smooth_angle += twoPi
				}

				app.handleMessage('signalk-avg-paths', {
				  updates: [
					{
					values: [
					  {
						path: 'navigation.courseOverGroundTrue_smooth',
						value: smooth_angle
					  }
					],
					meta: [
					  {
						path: 'navigation.courseOverGroundTrue_smooth',
						value: {"units": "rad"}
					  }
					]
				   }
				  ]
				}) // handleMessage}

			} // if path
		
		}) // forEach Path
	  } // if not AIS message
    }) // forEach Delta


    next(delta)
    }); // dataInputHandler
  } // pluginStart



 plugin.stop = function () {
    // Here we put logic we need when the plugin stops
    app.debug('Plugin stopped');
  };

  plugin.schema = {
    // The plugin schema
    type: 'object',
    required: ['smoothSamples', 'angleOffset'],
    properties: {
      smoothSamples: {
        type: 'number',
        title: 'Number of samples used for moving average',
        default: 50
      },
      angleOffset: {
        type: 'number',
        title: 'Offset angle to be added to directionTrue_smooth to test downstream procedures',
        default: 0
      }
    }
  };

  return plugin;
};

