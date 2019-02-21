import fs from 'fs';

const resetDatabase = (path, initialStructure) => {
  const json = JSON.stringify(initialStructure);
  fs.writeFile(path, json, 'utf8', (err, data) => {
    if (err) {
      return;
    } else {
      return;
    }
  });
};

export default resetDatabase;
