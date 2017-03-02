# openwhisk-alexa-demo

An OpenWhisk action as an Amazon Alexa Skill.

## Install it in OpenWhisk

1. Using [github-deployer](https://github.com/ddragosd/openwhisk-github-deployer#deploying-an-action-using-github-deployer)
2. Using [wskdeploy](https://github.com/openwhisk/wskdeploy)

## Configure a new Alexa Skill

TBD...

# Alexa Developer Portal Prelab Setup
[Setup Instructions](./speechAssets)

# Lab Exercises

## Exercise 1

In this exercise we will configure Alexa to Respond back with "Hello" followed by your name after the skill is launched. 

### Step 1 
Add code to handle new sessions requests. A LaunchRequest is an object that represents that a user made a request to an Alexa skill, but did not provide a specific intent.

```javascript
// Create default handlers
var newSessionHandlers = {
    'LaunchRequest': function () {
        //Skill was launched

        //TODO: Say Hello!
        this.emit(':tell', "Hello NAME");
    }
};
```

### Step 2 
In the main function register the newSessionHandlers with the Alexa SDK 

```javascript
alexaSDK.registerHandlers(newSessionHandlers);
```

### Step 3
Commit changes back to github


## Exercise 2

In this exercise we will configure Alexa to let the user select a report suite using the Analytics API.

1. Replace the LaunchRequest function inside of newSessionHandlers with the implementation below. This code will make a call to the Analytics API to get all available report suites and list them back to the user.

```javascript
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
```

2. Add function to handle get report suites call

```javascript
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
```

3. Add rsidSelectionHandlers to handle rsid selection state requests

```javascript
// Create a new handler for the report suite selection state
var rsidSelectionHandlers = Alexa.CreateStateHandler(states.STATE_RSID_SELECTION, {
    'LaunchRequest': function () {
        this.emit('LaunchRequest'); // Uses the handler in newSessionHandlers
    },
    'ReportSuiteSelectionIntent': function () {
        console.log("ReportSuiteSelectionIntent Started");

        //Get all the reports suites loaded during this session
        var reportSuites = this.event.session.attributes.reportSuites;

        //Try and match the spoken report suite to one in our list
        var matchingReportSuite = matchReportSuite(this.event.request.intent.slots.ReportSuite.value, reportSuites);
        if(!matchingReportSuite.error){
            //We found a match!

            //Enter the query state
            //this.handler.state = states.STATE_QUERY;

            //Store the selected report suite in session
            this.attributes['selectedReportSuite'] = matchingReportSuite;

            //Tell use they can now ask for data
            var speechOutput = this.t("REPORT_SUITE_SELECTED", matchingReportSuite.name);
            var reprompt = this.t("REPORT_SUITE_SELECTED_REPROMPT";
            this.emit(':ask', speechOutput, reprompt);
        }else{
            //We were unable to match the spoken word to a report suite
            var reportSuiteList = getReportsSuitesListFromObject(reportSuites);
            var speechOutput = this.t("UNKNOWN_COMMAND_RSID_SELECTION", reportSuiteList);
            var reprompt = this.t("UNKNOWN_COMMAND_REPROMPT_RSID_SELECTION", reportSuiteList);
            this.emit(':ask', speechOutput, reprompt);
        }
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
```    
    
4. Add function to match spoken word to report suite

```javascript    
/**
 * Tries to match a report suite with the spoken name
 */
function matchReportSuite(spokenLiteral, reportSuites) {
    var reportSuiteList = '';
    for (var key in reportSuites) {
        var reportSuite = reportSuites[key];
        var re = new RegExp(spokenLiteral.toLowerCase(),"g");
        var match = reportSuite.name.toLowerCase().match(re);
        if(match != null){
            console.log("Found report suite match " + reportSuite);
            return reportSuite;
        }
    }

    console.log("No match found");
    return {
        error: true
    }
}
```

5. Add function to turn an array of report suites into a comma separated string

```javascript
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
```

6. Register rsidSelectionHandlers with AlexaSDK in the main method.

```javascript
alexaSDK.registerHandlers(newSessionHandlers, rsidSelectionHandlers);

```

7. Change the location manifest.yaml to point to
```
exercises/exercise-2/alexa-skill.js
```

9. Commit changes back to github


## Exercise 3

In this exercise we will configure Alexa to respond to requests for the page views metric for the day.

1. Add querySelectionHandlers to skill, these methods will handle requests while in the Query state. To start we will just handle request for page view today.

```javascript
// Create a new handler for the Query state
var querySelectionHandlers = Alexa.CreateStateHandler(states.STATE_QUERY, {
    'PageViewsTodayIntent': function() {
        //Oneshot Report Started
        console.log("PageViewsTodayIntent Started");

        //Set duration to today
        var duration = "today";

        //Set metric to page views
        var metric = "metrics/pageviews";
        
        //Based on the duration get the start and end dates
        var durationDates = analytics.dateUtil.getDurationFromToDates(duration);

        //Store local scope
        var that = this;

        //Get selected report suite
        var reportSuiteId = this.event.session.attributes.selectedReportSuite.rsid;
        
        //Call get metric using the information from the intent
        getMetric(this.event.session.user.accessToken, reportSuiteId, metric, durationDates, function metricResponseCallback(err, reportResponse) {
            var speechOutput;
            console.log("in response");
            if (err) {
                //An error occured while trying to query metric
                speechOutput = that.t("API_ERROR");
                console.log("error" + JSON.stringify(err));
            } else {
                console.log("report response:" + reportResponse);

                //Verb used to describe the metric based on duration. Past or present
                var verb = getDurationVerb(duration);

                speechOutput = "The total number of page views today " + verb + " " + reportResponse;
            }

            that.emit(':ask', speechOutput, that.t("QUERY_REPROMPT"));
        });
    },
    'ThankYouIntent': function () {
        //User ask for something we are unable to answer
        var speechOutput = this.t("YOU_ARE_WELCOME");
        this.emit(':tell', speechOutput);
    },
    'Unhandled': function () {
        //User ask for something we are unable to answer
        var speechOutput = this.t("UNKNOWN_COMMAND_QUERY");
        var reprompt = this.t("UNKNOWN_COMMAND_REPROMPT_QUERY", getAllMetricsText());
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.HelpIntent': function () {
        //User asked for help
        var speechOutput = this.t("HELP_MESSAGE_QUERY");
        var reprompt = this.t("HELP_REPROMPT_QUERY", getAllMetricsText());
        this.emit(':ask', speechOutput, reprompt);
    },
    "AMAZON.StopIntent": function() {
        //User stopped the skill
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    "AMAZON.CancelIntent": function() {
        //User cancelled the skill
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
});
```

2. Register querySelectionHandlers with AlexaSDK in main

```javascript
alexaSDK.registerHandlers(newSessionHandlers, rsidSelectionHandlers, querySelectionHandlers);
```

3. Add getMetric method to handle report queries

```javascript
/**
 * Queries a metric based from the Analytics API
 */
function getMetric(token, rsid, metric, durationDates, metricResponseCallback) {
    //Debug call
    console.log("Getting metric: " + metric);
    console.log("Start Date: " + durationDates.fromDate);
    console.log("End Date: " + durationDates.toDate);

    //Format dateRange string
    var dateRange = durationDates.fromDate + "/" + durationDates.toDate;

    //Create API headers
    var headers = {
        "Authorization": "Bearer " + token,
        "x-api-key": API_KEY,
        "x-proxy-company": ANALYTICS_COMPANY
    }

    //Instantiate Analytics API helper 
    var analytics = require('adobe-analytics');

    //Query metric
    analytics.config(headers).then(function (api) {
        var args = {
            "rsid": rsid,
            "globalFilters": [{
                "type": "dateRange",
                "dateRange": dateRange,
            }],
            "metricContainer": {"metrics": [{"id": metric}]}
        }

        api.reports.runRankedReport({'body': args})
            .then(function (result) {
                var data = JSON.parse(result["data"]);
                var total = data.summaryData.totals[0];
                metricResponseCallback(null, total);
            })
            .catch( function(error) {
                metricResponseCallback(error,-1);
            });
    })
}
```

3. Add getDurationVerb function

```javascript
/**
 * Get a verb to describe the duration
 */
function getDurationVerb(duration){
    var verb = "was";
    if(duration == "today" || duration == "this week" || duration == "this month" || duration == "this year"){
        verb = "is";
    }
    return verb;
}
```

4. Add method to return a comma seperated list of metrics.

```javascript
/**
 * Returns a comma separated list of supported metrics 
 */
function getAllMetricsText() {
    var metricList = '';
    for (var metric in METRICS) {
        //pageviews and page views is listed as metrics.. Don't say them twice.
        if(metric != "page views"){
           metricList += metric + ", ";
        }
    }

    return metricList;
}
```

5. Change the location manifest.yaml to point to
```
exercises/exercise-3/alexa-skill.js
```

7. Commit changes back to github


## Exercise 4

In this exercise we will configure Alexa to handle requests for different metrics over any duration.

1. Add OneshotReportIntent to querySelectionHandlers, this intent handler supports adhoc queries for various metric's over multiple time periods

```javascript
    'OneshotReportIntent': function () {
        //Oneshot Report Started
        console.log("OneshotReportIntent Started");
        
        //Get the intent object
        var intent = this.event.request.intent;
        
        //Pull out the duration from the oneshot report intent
        var duration = getDurationFromIntent(intent);
        
        //Pull out the metric from the oneshot report intent
        var metric = getMetricFromIntent(intent);
        
        //Based on the duration get the start and end dates
        var durationDates = analytics.dateUtil.getDurationFromToDates(duration);

        //Store local scope
        var that = this;

        //Get selected report suite
        var reportSuiteId = this.event.session.attributes.selectedReportSuite.rsid;

        console.log("Active report suite is " + reportSuiteId);

        //Call get metric using the information from the intent
        getMetric(this.event.session.user.accessToken, reportSuiteId, metric.metricId, durationDates, function metricResponseCallback(err, reportResponse) {
            //Response text
            var speechOutput;

            if (err) {
                //An error occured while trying to query metric
                speechOutput = that.t("API_ERROR");
                console.log("error" + JSON.stringify(err));
            } else {
                //A valid value for metric was returned
                console.log("report response:" + reportResponse);

                //Verb used to describe the metric based on duration. Past or present
                var verb = getDurationVerb(duration);

                //Get the measurement from the intent
                var measurement = getMeasurementFromIntent(intent);
                if(measurement == "percent"){
                    //The measurement is a percent, round to 2 decimal places and multiply by 100
                    speechOutput = "The " + metric.query + " " + duration + " " + verb + " " + (parseFloat(reportResponse).toFixed(2) * 100) + " " + measurement + ".";
                }else if(measurement.indexOf("pages") > -1){
                    //The measurement is pages, round to 2 decimal places
                    speechOutput = "The " + metric.query + " " + duration + " " + verb + " " + parseFloat(reportResponse).toFixed(2) + " " + measurement + ".";
                }else{
                    //All other metrics
                    speechOutput = "The total number of " + metric.query + " " + duration + " " + verb + " " + reportResponse;
                }
            }

            that.emit(':ask', speechOutput, that.t("QUERY_REPROMPT"));
        });
    },
```

2. Add getMeasurementFromIntent function, this function will take an intent and figure out the measurement. The measurement is used to describe the results. Result could be pages or percent for support metrics.

```javascript
/**
 * Gets the measurement for the intent
 */
function getMeasurementFromIntent(intent) {
    console.log("Determining Intent Measurement");
    var metricSlot = intent.slots.Metric;
    var metricName = metricSlot.value;

    var metricValue = METRICS[metricName.toLowerCase()];
    var measurement = MEASUREMENT[metricValue];
    console.log("Measurement for " + metricValue + " is " + measurement);
    if (measurement) {
        return measurement;
    } else {
        return "";
    }
}
```

3. Add getDurationFromIntent function, this function will return the duration for a given intent.

```javascript
/**
 * Gets the duration from the intent
 */
function getDurationFromIntent(intent) {
    var durationSlot = intent.slots.Duration;
    if (!durationSlot || !durationSlot.value) {
      return {
          duration: "today"
      }
    }

    return durationSlot.value;
}
```

4. Add getMetricFromIntent function, this function will return the metric and it's API counterpart for a given intent.

```javascript
/**
 * Gets the metric from the intent
 */
function getMetricFromIntent(intent) {
    var metricSlot = intent.slots.Metric;
    var metricName = metricSlot.value.toLowerCase();
    console.log("Metric is " + metricName + " which maps to " + METRICS[metricName]);
    if (METRICS[metricName]) {
        return {
            query: metricName,
            metricId: METRICS[metricName]
        }
    } else {
        return {
            error: true
        }
    }
}
```

6. Change manafest.yaml to point to exercise 4
```
    exercises/exercise-4/alexa-skill.js
```

7. Commit changes back to github
