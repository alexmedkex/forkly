import React from 'react'

export const ConfirmDelete = ({ template }: { template: string }) => {
  return (
    <p>
      Are you sure you want to delete the template <strong>{template}</strong>? This action can't be undone
    </p>
  )
}
