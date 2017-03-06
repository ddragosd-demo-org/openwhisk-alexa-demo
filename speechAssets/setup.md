:clock3:  ~ `15 minutes`

##### Table of Contents
[Setting up](#setting-up)
  * [Set up an action in Adobe I/O Runtime](#set-up-an-action-in-adobe-io-runtime)
  * [Connect the action with an Amazon Alexa skill](#setup-an-amazon-alexa-skill)
[Send the first voice command to your skill](#send-the-first-voice-command-to-your skill)

# Setting up

:clock3:  ~ `15 minutes`

## Set up an action in Adobe I/O Runtime

1. Login or Create an Account on [GitHub](https://github.com)
2. Fork the repository used for the lab from:
    https://github.com/adobe-apiplatform/adobeio-runtime-lab-analytics

    > :bulb: Make sure the repository is public

3. ##### Configure a new webhook

   In this step you'll deploy your own code into Adobe I/O Runtime so that you can respond to Alexa voice commands and extract data from Adobe Analytics in response.

   Visit your new repo and go to `Settings` > `Webhooks` > `Add webhook`
   ![Github webhooks view](./readmeAssets/github-webhooks-view.png)

   Configure the new webhook with the following information:

Field        |    Value
------------ | -------------
Payload URL  | `https://runtime-preview.adobe.io/github/webhook`
Content type | _application/json_
Secret       | _( provided during the lab )_
Which events would you like to trigger this webhook? | _Just the push event._

   When done, click the `Add webhook` button. Once the webhook is saved, you should see it listed.


Click on `Enable` button and login using an Adobe ID.The browser should redirect you now to Adobe's login page.
> You should use the Adobe ID provided during the lab.

<img src="./readmeAssets/adobe-login-screen.png" height="250">

Once login is successful with Adobe, Alexa should confirm it with a message similar to the one in the screenshot below.

<img src="./readmeAssets/adobe-login-success.png" height="150">

To complete this section move on to Exercise 1.
