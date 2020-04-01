import React from 'react'
import Helmet from 'react-helmet'
import { Header } from 'semantic-ui-react'

interface IPageProps {
  title: string
  header?: string
}

export const Page: React.FC<IPageProps> = ({ title, header, children }) => (
  <>
    <Helmet>
      <title>{title}</title>
    </Helmet>
    <Header as="h1" content={header !== undefined ? header : title} />
    {children}
  </>
)
