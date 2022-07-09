import { GetStaticProps } from 'next'

import Head from 'next/head'

import { stripe } from '../services/stripe'

import { SubscribeButton } from '../components/SubscribeButton'

import styles from '../styles/home.module.scss'

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about <br /> the <span>React</span> world</h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1KPUbxEa9DWIVKt7gEVdINnK')
  
  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100), // prices are usually saved in cents in the databases, so the need to divide by 100
  } 

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}

// 3 main ways to make an api call in React/Next.js 

// Client-side/Single-page Application (SPA) -> page that needs information that is loaded with some user action and not necessarily when the page is loaded/information that sometimes has no need to already be there when the page is loaded or that do not need indexing/SEO
// Server-side (SSR) -> page that need dynamic user session data/real-time information from the user who is accessing, from the context of the request, and who need indexing/SEO
// Static Site Generation (SSG) -> page that will be the same for all users and that need indexing/SEO