//
//  select-report-suite
//
//  Created by Dylan Depass & Dragos Dascalita Haut on 2017-02-23.
//  Copyright (c) 2017 Adobe. All rights reserved.
//

'use strict';
var Alexa = require('alexa-sdk');                                                   //Alexa SDK

var states = {
    STATE_RSID_SELECTION: '_STATE_RSID_SELECTION',
    STATE_QUERY         : '_STATE_QUERY'
};

var APP_ID = null; /* ignored in this demo */

var API_KEY = ''; /* provided */
var ANALYTICS_COMPANY = ''; /* provided */

//Speech strings
var languageStrings = {
    "en-US": {
        "translation": {
            "WELCOME" : "Welcome to Adobe Analytics.. Which report suite would you like to use? %s.",
            "WELCOME_REPROMPT" : "You can choose from the following report suites %s.",
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
function getReportSuites(token, reportSuitesResponseCallback){
    //Create API headers
    var headers = { "Authorization" : "Bearer " + token,
        "x-api-key" : API_KEY,
        "x-proxy-company" : ANALYTICS_COMPANY };

    var analytics = require('adobe-analytics');

    analytics.config(headers).then(function(api){
        api.collections.findAll({expansion:"name", limit:"50"}).then(function(result)
        {
            var data = JSON.parse(result["data"]);
            var reportSuites = data.content;
            console.log(JSON.stringify(reportSuites));
            reportSuitesResponseCallback(null, reportSuites);
        })
    })
}

function main(event) {
    console.log('ALEXA Event', event.request.type + '!');
    
    API_KEY = event.analytics_api_key; /* default parameter for the action */
    ANALYTICS_COMPANY = event.analytics_company; /* default parameter for the action */
    
    return new Promise(
        (resolve, reject) => {
            try {
                var alexaSDK = Alexa.handler(event,
                    {
                        succeed: resolve
                    });
                alexaSDK.APP_ID = APP_ID;
                alexaSDK.resources = languageStrings;
                alexaSDK.registerHandlers(newSessionHandlers);
                return alexaSDK.execute();                
            } catch (err) {
                console.log(err);
                reject(err.toString());
            }
        });
}

exports.default=main;
