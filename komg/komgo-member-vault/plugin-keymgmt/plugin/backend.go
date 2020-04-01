package plugin

import (
	"context"
	"sync"

	"github.com/hashicorp/vault/sdk/framework"
	"github.com/hashicorp/vault/sdk/logical"
	"github.com/patrickmn/go-cache"
)

func Factory(ctx context.Context, conf *logical.BackendConfig) (logical.Backend, error) {
	backend := newBackend()
	// backend.Setup(ctx, conf)
	return backend, nil
}

func newBackend() *backend {
	keymgmtBackend := &backend{}
	keymgmtBackend.Backend = &framework.Backend{
		Help: backendHelp,
		Paths: []*framework.Path{
			keymgmtBackend.pathConfig(),
			keymgmtBackend.pathRsa(),
		},
		PathsSpecial: &logical.Paths{
			SealWrapStorage: []string{
				configPath,
				credPrefix,
			},
		},
		Invalidate:  keymgmtBackend.Invalidate,
		BackendType: logical.TypeLogical,
	}

	return keymgmtBackend
}

type backend struct {
	logical.Backend

	roleCache      *cache.Cache
	credCache      *cache.Cache
	credLock       sync.Mutex
	rotateRootLock *int32
}

func (b *backend) Invalidate(ctx context.Context, key string) {
	b.invalidateRole(ctx, key)
	b.invalidateCred(ctx, key)
}

// // Wraps the *util.SecretsClient in an interface to support testing.
// type secretsClient interface {
// 	Get(conf *client.KeymgmtConf, serviceAccountName string) (*client.Entry, error)
// 	GetPasswordLastSet(conf *client.KeymgmtConf, serviceAccountName string) (time.Time, error)
// 	UpdatePassword(conf *client.KeymgmtConf, serviceAccountName string, newPassword string) error
// 	UpdateRootPassword(conf *client.KeymgmtConf, bindDN string, newPassword string) error
// }

const backendHelp = `
The Active Directory (AD) secrets engine rotates AD passwords dynamically,
and is designed for a high-load environment where many instances may be accessing
a shared password simultaneously. With a simple set up and a simple creds API,
it doesn't require instances to be manually registered in advance to gain access. 
As long as access has been granted to the creds path via a method like 
AppRole, they're available.

Passwords are lazily rotated based on preset TTLs and can have a length configured to meet 
your needs.
`
