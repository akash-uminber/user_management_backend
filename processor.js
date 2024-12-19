// // method used for test track personal info api 
// // processor.js
// 'use strict';

// // Track success/failure counts
// const stats = {
//   successCount: 0,
//   failureCount: 0,
//   responseTimeSum: 0,
//   requestCount: 0
// };

// // Function must be called trackRequest to match the hook name
// function trackRequest(requestParams, response, context, ee, next) {
//   try {
//     const currentTime = new Date();
    
//     // Update stats
//     stats.requestCount++;

//     if (response.statusCode >= 200 && response.statusCode < 300) {
//       stats.successCount++;
//     } else {
//       stats.failureCount++;
//     }

//     console.log(`[${currentTime.toISOString()}] Status: ${response.statusCode} | URL: ${requestParams.url}`);
//     console.log(`Success Rate: ${((stats.successCount/stats.requestCount) * 100).toFixed(2)}%`);

//   } catch (error) {
//     console.error('Error in trackRequest:', error);
//   }

//   // Must return next()
//   return next();
// }

// // Must export the function
// module.exports = {
//   trackRequest
// };

// // end here 

// start here for user-history fetch 

// Current processor.js with improvements
'use strict';

function trackRequest(requestParams, response, context, ee, next) {
  try {
    // Basic response validation
    if (!response) {
      console.error('No response received');
      return next(new Error('No response received'));
    }

    // Track response time
    const responseTime = Date.now() - context._startTime;
    ee.emit('customStat', {
      stat: 'response_time',
      value: responseTime
    });

    // Parse response body
    if (response.body) {
      const responseData = JSON.parse(typeof response.body === 'string' ? response.body : JSON.stringify(response.body));
      context.vars.responseData = responseData;

      // Log if response indicates failure
      if (!responseData.success) {
        console.error('API request failed:', {
          url: requestParams.url,
          statusCode: response.statusCode,
          error: responseData.error || 'Unknown error'
        });
      }
    }

    return next();
  } catch (error) {
    console.error('Error processing request:', error);
    return next(error);
  }
}

module.exports = {
  trackRequest
};
//end here 