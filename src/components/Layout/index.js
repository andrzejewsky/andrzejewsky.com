import React from "react"
import Heading from './Heading'
import Link from  'gatsby-link';
import styled from 'styled-components'
import { rhythm } from '../../utils/typography'

export const HeadingLink = styled(Link)`
  box-shadow: none;
  color: inherit;
`

export const Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: ${rhythm(28)};
  padding: ${rhythm(1.5)} ${rhythm(3 / 4)};

  img {
    margin-bottom: 0;
  }
`

const Layout = ({ location, title, children }) => (
  <Container>
    <header>
      <Heading location={location}>
        <HeadingLink to="/">{title}</HeadingLink>
      </Heading>
    </header>
    <main>{children}</main>
    <footer>
      © {new Date().getFullYear()}, Built with
      {` `}
      <a href="https://www.gatsbyjs.org">Gatsby</a>
    </footer>
  </Container>
)


export default Layout
