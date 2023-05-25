Webhook consumer
================

/!\ Read this file before running anything.

1/ Register
-----------
You must create an account on [webhook.ludi.cat](https://webhook.ludi.cat)
Report your credentials in a `.env.local` file like this

    RABBITMQ_USER=my.email@ludi.cat
    RABBITMQ_PASS=token_myuuid-is-along-string

2/ Create your webhooks
-----------------------
Create a rounting in [webhook.ludi.cat/routing](https://webhook.ludi.cat/routing/) 
This will open a forward endpoint for your webhooks like this 

    https://webhook.ludi.cat/forward/routing-uuid-here

3/ Map your endpoint to local vhost
-----------------------------------
Create a `config.json` file and add a list of endpoints with the related urls to forward data

    {
        "routing-uuid-here": "https://webhook.ludicat.test/_payment/webhook"
    }

4/ Start container with docker compose
--------------------------------------
Run make start

That's all
You'll find user's original IP in header `X-ORIGINAL-IP`
