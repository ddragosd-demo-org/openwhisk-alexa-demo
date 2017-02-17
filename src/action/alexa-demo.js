/**
 * Handler for Amazon Alexa.
 * SAMPLE EVENT:
 *
 {
   "session": {
     "sessionId": "SessionId.baae4592-3194-463d-a1bf-a4cea0622913",
     "application": {
       "applicationId": "amzn1.ask.skill.647acd60-f1e7-4f77-9d5e-90c4a4cdfd76"
     },
     "attributes": {},
     "user": {
       "userId": "amzn1.ask.account.AFP3ZWPOS2BGJR7OWJZ3DHPKMOMCKURC2K6A2PLLNCMHBXRN7PSIZJIGE5Y2WGEAVZLBLUK4ZLWURQ2ZOW6WPFLWKVH6XC24ADTVXQULVDJ25JA6T2KU2S6CCJKBMMBDJWB7B5PILJABBQCW6R4X5NRHBVTDGYSLXJWZ3ICZROKXBOPFJBFLUDGLPGBITLPFBXI4UYMSGV6IWYY"
     },
     "new": true
   },
   "request": {
     "type": "IntentRequest",
     "requestId": "EdwRequestId.55f5f621-00a1-46fe-a0bb-130a58ff94a7",
     "locale": "en-US",
     "timestamp": "2016-10-20T04:56:11Z",
     "intent": {
       "name": "AMAZON.HelpIntent",
       "slots": {}
     }
   },
   "version": "1.0"
 }
 */

var AlexaSDK = require('alexa-sdk');
var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', 'Welcome to Adobe Analytics.. Which report suite would you like to use?' + getReportSuites(), "You can choose from the following report suites" + getReportSuites());
    },    
    'ReportSuiteSelectionIntent': function () {

        this.emit(':ask', 'Ok. How can I help you?', 'I can currently tell you information about X, Y and Z');
    },    
    'OneshotReportIntent': function () {

        this.emit(':tell', 'One shot report intent.. Metric is ' + this.event.request.intent.slots.Metric.value + '. Duration is ' + this.event.request.intent.slots.Duration.value);
    },    
    'ThankYouIntent': function () {

        this.emit(':tell', 'My pleasure, Goodbye');
    },
    'Unhandled': function () {
        this.emit(':tell', 'Unhandled');
    }
};

function getReportSuites(){
  return "Adobe I/O Portal, Bladerunner Lab";
}

function handleOneshotReportRequest(intent, session, response) {
    // Determine metric, using default if none provided
    var metric = getMetricFromIntent(intent, true),
        repromptText,
        speechOutput;
    if (metric.error) {
        // invalid metric. move to the dialog
        repromptText = "Currently, I can tell you information about the following metrics: " + getAllMetricsText()
            + "Which metric would you like to load?";
        // if we received a value for the incorrect city, repeat it to the user, otherwise we received an empty slot
        speechOutput = "I'm sorry, I don't have any data for that metric.";

        response.ask(speechOutput, repromptText);
        return;
    }

    // Determine custom date
    var duration = getDurationFromIntent(intent);

    // all slots filled, either from the user or by default values. Move to final request
    getFinalReportResponse(intent, metric, duration, response);
}


function main(event) {
    console.log('ALEXA Event', event.request.type + '!');

    return new Promise(
        (resolve, reject) => {
            var alexaSDK = AlexaSDK.handler(event,
                {
                    succeed: resolve
                });
            alexaSDK.registerHandlers(handlers);
            return alexaSDK.execute();
        });
}

export default main;
