import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import AppConfigIntl from "./App.ConfigIntl";

export default function App() {
	return (
		<AppConfigIntl>
			<RouterProvider router={router} />
		</AppConfigIntl>
	);
}
