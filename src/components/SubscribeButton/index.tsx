import { useRouter } from 'next/router'

import { signIn, useSession } from 'next-auth/react'

import { api } from '../../services/api'

import { getStripeJs } from '../../services/stripe-js'

import styles from './styles.module.scss'

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {

  const { data: session } = useSession()

  const router = useRouter() // whenever you need to redirect the user through a function or in a programmatic way and not by a button that he clicks or a link, you should always use the nextJS 'useRouter'

  async function handleSubscribe() {
    if(!session) {
      signIn('github')
      return
    }

    if(session.activeSubscription) {
      router.push('/posts')
      return
    }

    try {
      const response = await api.post('/subscribe')

      console.log(response.data)

      const { sessionId } = response.data

      const stripe = await getStripeJs()

      await stripe.redirectToCheckout({ sessionId: sessionId })
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <button 
      type="button" 
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}