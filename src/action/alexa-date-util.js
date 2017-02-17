/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * Provides date and time utilities to format responses in
 * a manner appropriate for speech output.
 */
var alexaDateUtil = (function () {

    var DAYS_OF_MONTH = [
        '1st',
        '2nd',
        '3rd',
        '4th',
        '5th',
        '6th',
        '7th',
        '8th',
        '9th',
        '10th',
        '11th',
        '12th',
        '13th',
        '14th',
        '15th',
        '16th',
        '17th',
        '18th',
        '19th',
        '20th',
        '21st',
        '22nd',
        '23rd',
        '24th',
        '25th',
        '26th',
        '27th',
        '28th',
        '29th',
        '30th',
        '31st'
    ];

    var DAYS_OF_WEEK = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    var MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];


    return {

        /**
         * Returns a speech formatted date, without the time. If the year
         * is the same as current year, it is omitted.
         * Example: 'Friday June 12th', '6/5/2016'
         */
        getFormattedDate: function (date) {
            var today = new Date();

            if (today.getFullYear() === date.getFullYear()) {
                return DAYS_OF_WEEK[date.getDay()] + ' ' + MONTHS[date.getMonth()] + ' ' + DAYS_OF_MONTH[date.getDate() - 1];
            } else {
                return DAYS_OF_WEEK[date.getDay()] + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            }
        },

        /**
         * Returns a speech formatted time, without a date, based on a period in the day. E.g.
         * '12:35 in the afternoon'
         */
        getFormattedTime: function (date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();

            var periodOfDay;
            if (hours < 12) {
                periodOfDay = ' in the morning';
            } else if (hours < 17) {
                periodOfDay = ' in the afternoon';
            } else if (hours < 20) {
                periodOfDay = ' in the evening';
            } else {
                periodOfDay = ' at night';
            }

            hours = hours % 12;
            hours = hours ? hours : 12; // handle midnight
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var formattedTime = hours + ':' + minutes + periodOfDay;
            return formattedTime;
        },

        /**
         * Returns a speech formatted, without a date, based on am/rpm E.g.
         * '12:35 pm'
         */
        getFormattedTimeAmPm: function (date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';

            hours = hours % 12;
            hours = hours ? hours : 12; // handle midnight
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var formattedTime = hours + ':' + minutes + ' ' + ampm;
            return formattedTime;
        },

        getDurationFromToDates: function (duration) {
            var moment = require('moment');
            var from, to;
            switch (duration)
            {
                case "today":
                    console.log("Today duration detected");
                    from = moment().format('YYYY-MM-DD');
                    to = moment().format('YYYY-MM-DD');
                    break;
                case "yesterday":
                    console.log("Yesterday duration detected");
                    from = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    to = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    break;
                case "this week":
                    console.log("This week duration detected");
                    from = moment().startOf('week').format('YYYY-MM-DD');
                    to = moment().endOf('week').format('YYYY-MM-DD');
                    break;

                case "last week":
                    console.log("Last week duration detected");
                    var today = moment().subtract(8, 'days');
                    from = today.startOf('week').format('YYYY-MM-DD');
                    to = today.endOf('week').format('YYYY-MM-DD');
                    break;

                case "this month":
                    console.log("This month duration detected");
                    var today = moment();
                    var startDate = moment([today.year(), today.month()]);
                    from = startDate.format('YYYY-MM-DD');
                    to = moment(startDate).endOf('month').format('YYYY-MM-DD');
                    break;

                case "last month":
                    console.log("Last month duration detected");
                    var startDate = moment().startOf('month');
                    from = startDate.format('YYYY-MM-DD');
                    to = moment(startDate).endOf('month').format('YYYY-MM-DD');
                    break;

                case "this year":
                    console.log("This year duration detected");
                    var today = moment();
                    var startDate = moment([today.year(), 0, 1]);
                    from = startDate.format('YYYY-MM-DD');
                    to = moment(startDate).endOf('year').format('YYYY-MM-DD');
                    break;

                case "last year":
                    console.log("Last year duration detected");
                    var today = moment().subtract(365, 'days');
                    var startDate = moment([today.year(), 0, 1]);
                    from = startDate.format('YYYY-MM-DD');
                    to = moment(from).endOf('year').format('YYYY-MM-DD');
                    break;
                default:
                    console.log("Could not identify duration.. Falling back to today.")
                    from = moment().format('YYYY-MM-DD');
                    to = moment().format('YYYY-MM-DD');
            }
            return {
                fromDate: from,
                toDate: to
            };
        },

        getBreakdownFromToDates: function (breakdown) {
            var moment = require('moment');
            var startDate1, endDate1, startDate2, endDate2, startDate3, endDate3;
            switch (breakdown)
            {
                case "day":
                    console.log("Day breakdown detected");
                    startDate1 = moment();
                    endDate1 = moment();
                    startDate2 = moment().subtract(1, 'days');
                    endDate2 = moment().subtract(1, 'days');
                    startDate3 = moment().subtract(366, 'days');
                    endDate3 = moment().subtract(366, 'days');
                    break;
                case "week":
                    console.log("Week breakdown detected");
                    var daysOfWeekElapsed = moment().day();
                    startDate1 = moment().startOf('week');
                    endDate1 = moment();
                    var lastWeek = moment().subtract(8, 'days');
                    startDate2 = lastWeek.startOf('week');
                    endDate2 = moment().subtract(8, 'days').startOf('week').add(daysOfWeekElapsed, 'd');
                    var weekLastYear = moment().subtract(366, 'days');
                    startDate3 = weekLastYear.startOf('week');
                    endDate3 = moment().subtract(366, 'days').startOf('week').add(daysOfWeekElapsed, 'd');
                    break;
                case "month":
                    console.log("Month breakdown detected");
                    var daysOfMonthElapsed = moment().date();
                    startDate1 = moment().startOf('month');
                    endDate1 = moment();
                    var today = moment();
                    var lastMonth = moment([today.year(), today.month()-1]);
                    startDate2 = lastMonth.startOf('month');
                    endDate2 = moment([today.year(), today.month()-1]).startOf('month').add(daysOfMonthElapsed - 1, 'd');
                    var monthLastYear = moment().subtract(366, 'days');
                    startDate3 = moment().subtract(366, 'days').startOf('month');
                    endDate3 = moment().subtract(366, 'days').startOf('month').add(daysOfMonthElapsed - 1, 'd');
                    break;
                case "year":
                    console.log("Year breakdown detected");
                    startDate1 = moment().startOf('year');
                    endDate1 = moment();
                    var today = moment();
                    var lastYear = moment([today.year() - 1]);
                    startDate2 = lastYear.startOf('year');
                    endDate2 = moment().subtract(366, 'days');
                    startDate3 = moment();
                    endDate3 = moment();
                    break;
                default:
                    console.log("Could not identify breakdown.. Falling back to day.")
                    startDate1 = moment();
                    endDate1 = moment();
                    startDate2 = moment().subtract(1, 'days');
                    endDate2 = moment().subtract(1, 'days');
                    startDate3 = moment().subtract(366, 'days');
                    endDate3 = moment().subtract(366, 'days');
            }
            return {
                fromDate1: startDate1.format('YYYY-MM-DD'),
                toDate1: endDate1.format('YYYY-MM-DD'),
                fromDate2: startDate2.format('YYYY-MM-DD'),
                toDate2: endDate2.format('YYYY-MM-DD'),
                fromDate3: startDate3.format('YYYY-MM-DD'),
                toDate3: endDate3.format('YYYY-MM-DD')
            };
        }
    };
})();
module.exports = alexaDateUtil;
