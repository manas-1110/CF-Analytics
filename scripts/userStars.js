
async function main() {
  async function getUserSolvedProblems(handle) {
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);

    if (response.status !== 200) {
      console.log(`Failed to get the user's solved problems data. Status code: ${response.status}`);
      return null;
    }

    const submissions = response.data.result;
    const solvedProblems = {};

    for (const submission of submissions) {
      if (submission.verdict === 'OK') {
        const problem = submission.problem;
        const problemLevel = problem.index;
        const div = problem.contestId.toString().charAt(0);

        if (!solvedProblems[div]) {
          solvedProblems[div] = {};
        }

        if (!solvedProblems[div][problemLevel]) {
          solvedProblems[div][problemLevel] = 0;
        }

        solvedProblems[div][problemLevel]++;
      }
    }

    return solvedProblems;
  }
  const params1 = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  
  let handle2 = params1.handle;
  
  const solvedProblems = await getUserSolvedProblems(handle2);

  let totalPoints = 0;
  let factorA = 90, factorB = 180, factorC = 270, factorD = 360, factorE = 400, factorF = 450;
  for (const key in solvedProblems) {
    for (const level in solvedProblems[key]) {
      if (level == 'A')
        totalPoints += (factorA * solvedProblems[key][level]);
      else if (level == 'B')
        totalPoints += (factorB * solvedProblems[key][level]);
      else if (level == 'C')
        totalPoints += (factorC * solvedProblems[key][level]);
      else if (level == 'D')
        totalPoints += (factorD * solvedProblems[key][level]);
      else if (level == 'E')
        totalPoints += (factorE * solvedProblems[key][level]);
      else if (level == 'F')
        totalPoints += (factorF * solvedProblems[key][level]);
    }
    factorA -= 10;
    factorB -= 20;
    factorC -= 30;
    factorD -= 40;
    factorE -= 50;
    factorF -= 60;
  }
  console.log(totalPoints);
  let stars = 0;
  if (totalPoints >= 200000)
    stars = 5;
  else if (totalPoints >= 100000)
    stars = 4;
  else if (totalPoints >= 50000)
    stars = 3;
  else if (totalPoints >= 10000)
    stars = 2;
  else if (totalPoints >= 5000)
    stars = 1;
  else
    stars = 0;


  const filledStarImage = '<img src="../img/star.png" alt="Filled Star" height="18px" width="18px">';
  const emptyStarImage = '<img src="../img/empty_star.png" alt="Empty Star" height="18px" width="18px">';

  const filledStarsCount = stars; // Number of filled stars
  const emptyStarsCount = 5 - stars; // Number of empty stars

  // Generate HTML for filled stars
  let filledStarsHTML = '';
  for (let i = 0; i < filledStarsCount; i++) {
    filledStarsHTML += filledStarImage;
  }

  // Generate HTML for empty stars
  let emptyStarsHTML = '';
  for (let i = 0; i < emptyStarsCount; i++) {
    emptyStarsHTML += emptyStarImage;
  }

  // Display the stars
  const starsContainer = document.getElementById('stars-container');
  starsContainer.innerHTML = filledStarsHTML + emptyStarsHTML;


}
main();


