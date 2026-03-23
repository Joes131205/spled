import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
    return (
        <div>
            <p>Hello World</p>
        </div>
    );
}
