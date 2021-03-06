#
# Debian Jessie Desktop (MATE) Dockerfile with QGIS
#
# https://github.com/DigitalGlobe/debian-desktop
#
# Pull base image.
FROM x11docker/mate
# FROM debian:jessie
#
# To run on a laptop.
# Demoes Python and TensorFlow.
# With VNC
#
LABEL maintainer="Olivier LeDiouris <olivier@lediouris.net>"
#
# Uncomment if running behind a firewall (also set the proxies at the Docker level to the values below)
# ENV http_proxy http://www-proxy.us.oracle.com:80
# ENV https_proxy http://www-proxy.us.oracle.com:80
# # ENV ftp_proxy $http_proxy
# ENV no_proxy "localhost,127.0.0.1,orahub.oraclecorp.com,artifactory-slc.oraclecorp.com"
#
RUN \
  apt-get update && \
  apt-get upgrade -y && \
  DEBIAN_FRONTEND=noninteractive apt-get install --fix-missing -y mate-desktop-environment-core curl git build-essential default-jdk sysvbanner vim tightvncserver && \
  rm -rf /var/lib/apt/lists/*
#
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y procps net-tools wget
#
RUN echo "deb http://qgis.org/debian jessie main" >> /etc/apt/sources.list
RUN mkdir ~/.vnc && echo "mate" | vncpasswd -f >> ~/.vnc/passwd && chmod 600 ~/.vnc/passwd
#
RUN apt-get install -y chromium
RUN echo "deb http://qgis.org/debian jessie main" >> /etc/apt/sources.list
#
RUN apt-get install -y python-pip python-dev
RUN apt-get install -y python3-pip python3-dev
#
RUN pip3 install tensorflow-gpu
RUN pip3 install tensorflow
#
RUN apt-get install -y cmake unzip pkg-config libopenblas-dev liblapack-dev
RUN apt-get install -y python-numpy python-scipy python-matplotlib python-yaml
RUN python3 -mpip install matplotlib
RUN apt-get install -y libhdf5-serial-dev python-h5py
RUN apt-get install -y graphviz
RUN pip install pydot-ng
#
RUN apt-get install -y python-opencv
RUN apt-get install -y python3-tk
#
EXPOSE 5901
#
RUN pip install keras
#
RUN echo "alias ll='ls -lisah'" >> $HOME/.bash_aliases
#
RUN echo "banner TensorFlow" >> $HOME/.bash_aliases
RUN echo "git --version" >> $HOME/.bash_aliases
RUN echo "echo -n 'node:' && node -v" >> $HOME/.bash_aliases
RUN echo "echo -n 'npm:' && npm -v" >> $HOME/.bash_aliases
RUN echo "java -version" >> $HOME/.bash_aliases
RUN echo "vncserver -version" >> $HOME/.bash_aliases
RUN echo "lsb_release -a" >> $HOME/.bash_aliases
#
RUN echo "echo 'To start VNCserver, type: vncserver :1 -geometry 1280x800 -depth 24'" >> $HOME/.bash_aliases
RUN echo "echo '                       or vncserver :1 -geometry 1440x900 -depth 24'" >> $HOME/.bash_aliases
RUN echo "echo '                       or vncserver :1 -geometry 1680x1050 -depth 24 , ...etc.'" >> $HOME/.bash_aliases
#
USER root
WORKDIR /root
RUN mkdir workdir
WORKDIR /root/workdir
#
RUN git clone https://github.com/fchollet/keras
WORKDIR /root/workdir/keras
RUN python3 setup.py install
#
RUN mkdir ./examples/oliv
# From local file system to image
COPY ./tensorflow ./examples/oliv
#    |            |
#    |            In the Docker image
#    On the host (this machine)
#
ENV http_proxy ""
ENV https_proxy ""
ENV no_proxy ""
#
CMD ["echo", "Happy TensorFlowing!"]
