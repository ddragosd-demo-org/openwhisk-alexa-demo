##### Table of Contents
[Settings up](#setting-up)
* [Prepare a GitHub repo](#prepare-a-github-repo)
*


# Setting up

## Setup your GitHub repo

1. Login or Create an Account on [GitHub](https://github.com)
2. Fork the repository used for the lab from:
   https://github.com/adobe-apiplatform/adobeio-runtime-lab-analytics
3. ##### Configure a new webhook
   Visit your new repo and go to `Settings` > `Webhooks` > `Add webhook`

   Configure the new webhook with the following information:

   Field | Value
   ------------ | -------------
   Payload URL | `https://runtime-preview.adobe.io/github/webhook`
   Content type | application/json
   Secret | _provided during the lab_
   Which events would you like to trigger this webhook? | Just the push event.

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

:boom: Congratulations ! At this point your code runs in the Adobe I/O Runtime.

## Setup an Amazon Alexa Skill 



### Skills Info Setup
![Skills Info](./readmeAssets/skills_info.png?raw=true )

1. In the name field pick something unique

2. Invocation name is what is used by Alexa to start the Skill, for example if the skill is named "Adobe Analytics" you would say "Use Adobe Analytics" to start the skill.

3. Leave global feilds as default


# Interaction Model Setup
![Interaction Model Setup](./readmeAssets/interaction_model.png?raw=true )

1. Paste in the intent schema from [here](./IntentSchema.json)

2. Create a custom slot for each of the items here [here](./customSlotTypes)
⋅⋅* Type name should match file name, copy contents of file into values

1. Paste in sample utterances from [here](./SampleUtterances.txt)

# Configuration Setup
![Configuration](./readmeAssets/configuration.png?raw=true )

1. Service Endpoint should be HTTPS and point to the I/O Runtime container for the users skill

2. Enable Account Linking

3. Set authorization URL to
```
https://ims-na1.adobelogin.com/ims/authorize/v1
```

4. Client ID should be
```
alexa_analytics_demo_prod
```

5. Add the following domains to the list
```
ims-na1.adobelogin.com

adobeid-na1.services.adobe.com
```

6. Under scopes add
```
openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.job_function,session
```

7. Set Authorization Grant type to Implicit
```
NOTE: This should be __Auth Code Grant__. Ran into a problem using the __Auth Code Grant__ so using implicit for the lab. Using Implicit means that the use must re-link their account with the skill every 24 hours.
```
