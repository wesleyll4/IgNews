import { GetServerSideProps } from 'next'

import Head from 'next/head'

import { getSession } from 'next-auth/react'

import { RichText } from 'prismic-dom'

import { getPrismicClient } from '../../../services/prismic'

import styles from './styles.module.scss'

type Post = {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
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
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req: request, params }) => {
  const session = await getSession({ req: request })

  const { slug } = params

  if(!session?.activeSubscription) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const prismic = getPrismicClient(request)

  const response = await prismic.getByUID<any>('post', String(slug), {}) // when typing some variable can be an array or not and you know it's not going to be an array, one way around typescript is to use 'String()' around that variable to ensure that it's going to be just one and not multiple

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    }
  }
}