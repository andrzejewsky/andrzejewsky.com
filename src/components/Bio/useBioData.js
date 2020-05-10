import { useStaticQuery, graphql } from "gatsby"

const useBioData = () => {
  const bioData = useStaticQuery(graphql`
    fragment socialIcon on File {
      childImageSharp {
        fixed(width: 15, height: 15) {
          ...GatsbyImageSharpFixed
        }
      }
    }

    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 80, height: 80) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      devto: file(absolutePath: { regex: "/devto.png/" }) {
        ...socialIcon
      }
      github: file(absolutePath: { regex: "/github.png/" }) {
        ...socialIcon
      }
      linked: file(absolutePath: { regex: "/linked.png/" }) {
        ...socialIcon
      }
      medium: file(absolutePath: { regex: "/medium.png/" }) {
        ...socialIcon
      }
      twitter: file(absolutePath: { regex: "/twitter.png/" }) {
        ...socialIcon
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter {
              username
              link
            }
            linked {
              username
              link
            }
            github {
              username
              link
            }
            devto {
              username
              link
            }
            medium {
              username
              link
            }
          }
        }
      }
    }
  `)

  const { author, social } = bioData.site.siteMetadata
  const avatar = bioData.avatar.childImageSharp.fixed
  const socialImages = {
    devto: bioData.devto.childImageSharp.fixed,
    github: bioData.github.childImageSharp.fixed,
    linked: bioData.linked.childImageSharp.fixed,
    medium: bioData.medium.childImageSharp.fixed,
    twitter: bioData.twitter.childImageSharp.fixed,
  }

  return { author, social, socialImages, avatar }
}

export default useBioData;
