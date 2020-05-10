import React from "react"
import styled from "styled-components"
import { rhythm, scale } from "../../utils/typography"

const MainHeading = styled.h1`
  ${scale(1.5)};
  margin-bottom: ${rhythm(1.5)};
  margin-top: 0;
`

const SubHeading = styled.h3`
  font-family: Montserrat, sans-serif;
  margin-top: 0;
`

const Heading = ({ location, ...props }) => {
  const rootPath = `${__PATH_PREFIX__}/`

  if (location.pathname === rootPath) {
    return <MainHeading {...props} />;
  }

  return <SubHeading {...props} />;
}

export default Heading;
