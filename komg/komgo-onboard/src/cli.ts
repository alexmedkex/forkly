import meow from 'meow'

export const cli = meow(
  `
Configuration:
  onboard config                              - Show current config status
  onboard config common.hostname   [HOST]     - Common broker host name
  onboard config common.hostport   [PORT]     - Common broker host port
  onboard config common.username   [USERNAME] - Common broker admin username
  onboard config common.password   [PASSWORD] - Common broker admin password
  onboard config routing.username  [USERNAME] - Routing username
  onboard config routing.password  [PASSWORD] - Routing password
  onboard config aws.enabled       [boolean]  - Enable or disable AWS features
  onboard config aws.env.type      [TYPE]     - AWS environment type
  onboard config aws.env.name      [NAME]     - AWS environment name
  onboard config.aws.config.region [REGION]   - AWS config region
  onboard config.aws.config.id     [KEYID]    - AWS secret ID
  onboard config.aws.config.key    [KEY]      - AWS secret key

Third-party platform onboarding (e.g. VAKT):
  onboard platform add [ORGFILE]                             - Add third-party company
  onboard platform rm  [ORGFILE]                             - Remove third-part company
  platform configure-monitoring  [MONFILE]                   - Add monitoring platform
  platform configure-email-notification  [EMAIL-NOTIF-FILE]  - Add email notification platform

Member onboarding (common broker + prepackage JSON file):
  onboard member add [MNID]                    - Add member
  onboard member rm  [MNID]                    - Remove member
  onboard member generate-member-package [PRE-PACKAGE FILE] - Generates onboarding member package from pre-package JSON file

Member onboarding (add keys and store attributes in ENS):
  onboard member add-general        [INPUT JSON FILE] - Add keys of the member and store the input data in ENS
  onboard member get-keys           [INPUT JSON FILE] - Retrieve keys of the member and populate input json with them
  onboard member add-keys           [INPUT JSON FILE] - Add keys of the member
  onboard member add-ens            [INPUT JSON FILE] - Store input of the member in ENS (optional -c ens.vaktonly=true - defaults to false)

Export Komgo address book for Vakt:
  onboard gen-addr-book

Funding account:
  onboard funding [KEYSTORE PATH] [PASSPHRASE] - Imports keystore as funding account
`,
  {
    flags: {
      ['skip-user-creation']: {
        type: 'boolean',
        default: false
      }
    }
  }
)

export type CLI = ReturnType<typeof meow>
