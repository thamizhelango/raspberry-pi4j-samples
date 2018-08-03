#!/bin/bash
# Navigation REST server
#
echo -e "----------------------------"
echo -e "Usage is $0 [y]"
echo -e "     [y] means with a proxy"
echo -e "----------------------------"
#
echo -e "Starting the Navigation Rest Server"
USE_PROXY=false
#
if [ $# -gt 0 ]
then
  if [ $1 == y ]
  then
    echo Will use a proxy
    USE_PROXY=true
  fi
fi
#
HTTP_VERBOSE=false
TIDE_VERBOSE=false
ASTRO_VERBOSE=false
IMAGE_VERBOSE=false
GRIB_VERBOSE=false
#
CP=./build/libs/RESTNavServer-1.0-all.jar
JAVA_OPTS=
JAVA_OPTS="$JAVA_OPTS -DdeltaT=68.9677" # 01-Jan-2018
JAVA_OPTS="$JAVA_OPTS -Dhttp.verbose=$HTTP_VERBOSE"
JAVA_OPTS="$JAVA_OPTS -Dtide.verbose=$TIDE_VERBOSE"
JAVA_OPTS="$JAVA_OPTS -Dastro.verbose=$ASTRO_VERBOSE"
JAVA_OPTS="$JAVA_OPTS -Dimage.verbose=$IMAGE_VERBOSE"
JAVA_OPTS="$JAVA_OPTS -Dgrib.verbose=$GRIB_VERBOSE"
#
if [ $USE_PROXY == true ]
then
  echo Using proxy
  JAVA_OPTS="$JAVA_OPTS -Dhttp.proxyHost=www-proxy.us.oracle.com -Dhttp.proxyPort=80"
fi
#
# refers to nmea.mux.properties, unless -Dmux.properties is set
echo -e "+----------------------------------------------------------------+"
echo -e "| Using nmea.mux.home.properties, TCP input from Weather station |"
echo -e "+----------------------------------------------------------------+"
JAVA_OPTS="$JAVA_OPTS -Dmux.properties=nmea.mux.home.properties"
JAVA_OPTS="$JAVA_OPTS -Dlatitude=37.7489 -Dlongitude=-122.5070" # SF.
#
echo -e "Using properties:$JAVA_OPTS"
#
java -cp $CP $JAVA_OPTS navrest.NavServer
#