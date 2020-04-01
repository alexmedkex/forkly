const fs = require("fs");

let commitBody = {
  branch: "KOMGO-update-package",
  commit_message: "scheduled package update",
  actions: []
};
process.argv.slice(2).forEach((val, index) => {
  let fileBuffer = fs.readFileSync(val);
  let encodedFile = fileBuffer.toString("base64");
  commitBody["actions"].push({
    encoding: "base64",
    action: "update",
    file_path: val,
    content: encodedFile
  });
});
console.log(JSON.stringify(commitBody));
