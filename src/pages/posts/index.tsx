import { GetStaticProps } from 'next'

import Head from 'next/head'

import Link from 'next/link'

import Prismic from '@prismicio/client'

import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic'

import styles from './styles.module.scss'

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[] 
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(post => {
            return (
              <Link key={post.slug} href={`/posts/preview/${post.slug}`} >
                <a>
                  <time>{post.updatedAt}</time>
                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              </Link>
            )
          }) }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query<any>(
    [Prismic.predicates.at("document.type", "post")],
    {
      fetch: ["post.title", "post.content"],
      pageSize: 100,
    }
  );

  // console.log(JSON.stringify(response, null, 2)) // whenever you give the 'console.log' on some object or array that has some cascading internal content (example: 'date: [Object]' | 'slugs: [Array]'), do it this way

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: {
      posts
    }
  }
}