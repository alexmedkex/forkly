package plugin

import (
	"context"
	"errors"

	"github.com/hashicorp/vault/sdk/framework"
	"github.com/hashicorp/vault/sdk/logical"
)

const (
	configPath       = "config"
	configStorageKey = "config"

	// This length is arbitrarily chosen but should work for
	// most Active Directory minimum and maximum length settings.
	// A bit tongue-in-cheek since programmers love their base-2 exponents.
	defaultPasswordLength = 64

	defaultRsaKeyLength = 4096

	defaultTLSVersion = "tls12"
)

func (b *backend) readConfig(ctx context.Context, storage logical.Storage) (*configuration, error) {
	entry, err := storage.Get(ctx, configStorageKey)
	if err != nil {
		return nil, err
	}
	if entry == nil {
		return nil, nil
	}
	config := &configuration{&keymgmtConf{}}
	if err := entry.DecodeJSON(config); err != nil {
		return nil, err
	}
	return config, nil
}

func (b *backend) pathConfig() *framework.Path {
	return &framework.Path{
		Pattern: configPath,
		Fields:  b.configFields(),
		Callbacks: map[logical.Operation]framework.OperationFunc{
			logical.UpdateOperation: b.configUpdateOperation,
			logical.ReadOperation:   b.configReadOperation,
			logical.DeleteOperation: b.configDeleteOperation,
		},
		HelpSynopsis:    configHelpSynopsis,
		HelpDescription: configHelpDescription,
	}
}

func (b *backend) configFields() map[string]*framework.FieldSchema {
	return map[string]*framework.FieldSchema{
		`ttl`: {
			Type:        framework.TypeDurationSecond,
			Description: "In seconds, the default password time-to-live.",
		},
		`rsa_key_length`: {
			Type:        framework.TypeInt,
			Description: "Size of the RSA key",
			Default:     defaultRsaKeyLength,
		},
	}
}

func (b *backend) configUpdateOperation(ctx context.Context, req *logical.Request, fieldData *framework.FieldData) (*logical.Response, error) {
	// Build the ttl conf.
	ttl := fieldData.Get("ttl").(int)
	rsa_key_length := fieldData.Get("rsa_key_length").(int)

	if ttl == 0 {
		ttl = int(b.System().DefaultLeaseTTL().Seconds())
	}

	if ttl < 1 {
		return nil, errors.New("ttl must be positive")
	}

	keymgmtConf := &keymgmtConf{
		TTL:          ttl,
		RSAKeyLength: rsa_key_length,
	}

	config := &configuration{keymgmtConf}
	entry, err := logical.StorageEntryJSON(configStorageKey, config)
	if err != nil {
		return nil, err
	}
	if err := req.Storage.Put(ctx, entry); err != nil {
		return nil, err
	}

	// Respond with a 204.
	return nil, nil
}

func (b *backend) configReadOperation(ctx context.Context, req *logical.Request, _ *framework.FieldData) (*logical.Response, error) {
	config, err := b.readConfig(ctx, req.Storage)
	if err != nil {
		return nil, err
	}
	if config == nil {
		return nil, nil
	}

	configMap := map[string]interface{}{
		"ttl":            config.KeymgmtConf.TTL,
		"rsa_key_length": config.KeymgmtConf.RSAKeyLength,
	}

	for k, v := range config.KeymgmtConf.Map() {
		configMap[k] = v
	}

	resp := &logical.Response{
		Data: configMap,
	}
	return resp, nil
}

func (b *backend) configDeleteOperation(ctx context.Context, req *logical.Request, _ *framework.FieldData) (*logical.Response, error) {
	if err := req.Storage.Delete(ctx, configStorageKey); err != nil {
		return nil, err
	}
	return nil, nil
}

const (
	configHelpSynopsis = `
Configure the KeyMgmt server to connect to, along with password options.
`
	configHelpDescription = `
This endpoint allows you to configure the KeyMgmt server to connect to and its
configuration options. When you add, update, or delete a config, it takes
immediate effect on all subsequent actions. It does not apply itself to roles
or creds added in the past.
`
)
