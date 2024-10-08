import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import AppConfigIntl from "./app.config-intl";

export default function App() {
	return (
		<AppConfigIntl>
			<RouterProvider router={router} />
		</AppConfigIntl>
	);
}
