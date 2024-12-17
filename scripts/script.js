

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

let handle1 = params.handle; // "some_value"

const usernameElement = document.getElementById("username");

usernameElement.textContent = handle1; // Replace 'elementId' with the ID of the element you want to find



const api_url = `https://codeforces.com/api/user.status?handle=${handle1}&from=1&count=1000000`;
fetch(api_url)
  .then(response => response.json())
  .then(data => {

        const tags = {};
        const language = {};
        const verdicts = {};
        const ratings = {};
        const accepted = new Set();
        const tried = new Set();
  
        const problem_counted = {};
        // Levels of the user
        let problem_count = {
          A: 0,
          B: 0,
          C: 0,
          D: 0,
          E: 0,
          F: 0,
        };
        var total = 0;
        const heatMapData = {};
        for (let submission of data.result) {
          const date = new Date(submission.creationTimeSeconds * 1000);
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          const submissionKey = `${year}-${month + 1}-${day}`;

          if (new Date().getFullYear() - year < 2) {
            if (!heatMapData[submissionKey]) {heatMapData[submissionKey] = 0;}
            heatMapData[submissionKey]++;
          }

          total = total+1;

      tried.add(submission.problem.contestId + '-' + submission.problem.index);

          const ques = submission.problem.contestId + '-' + submission.problem.index;
          if(problem_counted[ques])
            problem_counted[ques]++;
          else
            problem_counted[ques] = 1;

          if (submission.verdict === 'OK') {

        accepted.add(submission.problem.contestId + '-' + submission.problem.index);
        //Tags of the user
        submission.problem.tags.forEach((tag) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });

        //Levels of the user
        let problem_index = submission.problem.index;
        if (problem_index in problem_count) {
          problem_count[problem_index]++;
        }

        //Ratings of the user
        const rt = submission.problem.rating;
        if (ratings[rt])
          ratings[rt]++;
        else
          ratings[rt] = 1;

      }
      //Language of the user
      const pl = submission.programmingLanguage;
      if (language[pl])
        language[pl]++;
      else
        language[pl] = 1;

      //Verdicts of the user
      const vr = submission.verdict;
      if (verdicts[vr])
        verdicts[vr]++;
      else
        verdicts[vr] = 1;


        
      }

        
        
        let labels = Object.keys(problem_count);
        let bata = Object.values(problem_count);
        
        let ctx = document.getElementById('level-chart').getContext('2d');
        
        let Levelchart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Problems Solved',
              data: bata,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              // yAxes: [{
              //   ticks: {
              //     beginAtZero: true
              //   }
              // }]
            }
          }
        });

        //Tags of the user

        let TagLabel = Object.keys(tags);
        let TagData = Object.values(tags);

        let cty = document.getElementById('tag-chart').getContext('2d');

        let TagChart = new Chart(cty, {
          type: 'doughnut',
          data: {
            labels: TagLabel,
            datasets: [{
              label: 'Problems Solved',
              data: TagData,

            }]
          },
        });

        //Language of the user
        let LangLabel = Object.keys(language);
        let LangData = Object.values(language);

        let ctz = document.getElementById('lang-chart').getContext('2d');

        let LangChart = new Chart(ctz, {
          type: 'pie',
          data: {
            labels: LangLabel,
            datasets: [{
              data: LangData,
              radius: '60%',

            }]
          },
        });

        //Verdicts of the user

        let VerdictLabel = Object.keys(verdicts);
        let VerdictData = Object.values(verdicts);

        let ctty = document.getElementById('verdict-graph').getContext('2d');

        let VerdChart = new Chart(ctty, {
          type: 'pie',
          data: {
            labels: VerdictLabel,
            datasets: [{
              data: VerdictData,
              radius: '64%',
            }]
          }
        });

        //Problem rating of user

        let RatingLabel = Object.keys(ratings);
        let RatingData = Object.values(ratings);

        let ctte = document.getElementById('rating-graph').getContext('2d');

        let RatingChart = new Chart(ctte, {
          type: 'bar',
          data: {
            labels: RatingLabel,
            datasets: [{
              data: RatingData,
              label: 'Problems Solved',
            }]
          }
        });

        //question solved with one attempt
        let once = 0;
        for(let ques of accepted){
          if(problem_counted[ques]==1)
            once++;
        }
        document.getElementById('once-value').textContent = once + '(' + ((once/accepted.size)*100).toFixed(2) + '%)';


        const solved = accepted.size;
        const countElement = document.getElementById('solved-value');
        countElement.textContent = solved;

        const triednum = tried.size;
        const ctelt = document.getElementById('tried-value');
        ctelt.textContent = triednum;

        const avnum = document.getElementById('average-value');
        avnum.textContent = (total / solved).toFixed(2);

        // Render the heatmap
        const rows = Object.keys(heatMapData).map(key => {
          const [year, month, day] = key.split('-').map(Number);
          return [new Date(year, month-1, day), heatMapData[key]];
        });

        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn({ type: 'date', id: 'Date' });
        dataTable.addColumn({ type: 'number', id: 'Submissions' });
        dataTable.addRows(rows);

        const chart = new google.visualization.Calendar(document.getElementById('heatmap-element'));
        const options = {
          title: 'Codeforces Submissions Heatmap',
          height: 350,
        };

        chart.draw(dataTable, options);

  })
  .catch(error => console.error(error));

    const api_url1 = 'https://codeforces.com/api/user.rating?handle='+handle1;
    fetch(api_url1)
    .then(response => response.json())
    .then(data => {
    
      var maxRatingUp = 0;
      var maxRatingDown = 0;
      var contests = 0;
      var minRank = 100000,maxRank = -1;
      for(let RatingChange of data.result){
        contests++;
        maxRatingUp = Math.max(maxRatingUp,Math.max(RatingChange.newRating-RatingChange.oldRating,0));
        maxRatingDown = Math.max(maxRatingDown,Math.max(0,RatingChange.oldRating-RatingChange.newRating));
        maxRank = Math.max(maxRank,RatingChange.rank);
        minRank = Math.min(minRank,RatingChange.rank);
      }

      const maxup = document.getElementById('chadai-value');
      if(maxRatingUp!=0)
        maxup.textContent = maxRatingUp;
      else
        maxup.textContent = '---';

      const maxdown = document.getElementById('girna-value');
      if(maxRatingDown!=0)
        maxdown.textContent = -maxRatingDown;
      else
        maxdown.textContent = '---';

    document.getElementById('contest-value').textContent = contests;

      if(contests==0){
        document.getElementById('best-value').textContent = '---';
        document.getElementById('worst-value').textContent = '---';
      }
      else
      {
        document.getElementById('best-value').textContent = minRank;
        document.getElementById('worst-value').textContent = maxRank;
      }

  })
  .catch(error => console.error(error));


    //unsolved questions

    
const unsolvedQuestionsElement = document.getElementById('unsolved-questions');


  fetch(api_url)
  .then(response => response.json())


    .then(data => {
      const unsolvedSubmissions = data.result.filter(submission => submission.verdict === 'FAILED' || submission.verdict === 'TIME_LIMIT_EXCEEDED');
      const unsolvedProblems = new Set();
      unsolvedSubmissions.forEach(submission => unsolvedProblems.add(submission.problem.contestId + submission.problem.index));
      const unsolvedList = Array.from(unsolvedProblems).sort();

      const unsolvedString = unsolvedList.join(', ');

      unsolvedQuestionsElement.innerText = unsolvedString;
    })
    .catch(error => console.error(error));