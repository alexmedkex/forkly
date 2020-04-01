FROM golang:1.11.11 as builder
# map the following args to env variables
# this is needed for build.sh
ARG VAULT_GIT_COMMIT
ARG VAULT_GIT_DIRTY
ENV GIT_COMMIT VAULT_GIT_COMMIT
ENV GIT_DIRTY VAULT_GIT_DIRTY

# copy plugin source code to this golang builder container
# compile and generate plugin binary
RUN mkdir -p $GOPATH/src/gitlab.com/ConsenSys/client/uk/KomGo/komgo-member-vault/plugin-keymgmt
COPY ./plugin-keymgmt $GOPATH/src/gitlab.com/ConsenSys/client/uk/KomGo/komgo-member-vault/plugin-keymgmt
WORKDIR $GOPATH/src/gitlab.com/ConsenSys/client/uk/KomGo/komgo-member-vault/plugin-keymgmt
RUN GO111MODULE=off make bootstrap
RUN make fmt
RUN make dev

# prepare custom plugins folder with the generated binary + sha256
RUN mkdir -p /vault/plugins
RUN rm -rf /vault/plugins/*
RUN cp bin/keymgmt /vault/plugins/keymgmt
RUN sh -c 'shasum -a 256 "/vault/plugins/keymgmt" | cut -d " " -f1 > /vault/plugins/keymgmt.sha'

FROM vault:1.1.2
COPY --from=builder /vault/plugins /vault/plugins
COPY vault-api.sh /usr/local/bin/vault-api
