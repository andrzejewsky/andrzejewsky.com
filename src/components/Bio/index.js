import React from "react"
import Image from "gatsby-image"
import styled from "styled-components"
import { rhythm } from "../../utils/typography"
import useBioData from './useBioData'

const Container = styled.div`
  display: flex;
  margin-bottom: ${rhythm(2.5)};
`

const Summary = styled.div`
  p {
    margin-bottom: 0;
  }

  div {
    font-style: italic;
  }
`

const Avatar = styled(Image)`
  margin-right: ${rhythm(1 / 2)};
  margin-bottom: 0;
  min-width: 80px;
  border-radius: 100%;
  border: 2px solid #60b8f3;
`

const SocialIcon = styled(Image)``
const SocialLink = styled.a`
  text-decoration: none;
  box-shadow: none;
  margin: 0 3px;

  &:first-child {
    margin-left: 10px;
  }
`

const Bio = () => {
  const { author, social, avatar, socialImages } = useBioData()
  console.log(social);

  const socialIcons = Object.keys(socialImages).map(key => (
    <SocialLink href={social[key].link} target="_blank" alt={social[key].username}>
      <SocialIcon fixed={socialImages[key]} />
    </SocialLink>
  ))
  return (
    <Container>
      <Avatar
        fixed={avatar}
        alt={author.name}
        imgStyle={{ borderRadius: `50%` }}
      />
      <Summary>
        <p>Written by <strong>{author.name}</strong></p>
        <div>
          {author.summary}
          {socialIcons}
        </div>
      </Summary>
    </Container>
  )
}

export default Bio
