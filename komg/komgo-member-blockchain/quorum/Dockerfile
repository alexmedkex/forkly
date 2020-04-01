FROM ubuntu:16.04 as builder

WORKDIR /work

RUN apt-get update && \
    apt-get install -y \
            build-essential \
            git \
            libdb-dev \
            libsodium-dev \
            libtinfo-dev \
            libleveldb-dev \
            sysvbanner \
            unzip \
            wget \
            wrk \
            zlib1g-dev

RUN wget -q https://github.com/jpmorganchase/constellation/releases/download/v0.3.5-build.1/constellation-0.3.5-ubuntu1604.tar.gz && \
    tar xf constellation-0.3.5-ubuntu1604.tar.gz && \
    cp constellation-node /usr/local/bin && \
    chmod 0755 /usr/local/bin/constellation-node && \
    rm -rf constellation-0.3.5-ubuntu1604.tar.gz constellation-node

ENV GOREL go1.9.3.linux-amd64.tar.gz
ENV PATH $PATH:/usr/local/go/bin

RUN wget -q https://dl.google.com/go/$GOREL && \
    tar xfz $GOREL && \
    mv go /usr/local/go && \
    rm -f $GOREL

RUN git clone https://github.com/jpmorganchase/quorum.git && \
    cd quorum && \
    git checkout tags/v2.1.1 && \
    make all && \
    cp build/bin/geth /usr/local/bin && \
    cp build/bin/bootnode /usr/local/bin && \
    cd .. && \
    rm -rf quorum

RUN git clone https://github.com/Serozd/nodekeytoaddress && \
    cd nodekeytoaddress && \
    make all && \
    cp nodekeytoaddress /usr/local/bin && \
    chmod 0755 /usr/local/bin/nodekeytoaddress && \
    cd .. && \
    rm -rf nodekeytoaddress

RUN git clone https://github.com/Serozd/istanbulextradatagen && \
    cd istanbulextradatagen && \
    make all && \
    cp istanbulextradatagen /usr/local/bin && \
    chmod 0755 /usr/local/bin/istanbulextradatagen && \
    cd .. && \
    rm -rf istanbulextradatagen



### Create the runtime image, leaving most of the cruft behind (hopefully...)

FROM ubuntu:16.04

# Install add-apt-repository
RUN apt-get update && \
    apt-get install -y --no-install-recommends software-properties-common && \
    add-apt-repository ppa:ethereum/ethereum && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        libdb-dev \
        libsodium-dev \
        libtinfo-dev \
        libleveldb-dev \
        solc && \
    rm -rf /var/lib/apt/lists/*

# Temporary useful tools
#RUN apt-get update && \
#        apt-get install -y iputils-ping net-tools vim

COPY --from=builder \
        /usr/local/bin/constellation-node \
        /usr/local/bin/geth \
        /usr/local/bin/bootnode \
        /usr/local/bin/nodekeytoaddress \
        /usr/local/bin/istanbulextradatagen \
    /usr/local/bin/

CMD ["/qdata/start-node.sh"]