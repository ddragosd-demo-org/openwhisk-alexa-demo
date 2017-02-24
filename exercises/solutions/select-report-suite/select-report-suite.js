//
//  select-report-suite
//
//  Created by Dylan Depass & Dragos Dascalita Haut on 2017-02-23.
//  Copyright (c) 2017 Adobe. All rights reserved.
//

var Alexa = require('alexa-sdk');                                                   //Alexa SDK

var states = {
    STATE_RSID_SELECTION: '_STATE_RSID_SELECTION',
    STATE_QUERY: '_STATE_QUERY'
};

var APP_ID = null;
/* ignored in this demo */

var API_KEY = '';
/* provided */
var ANALYTICS_COMPANY = '';
/* provided */

//Speech strings
var languageStrings = {
    "en-US": {
        "translation": {
            "WELCOME": "Welcome to Adobe Analytics test.. Which report suite would you like to use? %s.",
            "WELCOME_REPROMPT": "You can choose from the following report suites %s.",
            "YOU_ARE_WELCOME" : "My pleasure, have a fantastic day!",
            "UNKNOWN_COMMAND_RSID_SELECTION" : "I'm sorry, I could not find that report suite. Which report suite would you like to use? %s.",
            "UNKNOWN_COMMAND_REPROMPT_RSID_SELECTION" : "Which report suite would you like to use? %s.",
            "HELP_MESSAGE_RSID_SELECTION" : "I am able to answer questions about metrics from your Adobe Analytics report suites. First we must select a report suite. Which report suite would you like to use? %s.",
            "HELP_REPROMPT_RSID_SELECTION" : "Which report suite would you like to use? %s.",
            "STOP_MESSAGE" : "Goodbye!"
        }
    }
};

// Create default handlers
var newSessionHandlers = {
    'LaunchRequest': function () {
        //Skill was launched

        //Set RSID selection state
        this.handler.state = states.STATE_RSID_SELECTION;

        //Store local scope
        var that = this;

        //Get a list of report suites
        getReportSuites(this.event.session.user.accessToken, function reportSuitesResponseCallback(err, reportSuites) {
            //Get a comma separated list of the report suites
            var reportSuiteList = getReportsSuitesListFromObject(reportSuites);
            console.log("Reportsuite list " + reportSuiteList);

            that.attributes['reportSuites'] = reportSuites;
            that.attributes['speechOutput'] = that.t("WELCOME", reportSuiteList);
            that.attributes['repromptSpeech'] = that.t("WELCOME_REPROMPT", reportSuiteList);
            that.emit(':ask', that.attributes['speechOutput'], that.attributes['repromptSpeech']);
        });
    }
};

// Create a new handler for the report suite selection state
var rsidSelectionHandlers = Alexa.CreateStateHandler(states.STATE_RSID_SELECTION, {
    'LaunchRequest': function () {
        this.emit('LaunchRequest'); // Uses the handler in newSessionHandlers
    },
    'ReportSuiteSelectionIntent': function () {
        console.log("ReportSuiteSelectionIntent Started");

        //Get all the reports suites loaded during this session
        var reportSuites = this.event.session.attributes.reportSuites;

        response.emit(':tell', "You will have to program me to select a reportig suite.");
    },
    'ThankYouIntent': function () {
        //User ask for something we are unable to answer
        var speechOutput = this.t("YOU_ARE_WELCOME");
        this.emit(':tell', speechOutput);
    },
    'Unhandled': function () {
        //Get a comma separated list of the report suites
        var reportSuites = this.event.session.attributes.reportSuites;
        var reportSuiteList = getReportsSuitesListFromObject(reportSuites);

        //User ask for something we are unable to answer
        var speechOutput = this.t("UNKNOWN_COMMAND_RSID_SELECTION", reportSuiteList);
        var reprompt = this.t("UNKNOWN_COMMAND_REPROMPT_RSID_SELECTION", reportSuiteList);
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.HelpIntent': function () {
        //Get a comma separated list of the report suites
        var reportSuites = this.event.session.attributes.reportSuites;
        var reportSuiteList = getReportsSuitesListFromObject(reportSuites);

        //User asked for help
        var speechOutput = this.t("HELP_MESSAGE_RSID_SELECTION", reportSuiteList);
        var reprompt = this.t("HELP_REPROMPT_RSID_SELECTION", reportSuiteList);
        this.emit(':ask', speechOutput, reprompt);
    },
    "AMAZON.StopIntent": function () {
        //User stopped the skill
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    "AMAZON.CancelIntent": function () {
        //User cancelled the skill
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
});

/**
 * Returns a comma separated list of report suites loaded..
 */
function getReportsSuitesListFromObject(reportSuites) {
    var reportSuiteList = '';
    for (var key in reportSuites) {
        var reportSuite = reportSuites[key];
        reportSuiteList += reportSuite.name + ", ";
    }

    return reportSuiteList;
}

/**
 * Get the list of report suites
 */
function getReportSuites(token, reportSuitesResponseCallback) {
    //Create API headers
    var headers = {
        "Authorization": "Bearer " + token,
        "x-api-key": API_KEY,
        "x-proxy-company": ANALYTICS_COMPANY
    };

    var analytics = require('adobe-analytics');

    analytics.config(headers).then(function (api) {
        api.collections.findAll({expansion: "name", limit: "50"}).then(function (result) {
            var data = JSON.parse(result["data"]);
            var reportSuites = data.content;
            console.log(JSON.stringify(reportSuites));
            reportSuitesResponseCallback(null, reportSuites);
        })
    })
}

var main = function (event) {
    console.log('ALEXA Event', event.request.type + '!');

    API_KEY = event.analytics_api_key;
    /* default parameter for the action */
    ANALYTICS_COMPANY = event.analytics_company;
    /* default parameter for the action */

    return new Promise(
        (resolve, reject) => {
            try {
                var alexaSDK = Alexa.handler(event,
                    {
                        succeed: resolve,
                        fail: reject
                    });
                alexaSDK.APP_ID = APP_ID;
                alexaSDK.resources = languageStrings;
                alexaSDK.registerHandlers(newSessionHandlers, rsidSelectionHandlers);
                return alexaSDK.execute();
            } catch (err) {
                console.log(err);
                reject(err.toString());
            }
        });
};
