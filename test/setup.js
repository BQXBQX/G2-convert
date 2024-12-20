import fetch from "node-fetch";
import fs from "fs";

global.fetch = (url, options) => {
  const urlString = url.toString ? url.toString() : url;

  if (urlString.startsWith("file://")) {
    const filePath = urlString.replace("file://", "");
    const data = fs.readFileSync(filePath);
    return Promise.resolve(new Response(data));
  }

  return fetch(url, options);
};
