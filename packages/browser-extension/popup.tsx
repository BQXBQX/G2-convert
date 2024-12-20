import { useState } from "react";
import "./style.css";

function IndexPopup() {
  const [data, setData] = useState("");

  const test = () => {
    console.log("test");
  };

  return (
    <div
      style={
        {
          // borderRadius: 4,
          // border: "1px solid #ccc",
          // background: "#fff",
        }
      }
    >
      <header>nihao</header>
      <div onClick={test} onKeyPress={test}>
        hello world!
      </div>
      <p>hello world</p>
    </div>
  );
}

export default IndexPopup;
