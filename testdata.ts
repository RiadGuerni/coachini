import axios from 'axios';
const API_KEY = 'r1wQF7LOEQEp92/jg1RNQA==FtIhnvBY2NKAoqdi';
async function testFetch() {
  try {
    const res = await axios.get('https://api.api-ninjas.com/v1/exercises', {
      headers: { 'X-Api-Key': API_KEY },
    });
    console.dir(res.data, { depth: null });
  } catch (error: any) {
    console.log('Error fetching data:', error);
  }
}
testFetch();
