# signalk-avg-paths
Plugin to dampen out the values of certain paths. Courtesy to Chris.

Paths concerned are:

|Path| Smoothed path|
|--------|--------|
|environment.wind.angleApparent|environment.wind.angleApparent_smooth|
|environment.wind.directionTrue|environment.wind.directionTrue_smooth, environment.wind.directionCardinal_smooth|
|environment.wind.angleTrueGround|environment.wind.angleTrueGround_smooth|
|environment.wind.angleTrueWater|environment.wind.angleTrueWater_smooth|
|environment.wind.speedTrue|environment.wind.speedTrue_smooth, environment.wind.beaufort_smooth|
|navigation.headingTrue|navigation.headingTrue_smooth|
|navigation.courseOverGroundTrue|navigation.courseOverGroundTrue_smooth|

