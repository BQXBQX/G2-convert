import { useEffect, useMemo, useRef, useState } from "react";
import "./style.css";
// @ts-ignore
import logo from "./assets/logo.svg";
import {
  SettingOutlined,
  CloseCircleOutlined,
  ApiOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { Button, Segmented, message } from "antd";
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

const value = `/**
 * This a API Chart Demo, you can convert it to spec
 */
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
  const [transformState, setTransformState] = useState<TransformState>(
    TransformState.INIT
  );
  const [segmentValue, setSegmentValue] = useState<string>("api");
  const [apiValue, setApiValue] = useState<string>(value);
  const [specValue, setSpecValue] = useState<string>(
    `please write your spec code or click "Convert to API/Spec"`
  );

  const monacoValue = useMemo(() => {
    return segmentValue === "api" ? apiValue : specValue;
  }, [segmentValue, apiValue, specValue]);

  useEffect(() => {
    switch (transformState) {
      case TransformState.TRANSFORM:
        chrome.runtime.sendMessage({
          type: "UPDATE_BADGE",
          text: "...",
          color: "#faad14",
        });
        break;
      case TransformState.TRANSFORMED:
        chrome.runtime.sendMessage({
          type: "UPDATE_BADGE",
          text: "✓",
          color: "#52c41a",
        });
        break;
      default:
        chrome.runtime.sendMessage({
          type: "UPDATE_BADGE",
          text: "G2",
          color: "#1677FF",
        });
    }
  }, [transformState]);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const response = event.data;

      if (response.type === "success") {
        setTransformState(TransformState.TRANSFORMED);
        switch (response.transformType) {
          case "api2spec":
            setSpecValue(response.result);
            setSegmentValue("spec");
            break;
          case "spec2api":
            setApiValue(response.result);
            setSegmentValue("api");
            break;
        }
      } else if (response.type === "error") {
        setTransformState(TransformState.INIT);
        message.error(response.error);
        chrome.runtime.sendMessage({
          type: "UPDATE_BADGE",
          text: "X",
          color: "#ff4d4f",
        });
      }
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
            disabled={transformState === TransformState.TRANSFORM}
            value={segmentValue}
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
              setSegmentValue(value);
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
            onChange={(value) => {
              if (segmentValue === "api") {
                setApiValue(value);
              } else {
                setSpecValue(value);
              }
            }}
          />
          <Button
            disabled={transformState === TransformState.TRANSFORM}
            type="primary"
            onClick={() => {
              setTransformState(TransformState.TRANSFORM);
              iframeRef.current?.contentWindow?.postMessage(
                {
                  type: segmentValue === "api" ? "api2spec" : "spec2api",
                  code: monacoValue,
                },
                "*"
              );
            }}
            className={styles.convertButton}
          >
            <strong>Convert to API / Spec</strong>
          </Button>
        </div>
      </div>
    </Provider>
  );
}

export default IndexPopup;
