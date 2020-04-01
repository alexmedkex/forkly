FROM rabbitmq:3.7.8-management

RUN apt-get update && apt-get install -y curl jq

# Fix CVE-2018-16865
RUN apt-get upgrade -y apt

# Fix CVE-2017-14062
RUN apt upgrade -y libidn2-0

# Fix CVE-2018-18314 CVE-2018-18312 CVE-2018-18311
RUN apt-get upgrade -y perl

# Fix CVE-2017-1000408 CVE-2017-15670 CVE-2017-15804
#     CVE-2017-16997 CVE-2017-18269 CVE-2018-1000001
#     CVE-2018-6485 CVE-2018-6551
RUN DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -t buster libc6

# FIX CVE-2017-12424
RUN apt-get upgrade -y -t buster login passwd

# Fix CVE-2018-15686 CVE-2018-15688 CVE-2018-6954
RUN DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -t buster systemd

# Fix CVE-2018-7409
RUN DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -t buster unixodbc

# Fix CVE-2016-2779
RUN DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -t buster util-linux

# Print versions related with CVE fixes
RUN dpkg-query --show --showformat='${binary:Package}=${Version}\n' libmount1 bsdutils libblkid1 libfdisk1 libuuid1 libsmartcols1 mount libodbc1 libudev1 libsystemd0 login passwd libpython2.7-stdlib libpython2.7-minimal python2.7-minimal perl-base libidn11 libc6 libc-bin multiarch-support libapt-pkg5.0 | sort


COPY config/pre-entrypoint.sh /

COPY config/enabled_plugins config/rabbitmq.conf /etc/rabbitmq/
COPY config/rabbitmq-cluster config/password-hash-gen config/create-admin config/sms-set-lazy-queues config/setup-member /usr/local/bin/

RUN usermod -u 1021 rabbitmq && groupmod -g 1021 rabbitmq && chown -Rf rabbitmq:rabbitmq /var/lib/rabbitmq

USER rabbitmq

EXPOSE 5672 15672 25672 4369 9100 9101 9102 9103 9104 9105
ENTRYPOINT ["/pre-entrypoint.sh"]
CMD ["rabbitmq-cluster"]
