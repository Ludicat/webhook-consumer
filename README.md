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

Please note that container is setup to restart with your system by default.

Troubleshooting
---------------

This tool has been made to be used out of the box with docker compose.
Look at the code and adapt along with your needs.
webhook.ludi.cat just provide a rabbitmq queue, the rest is up to you.

Final word
==========

This tool is 

**!!! DEFINITIVELY NOT SUPPOSED TO BE USED IN PRODUCTION ENVIRONMENT !!!**

This could expose you to a man in the middle attack, so please take care.
