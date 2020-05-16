module.exports = {
  siteMetadata: {
    title: `Patryk Andrzejewski Blog`,
    author: {
      name: `Patryk Andrzejewski`,
      summary: `I'm a software engineer who is fascinated with new technologies and creating a modern software. Mainly I do #javascript #react and #vue but... programming is a tool, so i try to force it to solve my problems by adjusting technology to myself, not myself to the technology.`,
    },
    siteUrl: `https://andrzejewsky.com`,
    description: 'Patryk Andrzejewski blog',
    social: {
      twitter: { username: 'andrzejewskyy', link: 'https://twitter.com/andrzejewskyy' },
      linked: { username: 'patryk-andrzejewski',  link: 'https://www.linkedin.com/in/patryk-andrzejewski' },
      github: { username: 'andrzejewsky',  link: 'https://github.com/andrzejewsky' },
      devto: { username: 'andrzejewsky',  link: 'https://dev.to/andrzejewsky' },
      medium: { username: 'patrykandrzejewski',  link: 'https://medium.com/@patrykandrzejewski' },
    },
  },
  plugins: [
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-166877894-1`,
      },
    },
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsby Starter Blog`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/gatsby-icon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-sitemap`
  ],
}
