package util

// import (
// 	"encoding/base64"
// 	"fmt"
// 	"strings"

// 	"github.com/hashicorp/go-uuid"
// )

func GenerateRSAKey(totalLength int) (string, error) {
	// if err := ValidatePwdSettings(formatter, totalLength); err != nil {
	// 	return "", err
	// }
	// pwd, err := generatePassword(totalLength)
	// if err != nil {
	// 	return "", err
	// }
	// if formatter == "" {
	// 	pwd = PasswordComplexityPrefix + pwd
	// 	return pwd[:totalLength], nil
	// }
	// return strings.Replace(formatter, PwdFieldTmpl, pwd[:lengthOfPassword(formatter, totalLength)], 1), nil
	return "rsaKey", nil
}

func ValidatePwdSettings(formatter string, totalLength int) error {
	// Check for if there's no formatter.

	// return fmt.Error() if problems

	return nil
}
