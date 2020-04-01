package plugin

import (
	"context"
	// "fmt"
	"strings"
	"time"

	// "github.com/go-errors/errors"
	"github.com/hashicorp/vault/sdk/framework"
	"github.com/hashicorp/vault/sdk/logical"
	// "gitlab.com/ConsenSys/client/uk/KomGo/vault-plugin-keymgmt/plugin/util"
)

const (
	credPrefix = "creds/"
	storageKey = "creds"

	// Since password TTL can be set to as low as 1 second,
	// we can't cache passwords for an entire second.
	credCacheCleanup    = time.Second / 3
	credCacheExpiration = time.Second / 2
)

// deleteCred fulfills the DeleteWatcher interface in roles.
// It allows the roleHandler to let us know when a role's been deleted so we can delete its associated creds too.
func (b *backend) deleteCred(ctx context.Context, storage logical.Storage, roleName string) error {
	if err := storage.Delete(ctx, storageKey+"/"+roleName); err != nil {
		return err
	}
	b.credCache.Delete(roleName)
	return nil
}

func (b *backend) invalidateCred(ctx context.Context, key string) {
	if strings.HasPrefix(key, credPrefix) {
		roleName := key[len(credPrefix):]
		b.credCache.Delete(roleName)
	}
}

func (b *backend) pathCreds() *framework.Path {
	return &framework.Path{
		Pattern: credPrefix + framework.GenericNameRegex("name"),
		Fields: map[string]*framework.FieldSchema{
			"name": {
				Type:        framework.TypeString,
				Description: "Name of the role",
			},
		},
		Callbacks: map[logical.Operation]framework.OperationFunc{
			logical.ReadOperation: b.credReadOperation,
		},
		HelpSynopsis:    credHelpSynopsis,
		HelpDescription: credHelpDescription,
	}
}

func (b *backend) credReadOperation(ctx context.Context, req *logical.Request, fieldData *framework.FieldData) (*logical.Response, error) {
	return nil, nil
}

func (b *backend) generateAndReturnCreds(ctx context.Context, engineConf *configuration, storage logical.Storage, roleName string, role *backendRole, previousCred map[string]interface{}) (*logical.Response, error) {
	return nil, nil
}

const (
	credHelpSynopsis = `
Retrieve a role's creds by role name.
`
	credHelpDescription = `
Read creds using a role's name to view the login, current password, and last password.
`
)
