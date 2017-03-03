##### Table of Contents
[Settings up](#setting-up)
* [Prepare a GitHub repo](#prepare-a-github-repo)
* [Setup an Amazon Alexa skill](#Setup-an-Amazon-Alexa-Skill)


# Setting up

## Setup your GitHub repo

1. Login or Create an Account on [GitHub](https://github.com)
2. Fork the repository used for the lab from:
    https://github.com/adobe-apiplatform/adobeio-runtime-lab-analytics
    > Make sure the repository is public
3. ##### Configure a new webhook
   Visit your new repo and go to `Settings` > `Webhooks` > `Add webhook`

   Configure the new webhook with the following information:

   Field | Value
   ------------ | -------------
   Payload URL | `https://runtime-preview.adobe.io/github/webhook`
   Content type | _application/json_
   Secret | _( provided during the lab )_
   Which events would you like to trigger this webhook? | _Just the push event._

   ![Github webhook setup](./readmeAssets/github-webhook-setup.png)

   When done click the `Add webhook` button.

   ![Github webhooks view](./readmeAssets/github-webhooks-view.png)

   Once the webhook is saved you should see it listed.


4. ##### Retrieve the URL for your action.
    Click the `Edit` button to go back into the webhook edit screen in order to get the URL to your function.
  Scroll down to see the `Recent deliveries`.
  ![Github recent delivery](./readmeAssets/github-recent-delivery.png) and click on the `...` button or the UID to open the details.
  ![Github recent delivery expanded](./readmeAssets/github-recent-delivery-open.png)
  The `Response` Tab should indicate a `200` Response with a Body containing the  `action_endpoint`.

:boom: Congratulations ! At this point your code is deployed in the Adobe I/O Runtime.

> Make a note of the `action_endpoint` value as you need it in the next step.

## Setup an Amazon Alexa Skill 

1. Login to Amazon Developer Portal at https://developer.amazon.com/
   > The lab should have provided you with access credentials.
2. Select the `Alexa` tab and then click on `Get Started` in Alexa Skill Kit box.
    ![Alexa-selection-ui](./readmeAssets/amazon-alexa-selection.png/)
3. Your Amazon developer account provided for the lab is most likely setup with the `Adobe Analytics Skill` under `You skills` tab.  In this case you can fast forward to step #6 or read bellow how to configure a new skill.
4. ##### Setup general skill info
  ![Skills Info](./readmeAssets/skills_info.png?raw=true )
    * The `Name` field should contain something unique.
    * `Invocation name` is what Alexa uses to start the Skill; for example if the skill is named `Adobe Analytics` you would say _Use Adobe Analytics_ to activate the skill.
    * The global fields can be left with the default value
5. ##### Setup an interaction model
    ![Interaction Model Setup](./readmeAssets/interaction_model.png?raw=true )

    * Paste in the intent schema from [IntentSchema.json](./IntentSchema.json)

    * Create a custom slot for each of the items in [./customSlotTypes](./customSlotTypes). Click `Add Slot Type` and enter a `Type` and the associated `Values` similar to the screenshot bellow:
    ![Edit Slot Type](./readmeAssets/amazon-alexa-custom-slot-type-edit.png)

    * Paste in sample utterances from [SampleUtterances.txt](./SampleUtterances.txt) inside the `Sample utterances` text area.

    > To learn more about Alexa's interaction model see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference

6. ##### Link the Alexa skill with your GitHub code deployed in the Adobe I/O Runtime
   Click the `Configuration` option on the left side menu to see something similar to the screenshot bellow:
    ![Configuration](./readmeAssets/amazon-alexa-setup-endpoint.png )

    * ##### Service Endpoint
      Paste here the value you got after setting up the GitHub webhook to [ Retrieve the URL for your action](Retrieve-the-URL-for-your-action)
      ```
      https://runtime-preview.adobe.io/<...>
      ```
      > Alexa will invoke this URL on each interaction with an end-user.

7. ##### :id: Link the Alexa skill with Adobe ID
    This step configures how users identify in Alexa, particularely how to let them identify with an Adobe ID. This Adobe ID will be used to extract data from Adobe Analytics on user's behalf.
    ![Alexa-setup-account-linking](./readmeAssets/amazon-alexa-link-account.png)

    * Set the Authorization URL to:
      ```
      https://ims-na1.adobelogin.com/ims/authorize/v1
      ```

    * Set the Client ID to the value provided during the lab.

    * Add the following domains to the list
      ```
      ims-na1.adobelogin.com

      adobeid-na1.services.adobe.com
      ```

    * In the scopes field add:
      ```
      openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.job_function,session
      ```
      These scopes are needed to pull data out from Marketing Cloud, Adobe Analytics.

    * Set Authorization Grant type to Implicit
      ```
      NOTE: This should be __Auth Code Grant__. Ran into a problem using the __Auth Code Grant__ so using implicit for the lab. Using Implicit means that the use must re-link their account with the skill every 24 hours.
      ```
