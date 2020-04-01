export type OptionClickHandler = (event: React.MouseEvent, props: object) => void

export interface DropdownOption {
  onClick: OptionClickHandler
  text: string
  key: string
  value?: string
  content?: string
  disabled?: boolean
  selected?: boolean
  popup?: {
    text: string
    position?:
      | 'top left'
      | 'top right'
      | 'bottom right'
      | 'bottom left'
      | 'right center'
      | 'left center'
      | 'top center'
      | 'bottom center'
  }
}

export const noopClickHandler: OptionClickHandler = (event: React.MouseEvent, props: object) => void 0

export const VIEW: DropdownOption = {
  key: 'view',
  text: '',
  value: 'View',
  content: 'View',
  onClick: noopClickHandler
}

export const EDIT: DropdownOption = {
  key: 'edit',
  text: '',
  value: 'Edit',
  content: 'Edit',
  onClick: noopClickHandler
}

export const DELETE: DropdownOption = {
  key: 'delete',
  text: '',
  value: 'Delete',
  content: 'Delete',
  onClick: noopClickHandler
}

export const DOWNLOAD: DropdownOption = {
  selected: false,
  key: 'download',
  text: '',
  value: 'Download',
  content: 'Download',
  onClick: noopClickHandler
}

export const DOWNLOAD_ALL: DropdownOption = {
  selected: false,
  key: 'downloadAll',
  text: '',
  value: 'Download all',
  content: 'Download all',
  onClick: noopClickHandler
}

export const View: DropdownOption = {
  key: 'view',
  text: '',
  value: 'View',
  content: 'View',
  onClick: noopClickHandler
}

export const SHARE: DropdownOption = {
  key: 'share',
  text: '',
  value: 'Share',
  content: 'Share',
  onClick: noopClickHandler
}

export const SHARE_ALL: DropdownOption = {
  key: 'shareAll',
  text: '',
  value: 'Share all',
  content: 'Share all',
  onClick: noopClickHandler
}

export const PRESENT: DropdownOption = {
  key: 'present',
  text: '',
  value: 'Present',
  content: 'Present',
  onClick: noopClickHandler
}

export const REVOKE: DropdownOption = {
  key: 'revoke',
  text: 'Revoke Access',
  onClick: noopClickHandler,
  disabled: true
}

export const defaultDropdownOptions = {
  // view: VIEW,
  // edit: EDIT,
  delete: DELETE,
  download: DOWNLOAD,
  share: SHARE,
  revoke: REVOKE
}
