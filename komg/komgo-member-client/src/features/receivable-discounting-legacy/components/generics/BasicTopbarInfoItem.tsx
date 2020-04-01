import React from 'react'

interface BasicTopbarInfoItemProps {
  title: string
  value: string
}

export const BasicTopbarInfoItem: React.FC<BasicTopbarInfoItemProps> = ({ title, value }) => {
  return (
    <>
      <p>{title}: </p>
      <p data-test-id={`topbar-${title.replace(/\s+/g, '-').toLocaleLowerCase()}-value`}>{value}</p>
    </>
  )
}
