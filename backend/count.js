// Count factory function

function createCount() {
  let count = 0;
  const getCount = () => count;
  const incrementCount = () => {
    count++;
  };
  return { getCount, incrementCount };
}

export default createCount;
