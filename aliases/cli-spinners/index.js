import spinnersJson from './spinners.json';

const spinners = Object.assign({}, spinnersJson);

const spinnersList = Object.keys(spinners);

Object.defineProperty(spinners, 'random', {
  get() {
    const randomIndex = Math.floor(Math.random() * spinnersList.length);
    const spinnerName = spinnersList[randomIndex];
    return spinners[spinnerName];
  },
});

export default spinners;
