async function main()
{
    const urlParams = new URLSearchParams(window.location.search);
    const handle1 = urlParams.get('handle1');
    const handle2 = urlParams.get('handle2');
    document.getElementById('person1').innerHTML = handle1;
    document.getElementById('person2').innerHTML = handle2;
    //chart1
    const  userURL= `https://codeforces.com/api/user.info?handles=${handle1};${handle2}&checkHistoricHandles=false`
    let userResponse = await axios.get(userURL);
    let json = userResponse.data;
    const rating = [json.result[0].rating,json.result[1].rating];
    const maxRating = [json.result[0].maxRating,json.result[1].maxRating];
    //chart2
    const userContest1 = `https://codeforces.com/api/user.rating?handle=${handle1}`;
    const userContest2 = `https://codeforces.com/api/user.rating?handle=${handle2}`;
    let userResponse1 = await axios.get(userContest1); 
    json = userResponse1.data;
    const contestNum = [json.result.length];
    let userResponse2 = await axios.get(userContest2); 
    json = userResponse2.data;
    contestNum.push(json.result.length);
    //chart3
    json = userResponse1.data;
    let bestRank1 = 100000;
    let worstRank1 = 0;
    let bestRank2 = 100000;
    let worstRank2 = 0;

    let maxDown1 = 0;
    let maxDown2 = 0;
    let maxUp1 = 0;
    let maxUp2 = 0;
    for(let i = 0; i < json.result.length; i++){
        let ratingChange = json.result[i].newRating-json.result[i].oldRating;
        bestRank1 = Math.min(bestRank1, json.result[i].rank);
        worstRank1 = Math.max(worstRank1, json.result[i].rank);
        maxDown1 = Math.min(maxDown1, ratingChange);
        maxUp1 = Math.max(maxUp1, ratingChange);
    }
    json = userResponse2.data;
    for(let i = 0; i < json.result.length; i++){
        let ratingChange = json.result[i].newRating-json.result[i].oldRating;
        maxDown2 = Math.min(maxDown2, ratingChange);
        maxUp2 = Math.max(maxUp2, ratingChange);
        bestRank2 = Math.min(bestRank2, json.result[i].rank);
        worstRank2 = Math.max(worstRank2, json.result[i].rank);
    }

    async function getData(handle) 
    {
        const accepted = new Set();
        const tried = new Set();
        const userURL = `https://codeforces.com/api/user.status?handle=${handle}`
        const res = await axios.get(userURL);
        const freq = {};
        const acceptedFreq = {};
        const obj = {};
        obj.userHandle = handle;
        let maxSubmissions = 0;
        let maxAccepted = 0;
        const data = res.data.result;
        
        for(const submission of data){
            const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
            tried.add(problemId);
            if(!freq[problemId])
                freq[problemId] = 1;
            else
                freq[problemId]++;
            maxSubmissions = Math.max(maxSubmissions, freq[problemId]);
            if(submission.verdict === 'OK'){
                accepted.add(problemId);
                if(!acceptedFreq[problemId])
                    acceptedFreq[problemId] = 1;
                else
                    acceptedFreq[problemId]++;
                maxAccepted = Math.max(maxAccepted, acceptedFreq[problemId]);
            }

            
        }
        
        obj.triedCount = tried.size;
        obj.acceptedCount = accepted.size; 
        obj.unsolvedCount = obj.triedCount - obj.acceptedCount;
        obj.maxSubmissions = maxSubmissions;

        let oneSubmission = 0;
        for(const pId of accepted) {
            if(freq[pId]==1)
                oneSubmission++;
        }

        oneSubmission = (oneSubmission/obj.acceptedCount)*100;
        obj.singleSubmissionAcceptedPercentage = oneSubmission;
        obj.maxAcceptedCount = maxAccepted;
        obj.averageSubmissions = data.length/obj.acceptedCount;

        return obj;

    }

    const data1 = await getData(handle1);
    const data2 = await getData(handle2);
    console.log(data1,data2);
    google.charts.load('current', {'packages':['bar','corechart']});
    google.charts.setOnLoadCallback(drawCharts);

    // Fetch submissions data for user1 and user2
    const submissions1 = await getSubmissions(handle1);
    const submissions2 = await getSubmissions(handle2);

    // Extract common questions attempted by both users
    const commonQuestions = findCommonQuestions(submissions1, submissions2);

    // Display common questions in the table
    let tableBody = document.getElementById('common-questions');
    // Display the count of common problems
    document.getElementById('common-questions').textContent = commonQuestions.length;


    // Function to fetch submissions data for a user
    async function getSubmissions(handle) {
        const userURL = `https://codeforces.com/api/user.status?handle=${handle}`;
        const res = await axios.get(userURL);
        return res.data.result;
    }

    // Function to find common questions between two sets of submissions
    function findCommonQuestions(submissions1, submissions2) {
        let commonQuestions = [];
        for (let submission1 of submissions1) {
            for (let submission2 of submissions2) {
                if (submission1.problem.index === submission2.problem.index) {
                    commonQuestions.push(submission1);
                    break; // Exit the inner loop once a common question is found
                }
            }
        }
        return commonQuestions;
    }

    function ratingComparison() {

        let data = google.visualization.arrayToDataTable([
            ['',  handle1, handle2],
            ['Rating', rating[0], rating[1]],
            ['MaxRating', maxRating[0], maxRating[1]],
        ]);

        let options = {
            vAxis: { format: 'decimal' },
            chart: {
            title: 'RATING & MAX RATING',
            subtitle: '         ',
            },
        };

        let chart = new google.charts.Bar(document.getElementById('rating-chart'));
        chart.draw(data, google.charts.Bar.convertOptions(options));

       

    }

    function contestsNumber(){
        let data = new google.visualization.DataTable();
        data.addColumn('string', 'User');
        data.addColumn('number', 'Contests');
        data.addRows([
        [handle1, contestNum[0]],
        [handle2, contestNum[1]],
        ]);

        // Set chart options with a ColumnChart for vertical bars
        let options = {
        title: 'Number of Contests Participated In',
        hAxis: {
            title: 'User',
        },
        vAxis: {
            title: 'Contests',
            // Set minimum axis value to 0
            minValue: 0,
        },
        // Use ColumnChart for vertical bars
        chartType: 'ColumnChart',
        };

        // Load the Visualization library and draw the chart
        let chart = new google.visualization.ColumnChart(document.getElementById('contests-num'));
        chart.draw(data, options);

    }

    function mxUp(){
        

        let data = google.visualization.arrayToDataTable([
            ['',  handle1, handle2],
            ['Max Up', maxUp1, maxUp2],
            ['Max Down', maxDown1, maxDown2],
        ]);

        let options = {
            vAxis: { format: 'decimal' },
            chart: {
            title: '        ',
            subtitle: '         ',
            },
        };

        let chart = new google.charts.Bar(document.getElementById('mx-up'));
        chart.draw(data, google.charts.Bar.convertOptions(options));

    }

    function bestTable(){
        document.getElementById('worst-h1').innerHTML = worstRank1;
        document.getElementById('worst-h2').innerHTML = worstRank2;
        document.getElementById('best-h1').innerHTML = bestRank1;
        document.getElementById('best-h2').innerHTML = bestRank2;
    }

    function unsolved() {
        var data = google.visualization.arrayToDataTable([
            ["Element", "Unsolved", { role: "style" }],
            [handle1, data1.unsolvedCount, "green"],
            [handle2 , data2.unsolvedCount, "blue"],
          ]);
          
          var view = new google.visualization.DataView(data);
          view.setColumns([0, 1, 2]);
          
          var options = {
            title: "UNSOLVED",
            bar: { groupWidth: "50%" }, // Adjust bar width here (e.g., 30%, 40%)
            legend: { position: "none" },
            vAxis: { minValue: 0 },
          };
          
          var chart = new google.visualization.ColumnChart(document.getElementById("unsolved-chart"));
          chart.draw(view, options);
          
    }

    function averageSubmissions(){
        var data = google.visualization.arrayToDataTable([
            ["Element", "Average Submissions", { role: "style" }],
            [handle1, data1.averageSubmissions, "green"],
            [handle2 , data2.averageSubmissions, "blue"],
        ]);
        
        var view = new google.visualization.DataView(data);
        view.setColumns([0, 1, 2]);
        
        var options = {
            title: "AVERAGE SUBMISSIONS",
            bar: { groupWidth: "50%" }, // Adjust bar width here (e.g., 30%, 40%)
            legend: { position: "none" },
            vAxis: { minValue: 0 },
        };
        
        var chart = new google.visualization.ColumnChart(document.getElementById("average-chart"));
        chart.draw(view, options);
    }
    
    function maxSubmissions(){
        var data = google.visualization.arrayToDataTable([
            ["Element", "Max Submissions", { role: "style" }],
            [handle1, data1.maxSubmissions, "green"],
            [handle2 , data2.maxSubmissions, "blue"],
        ]);
        
        var view = new google.visualization.DataView(data);
        view.setColumns([0, 1, 2]);
        
        var options = {
            title: "MAX SUBMISSIONS FOR ONE PROBLEM",
            bar: { groupWidth: "50%" }, // Adjust bar width here (e.g., 30%, 40%)
            legend: { position: "none" },
            vAxis: { minValue: 0 },
        };
        
        var chart = new google.visualization.ColumnChart(document.getElementById("max-submissions"));
        chart.draw(view, options);
    }
    
    function solvedWithOneSubmission(){
        var data = google.visualization.arrayToDataTable([
            ["Element", "PERCENTAGE", { role: "style" }],
            [handle1,data1.singleSubmissionAcceptedPercentage, "green"],
            [handle2 ,data2.singleSubmissionAcceptedPercentage, "blue"],
        ]);
        
        var view = new google.visualization.DataView(data);
        view.setColumns([0, 1, 2]);
        
        var options = {
            title: "SOLVED WITH ONE SUBMISSIONS(%)",
            bar: { groupWidth: "50%" }, // Adjust bar width here (e.g., 30%, 40%)
            legend: { position: "none" },
            vAxis: { minValue: 0 },
        };
        
        var chart = new google.visualization.ColumnChart(document.getElementById("one-chart"));
        chart.draw(view, options);
    }
    
    function maxAccepted(){
        var data = google.visualization.arrayToDataTable([
            ["Element", "Max Accepted", { role: "style" }],
            [handle1, data1.maxAcceptedCount, "green"],
            [handle2 , data2.maxAcceptedCount, "blue"],
        ]);
        
        var view = new google.visualization.DataView(data);
        view.setColumns([0, 1, 2]);
        
        var options = {
            title: "MAX ACCEPTED FOR ONE PROBLEM",
            bar: { groupWidth: "50%" }, // Adjust bar width here (e.g., 30%, 40%)
            legend: { position: "none" },
            vAxis: { minValue: 0 },
        };
        
        var chart = new google.visualization.ColumnChart(document.getElementById("max-ac"));
        chart.draw(view, options);
    }
    
    function triedAndSolved(){
        let data = google.visualization.arrayToDataTable([
            ['',  handle1, handle2],
            ['Tried', data1.triedCount, data2.triedCount],
            ['Solved', data1.acceptedCount, data2.acceptedCount],
        ]);

        let options = {
            vAxis: { format: 'decimal' },
            chart: {
            title: 'TRIED & SOLVED',
            subtitle: '         ',
            },
        };

        let chart = new google.charts.Bar(document.getElementById('triedAndSolved'));
        chart.draw(data, google.charts.Bar.convertOptions(options));
  
    }

    function drawTimeline() {
        let data = google.visualization.arrayToDataTable([
            ['Month', handle1, handle2],
            [new Date(2022, 0), 500, 600],
            [new Date(2022, 1), 450, 620],
            [new Date(2022, 2), 500, 700],
            [new Date(2022, 3), 520, 750],
            [new Date(2022, 4), 500, 760],
            [new Date(2022, 5), 480, 800],
            [new Date(2022, 6), 470, 850],
            [new Date(2022, 7), 460, 900],
            [new Date(2022, 8), 450, 920],
            [new Date(2022, 9), 460, 940],
            [new Date(2022, 10), 480, 950],
            [new Date(2022, 11), 500, 980],
            [new Date(2023, 0), 520, 1000],
            [new Date(2023, 1), 540, 1050],
            [new Date(2023, 2), 550, 1100],
            [new Date(2023, 3), 560, 1150],
        ]);
    
        let options = {
            title: 'Timeline',
            hAxis: {
                title: 'Month',
                format: 'MMM yyyy',
                gridlines: { count: 15 }
            },
            vAxis: {
                title: 'Rating',
                minValue: 0,
            },
            legend: { position: 'right' }
        };
    
        let chart = new google.visualization.LineChart(document.getElementById('timeline'));
        chart.draw(data, options);
    }
    

    function drawCharts(){
        ratingComparison();
        contestsNumber();
        mxUp();
        bestTable();
        unsolved();
        averageSubmissions();
        maxSubmissions();
        solvedWithOneSubmission();
        maxAccepted();
        triedAndSolved();
        drawTimeline();
    }

    
}
main();