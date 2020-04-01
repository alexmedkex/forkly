package plugin

type keymgmtConf struct {
	TTL          int `json:"ttl"`
	RSAKeyLength int `json:"rsa_key_length"`
}

func (c *keymgmtConf) Map() map[string]interface{} {
	return map[string]interface{}{
		"ttl":            c.TTL,
		"rsa_key_length": c.RSAKeyLength,
	}
}
