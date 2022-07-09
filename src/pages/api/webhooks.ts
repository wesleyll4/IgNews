/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next"

import { Readable } from 'stream'

import Stripe from "stripe"

import { stripe } from "../../services/stripe"

import { saveSubscription } from "./_lib/manageSubscription"

async function buffer(readable: Readable) {
  const chunks = []

  for await(const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([ // 'Set' is like an array only that can not have anything duplicated inside it, it is a different data structure but ensures that we will treat only the data we want
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async(request: NextApiRequest, response: NextApiResponse) => {
  if(request.method === 'POST') {
    const buf = await buffer(request)
    
    const secret = request.headers['stripe-signature']

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(err) {
      return response.status(400).send(`Webhook error: ${err.message}`)
    }

    const { type } = event

    if(relevantEvents.has(type)) {
      try {
        switch(type) {
          // that way the 2 cases will use the same logic
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            )

            break
          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )

            break
          default: 
            throw new Error('Unhandled event')
        }
      } catch(err) {
        return response.json({ error: 'Webhook handler failed' })
      }
    }

    return response.json({ received: true })
  } else {
    response.setHeader('Allow', 'POST')
    response.status(405).end('Method not allowed')
  }
}