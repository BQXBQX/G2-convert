import { useEffect, useRef, useState } from "react";
import "./style.css";
// @ts-ignore
import logo from "./assets/logo.svg";
import { SettingOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Button, Segmented } from "antd";

const value = `
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
  autoFit: true,
});

chart
  .rect()
  .data({
    type: 'fetch',
    value: 'https://assets.antv.antgroup.com/g2/athletes.json',
  })
  .encode('x', 'weight')
  .encode('color', 'sex')
  .transform({ type: 'binX', y: 'count' })
  .transform({ type: 'stackY', orderBy: 'series' })
  .style('inset', 0.5);

chart.render();
`;

function IndexPopup() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [spec, setSpec] = useState();

  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log(`EVAL output: ${event.data}`);
      setSpec(event.data);
    });
  }, []);
  const [data, setData] = useState("");

  return (
    <div style={{ width: "400px", height: "650px" }}>
      <iframe
        title="sandbox"
        src="sandbox.html"
        ref={iframeRef}
        style={{ display: "none" }}
      />
      <header
        style={{
          height: "50px",
          backgroundColor: "#fef4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.4rem",
        }}
      >
        <img src={logo} alt="logo" />
        <div style={{ display: "flex", height: "100%" }}>
          <SettingOutlined
            style={{
              marginRight: "1rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          />
          <CloseCircleOutlined
            onClick={() => window.close()}
            style={{
              fontSize: "1rem",
              cursor: "pointer",
            }}
          />
        </div>
      </header>
      <div style={{ padding: "0.5rem 1rem" }}>
        <Segmented<string>
          options={["API", "Spec"]}
          onChange={(value) => {
            console.log(value);
          }}
          style={{ width: "100%", backgroundColor: "#fef4ff" }}
          block
        />
        {spec && (
          <pre>
            <code>{JSON.stringify(spec, null, 2)}</code>
          </pre>
        )}
        <Button
          onClick={() => {
            iframeRef.current?.contentWindow?.postMessage(value, "*");
          }}
        >
          Convert
        </Button>
      </div>
    </div>
  );
}

export default IndexPopup;
