import React from "react"
import { Link, graphql } from "gatsby"
import Bio from "../components/Bio"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import { rhythm } from "../utils/typography"
import styled from "styled-components"

const SubHeading = styled.h3`
  margin-bottom: ${rhythm(1 / 4)};
`

const PostLink = styled(Link)`
  box-shadow: none;
`

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="All posts" />
      <Bio />
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug

        return (
          <article key={node.fields.slug}>
            <header>
              <SubHeading>
                <PostLink to={node.fields.slug}>{title}</PostLink>
              </SubHeading>
              <small>{node.frontmatter.date}</small>
            </header>
            <section>
              <p
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt,
                }}
              />
            </section>
          </article>
        )
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
