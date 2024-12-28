import { useEffect, useRef, useState } from "react";
import "./style.css";
// @ts-ignore
import logo from "./assets/logo.svg";
import {
  SettingOutlined,
  CloseCircleOutlined,
  ApiOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { Button, Segmented } from "antd";
import { Provider } from "~provider";
import ReactCodeMirror from "@uiw/react-codemirror";
import { xcodeLight } from "@uiw/codemirror-theme-xcode";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import styles from "./popup.module.css";

enum TransformState {
  INIT,
  TRANSFORM,
  TRANSFORMED,
}

const value = `import { Chart } from '@antv/g2';

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
  const [transformState, setTransformState] = useState<TransformState>(
    TransformState.INIT
  );
  const [monacoValue, setMonacoValue] = useState(value);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log(`EVAL output: ${JSON.stringify(event.data)}`);
    });
  }, []);

  return (
    <Provider>
      <div className={styles.container}>
        <iframe
          title="sandbox"
          src="sandbox.html"
          ref={iframeRef}
          className={styles.iframe}
        />
        <header className={styles.header}>
          <img src={logo} alt="logo" />
          <div className={styles.headerIcons}>
            <SettingOutlined className={styles.settingIcon} />
            <CloseCircleOutlined
              onClick={() => window.close()}
              className={styles.closeIcon}
            />
          </div>
        </header>
        <div className={styles.mainContent}>
          <Segmented<string>
            options={[
              {
                label: (
                  <div className={styles.segmentedStyle}>
                    <ApiOutlined />
                    <span>API</span>
                  </div>
                ),
                value: "api",
              },
              {
                label: (
                  <div className={styles.segmentedStyle}>
                    <ControlOutlined />
                    <span>Spec</span>
                  </div>
                ),
                value: "spec",
              },
            ]}
            onChange={(value) => {
              console.log(value);
            }}
            className={styles.segmented}
            block
          />
          <ReactCodeMirror
            value={monacoValue}
            width="100%"
            height="100%"
            maxHeight="100%"
            theme={xcodeLight}
            extensions={[EditorView.lineWrapping, javascript()]}
            className={styles.codeMirror}
          />
          <Button
            type="primary"
            onClick={() => {
              iframeRef.current?.contentWindow?.postMessage(value, "*");
            }}
            className={styles.convertButton}
          >
            <strong>Convert to Spec</strong>
          </Button>
        </div>
      </div>
    </Provider>
  );
}

export default IndexPopup;
