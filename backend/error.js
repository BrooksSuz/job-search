function throwErrorAndHalt(err, strFunctionName) {
  console.error(
    `\nUnexpected error in function ${strFunctionName}:\n\n`,
    err.message
  );
  process.exit(1);
}

export default throwErrorAndHalt;
