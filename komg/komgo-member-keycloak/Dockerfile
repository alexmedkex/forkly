FROM jboss/keycloak:4.5.0.Final

USER root

# Yum install of the packages below is to fix image vulnerabilities flagged up in harbor
RUN yum install -y bind-license \
                    bind-utils \
                    dracut \
                    glib2 \
                    glibc \
                    glibc-common \
                    gnupg2 \
                    java-1.8.0-openjdk \
                    java-1.8.0-openjdk-devel \
                    java-1.8.0-openjdk-headless \
                    krb5-libs \
                    libgcc \
                    libstdc++ \
                    nmap-ncat \
                    openssl \
                    openssl-libs \
                    perl \
                    perl-libs \
                    perl-macros \
                    perl-Pod-Escapes \
                    procps-ng \
                    python \
                    python-libs \
                    setup \
                    systemd \
                    systemd-libs \
                    yum-plugin-fastestmirror \
                    yum-plugin-ovl \
                    yum-utils && \
    yum remove -y git perl-Git

USER 1000

COPY themes /opt/jboss/keycloak/themes/
# uncomment for hot reload css
# COPY standalone/configuration/* /opt/jboss/keycloak/standalone/configuration/
COPY scripts/* /opt/jboss/keycloak/bin/scripts/
COPY docker-entrypoint.sh /opt/jboss/tools/docker-entrypoint.sh
