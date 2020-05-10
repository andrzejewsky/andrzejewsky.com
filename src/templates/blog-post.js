import React from "react"
import { Link, graphql } from "gatsby"
import Bio from "../components/Bio"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import { rhythm, scale } from "../utils/typography"
import styled from "styled-components"

const MainHeading = styled.h1`
  margin-top: ${rhythm(1)};
  margin-bottom: 0;
`

const PostDate = styled.p`
  ${scale(-1 / 5)}
  display: block;
  margin-bottom: ${rhythm(1)};
`

const BottomLine = styled.hr`
  margin-bottom: ${rhythm(1)}
`

const NavList = styled.ul`
  display: flex;
  flexWrap: wrap;
  justify-content: space-between;
  list-style: none;
  padding: 0;
`

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  return (
    <Layout location={location} title={siteTitle}>
      <Seo
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article>
        <header>
          <MainHeading>{post.frontmatter.title}</MainHeading>
          <PostDate>{post.frontmatter.date}</PostDate>
        </header>
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
        <BottomLine />
        <footer>
          <Bio />
        </footer>
      </article>

      <nav>
        <NavList>
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </NavList>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
