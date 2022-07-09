import { useEffect } from 'react'

import { GetStaticPaths, GetStaticProps } from 'next'

import { useRouter } from 'next/router'

import Head from 'next/head'

import Link from 'next/link'

import { useSession } from 'next-auth/react'

import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../../services/prismic'

import styles from './styles.module.scss'

type Post = {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface PostPreviewProps {
  post: Post;
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data: session } = useSession() 

  const router = useRouter()

  useEffect(() => {
    if(session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [session])

  return (
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>

          <div 
            className={`${styles.content} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            
              <Link href='/'>
                <a>Subscribe now 🤗</a>
              </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // when you want the pages to be statically generated when the user first accesses it, leave this array empty
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => { // every page that can be public can be static
  const { slug } = params

  const prismic = getPrismicClient()

  const response = await prismic.getByUID<any>('post', String(slug), {}) // when typing some variable can be an array or not and you know it's not going to be an array, one way around typescript is to use 'String()' around that variable to ensure that it's going to be just one and not multiple

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)), // that way it will pick up only the first three items/blocks of content that exists within the content of the post
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30 // 30 minutes
  }
}