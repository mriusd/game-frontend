export function detectObjectChanges(oldObj, newObj) {
    let changedData = {};
    for (const [key, value] of Object.entries(newObj)) {
      if (!(key in oldObj)) {
        changedData[key] = value;
      } else if (oldObj[key] !== value) {
        if (typeof value === 'object') {
          const nestedChanges = detectObjectChanges(oldObj[key], value);
          if (Object.keys(nestedChanges).length !== 0) {
            changedData[key] = nestedChanges;
          }
        } else {
          changedData[key] = value;
        }
      }
    }
    return changedData;
  }