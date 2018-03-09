#!/bin/bash
#
CP=./build/libs/RasPISamples-1.0-all.jar
#
JAVA_OPTIONS=
JAVA_OPTIONS="$JAVA_OPTIONS -Dweather.station.verbose=true"
JAVA_OPTIONS="$JAVA_OPTIONS -Dsdl.weather.station.verbose=true"
JAVA_OPTIONS="$JAVA_OPTIONS -Dmysql.logger.verbose=true"
JAVA_OPTIONS="$JAVA_OPTIONS -Dws.wspeed.coeff=1"
JAVA_OPTIONS="$JAVA_OPTIONS -Dws.wdir.offset=30"
# JAVA_OPTIONS="$JAVA_OPTIONS -Ddebounce.time.millisec=30"
#
# data.logger is the list of classes dealing with the data read from the Weather Station
#
DATA_LOGGERS=
# DATA_LOGGERS="$DATA_LOGGERS,weatherstation.logger.DummyLogger"
DATA_LOGGERS="$DATA_LOGGERS,weatherstation.logger.NMEAOverTCPLogger"
# DATA_LOGGERS="$DATA_LOGGERS,weatherstation.logger.HTTPLogger"
DATA_LOGGERS="$DATA_LOGGERS,weatherstation.logger.WebSocketLogger"
DATA_LOGGERS="$DATA_LOGGERS,weatherstation.logger.MySQLLoggerImpl"
#
JAVA_OPTIONS="$JAVA_OPTIONS -Ddata.logger=$DATA_LOGGERS"
# Options for MySQL logger
JAVA_OPTIONS="$JAVA_OPTIONS -Dws.between.logs=600000"
JAVA_OPTIONS="$JAVA_OPTIONS -Dmysql.logger.verbose=true"
# Option for TCP logger
JAVA_OPTIONS="$JAVA_OPTIONS -Dstation.lat=37.7489 -Dstation.lng=-122.5070"
#
# JAVA_OPTIONS="$JAVA_OPTIONS -client -agentlib:jdwp=transport=dt_socket,server=y,address=1044"
#
echo -e "JAVA_OPTIONS are $JAVA_OPTIONS"
echo -e "Make sure the server is started (node/weather.server.js) if needed."
# ADDR=`hostname`
ADDR=`ifconfig wlan0 2> /dev/null  | awk '/inet addr:/ {print $2}' | sed 's/addr://'`
echo -e "then from your browser, reach http://$ADDR:9876/data/weather.station/analog.all.html"
#
sudo java $JAVA_OPTIONS -cp $CP weatherstation.ws.HomeWeatherStation