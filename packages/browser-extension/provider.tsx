import { ConfigProvider } from "antd";
import themeConfig from "~config/theme.config";

export const Provider = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
		</>
	);
};
