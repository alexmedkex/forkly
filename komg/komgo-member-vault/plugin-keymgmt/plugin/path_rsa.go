package plugin

import (
	// "context"
	// "errors"
	// "fmt"
	// "math"
	// "time"

	"github.com/hashicorp/vault/sdk/framework"
	"github.com/hashicorp/vault/sdk/logical"
	// "gitlab.com/ConsenSys/client/uk/KomGo/vault-plugin-keymgmt/plugin/util"
)

func (b *backend) pathRsa() *framework.Path {
	return &framework.Path{
		Pattern: "rsa",
		Fields: map[string]*framework.FieldSchema{
			"name": {
				Type:        framework.TypeString,
				Description: "Name of the key",
			},
		},
		Callbacks: map[logical.Operation]framework.OperationFunc{
			logical.UpdateOperation: b.configUpdateOperation,
			logical.ReadOperation:   b.configReadOperation,
			logical.DeleteOperation: b.configDeleteOperation,
		},
		HelpSynopsis:    rsaPathHelpSynopsis,
		HelpDescription: rsaPathHelpDescription,
	}
}

const (
	rsaPathHelpSynopsis = `Rsa help Synopsis. Complete this text....`

	rsaPathHelpDescription = `Rsa path help description. To be completed`
)
