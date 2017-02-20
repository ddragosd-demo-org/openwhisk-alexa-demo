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

 var METRICS = {
    'pageviews': "metrics/pageviews",
    'visitors': "metrics/visitors",
};

var MEASUREMENT = {
    'averagetimespentonsite': "minutes",
    'averagevisitdepth': "pages per visit"
};

var AlexaSDK = require('alexa-sdk');
var DateUtil = require('./alexa-date-util');
var util = require('util');

var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', 'Welcome to Adobe Analytics.. Which report suite would you like to use working? ' + getReportSuites(), "You can choose from the following report suites" + getReportSuites());
    },
    'ReportSuiteSelectionIntent': function () {

        this.emit(':ask', 'Ok. How can I help you?', 'I can currently tell you information about X, Y and Z');
    },
    'OneshotReportIntent': function () {
        handleOneshotReportRequest(this.event.request.intent, this.event.session.user.accessToken);
    },
    'PageViewsToday': function() {
        var duration = "today";
        var emit = this.emit;
        getMetric("metrics/pageviews", duration, function metricResponseCallback(err, reportResponse) {
            var speechOutput;

            if (err) {
                speechOutput = "Sorry, Adobe Analytics experienced an error. Please try again later";
                console.log("error:" + err.toString());
            } else {
                console.log("report response:" + reportResponse);
                var verb;
                if(duration == "today" || duration == "this week" || duration == "this month" || duration == "this year"){
                    verb = "is";
                }else{
                    verb = "was";
                }

                /*var measurement = getMeasurementFromIntent(intent);
                if(metric.query.indexOf("average") > -1){
                    speechOutput = "The " + metric.query + " " + duration + " " + verb + " " + parseFloat(reportResponse).toFixed(2) + " " + measurement + ".";
                }else{
                    speechOutput = "The total number of " + metric.query + " " + duration + " " + verb + " " + reportResponse;
                }*/

                speechOutput = "The total number is " + reportResponse;
            }

            emit(':tell', speechOutput, false);
        });
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

function handleOneshotReportRequest(intent, accessToken) {
    // Determine metric
    var metric = getMetricFromIntent(intent)
    if (metric.error) {
        var repromptText = "Currently, I can tell you information about the following metrics: " + getAllMetricsText()
            + "Which metric would you like to load?";
        var speechOutput = "I'm sorry, I don't have any data for that metric.";

        response.ask(speechOutput, repromptText);
        return;
    }

    // Determine custom date
    var duration = getDurationFromIntent(intent);

    getMetric(metric, duration, function metricResponseCallback(err, reportResponse) {
        var speechOutput;

        if (err) {
            speechOutput = "Sorry, Adobe Analytics experienced an error. Please try again later";
        } else {
            var verb;
            if(duration == "today" || duration == "this week" || duration == "this month" || duration == "this year"){
                verb = "is";
            }else{
                verb = "was";
            }

            var measurement = getMeasurementFromIntent(intent);
            if(metric.query.indexOf("average") > -1){
                speechOutput = "The " + metric.query + " " + duration + " " + verb + " " + parseFloat(reportResponse).toFixed(2) + " " + measurement + ".";
            }else{
                speechOutput = "The total number of " + metric.query + " " + duration + " " + verb + " " + reportResponse;
            }
        }

        response.tell(speechOutput, false);
    });
}

function getMetric(metric, duration, metricResponseCallback) {
    console.log("Calling make report");

    var durationDates = DateUtil.getDurationFromToDates(duration);
    console.log("From Date " + durationDates.fromDate);
    console.log("To Date " + durationDates.toDate);

    var headers = {
        "Authorization": "Bearer eyJ4NXUiOiJpbXNfbmExLWtleS0xLmNlciIsImFsZyI6IlJTMjU2In0.eyJmZyI6IlJGN1Q2TDROUE1BQUFBQUFBQUFBQUFHWUFBPT09PT09IiwiYyI6Ilg5NGhjWmpwUzlwZEp4dzZWS3MyTmc9PSIsIm1vaSI6IjQ4NmUwYzkyIiwicnRpZCI6IjE0ODczNDUyMzU0MDgtNGVjNmVlNDctMzc3MS00NDNhLTg1ZmUtZGFhMGQ3MmI2MGYxIiwiY3JlYXRlZF9hdCI6IjE0ODczNDUyMzU0MDgiLCJydGVhIjoiMTQ4ODU1NDgzNTQwOCIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJTaXRlQ2F0YWx5c3QyIiwiYXMiOiJpbXMtbmExIiwib2MiOiJyZW5nYSpuYTFyKjE1YTRjYWYzMWVkKjBCNkFTNTlGSlgyMFhFMTJRWlFIUzc2NlNHIiwidXNlcl9pZCI6IjEwNzMzNDk1NEE3MDY4RTc5OTIwMTVBOUBBZG9iZUlEIiwic2NvcGUiOiJvcGVuaWQsQWRvYmVJRCxyZWFkX29yZ2FuaXphdGlvbnMsYWRkaXRpb25hbF9pbmZvLnByb2plY3RlZFByb2R1Y3RDb250ZXh0LGFkZGl0aW9uYWxfaW5mby5qb2JfZnVuY3Rpb24sc2Vzc2lvbiIsImlkIjoiMTQ4NzM0NTIzNTQwOC00MjJiOGMxMy02YTE2LTRlYjMtYjI2MS1jNTgxMDI4MGI3NzEiLCJzdGF0ZSI6IntcInNlc3Npb25cIjpcImh0dHBzOi8vaW1zLW5hMS5hZG9iZWxvZ2luLmNvbS9pbXMvc2Vzc2lvbi92MS9PVE00TlRjeU1qWXRPRE01T0MwMFlqYzNMVGswT1RFdE5tTTBPR0l3TkdZeU5Ua3lMUzB4TURjek16UTVOVFJCTnpBMk9FVTNPVGt5TURFMVFUbEFRV1J2WW1WSlJBXCJ9IiwiZXhwaXJlc19pbiI6Ijg2NDAwMDAwIn0.DoMFI9dm6WbHliyEtLkdDTQAmAeW0fLmMgMTrmUo1hp1EFsXEbSxvYf_GY3nuTCgEYrRUfjNkcNqaXjSHsvgZjPY7KduFkQMtsmxBgsMnnq08sigZtVMB1ed1sYuiWp3xyy39g_XXXvNa3rvzX9sPxmk1VlmW_4kBW32A2iYVR0EItfgSLOo5Ayo3uCmP0PbsQ3Y6-mTVGyRfs7YMt93fU0Vcr9qpoGSBkuEBfUsLXcxQQwHvgx31QTITnVvvBGGdzGhvf4kKcoLUYGuNQ0RdPfS2hzgzyc82vJT_Mw1lXRorP_vo6uD6_tZjcEv1VqdT6Se9vCMQeo8bgYweFR-5A",
        "x-api-key": "analytics-services",
        "x-proxy-company": "AdobeAtAdobe"
    }

    var analytics = require('./aa-lib/adobe-analytics')(headers);

    analytics.then(function (api) {
        var args = {
            "rsid": "adbecush",
            "globalFilters": [{
                "type": "dateRange",
                "dateRange": "2017-1-1T00:00:00/2017-2-1T23:59:59"
            }],
            "metricContainer": {"metrics": [{"id": "metrics/visitors"}]}
        }
        console.log("Running analytics API with args:" + util.inspect(args, {depth:4}));

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


/**
 * Gets the metric from the intent, or returns an error
 */
function getMetricFromIntent(intent) {
    var metricSlot = intent.slots.Metric;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!metricSlot || !metricSlot.value) {
      return {
          error: true
      }
    }

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

/**
 * Gets the duration from the intent, or returns an error
 */
function getDurationFromIntent(intent) {
    var durationSlot = intent.slots.Duration;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!durationSlot || !durationSlot.value) {
      return {
          duration: "today"
      }
    }

    return durationSlot.value;
}

/**
 * Gets the report from the intent, or returns an error
 */
function getMeasurementFromIntent(intent) {
    console.log("Determining Intent Measurement");
    var metricSlot = intent.slots.Metric;
    var metricName = metricSlot.value;

    var metricValue = METRICS[metricName.toLowerCase()];
    var measurement = MEASUREMENT[metricValue];
    if (measurement) {
        return measurement;
    } else {
        return "";
    }
}

function getAllMetricsText() {
    var metricList = '';
    for (var metric in METRICS) {
       metricList += metric + ", ";
    }

    return metricList;
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
